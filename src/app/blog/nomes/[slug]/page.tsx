import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { BlogAdSlot } from "@/components/blog/ad-slot";
import { getAdsenseConfig } from "@/lib/adsense";
import { getNameEntry, listNames } from "@/lib/content/names";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo/faq";
import { buildArticleJsonLd } from "@/lib/seo/json-ld";

import styles from "./page.module.css";

type NamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return listNames().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: NamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getNameEntry(slug);

  if (!entry) {
    return {};
  }

  return {
    title: `Significado do nome ${entry.name}`,
    description: `${entry.meaning} Veja origem, combinações e ideias para eternizar o nome ${entry.name}.`,
    alternates: {
      canonical: `/blog/nomes/${entry.slug}`,
    },
  };
}

export default async function NamePage({ params }: NamePageProps) {
  const { slug } = await params;
  const entry = getNameEntry(slug);

  if (!entry) {
    notFound();
  }

  const siteUrl = process.env.APP_URL || "https://nossobebe.com.br";
  const adsense = getAdsenseConfig();
  const pageUrl = `${siteUrl}/blog/nomes/${entry.slug}`;
  const articleJsonLd = buildArticleJsonLd({
    title: `Significado do nome ${entry.name}`,
    description: `${entry.meaning} Veja origem, combinações e ideias para eternizar o nome ${entry.name}.`,
    publishedAt: "2026-04-03",
    url: pageUrl,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", item: siteUrl },
    { name: "Blog", item: `${siteUrl}/blog` },
    { name: "Nomes", item: `${siteUrl}/blog/nomes` },
    { name: entry.name, item: pageUrl },
  ]);
  const faqJsonLd = buildFaqJsonLd([
    {
      question: `Qual o significado do nome ${entry.name}?`,
      answer: entry.meaning,
    },
    {
      question: `O nome ${entry.name} e popular no Brasil?`,
      answer: entry.popularity,
    },
  ]);

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd),
          }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
          type="application/ld+json"
        />

        <header className={styles.header}>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: "Nomes", href: "/blog/nomes" },
              { label: entry.name },
            ]}
          />
          <p className={styles.category}>Nomes</p>
          <h1>Significado do nome {entry.name}</h1>
          <p className={styles.description}>{entry.meaning}</p>
        </header>

        <section className={styles.section}>
          <h2>Origem do nome {entry.name}</h2>
          <p>
            {entry.name} e um nome de origem {entry.origin.toLowerCase()} e
            continua relevante por unir sonoridade forte, boa lembranca e
            facilidade de combinacao.
          </p>
        </section>

        <BlogAdSlot
          clientId={adsense.clientId}
          slotId={adsense.blogSlots.inline}
          title="Espaco patrocinado"
          variant="inline"
        />

        <section className={styles.section}>
          <h2>Personalidade de quem se chama {entry.name}</h2>
          <p>{entry.personality}</p>
        </section>

        <section className={styles.section}>
          <h2>Popularidade do nome {entry.name} no Brasil</h2>
          <p>{entry.popularity}</p>
        </section>

        <BlogAdSlot
          clientId={adsense.clientId}
          slotId={adsense.blogSlots.middle}
          title="Publicidade relacionada"
          variant="middle"
        />

        <section className={styles.section}>
          <h2>Nomes que combinam com {entry.name}</h2>
          <ul>
            {entry.combinations.map((combination) => (
              <li key={combination}>{combination}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Famosos com o nome {entry.name}</h2>
          <ul>
            {entry.famousPeople.map((person) => (
              <li key={person}>{person}</li>
            ))}
          </ul>
        </section>

        <BlogAdSlot
          clientId={adsense.clientId}
          slotId={adsense.blogSlots.footer}
          title="Publicidade"
          variant="footer"
        />

        <section className={styles.ctaBox}>
          <h2>Eternize o nome {entry.name}</h2>
          <p>
            Uma canção de ninar exclusiva com o nome {entry.name} na letra pode
            transformar o significado do nome em memoria afetiva.
          </p>
          <Link href="/criar">Criar o pack do bebê</Link>
        </section>
      </article>
    </main>
  );
}
