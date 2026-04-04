import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";

import styles from "./pages.module.css";

export function MarketingPageShell(input: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  currentLabel: string;
  currentPath: string;
}) {
  const siteUrl = process.env.APP_URL || "https://nossobebe.com.br";
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", item: siteUrl },
    { name: input.currentLabel, item: `${siteUrl}${input.currentPath}` },
  ]);

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
          type="application/ld+json"
        />
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: input.currentLabel },
          ]}
        />
        <p className={styles.eyebrow}>{input.eyebrow}</p>
        <h1>{input.title}</h1>
        {input.children}
      </article>
    </main>
  );
}
