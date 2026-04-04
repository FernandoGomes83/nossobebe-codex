import Link from "next/link";

import { buildFaqJsonLd } from "@/lib/seo/faq";

import styles from "./page.module.css";

const faqItems = [
  {
    question: "Em quanto tempo o pack fica pronto?",
    answer:
      "No MVP atual, a entrega acontece de forma manual em até 24 horas após a aprovação do pagamento.",
  },
  {
    question: "Posso comprar apenas um item em vez do pack completo?",
    answer:
      "Sim. O cliente pode comprar produtos avulsos, embora o pack completo tenha melhor custo-benefício.",
  },
  {
    question: "Como recebo meus arquivos?",
    answer:
      "A entrega acontece em uma página segura do pedido, com links temporários para download dos entregáveis publicados.",
  },
];

export default function Home() {
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
          type="application/ld+json"
        />
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

        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>FAQ</p>
            <h2>Perguntas frequentes do MVP</h2>
          </div>

          <div className={styles.faqGrid}>
            {faqItems.map((item) => (
              <article key={item.question} className={styles.faqCard}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
