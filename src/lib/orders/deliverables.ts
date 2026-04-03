import path from "node:path";
import crypto from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const kindMimeMap: Record<string, string[]> = {
  song_mp3: ["audio/mpeg"],
  song_video: ["video/mp4"],
  art_image: ["image/png", "image/jpeg"],
  world_poster: ["image/png", "image/jpeg"],
  name_art: ["image/png", "image/jpeg"],
  guide_pdf: ["application/pdf"],
  zip_bundle: ["application/zip"],
};

export function listDeliverableKinds() {
  return Object.keys(kindMimeMap);
}

export function isAllowedDeliverableMime(kind: string, mimeType: string) {
  return kindMimeMap[kind]?.includes(mimeType) ?? false;
}

export async function uploadDeliverable(input: {
  orderId: string;
  kind: string;
  file: File;
}) {
  const admin = createAdminClient();
  const extension = path.extname(input.file.name || "").toLowerCase() || ".bin";
  const deliverableId = crypto.randomUUID();
  const storagePath = `${input.orderId}/${deliverableId}${extension}`;
  const fileBuffer = Buffer.from(await input.file.arrayBuffer());

  const { error: storageError } = await admin.storage
    .from("deliverables")
    .upload(storagePath, fileBuffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (storageError) {
    throw new Error("Could not upload deliverable file.");
  }

  const { error: insertError } = await admin.from("deliverables").insert({
    id: deliverableId,
    order_id: input.orderId,
    kind: input.kind,
    bucket_name: "deliverables",
    storage_path: storagePath,
    mime_type: input.file.type || "application/octet-stream",
    size_bytes: fileBuffer.byteLength,
  });

  if (insertError) {
    await admin.storage.from("deliverables").remove([storagePath]);
    throw new Error("Could not register deliverable.");
  }
}

export async function publishDeliverable(input: {
  deliverableId: string;
  orderId: string;
}) {
  const admin = createAdminClient();

  await admin
    .from("deliverables")
    .update({
      published_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", input.deliverableId)
    .eq("order_id", input.orderId);
}
