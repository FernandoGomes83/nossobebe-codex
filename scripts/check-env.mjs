const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "APP_URL",
  "EMAIL_ENCRYPTION_KEY",
  "ORDER_ACCESS_TOKEN_SECRET",
  "MERCADO_PAGO_ACCESS_TOKEN",
  "MERCADO_PAGO_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CRON_SECRET",
];

const recommendedEnv = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

let hasFailure = false;

process.stdout.write("Checking required environment variables...\n");

for (const key of requiredEnv) {
  if (!process.env[key]) {
    hasFailure = true;
    process.stdout.write(`MISSING ${key}\n`);
  } else {
    process.stdout.write(`OK ${key}\n`);
  }
}

process.stdout.write("\nChecking recommended environment variables...\n");

for (const key of recommendedEnv) {
  if (!process.env[key]) {
    process.stdout.write(`WARN ${key} not set\n`);
  } else {
    process.stdout.write(`OK ${key}\n`);
  }
}

if (hasFailure) {
  process.stderr.write(
    "\nEnvironment validation failed. Fill the missing required variables before deploy.\n",
  );
  process.exit(1);
}

process.stdout.write("\nEnvironment validation passed.\n");
