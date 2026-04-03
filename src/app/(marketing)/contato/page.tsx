import type { Metadata } from "next";

import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Contato | NossoBebe",
  description: "Canal de contato do NossoBebe.",
};

export default function ContatoPage() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>Contato</p>
        <h1>Fale com o NossoBebe.</h1>
        <p>Para atendimento, duvidas ou solicitacoes de dados, use:</p>
        <p>
          Email: <strong>contato@nossobebe.com.br</strong>
        </p>
      </article>
    </main>
  );
}
