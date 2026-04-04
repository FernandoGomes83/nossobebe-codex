import { createAdminClient } from "@/lib/supabase/admin";

import { type OrderDraftInput, getOrderDraftSummary } from "./schema";
import { notifyOrderCreated } from "./email-events";
import { createOrderAccessToken } from "@/lib/security/order-access-token";
import { encryptEmail, hashEmail } from "@/lib/security/crypto";
import { createPreferenceClient } from "@/lib/mercadopago/client";
import { getServerEnv } from "@/lib/env";
import { formatPrice } from "@/lib/catalog";

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export async function createOrderCheckout(input: OrderDraftInput) {
  const admin = createAdminClient();
  const env = getServerEnv();
  const summary = getOrderDraftSummary(input);
  const promisedDeliveryAt = addHours(new Date(), 24).toISOString();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_email_ciphertext: encryptEmail(input.customerEmail),
      customer_email_hash: hashEmail(input.customerEmail),
      baby_name: input.babyName,
      birth_date: input.birthDate,
      birth_time: input.birthTime || null,
      birth_city: input.birthCity,
      birth_weight_text: input.birthWeightText || null,
      parent_names: input.parentNames || null,
      music_style: input.musicStyle ?? null,
      music_tone: input.musicTone ?? null,
      special_words: input.specialWords || null,
      art_style: input.artStyle ?? null,
      status: "checkout_pending",
      total_amount_cents: summary.totalCents,
      promised_delivery_at: promisedDeliveryAt,
    })
    .select("id, public_token")
    .single();

  if (orderError || !order) {
    throw new Error("Could not create order.");
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    summary.items.map((item) => ({
      order_id: order.id,
      product_kind: item.kind,
      quantity: 1,
      unit_price_cents: item.priceCents,
      total_price_cents: item.priceCents,
    })),
  );

  if (itemsError) {
    throw new Error("Could not create order items.");
  }

  if (input.uploadedPhotoId) {
    const { error: uploadLinkError } = await admin
      .from("uploads")
      .update({
        order_id: order.id,
        delete_after: null,
      })
      .eq("id", input.uploadedPhotoId)
      .is("order_id", null);

    if (uploadLinkError) {
      throw new Error("Could not associate uploaded photo.");
    }
  }

  const { error: statusEventError } = await admin
    .from("order_status_events")
    .insert({
      order_id: order.id,
      from_status: null,
      to_status: "checkout_pending",
      actor_type: "customer",
      note: "Pedido iniciado pelo wizard publico.",
    });

  if (statusEventError) {
    throw new Error("Could not create order status event.");
  }

  const orderAccessToken = createOrderAccessToken(order.public_token);
  const orderStatusUrl = `${env.appUrl}/pedido/${orderAccessToken}`;
  const externalReference = order.id;

  const { data: checkoutSession, error: checkoutSessionError } = await admin
    .from("checkout_sessions")
    .insert({
      order_id: order.id,
      provider: "mercado_pago",
      status: "created",
      external_reference: externalReference,
      amount_cents: summary.totalCents,
      payload: {
        selectedPack: summary.includesPack,
        itemCount: summary.items.length,
      },
    })
    .select("id")
    .single();

  if (checkoutSessionError || !checkoutSession) {
    throw new Error("Could not create checkout session.");
  }

  const preference = await createPreferenceClient().create({
    body: {
      items: summary.items.map((item) => ({
        id: item.kind,
        title: item.name,
        quantity: 1,
        unit_price: Number((item.priceCents / 100).toFixed(2)),
        currency_id: "BRL",
      })),
      payer: {
        email: input.customerEmail,
      },
      back_urls: {
        success: orderStatusUrl,
        failure: orderStatusUrl,
        pending: orderStatusUrl,
      },
      auto_return: "approved",
      notification_url: `${env.appUrl}/api/webhooks/mercadopago`,
      external_reference: externalReference,
      statement_descriptor: "NOSSOBEBE",
    },
  });

  const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;

  if (!checkoutUrl) {
    throw new Error("Mercado Pago did not return a checkout URL.");
  }

  const { error: checkoutUpdateError } = await admin
    .from("checkout_sessions")
    .update({
      provider_checkout_id: preference.id,
      provider_init_point: checkoutUrl,
      status: "pending",
      payload: {
        selectedPack: summary.includesPack,
        itemCount: summary.items.length,
        preferenceId: preference.id,
      },
    })
    .eq("id", checkoutSession.id);

  if (checkoutUpdateError) {
    throw new Error("Could not update checkout session.");
  }

  try {
    await notifyOrderCreated(order.id);
  } catch {
    // Transactional email should not block checkout creation in the MVP.
  }

  return {
    checkoutUrl,
    orderStatusUrl,
    orderAccessToken,
    orderId: order.id,
    orderSummaryLabel: `${summary.items.length} item(ns), total ${formatPrice(
      summary.totalCents,
    )}`,
  };
}

type OrderStatusRecord = {
  id: string;
  baby_name: string;
  status: string;
  total_amount_cents: number;
  created_at: string;
  promised_delivery_at: string | null;
  paid_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
};

export async function getOrderStatusByPublicToken(publicToken: string) {
  const admin = createAdminClient();

  const [{ data: order, error: orderError }, { data: checkout }] =
    await Promise.all([
      admin
        .from("orders")
        .select(
          "id, baby_name, status, total_amount_cents, created_at, promised_delivery_at, paid_at, ready_at, delivered_at",
        )
        .eq("public_token", publicToken)
        .maybeSingle<OrderStatusRecord>(),
      admin
        .from("checkout_sessions")
        .select("provider_init_point, status")
        .eq("external_reference", publicToken)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (orderError || !order) {
    return null;
  }

  const { data: latestCheckout } = await admin
    .from("checkout_sessions")
    .select("provider_init_point, status")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: orderDeliverables } = await admin
    .from("deliverables")
    .select("id, kind, storage_path, published_at")
    .eq("order_id", order.id)
    .not("published_at", "is", null)
    .order("created_at", { ascending: true });

  const signedDeliverables = await Promise.all(
    (orderDeliverables ?? []).map(async (item) => {
      const signed = await admin.storage
        .from("deliverables")
        .createSignedUrl(item.storage_path, 60 * 60 * 24);

      return {
        ...item,
        signedUrl: signed.data?.signedUrl ?? null,
      };
    }),
  );

  return {
    order,
    checkout: latestCheckout ?? checkout,
    deliverables: signedDeliverables,
  };
}

export async function getPublishedDeliverablesByPublicToken(publicToken: string) {
  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, baby_name")
    .eq("public_token", publicToken)
    .maybeSingle();

  if (orderError || !order) {
    return null;
  }

  const { data: deliverables, error: deliverablesError } = await admin
    .from("deliverables")
    .select("id, kind, storage_path, mime_type")
    .eq("order_id", order.id)
    .not("published_at", "is", null)
    .order("created_at", { ascending: true });

  if (deliverablesError) {
    return null;
  }

  return {
    order,
    deliverables: deliverables ?? [],
  };
}
