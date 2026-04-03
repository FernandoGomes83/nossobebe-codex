import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import { getServerEnv } from "@/lib/env";

function createMercadoPagoConfig() {
  const env = getServerEnv();

  return new MercadoPagoConfig({
    accessToken: env.mercadoPagoAccessToken,
    options: {
      timeout: 5000,
    },
  });
}

export function createPreferenceClient() {
  return new Preference(createMercadoPagoConfig());
}

export function createPaymentClient() {
  return new Payment(createMercadoPagoConfig());
}
