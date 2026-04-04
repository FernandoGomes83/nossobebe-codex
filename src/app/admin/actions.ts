"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { notifyDeliveryPublished } from "@/lib/orders/email-events";
import {
  isAllowedDeliverableMime,
  publishDeliverable,
  uploadDeliverable,
} from "@/lib/orders/deliverables";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedStatuses = ["in_production", "ready", "delivered"] as const;

function normalizeStatus(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updateOrderStatusAction(formData: FormData) {
  const { user } = await requireAdmin();
  const orderId = normalizeStatus(formData.get("orderId"));
  const nextStatus = normalizeStatus(formData.get("nextStatus"));

  if (!orderId || !allowedStatuses.includes(nextStatus as (typeof allowedStatuses)[number])) {
    return;
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const patch: Record<string, string> = {
    status: nextStatus,
  };

  if (nextStatus === "in_production") {
    patch.production_started_at = now;
  }

  if (nextStatus === "ready") {
    patch.ready_at = now;
  }

  if (nextStatus === "delivered") {
    patch.delivered_at = now;
  }

  await admin.from("orders").update(patch).eq("id", orderId);
  await admin.from("order_status_events").insert({
    order_id: orderId,
    to_status: nextStatus,
    actor_type: "admin",
    actor_user_id: user.id,
    note: "Status alterado pelo painel admin.",
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function uploadDeliverableAction(formData: FormData) {
  await requireAdmin();

  const orderId = normalizeStatus(formData.get("orderId"));
  const kind = normalizeStatus(formData.get("kind"));
  const file = formData.get("file");

  if (!orderId || !kind || !(file instanceof File) || file.size === 0) {
    return;
  }

  if (!isAllowedDeliverableMime(kind, file.type)) {
    throw new Error("Invalid deliverable mime type.");
  }

  await uploadDeliverable({
    orderId,
    kind,
    file,
  });

  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath(`/pedido/[token]`);
}

export async function publishDeliverableAction(formData: FormData) {
  const { user } = await requireAdmin();

  const orderId = normalizeStatus(formData.get("orderId"));
  const deliverableId = normalizeStatus(formData.get("deliverableId"));

  if (!orderId || !deliverableId) {
    return;
  }

  await publishDeliverable({
    deliverableId,
    orderId,
  });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("status, ready_at")
    .eq("id", orderId)
    .maybeSingle();

  const shouldMarkReady =
    !!order && order.status !== "ready" && order.status !== "delivered";

  if (shouldMarkReady) {
    const readyAt = new Date().toISOString();

    await admin
      .from("orders")
      .update({
        status: "ready",
        ready_at: order.ready_at ?? readyAt,
      })
      .eq("id", orderId);

    await admin.from("order_status_events").insert({
      order_id: orderId,
      from_status: order.status,
      to_status: "ready",
      actor_type: "admin",
      actor_user_id: user.id,
      note: "Pedido marcado como pronto ao publicar o primeiro entregavel.",
    });

    try {
      await notifyDeliveryPublished(orderId);
    } catch {
      // Email failure should not block manual publication.
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/pedidos/${orderId}`);
}
