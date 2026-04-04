import JSZip from "jszip";
import { NextResponse } from "next/server";

import { getPublishedDeliverablesByPublicToken } from "@/lib/orders/repository";
import { verifyOrderAccessToken } from "@/lib/security/order-access-token";
import { createAdminClient } from "@/lib/supabase/admin";

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "audio/mpeg":
      return "mp3";
    case "video/mp4":
      return "mp4";
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "application/pdf":
      return "pdf";
    case "application/zip":
      return "zip";
    default:
      return "bin";
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = verifyOrderAccessToken(token);

  if (!payload) {
    return NextResponse.json({ error: "invalid token" }, { status: 404 });
  }

  const data = await getPublishedDeliverablesByPublicToken(payload.publicToken);

  if (!data || data.deliverables.length === 0) {
    return NextResponse.json({ error: "no deliverables" }, { status: 404 });
  }

  const zip = new JSZip();
  const admin = createAdminClient();

  for (const item of data.deliverables) {
    const download = await admin.storage.from("deliverables").download(item.storage_path);

    if (download.error || !download.data) {
      continue;
    }

    const buffer = Buffer.from(await download.data.arrayBuffer());
    const extension = getExtensionFromMimeType(item.mime_type);

    zip.file(`${item.kind}.${extension}`, buffer);
  }

  const archive = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  const safeBabyName = data.order.baby_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return new Response(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"nossobebe-${safeBabyName || "pedido"}.zip\"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
