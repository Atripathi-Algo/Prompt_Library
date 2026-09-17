/**
 * In-memory sliding-window rate limiter. Good enough for a single-instance
 * deployment; if this app ever runs behind multiple server instances, swap
 * the Map below for a shared store (e.g. Redis) — the interface stays the same.
 */
const buckets = new Map<string, number[]>();

// Periodically drop empty buckets so this doesn't grow unbounded over a long
// server lifetime.
const MAX_TRACKED_KEYS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = buckets.get(key);
  if (!timestamps) {
    timestamps = [];
    if (buckets.size >= MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
    buckets.set(key, timestamps);
  }

  while (timestamps.length > 0 && timestamps[0] < windowStart) {
    timestamps.shift();
  }

  if (timestamps.length >= limit) {
    return { ok: false, retryAfterMs: timestamps[0] + windowMs - now };
  }

  timestamps.push(now);
  return { ok: true, retryAfterMs: 0 };
}

/** Best-effort client identifier for rate limiting (proxy-aware). */
export function clientKey(req: Request, suffix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${ip}:${suffix}`;
}
