/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(options: RateLimitOptions) {
  return {
    async check(
      request: Request,
      limit: number,
      identifier: string
    ): Promise<void> {
      const key = `${identifier}:${getClientIdentifier(request)}`;
      const now = Date.now();

      // Clean up expired entries
      Object.keys(store).forEach((k) => {
        if (store[k].resetTime < now) {
          delete store[k];
        }
      });

      // Get or create entry
      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 0,
          resetTime: now + options.interval,
        };
      }

      // Increment count
      store[key].count++;

      // Check limit
      if (store[key].count > limit) {
        throw new Error("Rate limit exceeded");
      }
    },
  };
}

function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return (
    cfConnectingIp ||
    realIp ||
    (forwarded ? forwarded.split(",")[0].trim() : "unknown")
  );
}

