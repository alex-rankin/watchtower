import type { FeedResponse } from "./types";

export async function fetchFeed(feedUrl: string): Promise<FeedResponse> {
  const response = await fetch(
    `/api/news/rss?feedUrl=${encodeURIComponent(feedUrl)}`,
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch feed: ${response.statusText}`,
    );
  }

  return response.json();
}
