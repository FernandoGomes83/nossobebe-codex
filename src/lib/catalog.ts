export type ProductKind =
  | "pack"
  | "song"
  | "art"
  | "world"
  | "name_meaning"
  | "guide";

export type ProductDefinition = {
  kind: ProductKind;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  featured?: boolean;
};

export const PRODUCT_CATALOG: Record<ProductKind, ProductDefinition> = {
  pack: {
    kind: "pack",
    name: "Pack comemorativo completo",
    shortName: "Pack completo",
    description:
      "Os 5 itens do produto principal com a melhor relacao custo-beneficio.",
    priceCents: 3990,
    featured: true,
  },
  song: {
    kind: "song",
    name: "Cancao de ninar com IA",
    shortName: "Cancao",
    description:
      "Musica personalizada com o nome do bebe e direcao musical escolhida.",
    priceCents: 2990,
  },
  art: {
    kind: "art",
    name: "Arte personalizada com IA",
    shortName: "Arte",
    description: "Retrato artistico do bebe em um estilo visual selecionado.",
    priceCents: 2490,
  },
  world: {
    kind: "world",
    name: "O mundo quando voce nasceu",
    shortName: "Poster do dia",
    description: "Poster comemorativo com curiosidades do nascimento.",
    priceCents: 1990,
  },
  name_meaning: {
    kind: "name_meaning",
    name: "Significado do nome",
    shortName: "Nome",
    description: "Arte tipografica com origem, significado e texto poetico.",
    priceCents: 1490,
  },
  guide: {
    kind: "guide",
    name: "Guia primeiros meses",
    shortName: "Guia",
    description:
      "PDF de apoio para os primeiros meses com orientacoes praticas.",
    priceCents: 1990,
  },
};

export const INDIVIDUAL_PRODUCT_KINDS: ProductKind[] = [
  "song",
  "art",
  "world",
  "name_meaning",
  "guide",
];

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

export function calculateSelection(input: {
  selectedPack: boolean;
  selectedProducts?: ProductKind[];
}) {
  const uniqueProducts = Array.from(new Set(input.selectedProducts ?? [])).filter(
    (kind): kind is ProductKind => kind in PRODUCT_CATALOG && kind !== "pack",
  );

  if (input.selectedPack) {
    return {
      items: [PRODUCT_CATALOG.pack],
      totalCents: PRODUCT_CATALOG.pack.priceCents,
      includesPack: true,
      isPackBetterDeal: false,
      individualTotalCents: uniqueProducts.reduce(
        (sum, kind) => sum + PRODUCT_CATALOG[kind].priceCents,
        0,
      ),
    };
  }

  const items = uniqueProducts.map((kind) => PRODUCT_CATALOG[kind]);
  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);
  const isPackBetterDeal = totalCents > PRODUCT_CATALOG.pack.priceCents;

  return {
    items,
    totalCents,
    includesPack: false,
    isPackBetterDeal,
    individualTotalCents: totalCents,
  };
}
