import type { Metadata } from "next";

import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Termos | NossoBebe",
  description: "Termos de uso e compra do NossoBebe.",
};

export default function TermosPage() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>Termos</p>
        <h1>Compra digital com entrega assíncrona e prazo informado.</h1>
        <p>
          O prazo prometido para o MVP e de ate 24 horas apos a aprovacao do
          pagamento. A confirmacao do pagamento depende dos sistemas do provedor
          de pagamento e do webhook.
        </p>
        <p>
          O acesso aos arquivos acontece por links temporarios e a entrega pode
          expirar conforme as regras da plataforma.
        </p>
      </article>
    </main>
  );
}
