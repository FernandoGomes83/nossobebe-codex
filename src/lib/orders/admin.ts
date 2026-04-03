import { formatPrice } from "@/lib/catalog";
import { createOrderAccessToken } from "@/lib/security/order-access-token";
import { createAdminClient } from "@/lib/supabase/admin";

export async function listOrdersForAdmin() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id, public_token, baby_name, status, total_amount_cents, created_at, paid_at, promised_delivery_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Could not list orders.");
  }

  return (data ?? []).map((order) => ({
    ...order,
    totalFormatted: formatPrice(order.total_amount_cents),
    publicStatusUrl: `/pedido/${createOrderAccessToken(order.public_token)}`,
  }));
}

export async function getOrderForAdmin(orderId: string) {
  const admin = createAdminClient();
  const [
    { data: order, error: orderError },
    { data: items },
    { data: events },
    { data: deliverables },
  ] =
    await Promise.all([
      admin
        .from("orders")
        .select(
          "id, public_token, baby_name, status, total_amount_cents, created_at, paid_at, promised_delivery_at, birth_date, birth_time, birth_city, birth_weight_text, parent_names, music_style, music_tone, special_words, art_style",
        )
        .eq("id", orderId)
        .maybeSingle(),
      admin
        .from("order_items")
        .select("id, product_kind, quantity, unit_price_cents, total_price_cents")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true }),
      admin
        .from("order_status_events")
        .select("id, to_status, actor_type, note, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
      admin
        .from("deliverables")
        .select("id, kind, mime_type, size_bytes, published_at, storage_path, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true }),
    ]);

  if (orderError || !order) {
    return null;
  }

  return {
    order: {
      ...order,
      totalFormatted: formatPrice(order.total_amount_cents),
      publicStatusUrl: `/pedido/${createOrderAccessToken(order.public_token)}`,
    },
    items:
      items?.map((item) => ({
        ...item,
        unitPriceFormatted: formatPrice(item.unit_price_cents),
        totalPriceFormatted: formatPrice(item.total_price_cents),
      })) ?? [],
    deliverables: deliverables ?? [],
    events: events ?? [],
  };
}
