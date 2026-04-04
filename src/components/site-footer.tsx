import Link from "next/link";

import styles from "./site-shell.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>NossoBebe</strong>
        <p>
          Packs digitais personalizados para transformar os primeiros dias do
          bebe em memoria afetiva.
        </p>
      </div>

      <nav className={styles.footerNav} aria-label="Links do rodape">
        <Link href="/blog">Blog</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/contato">Contato</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos</Link>
      </nav>
    </footer>
  );
}
