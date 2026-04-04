import crypto from "node:crypto";

import type { NextRequest } from "next/server";

export function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || !authHeader) {
    return false;
  }

  const expected = `Bearer ${secret}`;

  if (authHeader.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(authHeader, "utf8"),
    Buffer.from(expected, "utf8"),
  );
}
