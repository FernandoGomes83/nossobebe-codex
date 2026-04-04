import crypto from "node:crypto";

import { getServerEnv } from "@/lib/env";

function parseSignatureHeader(headerValue: string | null) {
  if (!headerValue) {
    return null;
  }

  const parts = headerValue.split(",");
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split("=", 2).map((item) => item?.trim());

    if (key === "ts") {
      ts = value ?? null;
    }

    if (key === "v1") {
      v1 = value ?? null;
    }
  }

  return ts && v1 ? { ts, v1 } : null;
}

export function validateMercadoPagoWebhookSignature(input: {
  signatureHeader: string | null;
  requestIdHeader: string | null;
  dataId: string | null;
}) {
  const parsed = parseSignatureHeader(input.signatureHeader);

  if (!parsed) {
    return false;
  }

  const env = getServerEnv();
  const manifestParts = [`ts:${parsed.ts};`];

  if (input.dataId) {
    manifestParts.unshift(`id:${input.dataId.toLowerCase()};`);
  }

  if (input.requestIdHeader) {
    manifestParts.splice(1, 0, `request-id:${input.requestIdHeader};`);
  }

  const manifest = manifestParts.join("");
  const expected = crypto
    .createHmac("sha256", env.mercadoPagoWebhookSecret)
    .update(manifest)
    .digest("hex");

  if (parsed.v1.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(parsed.v1, "utf8"),
    Buffer.from(expected, "utf8"),
  );
}
