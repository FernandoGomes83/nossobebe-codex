export function buildArticleJsonLd(input: {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.publishedAt,
    inLanguage: "pt-BR",
    mainEntityOfPage: input.url,
    author: {
      "@type": "Organization",
      name: "NossoBebe",
    },
    publisher: {
      "@type": "Organization",
      name: "NossoBebe",
    },
  };
}
