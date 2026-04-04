"use client";

import { useActionState, useMemo, useState } from "react";

import {
  INDIVIDUAL_PRODUCT_KINDS,
  PRODUCT_CATALOG,
  ProductKind,
  calculateSelection,
  formatPrice,
} from "@/lib/catalog";

import {
  initialDraftOrderState,
  validateDraftOrder,
} from "../actions";
import { PhotoUploadField } from "./photo-upload-field";
import styles from "./create-order-form.module.css";

const musicOptions = [
  ["mpb", "MPB"],
  ["instrumental", "Instrumental"],
  ["gospel", "Gospel"],
  ["classico", "Classico"],
  ["lofi", "Lo-fi"],
  ["pop", "Pop suave"],
] as const;

const artOptions = [
  ["aquarela", "Aquarela"],
  ["ilustracao", "Ilustracao infantil"],
  ["minimalista", "Minimalista"],
  ["retro", "Poster retro"],
] as const;

function isProductSelected(selected: ProductKind[], kind: ProductKind) {
  return selected.includes(kind);
}

export function CreateOrderForm() {
  const [state, formAction, pending] = useActionState(
    validateDraftOrder,
    initialDraftOrderState,
  );
  const [selectedPack, setSelectedPack] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<ProductKind[]>([]);

  const selection = useMemo(
    () => calculateSelection({ selectedPack, selectedProducts }),
    [selectedPack, selectedProducts],
  );

  const shouldShowMusicSection =
    selectedPack || isProductSelected(selectedProducts, "song");
  const shouldShowArtSection =
    selectedPack || isProductSelected(selectedProducts, "art");
  const fieldErrors = state?.fieldErrors ?? {};

  function togglePack(nextValue: boolean) {
    setSelectedPack(nextValue);
    if (nextValue) {
      setSelectedProducts([]);
    }
  }

  function toggleProduct(kind: ProductKind) {
    setSelectedPack(false);
    setSelectedProducts((current) =>
      current.includes(kind)
        ? current.filter((item) => item !== kind)
        : [...current, kind],
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Montagem do pedido</p>
          <h1>Escolha o pack ou monte os avulsos.</h1>
          <p className={styles.description}>
            Esta etapa organiza o briefing comercial do pedido e aplica a regra
            de ancoragem para empurrar o pack quando fizer mais sentido.
          </p>
        </div>

        <aside className={styles.summaryCard}>
          <span>Resumo atual</span>
          <strong>{formatPrice(selection.totalCents)}</strong>
          <p>
            {selection.includesPack
              ? "Pack completo selecionado."
              : `${selection.items.length} item(ns) avulso(s) selecionado(s).`}
          </p>
          {selection.isPackBetterDeal ? (
            <p className={styles.packAlert}>
              Os avulsos ficaram mais caros que o pack completo. Trocar para o
              pack economiza{" "}
              {formatPrice(
                selection.individualTotalCents - PRODUCT_CATALOG.pack.priceCents,
              )}
              .
            </p>
          ) : null}
        </aside>
      </section>

      <form action={formAction} className={styles.form}>
        <div aria-hidden="true" className={styles.honeypot}>
          <label htmlFor="website">Nao preencha este campo</label>
          <input
            autoComplete="off"
            id="website"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.step}>Etapa 1</p>
            <h2>Escolha comercial</h2>
          </div>

          <div className={styles.productGrid}>
            <label
              className={`${styles.productCard} ${selectedPack ? styles.selected : ""}`}
            >
              <input
                checked={selectedPack}
                name="selectedPack"
                onChange={(event) => togglePack(event.target.checked)}
                type="checkbox"
              />
              <span className={styles.productBadge}>Melhor oferta</span>
              <strong>{PRODUCT_CATALOG.pack.name}</strong>
              <p>{PRODUCT_CATALOG.pack.description}</p>
              <em>{formatPrice(PRODUCT_CATALOG.pack.priceCents)}</em>
            </label>

            {INDIVIDUAL_PRODUCT_KINDS.map((kind) => {
              const product = PRODUCT_CATALOG[kind];
              const selected = isProductSelected(selectedProducts, kind);

              return (
                <label
                  key={kind}
                  className={`${styles.productCard} ${selected ? styles.selected : ""}`}
                >
                  <input
                    checked={selected}
                    disabled={selectedPack}
                    name="selectedProducts"
                    onChange={() => toggleProduct(kind)}
                    type="checkbox"
                    value={kind}
                  />
                  <strong>{product.name}</strong>
                  <p>{product.description}</p>
                  <em>{formatPrice(product.priceCents)}</em>
                </label>
              );
            })}
          </div>

          {fieldErrors.selectedProducts?.length ? (
            <p className={styles.error}>{fieldErrors.selectedProducts[0]}</p>
          ) : null}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.step}>Etapa 2</p>
            <h2>Dados do bebe</h2>
          </div>

          <PhotoUploadField name="uploadedPhotoId" />

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Email do comprador</span>
              <input name="customerEmail" type="email" required />
              {fieldErrors.customerEmail?.[0] ? (
                <small>{fieldErrors.customerEmail[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Nome do bebe</span>
              <input name="babyName" maxLength={50} required />
              {fieldErrors.babyName?.[0] ? (
                <small>{fieldErrors.babyName[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Data de nascimento</span>
              <input name="birthDate" type="date" required />
              {fieldErrors.birthDate?.[0] ? (
                <small>{fieldErrors.birthDate[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Hora de nascimento</span>
              <input name="birthTime" type="time" />
            </label>

            <label className={styles.field}>
              <span>Cidade de nascimento</span>
              <input name="birthCity" maxLength={100} required />
              {fieldErrors.birthCity?.[0] ? (
                <small>{fieldErrors.birthCity[0]}</small>
              ) : null}
            </label>

            <label className={styles.field}>
              <span>Peso ao nascer</span>
              <input name="birthWeightText" maxLength={10} placeholder="3,250 kg" />
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Nomes dos pais</span>
              <input name="parentNames" maxLength={100} />
            </label>
          </div>
        </section>

        {shouldShowMusicSection ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.step}>Etapa 3</p>
              <h2>Direcao musical</h2>
            </div>

            <div className={styles.choiceGrid}>
              {musicOptions.map(([value, label]) => (
                <label key={value} className={styles.choiceCard}>
                  <input name="musicStyle" type="radio" value={value} />
                  <strong>{label}</strong>
                </label>
              ))}
            </div>
            {fieldErrors.musicStyle?.[0] ? (
              <p className={styles.error}>{fieldErrors.musicStyle[0]}</p>
            ) : null}

            <div className={styles.inlineChoices}>
              <label className={styles.pill}>
                <input name="musicTone" type="radio" value="alegre" />
                <span>Mais alegre</span>
              </label>
              <label className={styles.pill}>
                <input name="musicTone" type="radio" value="suave" />
                <span>Mais suave</span>
              </label>
            </div>
            {fieldErrors.musicTone?.[0] ? (
              <p className={styles.error}>{fieldErrors.musicTone[0]}</p>
            ) : null}

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Palavras ou frases especiais</span>
              <textarea name="specialWords" maxLength={200} rows={4} />
            </label>
          </section>
        ) : null}

        {shouldShowArtSection ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.step}>Etapa 4</p>
              <h2>Estilo da arte</h2>
            </div>

            <div className={styles.choiceGrid}>
              {artOptions.map(([value, label]) => (
                <label key={value} className={styles.choiceCard}>
                  <input name="artStyle" type="radio" value={value} />
                  <strong>{label}</strong>
                </label>
              ))}
            </div>
            {fieldErrors.artStyle?.[0] ? (
              <p className={styles.error}>{fieldErrors.artStyle[0]}</p>
            ) : null}
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.step}>Resumo</p>
            <h2>Fechamento comercial</h2>
          </div>

          <div className={styles.checkoutBox}>
            <div>
              <span className={styles.summaryLabel}>Itens selecionados</span>
              <ul className={styles.summaryList}>
                {selection.items.map((item) => (
                  <li key={item.kind}>
                    <span>{item.shortName}</span>
                    <strong>{formatPrice(item.priceCents)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.totalBlock}>
              <span className={styles.summaryLabel}>Total atual</span>
              <strong>{formatPrice(selection.totalCents)}</strong>
              <p>Entrega manual em ate 24 horas apos aprovacao.</p>
            </div>
          </div>

          {state?.message ? (
            <p className={state.success ? styles.success : styles.error}>
              {state.message}
            </p>
          ) : null}

          <button className={styles.submitButton} disabled={pending} type="submit">
            {pending ? "Abrindo checkout..." : "Ir para o pagamento"}
          </button>
        </section>
      </form>
    </main>
  );
}
