/**
 * In-memory sliding-window rate limiter for server actions
 * Can be replaced with Redis/Upstash for multi-instance deployments
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const userRequestStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxRequests: number; // e.g. 10 requests
  windowMs: number;    // e.g. 60000 (1 minute)
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 15, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = userRequestStore.get(key);

  if (!record || now > record.resetAt) {
    userRequestStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (record.count >= config.maxRequests) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
  };
}
