import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBlogPost, listBlogSlugs } from "@/lib/content/blog";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";
import { buildArticleJsonLd } from "@/lib/seo/json-ld";

import styles from "./page.module.css";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await listBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.metadata.title} | NossoBebe`,
    description: post.metadata.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const Post = post.default;
  const siteUrl = process.env.APP_URL || "https://nossobebe.com.br";
  const articleJsonLd = buildArticleJsonLd({
    title: post.metadata.title,
    description: post.metadata.description,
    publishedAt: post.metadata.publishedAt,
    url: `${siteUrl}/blog/${slug}`,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", item: siteUrl },
    { name: "Blog", item: `${siteUrl}/blog` },
    { name: post.metadata.title, item: `${siteUrl}/blog/${slug}` },
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
        <header className={styles.header}>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.metadata.title },
            ]}
          />
          <p className={styles.category}>{post.metadata.category}</p>
          <h1>{post.metadata.title}</h1>
          <p className={styles.description}>{post.metadata.description}</p>
          <small>
            {new Date(post.metadata.publishedAt).toLocaleDateString("pt-BR")}
          </small>
        </header>

        <div className={styles.content}>
          <Post />
        </div>
      </article>
    </main>
  );
}
