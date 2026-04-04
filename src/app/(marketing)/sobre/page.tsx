import type { Metadata } from "next";

import { MarketingPageShell } from "../page-shell";

export const metadata: Metadata = {
  title: "Sobre | NossoBebe",
  description: "Conheca o NossoBebe e a proposta do projeto.",
};

export default function SobrePage() {
  return (
    <MarketingPageShell
      currentLabel="Sobre"
      currentPath="/sobre"
      eyebrow="Sobre o projeto"
      title="NossoBebe transforma momentos em registros afetivos."
    >
        <p>
          O NossoBebe nasceu para ajudar familias a registrar os primeiros dias
          do bebe com produtos digitais personalizados, linguagem acolhedora e
          foco em emocao.
        </p>
        <p>
          O produto principal combina canção, arte e lembrancas do nascimento em
          um fluxo simples de compra e entrega digital.
        </p>
    </MarketingPageShell>
  );
}
