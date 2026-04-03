import crypto from "node:crypto";

import { getServerEnv } from "@/lib/env";

function getAesKey() {
  const env = getServerEnv();
  const raw = env.emailEncryptionKey.trim();

  const key = /^[0-9a-fA-F]+$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");

  if (key.length !== 32) {
    throw new Error("EMAIL_ENCRYPTION_KEY must decode to 32 bytes.");
  }

  return key;
}

export function hashEmail(email: string) {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

export function encryptEmail(email: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getAesKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(email.toLowerCase(), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptEmail(payload: string) {
  const buffer = Buffer.from(payload, "base64url");
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getAesKey(), iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
