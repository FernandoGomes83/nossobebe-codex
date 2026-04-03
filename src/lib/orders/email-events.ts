import {
  sendDeliveryPublishedEmail,
  sendOrderCreatedEmail,
  sendPaymentApprovedEmail,
} from "@/lib/email/service";
import { createAdminClient } from "@/lib/supabase/admin";

async function getOrderEmailContext(orderId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      "id, baby_name, customer_email_ciphertext, public_token, total_amount_cents",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    babyName: data.baby_name,
    customerEmailCiphertext: data.customer_email_ciphertext,
    publicToken: data.public_token,
    totalAmountCents: data.total_amount_cents,
  };
}

export async function notifyOrderCreated(orderId: string) {
  const order = await getOrderEmailContext(orderId);
  if (!order) return;
  await sendOrderCreatedEmail(order);
}

export async function notifyPaymentApproved(orderId: string) {
  const order = await getOrderEmailContext(orderId);
  if (!order) return;
  await sendPaymentApprovedEmail(order);
}

export async function notifyDeliveryPublished(orderId: string) {
  const order = await getOrderEmailContext(orderId);
  if (!order) return;
  await sendDeliveryPublishedEmail(order);
}
