import Link from "next/link";

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Fundacao do produto</p>
          <h1>NossoBebe esta pronto para receber a implementacao do MVP.</h1>
          <p className={styles.description}>
            A base do projeto foi criada com Next.js, preparada para Supabase,
            Vercel e para os requisitos de seguranca definidos nos documentos do
            produto.
          </p>
        </section>

        <section className={styles.grid} aria-label="Progresso da fundacao">
          <article className={styles.card}>
            <span>Estrutura</span>
            <strong>Next.js App Router</strong>
            <p>Projeto inicializado com TypeScript, ESLint e pasta src.</p>
          </article>
          <article className={styles.card}>
            <span>Backend</span>
            <strong>Supabase base</strong>
            <p>Clients de browser e server prontos para a proxima etapa.</p>
          </article>
          <article className={styles.card}>
            <span>Seguranca</span>
            <strong>Headers iniciais</strong>
            <p>Headers obrigatorios aplicados no app desde o inicio.</p>
          </article>
          <article className={styles.card}>
            <span>Proximo bloco</span>
            <strong>Schema e auth admin</strong>
            <p>Banco, storage privado e autenticacao operacional.</p>
          </article>
        </section>

        <div className={styles.ctas}>
          <Link className={styles.primary} href="/criar">
            Abrir wizard do pedido
          </Link>
          <Link className={styles.secondary} href="/admin">
            Abrir dashboard
          </Link>
          <Link className={styles.secondary} href="/blog">
            Abrir blog
          </Link>
        </div>
      </main>
    </div>
  );
}
