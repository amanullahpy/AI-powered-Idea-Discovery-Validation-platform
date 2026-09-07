/**
 * Production-ready Sliding-Window Rate Limiter
 * Includes automatic expired entry pruning to prevent memory leaks in long-running processes
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const userRequestStore = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export interface RateLimitConfig {
  maxRequests: number; // e.g. 15 requests
  windowMs: number;    // e.g. 60000 (1 minute)
}

/**
 * Purges expired keys from memory when store exceeds threshold or every 5 minutes
 */
function pruneExpiredEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && userRequestStore.size < 500) {
    return;
  }

  for (const [key, record] of userRequestStore.entries()) {
    if (now > record.resetAt) {
      userRequestStore.delete(key);
    }
  }
  lastCleanup = now;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 15, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  pruneExpiredEntries(now);

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
