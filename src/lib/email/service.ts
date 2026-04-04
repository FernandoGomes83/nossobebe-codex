import { createOrderAccessToken } from "@/lib/security/order-access-token";
import { decryptEmail } from "@/lib/security/crypto";
import { getServerEnv } from "@/lib/env";
import { createResendClient } from "@/lib/email/client";
import {
  buildDeliveryPublishedEmail,
  buildOrderCreatedEmail,
  buildPaymentApprovedEmail,
  buildWeeklyDripEmail,
} from "@/lib/email/templates";

type OrderEmailContext = {
  babyName: string;
  customerEmailCiphertext: string;
  publicToken: string;
  totalAmountCents?: number;
};

function buildOrderUrl(publicToken: string) {
  const env = getServerEnv();
  const accessToken = createOrderAccessToken(publicToken);
  return `${env.appUrl}/pedido/${accessToken}`;
}

function buildUnsubscribeUrl(unsubscribeToken: string) {
  const env = getServerEnv();
  return `${env.appUrl}/email/unsubscribe/${unsubscribeToken}`;
}

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const env = getServerEnv();
  const resend = createResendClient();

  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: [input.to],
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendOrderCreatedEmail(order: OrderEmailContext) {
  const to = decryptEmail(order.customerEmailCiphertext);
  const template = buildOrderCreatedEmail({
    babyName: order.babyName,
    orderUrl: buildOrderUrl(order.publicToken),
    totalFormatted: formatPrice(order.totalAmountCents ?? 0),
  });

  await sendEmail({
    to,
    subject: `Recebemos o pedido de ${order.babyName}`,
    html: template.html,
  });
}

export async function sendPaymentApprovedEmail(order: OrderEmailContext) {
  const to = decryptEmail(order.customerEmailCiphertext);
  const template = buildPaymentApprovedEmail({
    babyName: order.babyName,
    orderUrl: buildOrderUrl(order.publicToken),
  });

  await sendEmail({
    to,
    subject: `Pagamento aprovado para ${order.babyName}`,
    html: template.html,
  });
}

export async function sendDeliveryPublishedEmail(order: OrderEmailContext) {
  const to = decryptEmail(order.customerEmailCiphertext);
  const template = buildDeliveryPublishedEmail({
    babyName: order.babyName,
    orderUrl: buildOrderUrl(order.publicToken),
  });

  await sendEmail({
    to,
    subject: `Entrega disponivel para ${order.babyName}`,
    html: template.html,
  });
}

export async function sendWeeklyDripEmail(
  input: OrderEmailContext & {
    unsubscribeToken: string;
    weekNumber: number;
  },
) {
  const to = decryptEmail(input.customerEmailCiphertext);
  const template = buildWeeklyDripEmail({
    babyName: input.babyName,
    weekNumber: input.weekNumber,
    orderUrl: buildOrderUrl(input.publicToken),
    unsubscribeUrl: buildUnsubscribeUrl(input.unsubscribeToken),
  });

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}
