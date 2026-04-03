function readRequiredEnv(
  key: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicEnv() {
  return {
    supabaseUrl: readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabasePublishableKey: readRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}

function readRequiredServerEnv(
  key:
    | "SUPABASE_SERVICE_ROLE_KEY"
    | "APP_URL"
    | "EMAIL_ENCRYPTION_KEY"
    | "ORDER_ACCESS_TOKEN_SECRET"
    | "MERCADO_PAGO_ACCESS_TOKEN"
    | "MERCADO_PAGO_WEBHOOK_SECRET"
    | "RESEND_API_KEY"
    | "EMAIL_FROM",
) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`);
  }

  return value;
}

export function getServerEnv() {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: readRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    appUrl: readRequiredServerEnv("APP_URL"),
    emailEncryptionKey: readRequiredServerEnv("EMAIL_ENCRYPTION_KEY"),
    orderAccessTokenSecret: readRequiredServerEnv("ORDER_ACCESS_TOKEN_SECRET"),
    mercadoPagoAccessToken: readRequiredServerEnv("MERCADO_PAGO_ACCESS_TOKEN"),
    mercadoPagoWebhookSecret: readRequiredServerEnv(
      "MERCADO_PAGO_WEBHOOK_SECRET",
    ),
    resendApiKey: readRequiredServerEnv("RESEND_API_KEY"),
    emailFrom: readRequiredServerEnv("EMAIL_FROM"),
  };
}
