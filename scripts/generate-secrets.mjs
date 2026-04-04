import crypto from "node:crypto";

function printSecret(label, value) {
  process.stdout.write(`${label}=${value}\n`);
}

printSecret("EMAIL_ENCRYPTION_KEY", crypto.randomBytes(32).toString("hex"));
printSecret("ORDER_ACCESS_TOKEN_SECRET", crypto.randomBytes(48).toString("base64url"));
