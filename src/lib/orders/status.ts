export const ORDER_STATUSES = [
  "draft",
  "checkout_pending",
  "payment_pending",
  "paid",
  "in_production",
  "ready",
  "delivered",
  "expired",
  "refunded",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CHECKOUT_STATUSES = [
  "created",
  "pending",
  "approved",
  "failed",
  "cancelled",
  "expired",
] as const;

export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number];

export const MANUAL_ORDER_STATUSES = [
  "in_production",
  "ready",
  "delivered",
] as const;

export type ManualOrderStatus = (typeof MANUAL_ORDER_STATUSES)[number];

type TransitionResult<TStatus extends string> = {
  allowed: boolean;
  changed: boolean;
  nextStatus: TStatus;
};

function unchanged<TStatus extends string>(status: TStatus): TransitionResult<TStatus> {
  return {
    allowed: true,
    changed: false,
    nextStatus: status,
  };
}

function changed<TStatus extends string>(status: TStatus): TransitionResult<TStatus> {
  return {
    allowed: true,
    changed: true,
    nextStatus: status,
  };
}

function blocked<TStatus extends string>(currentStatus: TStatus): TransitionResult<TStatus> {
  return {
    allowed: false,
    changed: false,
    nextStatus: currentStatus,
  };
}

export function resolveManualOrderStatusTransition(
  currentStatus: OrderStatus,
  requestedStatus: ManualOrderStatus,
) {
  if (currentStatus === requestedStatus) {
    return unchanged(currentStatus);
  }

  switch (requestedStatus) {
    case "in_production":
      return currentStatus === "paid"
        ? changed("in_production")
        : blocked(currentStatus);
    case "ready":
      return currentStatus === "paid" || currentStatus === "in_production"
        ? changed("ready")
        : blocked(currentStatus);
    case "delivered":
      return currentStatus === "ready"
        ? changed("delivered")
        : blocked(currentStatus);
  }
}

export function resolveWebhookOrderStatusTransition(
  currentStatus: OrderStatus,
  requestedStatus: Extract<OrderStatus, "payment_pending" | "paid" | "refunded">,
) {
  if (currentStatus === requestedStatus) {
    return unchanged(currentStatus);
  }

  switch (requestedStatus) {
    case "payment_pending":
      return currentStatus === "checkout_pending"
        ? changed("payment_pending")
        : currentStatus === "payment_pending"
          ? unchanged(currentStatus)
          : blocked(currentStatus);
    case "paid":
      if (currentStatus === "checkout_pending" || currentStatus === "payment_pending") {
        return changed("paid");
      }

      if (
        currentStatus === "paid" ||
        currentStatus === "in_production" ||
        currentStatus === "ready" ||
        currentStatus === "delivered"
      ) {
        return unchanged(currentStatus);
      }

      return blocked(currentStatus);
    case "refunded":
      if (
        currentStatus === "paid" ||
        currentStatus === "in_production" ||
        currentStatus === "ready" ||
        currentStatus === "delivered"
      ) {
        return changed("refunded");
      }

      return currentStatus === "refunded"
        ? unchanged(currentStatus)
        : blocked(currentStatus);
  }
}

export function resolveWebhookCheckoutStatusTransition(
  currentStatus: CheckoutStatus,
  requestedStatus: CheckoutStatus,
) {
  if (currentStatus === requestedStatus) {
    return unchanged(currentStatus);
  }

  switch (requestedStatus) {
    case "approved":
      return currentStatus === "created" || currentStatus === "pending"
        ? changed("approved")
        : currentStatus === "approved"
          ? unchanged(currentStatus)
          : blocked(currentStatus);
    case "pending":
      return currentStatus === "created"
        ? changed("pending")
        : currentStatus === "pending"
          ? unchanged(currentStatus)
          : blocked(currentStatus);
    case "failed":
    case "cancelled":
    case "expired":
      return currentStatus === "created" || currentStatus === "pending"
        ? changed(requestedStatus)
        : currentStatus === requestedStatus
          ? unchanged(currentStatus)
          : blocked(currentStatus);
    case "created":
      return blocked(currentStatus);
  }
}
