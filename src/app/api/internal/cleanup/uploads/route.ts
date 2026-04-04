import crypto from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { cleanupExpiredUploads } from "@/lib/uploads/cleanup";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await cleanupExpiredUploads();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
