import crypto from "node:crypto";

import { getServerEnv } from "@/lib/env";

type OrderTokenPayload = {
  publicToken: string;
  exp: number;
};

function encodePayload(payload: OrderTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(encodedPayload: string) {
  const env = getServerEnv();

  return crypto
    .createHmac("sha256", env.orderAccessTokenSecret)
    .update(encodedPayload)
    .digest("base64url");
}

export function createOrderAccessToken(publicToken: string, expiresInSeconds = 60 * 60 * 24 * 30) {
  const payload: OrderTokenPayload = {
    publicToken,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyOrderAccessToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as OrderTokenPayload;

  if (!payload.publicToken || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
