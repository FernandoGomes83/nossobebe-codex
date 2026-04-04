import crypto from "node:crypto";

import { fileTypeFromBuffer } from "file-type";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

import { getClientIp, consumeRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "heic", "heif"]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const rateLimit = await consumeRateLimit({
    key: `upload:${getClientIp(request.headers)}`,
    limit: 5,
    windowMs: 60 * 1000,
    prefix: "ratelimit:upload",
  });

  if (!rateLimit.allowed) {
    return jsonError("Muitas tentativas de upload. Tente novamente em instantes.", 429);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Arquivo ausente.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonError("Arquivo excede o limite de 10MB.");
  }

  const originalFilename = file.name || "upload";
  const ext = originalFilename.split(".").pop()?.toLowerCase();

  if (!ext || !allowedExtensions.has(ext)) {
    return jsonError("Extensao de arquivo nao permitida.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const sourceBuffer = Buffer.from(arrayBuffer);
  const detectedType = await fileTypeFromBuffer(sourceBuffer);

  if (!detectedType || !allowedMimes.has(detectedType.mime)) {
    return jsonError("Tipo de arquivo invalido.");
  }

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(sourceBuffer, { failOn: "error" }).metadata();
  } catch {
    return jsonError("Nao foi possivel validar a imagem.");
  }

  if (!metadata.width || !metadata.height) {
    return jsonError("Imagem invalida.");
  }

  if (metadata.width > 8000 || metadata.height > 8000) {
    return jsonError("Resolucao acima do permitido.");
  }

  const normalizedBuffer = await sharp(sourceBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 86,
      mozjpeg: true,
    })
    .toBuffer();

  const uploadId = crypto.randomUUID();
  const objectPath = `temporary/${uploadId}.jpg`;
  const sha256 = crypto.createHash("sha256").update(normalizedBuffer).digest("hex");
  const deleteAfter = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();

  const { error: storageError } = await admin.storage
    .from("baby-uploads")
    .upload(objectPath, normalizedBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (storageError) {
    return jsonError("Nao foi possivel salvar a foto agora.", 500);
  }

  const { error: insertError } = await admin.from("uploads").insert({
    id: uploadId,
    bucket_name: "baby-uploads",
    storage_path: objectPath,
    original_filename: originalFilename,
    mime_type: "image/jpeg",
    size_bytes: normalizedBuffer.byteLength,
    sha256,
    status: "processed",
    delete_after: deleteAfter,
    processed_at: new Date().toISOString(),
  });

  if (insertError) {
    await admin.storage.from("baby-uploads").remove([objectPath]);
    return jsonError("Nao foi possivel registrar o upload.", 500);
  }

  return NextResponse.json({
    ok: true,
    uploadId,
    mimeType: "image/jpeg",
    sizeBytes: normalizedBuffer.byteLength,
  });
}
