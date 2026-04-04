import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/security/cron";
import { cleanupExpiredUploads } from "@/lib/uploads/cleanup";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await cleanupExpiredUploads();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
