import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/db";

let ratelimiters: Record<string, Ratelimit> = {};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function checkViaUpstash(
  redis: Redis,
  bucket: string,
  key: string,
  limit: { requests: number; windowSeconds: number }
) {
  let limiter = ratelimiters[bucket];
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit.requests, `${limit.windowSeconds} s`),
      prefix: `cosfy:ratelimit:${bucket}`,
    });
    ratelimiters = { ...ratelimiters, [bucket]: limiter };
  }

  const result = await limiter.limit(key);
  if (result.success) return { ok: true as const };
  return { ok: false as const, retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
}

// Postgres-backed sliding window: used whenever Upstash isn't configured, so
// the AI-cost and upload routes are never left completely unthrottled just
// because an optional third-party env var wasn't set. Slower than Redis (a
// DB round trip per check) but fine at Cosfy's scale, and it's already the
// database every request touches anyway.
async function checkViaDb(bucket: string, key: string, limit: { requests: number; windowSeconds: number }) {
  const bucketKey = `${bucket}:${key}`;
  const windowStart = new Date(Date.now() - limit.windowSeconds * 1000);

  // Prune this key's expired hits before counting, so the table stays small
  // and the count below only reflects the live window.
  await db.rateLimitHit.deleteMany({ where: { bucketKey, createdAt: { lt: windowStart } } });

  const count = await db.rateLimitHit.count({ where: { bucketKey, createdAt: { gte: windowStart } } });
  if (count >= limit.requests) {
    return { ok: false as const, retryAfterSeconds: limit.windowSeconds };
  }

  await db.rateLimitHit.create({ data: { bucketKey } });
  return { ok: true as const };
}

/**
 * Sliding-window rate limit keyed by session id (or IP as a fallback for
 * unauthenticated calls). Prefers Upstash Redis when configured
 * (UPSTASH_REDIS_REST_URL/TOKEN); otherwise falls back to a Postgres-backed
 * check so requests are never left completely unthrottled.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  limit: { requests: number; windowSeconds: number }
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const redis = getRedis();
  if (redis) return checkViaUpstash(redis, bucket, key, limit);
  return checkViaDb(bucket, key, limit);
}
