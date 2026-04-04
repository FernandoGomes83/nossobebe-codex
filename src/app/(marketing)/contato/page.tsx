import type { Metadata } from "next";

import { MarketingPageShell } from "../page-shell";

export const metadata: Metadata = {
  title: "Contato | NossoBebe",
  description: "Canal de contato do NossoBebe.",
};

export default function ContatoPage() {
  return (
    <MarketingPageShell
      currentLabel="Contato"
      currentPath="/contato"
      eyebrow="Contato"
      title="Fale com o NossoBebe."
    >
        <p>Para atendimento, duvidas ou solicitacoes de dados, use:</p>
        <p>
          Email: <strong>contato@nossobebe.com.br</strong>
        </p>
    </MarketingPageShell>
  );
}
