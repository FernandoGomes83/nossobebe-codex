export type NameEntry = {
  slug: string;
  name: string;
  origin: string;
  meaning: string;
  personality: string;
  popularity: string;
  combinations: string[];
  famousPeople: string[];
};

export const NAME_ENTRIES: NameEntry[] = [
  {
    slug: "helena",
    name: "Helena",
    origin: "Grega",
    meaning: "Associado a luz, brilho e beleza.",
    personality:
      "Helena costuma ser percebido como um nome elegante, delicado e marcante ao mesmo tempo.",
    popularity:
      "Helena aparece com frequencia entre os nomes mais escolhidos por familias brasileiras nos ultimos anos.",
    combinations: ["Helena Sofia", "Maria Helena", "Ana Helena", "Helena Beatriz"],
    famousPeople: ["Helena Bonham Carter", "Helena Ranaldi", "Helena Kolody"],
  },
  {
    slug: "miguel",
    name: "Miguel",
    origin: "Hebraica",
    meaning: "Tradicionalmente interpretado como quem e como Deus.",
    personality:
      "Miguel costuma transmitir forca, protecao e confianca, com um tom classico que continua atual.",
    popularity:
      "Miguel segue entre os nomes masculinos mais fortes no Brasil e permanece muito presente nos rankings recentes.",
    combinations: ["Joao Miguel", "Miguel Henrique", "Miguel Augusto", "Miguel Levi"],
    famousPeople: ["Miguel de Cervantes", "Miguel Falabella", "Miguel Nicolelis"],
  },
  {
    slug: "theo",
    name: "Theo",
    origin: "Grega",
    meaning: "Ligado a Deus ou ao divino, em uma forma curta e moderna.",
    personality:
      "Theo costuma soar leve, atual e afetuoso, com uma presenca simples e direta.",
    popularity:
      "Theo cresceu bastante no Brasil e virou uma escolha recorrente entre familias que buscam um nome curto.",
    combinations: ["Theo Gabriel", "Theo Henrique", "Theo Lucca", "Theo Benjamin"],
    famousPeople: ["Theo Becker", "Theo Hernandez", "Theo James"],
  },
  {
    slug: "gael",
    name: "Gael",
    origin: "Celta",
    meaning: "Associado a generosidade e protecao em algumas leituras populares.",
    personality:
      "Gael passa uma sensacao moderna, forte e ao mesmo tempo carinhosa.",
    popularity:
      "Gael ganhou espaco no Brasil como um nome curto, contemporaneo e muito lembrado nas maternidades.",
    combinations: ["Gael Miguel", "Gael Henrique", "Gael Benicio", "Gael Levi"],
    famousPeople: ["Gael Garcia Bernal"],
  },
  {
    slug: "cecilia",
    name: "Cecilia",
    origin: "Latina",
    meaning: "Nome classico ligado a delicadeza, sensibilidade e tradicao.",
    personality:
      "Cecilia transmite refinamento e suavidade, com um perfil poetico e atemporal.",
    popularity:
      "Cecilia voltou a ganhar relevancia entre familias que preferem nomes tradicionais com boa musicalidade.",
    combinations: ["Cecilia Maria", "Ana Cecilia", "Cecilia Luisa", "Maria Cecilia"],
    famousPeople: ["Cecilia Meireles", "Cecilia Dassi"],
  },
  {
    slug: "arthur",
    name: "Arthur",
    origin: "Celta",
    meaning: "Comumente ligado a nobreza, coragem e lideranca.",
    personality:
      "Arthur costuma soar forte, classico e seguro, sendo um nome de presenca consolidada.",
    popularity:
      "Arthur segue muito forte no Brasil e aparece com frequencia entre os nomes masculinos mais escolhidos.",
    combinations: ["Arthur Miguel", "Arthur Henrique", "Arthur Gabriel", "Arthur Benjamin"],
    famousPeople: ["Arthur Conan Doyle", "Arthur Aguiar", "Arthur Friedenreich"],
  },
];

export function listNames() {
  return NAME_ENTRIES;
}

export function getNameEntry(slug: string) {
  return NAME_ENTRIES.find((entry) => entry.slug === slug) ?? null;
}
