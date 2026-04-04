import Link from "next/link";

import styles from "./site-shell.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/">
        NossoBebe
      </Link>

      <nav className={styles.nav} aria-label="Navegacao principal">
        <Link href="/criar">Criar pedido</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/contato">Contato</Link>
      </nav>
    </header>
  );
}
