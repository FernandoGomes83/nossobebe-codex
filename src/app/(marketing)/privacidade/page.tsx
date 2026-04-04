import type { Metadata } from "next";

import { MarketingPageShell } from "../page-shell";

export const metadata: Metadata = {
  title: "Privacidade | NossoBebe",
  description: "Politica de privacidade do NossoBebe.",
};

export default function PrivacidadePage() {
  return (
    <MarketingPageShell
      currentLabel="Privacidade"
      currentPath="/privacidade"
      eyebrow="Privacidade"
      title="Tratamento minimo, finalidade clara e exclusao sob solicitacao."
    >
        <p>
          O NossoBebe trata os dados estritamente necessarios para executar o
          pedido, entregar os arquivos e, quando houver consentimento, enviar
          comunicacoes recorrentes.
        </p>
        <p>
          Fotos do bebe sao armazenadas em bucket privado e devem ser removidas
          apos o uso operacional definido no fluxo interno.
        </p>
    </MarketingPageShell>
  );
}
