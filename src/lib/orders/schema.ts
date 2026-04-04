import { z } from "zod";

import {
  INDIVIDUAL_PRODUCT_KINDS,
  PRODUCT_CATALOG,
  calculateSelection,
} from "@/lib/catalog";

const babyNamePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

function toOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toOptionalMusicStyle(value: unknown): OrderDraftInput["musicStyle"] {
  const normalized = toOptionalString(value);

  if (
    normalized === "mpb" ||
    normalized === "instrumental" ||
    normalized === "gospel" ||
    normalized === "classico" ||
    normalized === "lofi" ||
    normalized === "pop"
  ) {
    return normalized;
  }

  return undefined;
}

function toOptionalMusicTone(value: unknown): OrderDraftInput["musicTone"] {
  const normalized = toOptionalString(value);
  return normalized === "alegre" || normalized === "suave"
    ? normalized
    : undefined;
}

function toOptionalArtStyle(value: unknown): OrderDraftInput["artStyle"] {
  const normalized = toOptionalString(value);
  return normalized === "aquarela" ||
    normalized === "ilustracao" ||
    normalized === "minimalista" ||
    normalized === "retro"
    ? normalized
    : undefined;
}

function isValidBirthDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const now = new Date();
  const oldest = new Date();
  oldest.setFullYear(now.getFullYear() - 1);

  return date <= now && date >= oldest;
}

export const orderDraftSchema = z
  .object({
    uploadedPhotoId: z.string().uuid().optional().or(z.literal("")),
    customerEmail: z.string().email().max(254),
    babyName: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(babyNamePattern, "Use apenas letras, espacos, apostrofos e hifens."),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isValidBirthDate, "Informe uma data valida de ate 1 ano atras."),
    birthTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional()
      .or(z.literal("")),
    birthCity: z.string().trim().min(2).max(100),
    birthWeightText: z.string().trim().max(10).optional().or(z.literal("")),
    parentNames: z.string().trim().max(100).optional().or(z.literal("")),
    musicStyle: z
      .enum(["mpb", "instrumental", "gospel", "classico", "lofi", "pop"])
      .optional(),
    musicTone: z.enum(["alegre", "suave"]).optional(),
    specialWords: z.string().trim().max(200).optional().or(z.literal("")),
    artStyle: z
      .enum(["aquarela", "ilustracao", "minimalista", "retro"])
      .optional(),
    dripConsent: z.boolean(),
    selectedPack: z.boolean(),
    selectedProducts: z.array(z.enum(INDIVIDUAL_PRODUCT_KINDS)).max(5),
  })
  .superRefine((value, ctx) => {
    if (!value.selectedPack && value.selectedProducts.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["selectedProducts"],
        message: "Selecione pelo menos um produto ou o pack completo.",
      });
    }

    if (
      (value.selectedPack || value.selectedProducts.includes("song")) &&
      !value.musicStyle
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["musicStyle"],
        message: "Escolha o estilo musical para a canção.",
      });
    }

    if (
      (value.selectedPack || value.selectedProducts.includes("song")) &&
      !value.musicTone
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["musicTone"],
        message: "Escolha o tom principal da canção.",
      });
    }

    if (
      (value.selectedPack || value.selectedProducts.includes("art")) &&
      !value.artStyle
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["artStyle"],
        message: "Escolha o estilo visual da arte.",
      });
    }
  });

export type OrderDraftInput = z.infer<typeof orderDraftSchema>;

export function normalizeOrderDraftInput(
  raw: Record<string, FormDataEntryValue | FormDataEntryValue[] | undefined>,
): OrderDraftInput {
  const selectedPack = raw.selectedPack === "on";
  const selectedProducts = Array.isArray(raw.selectedProducts)
    ? raw.selectedProducts
    : raw.selectedProducts
      ? [raw.selectedProducts]
      : [];

  return {
    customerEmail: String(raw.customerEmail ?? "").trim().toLowerCase(),
    uploadedPhotoId: String(raw.uploadedPhotoId ?? "").trim(),
    babyName: String(raw.babyName ?? "").trim(),
    birthDate: String(raw.birthDate ?? "").trim(),
    birthTime: String(raw.birthTime ?? "").trim(),
    birthCity: String(raw.birthCity ?? "").trim(),
    birthWeightText: String(raw.birthWeightText ?? "").trim(),
    parentNames: String(raw.parentNames ?? "").trim(),
    musicStyle: toOptionalMusicStyle(raw.musicStyle),
    musicTone: toOptionalMusicTone(raw.musicTone),
    specialWords: String(raw.specialWords ?? "").trim(),
    artStyle: toOptionalArtStyle(raw.artStyle),
    dripConsent: raw.dripConsent === "on",
    selectedPack,
    selectedProducts: selectedProducts.map((value) => String(value).trim()) as
      | OrderDraftInput["selectedProducts"]
      | [],
  };
}

export function getOrderDraftSummary(input: OrderDraftInput) {
  const selection = calculateSelection({
    selectedPack: input.selectedPack,
    selectedProducts: input.selectedProducts,
  });

  return {
    ...selection,
    promisedDeliveryText: "Entrega manual em ate 24 horas apos a aprovacao.",
    packSavingsCents: Math.max(
      0,
      selection.individualTotalCents - PRODUCT_CATALOG.pack.priceCents,
    ),
  };
}
