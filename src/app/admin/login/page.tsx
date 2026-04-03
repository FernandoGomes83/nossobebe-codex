import type { Metadata } from "next";

import { loginAction } from "./actions";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Admin | NossoBebe",
  description: "Acesso administrativo do projeto NossoBebe.",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    redirectedFrom?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "Email ou senha invalidos.",
  missing_credentials: "Preencha email e senha para continuar.",
  not_authorized: "Seu usuario existe, mas ainda nao foi liberado como admin.",
};

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const errorMessage = params.error ? errorMessages[params.error] : undefined;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Painel operacional</p>
          <h1>Entrar no admin</h1>
          <p>
            A area administrativa usa Supabase Auth separado do fluxo do
            cliente. O acesso real tambem depende da tabela <code>admin_users</code>.
          </p>
        </div>

        <form className={styles.form} action={loginAction}>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {params.redirectedFrom ? (
            <p className={styles.note}>
              Login exigido para acessar <strong>{params.redirectedFrom}</strong>.
            </p>
          ) : null}

          {errorMessage ? (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button className={styles.submit} type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
