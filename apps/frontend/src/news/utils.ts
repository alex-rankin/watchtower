import type { NewsArticle } from "./types";

/**
 * Generate a canonical hash for deduplication
 */
export function hashArticle(article: NewsArticle): string {
  // Use guid if available, otherwise use URL
  return article.guid || article.url;
}

/**
 * Deduplicate articles by canonical hash
 */
export function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const deduped: NewsArticle[] = [];

  for (const article of articles) {
    const hash = hashArticle(article);
    if (!seen.has(hash)) {
      seen.add(hash);
      deduped.push(article);
    }
  }

  return deduped;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

/**
 * Check if article is within date range
 */
export function isWithinDateRange(
  article: NewsArticle,
  range: "24h" | "7d" | "30d" | "all",
): boolean {
  if (range === "all") {
    return true;
  }

  const articleDate = new Date(article.publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - articleDate.getTime();

  const ranges = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  return diffMs <= ranges[range];
}

/**
 * Search articles by title and summary
 */
export function matchesSearch(article: NewsArticle, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const lowerQuery = query.toLowerCase();
  return (
    article.title.toLowerCase().includes(lowerQuery) ||
    (article.summary?.toLowerCase().includes(lowerQuery) ?? false)
  );
}

/**
 * Sort articles
 */
export function sortArticles(
  articles: NewsArticle[],
  sortBy: "newest" | "source",
): NewsArticle[] {
  const sorted = [...articles];

  if (sortBy === "newest") {
    sorted.sort((a, b) => {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });
  } else if (sortBy === "source") {
    sorted.sort((a, b) => {
      const sourceCompare = a.sourceName.localeCompare(b.sourceName);
      if (sourceCompare !== 0) {
        return sourceCompare;
      }
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });
  }

  return sorted;
}
