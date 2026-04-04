import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type LocalLimiter = {
  count: number;
  windowMs: number;
};

type LimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  prefix: string;
};

const localStore = new Map<string, RateLimitEntry>();
const ratelimitCache = new Map<string, Ratelimit>();

function getDurationString(windowMs: number) {
  const seconds = Math.max(1, Math.floor(windowMs / 1000));
  return `${seconds} s` as Parameters<typeof Ratelimit.slidingWindow>[1];
}

function hasUpstashEnv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getRemoteLimiter(input: LocalLimiter & { prefix: string }) {
  const cacheKey = `${input.prefix}:${input.count}:${input.windowMs}`;
  const existing = ratelimitCache.get(cacheKey);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(input.count, getDurationString(input.windowMs)),
    analytics: true,
    prefix: input.prefix,
  });

  ratelimitCache.set(cacheKey, limiter);
  return limiter;
}

function consumeLocalRateLimit(input: LimitInput) {
  const now = Date.now();
  const current = localStore.get(input.key);

  if (!current || current.resetAt <= now) {
    localStore.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return {
      allowed: true,
      remaining: input.limit - 1,
      resetAt: now + input.windowMs,
      source: "memory" as const,
    };
  }

  if (current.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      source: "memory" as const,
    };
  }

  current.count += 1;
  localStore.set(input.key, current);

  return {
    allowed: true,
    remaining: input.limit - current.count,
    resetAt: current.resetAt,
    source: "memory" as const,
  };
}

export async function consumeRateLimit(input: LimitInput) {
  if (!hasUpstashEnv()) {
    return consumeLocalRateLimit(input);
  }

  const limiter = getRemoteLimiter({
    count: input.limit,
    windowMs: input.windowMs,
    prefix: input.prefix,
  });

  const result = await limiter.limit(input.key);

  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
    source: "upstash" as const,
  };
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return headers.get("x-real-ip") ?? "unknown";
}
