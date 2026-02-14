import type { MarketQuote } from "./types";

export async function fetchMarketQuotes(): Promise<MarketQuote[]> {
  const response = await fetch("/api/markets/quotes");

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch quotes: ${response.statusText}`,
    );
  }

  return response.json();
}
