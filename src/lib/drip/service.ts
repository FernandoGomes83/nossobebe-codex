import { z } from "zod";

import { sendWeeklyDripEmail } from "@/lib/email/service";
import { hashEmail } from "@/lib/security/crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const unsubscribeTokenSchema = z.string().uuid();
const MAX_DRIP_ATTEMPTS = 3;
const DRIP_WEEK_SEQUENCE = Array.from({ length: 12 }, (_, index) => index + 1);

function addWeeks(date: Date, weeks: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + weeks * 7);
  return copy;
}

function buildTemplateKey(weekNumber: number) {
  return `week-${weekNumber}`;
}

function parseTemplateWeekNumber(templateKey: string, payload: unknown) {
  const payloadWeekNumber =
    payload &&
    typeof payload === "object" &&
    "weekNumber" in payload &&
    typeof payload.weekNumber === "number"
      ? payload.weekNumber
      : null;

  if (payloadWeekNumber && Number.isInteger(payloadWeekNumber)) {
    return payloadWeekNumber;
  }

  const match = /^week-(\d+)$/.exec(templateKey);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isInteger(parsed) ? parsed : null;
}

async function getSubscriptionByOrderId(orderId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("drip_subscriptions")
    .select("id, order_id, consented_at, unsubscribed_at, unsubscribe_token")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load drip subscription.");
  }

  return data;
}

async function cancelPendingDripJobsForSubscription(
  subscriptionId: string,
  reason: string,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("drip_jobs")
    .update({
      status: "cancelled",
      last_error: reason,
    })
    .eq("subscription_id", subscriptionId)
    .in("status", ["pending", "failed", "processing"])
    .is("sent_at", null)
    .select("id");

  if (error) {
    throw new Error("Could not cancel drip jobs.");
  }

  return data?.length ?? 0;
}

async function getJobContext(subscriptionId: string) {
  const admin = createAdminClient();
  const { data: subscription, error: subscriptionError } = await admin
    .from("drip_subscriptions")
    .select("id, order_id, consented_at, unsubscribed_at, unsubscribe_token")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error("Could not load drip subscription context.");
  }

  if (!subscription) {
    return null;
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id, baby_name, customer_email_ciphertext, public_token, status, paid_at",
    )
    .eq("id", subscription.order_id)
    .maybeSingle();

  if (orderError) {
    throw new Error("Could not load drip order context.");
  }

  if (!order) {
    return null;
  }

  return {
    subscription,
    order,
  };
}

export async function upsertDripSubscriptionForOrder(input: {
  orderId: string;
  customerEmail: string;
  consented: boolean;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("drip_subscriptions").upsert(
    {
      order_id: input.orderId,
      email_hash: hashEmail(input.customerEmail),
      consented_at: input.consented ? new Date().toISOString() : null,
      unsubscribed_at: null,
    },
    {
      onConflict: "order_id",
    },
  );

  if (error) {
    throw new Error("Could not persist drip subscription.");
  }
}

export async function scheduleWeeklyDripJobsForOrder(
  orderId: string,
  anchorDateIso: string,
) {
  const subscription = await getSubscriptionByOrderId(orderId);

  if (!subscription || !subscription.consented_at || subscription.unsubscribed_at) {
    return {
      scheduled: 0,
    };
  }

  const admin = createAdminClient();
  const anchorDate = new Date(anchorDateIso);
  const { data, error } = await admin
    .from("drip_jobs")
    .upsert(
      DRIP_WEEK_SEQUENCE.map((weekNumber) => ({
        subscription_id: subscription.id,
        template_key: buildTemplateKey(weekNumber),
        scheduled_for: addWeeks(anchorDate, weekNumber).toISOString(),
        payload: { weekNumber },
      })),
      {
        onConflict: "subscription_id,template_key",
        ignoreDuplicates: true,
      },
    )
    .select("id");

  if (error) {
    throw new Error("Could not schedule drip jobs.");
  }

  return {
    scheduled: data?.length ?? 0,
  };
}

export async function cancelPendingDripJobsForOrder(
  orderId: string,
  reason: string,
) {
  const subscription = await getSubscriptionByOrderId(orderId);

  if (!subscription) {
    return {
      cancelled: 0,
    };
  }

  const cancelled = await cancelPendingDripJobsForSubscription(
    subscription.id,
    reason,
  );

  return {
    cancelled,
  };
}

export async function getDripUnsubscribeContext(token: string) {
  const parsedToken = unsubscribeTokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return null;
  }

  const admin = createAdminClient();
  const { data: subscription, error: subscriptionError } = await admin
    .from("drip_subscriptions")
    .select("id, order_id, consented_at, unsubscribed_at, unsubscribe_token")
    .eq("unsubscribe_token", parsedToken.data)
    .maybeSingle();

  if (subscriptionError || !subscription) {
    return null;
  }

  const { data: order } = await admin
    .from("orders")
    .select("baby_name")
    .eq("id", subscription.order_id)
    .maybeSingle();

  return {
    babyName: order?.baby_name ?? "seu bebe",
    consentedAt: subscription.consented_at,
    token: subscription.unsubscribe_token,
    unsubscribedAt: subscription.unsubscribed_at,
  };
}

