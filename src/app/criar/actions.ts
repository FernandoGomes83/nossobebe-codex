"use server";

import { redirect } from "next/navigation";

import { createOrderCheckout } from "@/lib/orders/repository";
import {
  getOrderDraftSummary,
  normalizeOrderDraftInput,
  orderDraftSchema,
} from "@/lib/orders/schema";

export type DraftOrderActionState = {
  success: boolean;
  message: string;
  fieldErrors: Record<string, string[] | undefined>;
  summary?: ReturnType<typeof getOrderDraftSummary>;
};

export const initialDraftOrderState: DraftOrderActionState = {
  success: false,
  message: "",
  fieldErrors: {},
};

export async function validateDraftOrder(
  _previousState: DraftOrderActionState,
  formData: FormData,
): Promise<DraftOrderActionState> {
  const normalized = normalizeOrderDraftInput({
    customerEmail: formData.get("customerEmail") ?? undefined,
    babyName: formData.get("babyName") ?? undefined,
    birthDate: formData.get("birthDate") ?? undefined,
    birthTime: formData.get("birthTime") ?? undefined,
    birthCity: formData.get("birthCity") ?? undefined,
    birthWeightText: formData.get("birthWeightText") ?? undefined,
    parentNames: formData.get("parentNames") ?? undefined,
    musicStyle: formData.get("musicStyle") ?? undefined,
    musicTone: formData.get("musicTone") ?? undefined,
    specialWords: formData.get("specialWords") ?? undefined,
    artStyle: formData.get("artStyle") ?? undefined,
    selectedPack: formData.get("selectedPack") ?? undefined,
    selectedProducts: formData.getAll("selectedProducts"),
  });

  const parsed = orderDraftSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos destacados antes de seguir para o checkout.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const checkout = await createOrderCheckout(parsed.data);
    redirect(checkout.checkoutUrl);
  } catch {
    return {
      success: false,
      message:
        "Nao foi possivel iniciar o checkout agora. Revise as configuracoes de ambiente e tente novamente.",
      fieldErrors: {},
      summary: getOrderDraftSummary(parsed.data),
    };
  }
}
