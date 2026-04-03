import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatPrice } from "@/lib/catalog";
import { getOrderStatusByPublicToken } from "@/lib/orders/repository";
import { verifyOrderAccessToken } from "@/lib/security/order-access-token";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Acompanhar pedido | NossoBebe",
  description: "Status do pedido e progresso da entrega do pack.",
};

type OrderStatusPageProps = {
  params: Promise<{
    token: string;
  }>;
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  checkout_pending: "Aguardando conclusao do checkout",
  payment_pending: "Pagamento em analise",
  paid: "Pagamento aprovado",
  in_production: "Em producao manual",
  ready: "Entrega pronta",
  delivered: "Entregue",
  expired: "Expirado",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export default async function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { token } = await params;
  const payload = verifyOrderAccessToken(token);

  if (!payload) {
    notFound();
  }

  const data = await getOrderStatusByPublicToken(payload.publicToken);

  if (!data) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Acompanhamento do pedido</p>
          <h1>{data.order.baby_name}</h1>
          <p className={styles.description}>
            Status atual: <strong>{statusLabels[data.order.status] ?? data.order.status}</strong>
          </p>
        </div>

        <div className={styles.totalCard}>
          <span>Total do pedido</span>
          <strong>{formatPrice(data.order.total_amount_cents)}</strong>
          <p>
            Prazo prometido:{" "}
            {data.order.promised_delivery_at
              ? new Date(data.order.promised_delivery_at).toLocaleString("pt-BR")
              : "em ate 24 horas"}
          </p>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span>Pagamento</span>
          <strong>{statusLabels[data.order.status] ?? data.order.status}</strong>
          <p>
            O pedido depende da confirmacao por webhook do Mercado Pago para
            avancar automaticamente para a fila operacional.
          </p>
          {data.checkout?.provider_init_point &&
          ["checkout_pending", "payment_pending"].includes(data.order.status) ? (
            <a
              className={styles.primaryLink}
              href={data.checkout.provider_init_point}
              rel="noreferrer"
              target="_blank"
            >
              Continuar pagamento
            </a>
          ) : null}
        </article>

        <article className={styles.card}>
          <span>Operacao</span>
          <strong>Entrega manual</strong>
          <p>
            Assim que o pagamento for aprovado, o pedido entra na fila para
            producao manual e segue o prazo prometido de ate 24 horas.
          </p>
        </article>

        <article className={styles.card}>
          <span>Entregaveis</span>
          <strong>
            {data.deliverables.length > 0
              ? `${data.deliverables.length} arquivo(s)`
              : "Nenhum arquivo publicado ainda"}
          </strong>
          <ul className={styles.deliverableList}>
            {data.deliverables.map((item) => (
              <li key={`${item.kind}-${item.storage_path}`}>
                {item.signedUrl ? (
                  <a href={item.signedUrl} rel="noreferrer" target="_blank">
                    {item.kind}
                  </a>
                ) : (
                  item.kind
                )}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
