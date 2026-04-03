import type { Metadata } from "next";

import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Sobre | NossoBebe",
  description: "Conheca o NossoBebe e a proposta do projeto.",
};

export default function SobrePage() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>Sobre o projeto</p>
        <h1>NossoBebe transforma momentos em registros afetivos.</h1>
        <p>
          O NossoBebe nasceu para ajudar familias a registrar os primeiros dias
          do bebe com produtos digitais personalizados, linguagem acolhedora e
          foco em emocao.
        </p>
        <p>
          O produto principal combina canção, arte e lembrancas do nascimento em
          um fluxo simples de compra e entrega digital.
        </p>
      </article>
    </main>
  );
}
