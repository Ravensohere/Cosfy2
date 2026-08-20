import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimiters: Record<string, Ratelimit> = {};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Sliding-window rate limit keyed by session id (or IP as a fallback for
 * unauthenticated calls). Requests are allowed through if Upstash isn't
 * configured (UPSTASH_REDIS_REST_URL/TOKEN unset) rather than hard-failing
 * the whole app on a missing optional env var — set those two vars to
 * actually enforce limits.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  limit: { requests: number; windowSeconds: number }
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const redis = getRedis();
  if (!redis) return { ok: true };

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
  if (result.success) return { ok: true };
  return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
}