export async function unsubscribeDripByToken(token: string) {
  const parsedToken = unsubscribeTokenSchema.safeParse(token);

  if (!parsedToken.success) {
    return {
      success: false,
    };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: subscription, error } = await admin
    .from("drip_subscriptions")
    .update({
      unsubscribed_at: now,
    })
    .eq("unsubscribe_token", parsedToken.data)
    .is("unsubscribed_at", null)
    .select("id, order_id")
    .maybeSingle();

  if (error) {
    throw new Error("Could not unsubscribe drip subscription.");
  }

  if (!subscription) {
    return {
      success: true,
      changed: false,
    };
  }

  const cancelled = await cancelPendingDripJobsForSubscription(
    subscription.id,
    "Cancelled by customer unsubscribe.",
  );

  return {
    success: true,
    changed: true,
    cancelled,
  };
}

export async function processDueDripJobs(limit = 10) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data: candidates, error: candidatesError } = await admin
    .from("drip_jobs")
    .select("id, subscription_id, template_key, attempts, payload, scheduled_for")
    .in("status", ["pending", "failed"])
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (candidatesError) {
    throw new Error("Could not load due drip jobs.");
  }

  if (!candidates?.length) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
    };
  }

  const { data: lockedJobs, error: lockError } = await admin
    .from("drip_jobs")
    .update({
      status: "processing",
      last_error: null,
    })
    .in(
      "id",
      candidates.map((job) => job.id),
    )
    .in("status", ["pending", "failed"])
    .select("id, subscription_id, template_key, attempts, payload");

  if (lockError) {
    throw new Error("Could not lock drip jobs.");
  }

  let sent = 0;
  let failed = 0;
  let cancelled = 0;

  for (const job of lockedJobs ?? []) {
    const context = await getJobContext(job.subscription_id);

    if (
      !context ||
      !context.subscription.consented_at ||
      context.subscription.unsubscribed_at ||
      context.order.status === "refunded" ||
      context.order.status === "cancelled"
    ) {
      await admin
        .from("drip_jobs")
        .update({
          status: "cancelled",
          last_error: "Subscription is no longer eligible for drip delivery.",
        })
        .eq("id", job.id);

      cancelled += 1;
      continue;
    }

    const weekNumber = parseTemplateWeekNumber(job.template_key, job.payload);

    if (!weekNumber) {
      await admin
        .from("drip_jobs")
        .update({
          status: "cancelled",
          last_error: "Invalid drip template key.",
        })
        .eq("id", job.id);

      cancelled += 1;
      continue;
    }

    try {
      await sendWeeklyDripEmail({
        babyName: context.order.baby_name,
        customerEmailCiphertext: context.order.customer_email_ciphertext,
        publicToken: context.order.public_token,
        unsubscribeToken: context.subscription.unsubscribe_token,
        weekNumber,
      });

      await admin
        .from("drip_jobs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          attempts: job.attempts + 1,
          last_error: null,
        })
        .eq("id", job.id);

      sent += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const finalStatus = attempts >= MAX_DRIP_ATTEMPTS ? "cancelled" : "failed";

      await admin
        .from("drip_jobs")
        .update({
          status: finalStatus,
          attempts,
          last_error:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Unknown drip delivery failure.",
        })
        .eq("id", job.id);

      if (finalStatus === "cancelled") {
        cancelled += 1;
      } else {
        failed += 1;
      }
    }
  }

  return {
    processed: (lockedJobs ?? []).length,
    sent,
    failed,
    cancelled,
  };
}
