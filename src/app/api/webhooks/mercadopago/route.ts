import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  cancelPendingDripJobsForOrder,
  scheduleWeeklyDripJobsForOrder,
} from "@/lib/drip/service";
import { createPaymentClient } from "@/lib/mercadopago/client";
import { validateMercadoPagoWebhookSignature } from "@/lib/mercadopago/webhook";
import { notifyPaymentApproved } from "@/lib/orders/email-events";
import {
  resolveWebhookCheckoutStatusTransition,
  resolveWebhookOrderStatusTransition,
} from "@/lib/orders/status";
import { consumeRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getRefundedUploadDeleteAfter,
  retainOrderUploads,
  scheduleOrderUploadDeletion,
} from "@/lib/uploads/cleanup";

const mercadoPagoWebhookSchema = z
  .object({
    action: z.string().trim().max(100).optional(),
    data: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
      })
      .partial()
      .optional(),
    live_mode: z.boolean().optional(),
    type: z.string().trim().max(50).optional(),
  })
  .passthrough();

function mapPaymentStatus(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return {
        checkoutStatus: "approved",
        paymentStatus: "approved",
        orderStatus: "paid",
      } as const;
    case "rejected":
    case "cancelled":
      return {
        checkoutStatus: "failed",
        paymentStatus: "failed",
        orderStatus: "payment_pending",
      } as const;
    case "refunded":
      return {
        checkoutStatus: "cancelled",
        paymentStatus: "refunded",
        orderStatus: "refunded",
      } as const;
    default:
      return {
        checkoutStatus: "pending",
        paymentStatus: "pending",
        orderStatus: "payment_pending",
      } as const;
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimit({
    key: `webhook:${getClientIp(request.headers)}`,
    limit: 30,
    windowMs: 60 * 1000,
    prefix: "ratelimit:webhook",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }

  const admin = createAdminClient();
  const searchParams = request.nextUrl.searchParams;
  const rawBody = await request.json().catch(() => ({}));
  const parsedBody = mercadoPagoWebhookSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const body = parsedBody.data;
  const dataId =
    searchParams.get("data.id") ??
    (typeof body?.data?.id === "string" || typeof body?.data?.id === "number"
      ? String(body.data.id)
      : null);
  const requestId = request.headers.get("x-request-id");
  const eventType = String(body.action ?? body.type ?? "unknown").trim().toLowerCase();
  const idempotencyKey = `mercado_pago:${requestId ?? "no-request-id"}:${dataId ?? "no-data-id"}:${eventType}`;

  const isValid = validateMercadoPagoWebhookSignature({
    signatureHeader: request.headers.get("x-signature"),
    requestIdHeader: requestId,
    dataId,
  });

  if (!isValid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const { error: eventError } = await admin.from("webhook_events").insert({
    provider: "mercado_pago",
    event_type: eventType,
    idempotency_key: idempotencyKey,
    payload: body,
  });

  if (eventError) {
    if (eventError.code !== "23505") {
      return NextResponse.json({ error: "could not persist event" }, { status: 500 });
    }

    const { data: existingEvent } = await admin
      .from("webhook_events")
      .select("created_at, processed_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingEvent?.processed_at) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const createdAt = existingEvent?.created_at
      ? new Date(existingEvent.created_at).getTime()
      : 0;
    const isStaleUnprocessed =
      createdAt > 0 && Date.now() - createdAt >= 2 * 60 * 1000;

    if (!isStaleUnprocessed) {
      return NextResponse.json({ ok: true, pending: true });
    }
  }

  try {
    if (!dataId || String(body.type ?? "").trim().toLowerCase() !== "payment") {
      await admin
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("idempotency_key", idempotencyKey);

      return NextResponse.json({ ok: true });
    }

    const paymentId = Number(dataId);

    if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
      await admin
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("idempotency_key", idempotencyKey);

      return NextResponse.json({ ok: true, ignored: true });
    }

    const payment = await createPaymentClient().get({ id: paymentId });
    const externalReference = payment.external_reference;

    if (!externalReference || String(payment.id) !== String(paymentId)) {
      await admin
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("idempotency_key", idempotencyKey);

      return NextResponse.json({ ok: true, ignored: true });
    }

    const [{ data: order }, { data: checkoutSession }] = await Promise.all([
      admin
        .from("orders")
        .select("id, status, paid_at")
        .eq("id", externalReference)
        .maybeSingle(),
      admin
        .from("checkout_sessions")
        .select("id, status")
        .eq("order_id", externalReference)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!order || !checkoutSession) {
      await admin
        .from("webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("idempotency_key", idempotencyKey);

      return NextResponse.json({ ok: true, ignored: true });
    }

    const mappedStatus = mapPaymentStatus(payment.status);
    const orderTransition = resolveWebhookOrderStatusTransition(
      order.status,
      mappedStatus.orderStatus,
    );
    const checkoutTransition = resolveWebhookCheckoutStatusTransition(
      checkoutSession.status,
      mappedStatus.checkoutStatus,
    );
    const now = new Date().toISOString();

    await admin.from("payments").upsert(
      {
        amount_cents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
        checkout_session_id: checkoutSession.id,
        order_id: externalReference,
        paid_at:
          mappedStatus.orderStatus === "paid" ? order.paid_at ?? now : order.paid_at,
        provider: "mercado_pago",
        provider_payment_id: String(payment.id),
        raw_payload: payment,
        status: mappedStatus.paymentStatus,
      },
      {
        onConflict: "provider_payment_id",
      },
    );

    if (checkoutTransition.allowed && checkoutTransition.changed) {
      await admin
        .from("checkout_sessions")
        .update({
          status: checkoutTransition.nextStatus,
        })
        .eq("id", checkoutSession.id)
        .eq("status", checkoutSession.status);
    }

    let appliedOrderStatus = order.status;
    let sendPaymentApprovedEmail = false;

    if (orderTransition.allowed && orderTransition.changed) {
      const orderPatch: {
        paid_at?: string;
        status: string;
      } = {
        status: orderTransition.nextStatus,
      };

      if (orderTransition.nextStatus === "paid") {
        orderPatch.paid_at = order.paid_at ?? now;
      }

      const { data: updatedOrder } = await admin
        .from("orders")
        .update(orderPatch)
        .eq("id", order.id)
        .eq("status", order.status)
        .select("status")
        .maybeSingle();

      if (updatedOrder) {
        appliedOrderStatus = updatedOrder.status;

        await admin.from("order_status_events").insert({
          actor_type: "webhook",
          from_status: order.status,
          note: `Webhook Mercado Pago processado com status ${payment.status}.`,
          order_id: externalReference,
          to_status: updatedOrder.status,
        });

        sendPaymentApprovedEmail = updatedOrder.status === "paid";
      }
    }

    if (appliedOrderStatus === "paid") {
      await retainOrderUploads(externalReference);
      await scheduleWeeklyDripJobsForOrder(externalReference, order.paid_at ?? now);
    }

    if (appliedOrderStatus === "refunded") {
      await cancelPendingDripJobsForOrder(
        externalReference,
        "Order refunded before all drip emails were sent.",
      );
      await scheduleOrderUploadDeletion(
        externalReference,
        getRefundedUploadDeleteAfter(),
      );
    }

    await admin
      .from("webhook_events")
      .update({ processed_at: now })
      .eq("idempotency_key", idempotencyKey);

    if (sendPaymentApprovedEmail) {
      try {
        await notifyPaymentApproved(externalReference);
      } catch {
        // Email failure should not fail webhook processing.
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "webhook processing failed" }, { status: 500 });
  }
}
