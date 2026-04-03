import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createPaymentClient } from "@/lib/mercadopago/client";
import { validateMercadoPagoWebhookSignature } from "@/lib/mercadopago/webhook";
import { notifyPaymentApproved } from "@/lib/orders/email-events";
import { consumeRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const rateLimit = consumeRateLimit({
    key: `webhook:${getClientIp(request.headers)}`,
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }

  const admin = createAdminClient();
  const searchParams = request.nextUrl.searchParams;
  const body = await request.json().catch(() => ({}));
  const dataId =
    searchParams.get("data.id") ??
    (typeof body?.data?.id === "string" || typeof body?.data?.id === "number"
      ? String(body.data.id)
      : null);
  const requestId = request.headers.get("x-request-id");
  const idempotencyKey = `mercado_pago:${requestId ?? "no-request-id"}:${dataId ?? "no-data-id"}:${String(body?.action ?? body?.type ?? "unknown")}`;

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
    event_type: String(body?.action ?? body?.type ?? "unknown"),
    idempotency_key: idempotencyKey,
    payload: body,
  });

  if (eventError) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (!dataId || String(body?.type ?? "") !== "payment") {
    await admin
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    return NextResponse.json({ ok: true });
  }

  const payment = await createPaymentClient().get({ id: Number(dataId) });
  const externalReference = payment.external_reference;

  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const mappedStatus = mapPaymentStatus(payment.status);
  const paidAt =
    mappedStatus.orderStatus === "paid"
      ? new Date().toISOString()
      : null;

  await admin.from("payments").upsert(
    {
      order_id: externalReference,
      provider: "mercado_pago",
      provider_payment_id: String(payment.id),
      status: mappedStatus.paymentStatus,
      amount_cents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
      paid_at: paidAt,
      raw_payload: payment,
    },
    {
      onConflict: "provider_payment_id",
    },
  );

  await admin
    .from("checkout_sessions")
    .update({
      status: mappedStatus.checkoutStatus,
    })
    .eq("external_reference", externalReference);

  await admin
    .from("orders")
    .update({
      status: mappedStatus.orderStatus,
      paid_at: paidAt,
    })
    .eq("id", externalReference);

  await admin.from("order_status_events").insert({
    order_id: externalReference,
    to_status: mappedStatus.orderStatus,
    actor_type: "webhook",
    note: `Webhook Mercado Pago processado com status ${payment.status}.`,
  });

  if (mappedStatus.orderStatus === "paid") {
    try {
      await notifyPaymentApproved(externalReference);
    } catch {
      // Email failure should not fail webhook processing.
    }
  }

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("idempotency_key", idempotencyKey);

  return NextResponse.json({ ok: true });
}
