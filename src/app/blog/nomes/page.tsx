import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { listNames } from "@/lib/content/names";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Nomes de bebê | NossoBebe",
  description:
    "Significados de nomes de bebê, origens, combinações e ideias para eternizar cada nome.",
};

export default function NamesIndexPage() {
  const names = listNames();
  const siteUrl = process.env.APP_URL || "https://nossobebe.com.br";
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", item: siteUrl },
    { name: "Blog", item: `${siteUrl}/blog` },
    { name: "Nomes", item: `${siteUrl}/blog/nomes` },
  ]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
          type="application/ld+json"
        />
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: "Nomes" },
          ]}
        />
        <p className={styles.eyebrow}>Base programatica</p>
        <h1>Significados de nomes para crescer o SEO de cauda longa.</h1>
        <p className={styles.description}>
          Esta secao concentra paginas de nomes com estrutura consistente para
          featured snippets, IA e linking interno com o produto.
        </p>
      </section>

      <section className={styles.grid}>
        {names.map((entry) => (
          <article key={entry.slug} className={styles.card}>
            <span>{entry.origin}</span>
            <h2>Significado do nome {entry.name}</h2>
            <p>{entry.meaning}</p>
            <Link href={`/blog/nomes/${entry.slug}`}>Abrir pagina</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
