import type { Metadata } from "next";

import { MarketingPageShell } from "../page-shell";

export const metadata: Metadata = {
  title: "Termos | NossoBebe",
  description: "Termos de uso e compra do NossoBebe.",
};

export default function TermosPage() {
  return (
    <MarketingPageShell
      currentLabel="Termos"
      currentPath="/termos"
      eyebrow="Termos"
      title="Compra digital com entrega assíncrona e prazo informado."
    >
        <p>
          O prazo prometido para o MVP e de ate 24 horas apos a aprovacao do
          pagamento. A confirmacao do pagamento depende dos sistemas do provedor
          de pagamento e do webhook.
        </p>
        <p>
          O acesso aos arquivos acontece por links temporarios e a entrega pode
          expirar conforme as regras da plataforma.
        </p>
    </MarketingPageShell>
  );
}
