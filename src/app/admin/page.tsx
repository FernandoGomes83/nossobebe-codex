import type { Metadata } from "next";

import Link from "next/link";

import { logoutAction } from "@/app/admin/login/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { listOrdersForAdmin } from "@/lib/orders/admin";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | NossoBebe",
  description: "Painel administrativo inicial do NossoBebe.",
};

export default async function AdminPage() {
  const { adminUser, user } = await requireAdmin();
  const orders = await listOrdersForAdmin();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Admin autenticado</p>
          <h1>Painel operacional inicial</h1>
          <p className={styles.description}>
            Esta base ja diferencia acesso administrativo do fluxo publico. O
            proximo passo e ligar pedidos, uploads privados e fila operacional.
          </p>
        </div>

        <form action={logoutAction}>
          <button className={styles.ghostButton} type="submit">
            Sair
          </button>
        </form>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span>Usuario</span>
          <strong>{adminUser.full_name || "Admin liberado"}</strong>
          <p>{user.email}</p>
        </article>

        <article className={styles.card}>
          <span>Status</span>
          <strong>Auth admin pronta</strong>
          <p>Login por Supabase Auth com autorizacao pela tabela admin_users.</p>
        </article>

        <article className={styles.card}>
          <span>Banco</span>
          <strong>{orders.length} pedido(s) visiveis</strong>
          <p>O painel agora lista os pedidos reais salvos no banco.</p>
        </article>

        <article className={styles.card}>
          <span>Storage</span>
          <strong>Buckets privados</strong>
          <p>Estrutura prevista para fotos temporarias e entregas assinadas.</p>
        </article>
      </section>

      <section className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Fila operacional</p>
            <h2>Pedidos recentes</h2>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Bebe</span>
            <span>Status</span>
            <span>Total</span>
            <span>Criado em</span>
            <span>Acoes</span>
          </div>

          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhum pedido salvo ainda. O primeiro checkout aprovado vai
              aparecer aqui.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <strong>{order.baby_name}</strong>
                <span>{order.status}</span>
                <span>{order.totalFormatted}</span>
                <span>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                <div className={styles.rowLinks}>
                  <Link href={`/admin/pedidos/${order.id}`}>Detalhes</Link>
                  <Link href={order.publicStatusUrl} target="_blank">
                    Link publico
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
