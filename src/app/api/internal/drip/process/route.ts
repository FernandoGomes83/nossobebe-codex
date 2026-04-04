import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { processDueDripJobs } from "@/lib/drip/service";
import { isAuthorizedCronRequest } from "@/lib/security/cron";

export const dynamic = "force-dynamic";

const processDripQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsedQuery = processDripQuerySchema.safeParse({
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "invalid query" }, { status: 400 });
  }

  const result = await processDueDripJobs(parsedQuery.data.limit ?? 10);

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
