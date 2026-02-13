import type { RateLimitEntry } from "../types.js";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute per feed

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(feedUrl: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(feedUrl) || { lastFetch: 0, count: 0 };

  if (now - entry.lastFetch > RATE_LIMIT_WINDOW) {
    entry.count = 1;
    entry.lastFetch = now;
    rateLimitMap.set(feedUrl, entry);
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  rateLimitMap.set(feedUrl, entry);
  return true;
}
