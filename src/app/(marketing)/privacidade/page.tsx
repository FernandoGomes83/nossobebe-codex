import type { Metadata } from "next";

import styles from "../pages.module.css";

export const metadata: Metadata = {
  title: "Privacidade | NossoBebe",
  description: "Politica de privacidade do NossoBebe.",
};

export default function PrivacidadePage() {
  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.eyebrow}>Privacidade</p>
        <h1>Tratamento minimo, finalidade clara e exclusao sob solicitacao.</h1>
        <p>
          O NossoBebe trata os dados estritamente necessarios para executar o
          pedido, entregar os arquivos e, quando houver consentimento, enviar
          comunicacoes recorrentes.
        </p>
        <p>
          Fotos do bebe sao armazenadas em bucket privado e devem ser removidas
          apos o uso operacional definido no fluxo interno.
        </p>
      </article>
    </main>
  );
}
