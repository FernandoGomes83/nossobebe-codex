import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getDripUnsubscribeContext,
  unsubscribeDripByToken,
} from "@/lib/drip/service";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cancelar emails semanais | NossoBebe",
  description: "Gerencie o recebimento dos emails semanais do NossoBebe.",
};

type DripUnsubscribePageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    done?: string;
  }>;
};

export default async function DripUnsubscribePage({
  params,
  searchParams,
}: DripUnsubscribePageProps) {
  const { token } = await params;
  const { done } = await searchParams;
  const context = await getDripUnsubscribeContext(token);

  if (!context) {
    notFound();
  }

  async function unsubscribeAction(formData: FormData) {
    "use server";

    const rawToken = formData.get("token");

    if (typeof rawToken !== "string" || rawToken.trim().length === 0) {
      notFound();
    }

    await unsubscribeDripByToken(rawToken);
    redirect(`/email/unsubscribe/${rawToken}?done=1`);
  }

  const alreadyDone = done === "1" || !!context.unsubscribedAt;
  const description = alreadyDone
    ? `Os emails semanais de ${context.babyName} foram cancelados com sucesso.`
    : `Voce autorizou receber emails semanais relacionados a ${context.babyName}. Se quiser, pode cancelar essa sequencia agora.`;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Preferencias de email</p>
        <h1>{alreadyDone ? "Inscricao cancelada" : "Cancelar emails semanais"}</h1>
        <p>{description}</p>

        <div className={styles.actions}>
          {alreadyDone ? (
            <Link className={styles.secondaryLink} href="/">
              Voltar ao site
            </Link>
          ) : (
            <>
              <form action={unsubscribeAction}>
                <input name="token" type="hidden" value={context.token} />
                <button className={styles.primaryButton} type="submit">
                  Confirmar cancelamento
                </button>
              </form>
              <Link className={styles.secondaryLink} href="/">
                Manter inscricao
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
