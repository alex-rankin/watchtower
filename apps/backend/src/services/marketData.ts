import YahooFinance from "yahoo-finance2";
import { MARKET_TICKERS } from "../config/tickers.js";

const yahooFinance = new YahooFinance();

export interface MarketQuoteResponse {
  id: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: number[];
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let cache: { at: number; data: MarketQuoteResponse[] } | null = null;

export async function fetchMarketQuotes(): Promise<MarketQuoteResponse[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const results: MarketQuoteResponse[] = [];

  for (const { id, dataSymbol } of MARKET_TICKERS) {
    try {
      const quote = await yahooFinance.quote(dataSymbol);
      const price =
        quote.regularMarketPrice ??
        quote.previousClose ??
        quote.open ??
        0;
      const change = quote.regularMarketChange ?? 0;
      const changePercent = quote.regularMarketChangePercent ?? 0;

      if (typeof price === "number" && !Number.isNaN(price)) {
        results.push({
          id,
          price,
          change: typeof change === "number" ? change : 0,
          changePercent: typeof changePercent === "number" ? changePercent : 0,
        });
      }
    } catch {
      // Skip this ticker; frontend will show "—" or "Unavailable"
    }
  }

  cache = { at: now, data: results };
  return results;
}
