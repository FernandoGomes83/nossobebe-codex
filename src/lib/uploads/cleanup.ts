import { createAdminClient } from "@/lib/supabase/admin";

const CHECKOUT_UPLOAD_GRACE_HOURS = 48;
const POST_OPERATION_UPLOAD_GRACE_HOURS = 48;
const REFUNDED_UPLOAD_GRACE_HOURS = 24;

function addHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function getCheckoutUploadDeleteAfter() {
  return addHours(CHECKOUT_UPLOAD_GRACE_HOURS);
}

export function getPostOperationUploadDeleteAfter() {
  return addHours(POST_OPERATION_UPLOAD_GRACE_HOURS);
}

export function getRefundedUploadDeleteAfter() {
  return addHours(REFUNDED_UPLOAD_GRACE_HOURS);
}

export async function retainOrderUploads(orderId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("uploads")
    .update({
      delete_after: null,
    })
    .eq("order_id", orderId)
    .in("status", ["pending", "processed"]);

  if (error) {
    throw new Error("Could not retain order uploads.");
  }
}

export async function scheduleOrderUploadDeletion(
  orderId: string,
  deleteAfter = getPostOperationUploadDeleteAfter(),
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("uploads")
    .update({
      delete_after: deleteAfter,
    })
    .eq("order_id", orderId)
    .in("status", ["pending", "processed"]);

  if (error) {
    throw new Error("Could not schedule order upload deletion.");
  }
}

export async function cleanupExpiredUploads(limit = 50) {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: uploads, error } = await admin
    .from("uploads")
    .select("id, bucket_name, storage_path")
    .in("status", ["pending", "processed", "rejected"])
    .not("delete_after", "is", null)
    .lte("delete_after", now)
    .order("delete_after", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error("Could not load expired uploads.");
  }

  let deleted = 0;
  let failed = 0;

  for (const upload of uploads ?? []) {
    const { error: storageError } = await admin.storage
      .from(upload.bucket_name)
      .remove([upload.storage_path]);

    if (storageError) {
      failed += 1;
      continue;
    }

    const { error: updateError } = await admin
      .from("uploads")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
        delete_after: null,
      })
      .eq("id", upload.id);

    if (updateError) {
      failed += 1;
      continue;
    }

    deleted += 1;
  }

  return {
    scanned: uploads?.length ?? 0,
    deleted,
    failed,
  };
}
