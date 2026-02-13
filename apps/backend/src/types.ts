export interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  author: string | null;
  summary: string | null;
  guid: string | null;
  sourceName: string;
  sourceUrl: string;
}

export interface FeedResponse {
  feed: {
    title: string;
    link: string;
    description: string | null;
  };
  articles: NewsArticle[];
}

export interface RateLimitEntry {
  lastFetch: number;
  count: number;
}
