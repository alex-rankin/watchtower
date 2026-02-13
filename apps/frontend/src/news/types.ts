export type Leaning = "left" | "center" | "right" | "finance" | "other";

export interface FeedDefinition {
  id: string;
  name: string;
  url: string;
  leaning?: Leaning;
  industries?: string[];
  regions?: string[];
}

export interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string; // ISO string
  author: string | null;
  summary: string | null;
  guid: string | null;
  sourceName: string;
  sourceUrl: string;
}

export interface NewsFilters {
  industries?: string[];
  sources?: string[];
  leanings?: Leaning[];
  dateRange?: "24h" | "7d" | "30d" | "all";
  searchQuery?: string;
  sortBy?: "newest" | "source";
}

export interface FeedResponse {
  feed: {
    title: string;
    link: string;
    description: string | null;
  };
  articles: NewsArticle[];
}
