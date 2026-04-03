import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  publishDeliverableAction,
  updateOrderStatusAction,
  uploadDeliverableAction,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { listDeliverableKinds } from "@/lib/orders/deliverables";
import { getOrderForAdmin } from "@/lib/orders/admin";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pedido | Admin NossoBebe",
  description: "Detalhes operacionais de um pedido no admin.",
};

type AdminOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const nextStatusOptions = [
  ["in_production", "Marcar como em producao"],
  ["ready", "Marcar como pronto"],
  ["delivered", "Marcar como entregue"],
] as const;

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  await requireAdmin();
  const { id } = await params;
  const data = await getOrderForAdmin(id);
  const deliverableKinds = listDeliverableKinds();

  if (!data) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Pedido operacional</p>
          <h1>{data.order.baby_name}</h1>
          <p className={styles.meta}>
            Status atual: <strong>{data.order.status}</strong>
          </p>
          <p className={styles.meta}>Total: {data.order.totalFormatted}</p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/admin">
            Voltar para lista
          </Link>
          <Link
            className={styles.secondaryLink}
            href={data.order.publicStatusUrl}
            target="_blank"
          >
            Abrir link publico
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span>Briefing</span>
          <ul className={styles.definitionList}>
            <li>Data: {data.order.birth_date}</li>
            <li>Hora: {data.order.birth_time || "Nao informada"}</li>
            <li>Cidade: {data.order.birth_city}</li>
            <li>Peso: {data.order.birth_weight_text || "Nao informado"}</li>
            <li>Pais: {data.order.parent_names || "Nao informado"}</li>
            <li>Estilo musical: {data.order.music_style || "Nao informado"}</li>
            <li>Tom: {data.order.music_tone || "Nao informado"}</li>
            <li>Arte: {data.order.art_style || "Nao informado"}</li>
          </ul>
          {data.order.special_words ? (
            <p className={styles.note}>
              Palavras especiais: {data.order.special_words}
            </p>
          ) : null}
        </article>

        <article className={styles.card}>
          <span>Itens</span>
          <ul className={styles.itemList}>
            {data.items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.product_kind}</strong>
                  <p>{item.unitPriceFormatted}</p>
                </div>
                <strong>{item.totalPriceFormatted}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <span>Acoes</span>
          <div className={styles.statusActions}>
            {nextStatusOptions.map(([statusValue, label]) => (
              <form key={statusValue} action={updateOrderStatusAction}>
                <input name="orderId" type="hidden" value={data.order.id} />
                <input name="nextStatus" type="hidden" value={statusValue} />
                <button className={styles.primaryButton} type="submit">
                  {label}
                </button>
              </form>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span>Upload de entregavel</span>
          <form action={uploadDeliverableAction} className={styles.uploadForm}>
            <input name="orderId" type="hidden" value={data.order.id} />
            <label className={styles.field}>
              <span>Tipo</span>
              <select name="kind" required>
                {deliverableKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Arquivo</span>
              <input name="file" required type="file" />
            </label>
            <button className={styles.primaryButton} type="submit">
              Enviar arquivo
            </button>
          </form>
        </article>

        <article className={styles.card}>
          <span>Entregaveis atuais</span>
          <ul className={styles.itemList}>
            {data.deliverables.length === 0 ? (
              <li>Nenhum entregavel salvo ainda.</li>
            ) : (
              data.deliverables.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.kind}</strong>
                    <p>
                      {item.mime_type} • {item.published_at ? "publicado" : "rascunho"}
                    </p>
                  </div>
                  {item.published_at ? (
                    <strong>Publicado</strong>
                  ) : (
                    <form action={publishDeliverableAction}>
                      <input name="orderId" type="hidden" value={data.order.id} />
                      <input
                        name="deliverableId"
                        type="hidden"
                        value={item.id}
                      />
                      <button className={styles.secondaryButton} type="submit">
                        Publicar
                      </button>
                    </form>
                  )}
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className={styles.timelineCard}>
        <span>Historico</span>
        <ul className={styles.timeline}>
          {data.events.map((event) => (
            <li key={event.id}>
              <strong>{event.to_status}</strong>
              <p>
                {event.actor_type} em{" "}
                {new Date(event.created_at).toLocaleString("pt-BR")}
              </p>
              {event.note ? <small>{event.note}</small> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
