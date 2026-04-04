import type { Metadata } from "next";
import Link from "next/link";

import { getAllBlogPosts } from "@/lib/content/blog";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog | NossoBebe",
  description:
    "Conteudo sobre nomes, desenvolvimento do bebe e os primeiros meses da familia.",
};

export default async function BlogIndexPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Blog editorial</p>
        <h1>Conteudo para crescer organico e sustentar o AdSense.</h1>
        <p className={styles.description}>
          A base do blog ja nasce com App Router, metadata, MDX e estrutura para
          artigos editoriais e paginas programaticas de nomes.
        </p>
      </section>

      <section className={styles.grid}>
        {posts.map((post) => (
          <article key={post.slug} className={styles.card}>
            <span>{post.category}</span>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <div className={styles.meta}>
              <small>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</small>
              <Link href={`/blog/${post.slug}`}>Ler artigo</Link>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.namesCta}>
        <div>
          <p className={styles.eyebrow}>Conteudo programatico</p>
          <h2>Explore a secao de nomes do bebê.</h2>
          <p className={styles.description}>
            A area de nomes concentra paginas pensadas para SEO de cauda longa,
            snippets diretos e links internos para o produto.
          </p>
        </div>
        <Link className={styles.namesLink} href="/blog/nomes">
          Abrir secao de nomes
        </Link>
      </section>
    </main>
  );
}
