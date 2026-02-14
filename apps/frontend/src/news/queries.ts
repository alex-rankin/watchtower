import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchFeed } from "./api";
import { feeds } from "./feeds";
import type { NewsArticle, NewsFilters } from "./types";
import {
  deduplicateArticles,
  isWithinDateRange,
  matchesSearch,
  sortArticles,
} from "./utils";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "news.cache.v2"; // Bumped so old cache (wrong sourceUrl) is discarded

/** Normalize URL for matching (strip trailing slash, handle redirects) */
function normalizeFeedUrl(url: string): string {
  try {
    const u = url.trim();
    return u.endsWith("/") ? u.slice(0, -1) : u;
  } catch {
    return url;
  }
}

export function getFeedForArticle(
  article: NewsArticle,
  feedList: typeof feeds,
): (typeof feeds)[number] | undefined {
  const articleUrl = normalizeFeedUrl(article.sourceUrl);
  return feedList.find((f) => normalizeFeedUrl(f.url) === articleUrl);
}

/**
 * Load cached articles from localStorage
 */
function loadCachedArticles(): NewsArticle[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as NewsArticle[]) : [];
  } catch {
    return [];
  }
}

/**
 * Save articles to localStorage
 */
function saveCachedArticles(articles: NewsArticle[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Fetch a single feed
 */
export function useNewsFeed(feedId: string) {
  const feed = feeds.find((f) => f.id === feedId);

  return useQuery({
    queryKey: ["news", "feed", feedId],
    queryFn: () => {
      if (!feed) {
        throw new Error(`Feed not found: ${feedId}`);
      }
      return fetchFeed(feed.url);
    },
    enabled: !!feed,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch all feeds in parallel
 */
export function useAllNews() {
  const queries = useQueries({
    queries: feeds.map((feed) => ({
      queryKey: ["news", "feed", feed.id],
      queryFn: () => fetchFeed(feed.url),
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const errors = queries
    .filter((q) => q.isError)
    .map((q) => q.error)
    .filter(Boolean);

  // Aggregate all articles
  const allArticles: NewsArticle[] = [];
  for (const query of queries) {
    if (query.data?.articles) {
      allArticles.push(...query.data.articles);
    }
  }

  // Deduplicate then sort by newest first (so "latest" is meaningful)
  const deduped = deduplicateArticles(allArticles);
  const articlesSorted = sortArticles(deduped, "newest");

  // Update cache when we have new data
  if (articlesSorted.length > 0) {
    saveCachedArticles(articlesSorted);
  }

  // Load cached articles as fallback
  const cachedArticles = loadCachedArticles();
  const articles =
    articlesSorted.length > 0 ? articlesSorted : cachedArticles;

  // Create a refetch function that refetches all queries
  const refetch = () => {
    for (const query of queries) {
      query.refetch();
    }
  };

  return {
    articles,
    isLoading,
    isError,
    errors,
    feeds,
    refetch,
  };
}

/**
 * Filter and sort articles based on filters
 */
export function useFilteredNews(filters: NewsFilters) {
  const { articles, isLoading, isError, errors, feeds, refetch } = useAllNews();

  const filtered = useMemo(() => {
    let result = [...articles];

    // Date range filter
    const dateRange = filters.dateRange;
    if (dateRange) {
      result = result.filter((article) =>
        isWithinDateRange(article, dateRange),
      );
    }

    // Industry filter
    if (filters.industries && filters.industries.length > 0) {
      const industries = filters.industries;
      result = result.filter((article) => {
        const feed = getFeedForArticle(article, feeds);
        return (
          feed?.industries?.some((ind) => industries.includes(ind)) ?? false
        );
      });
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      const sources = filters.sources;
      result = result.filter((article) => {
        const feed = getFeedForArticle(article, feeds);
        return feed != null && sources.includes(feed.name);
      });
    }

    // Leaning filter
    if (filters.leanings && filters.leanings.length > 0) {
      const leanings = filters.leanings;
      result = result.filter((article) => {
        const feed = getFeedForArticle(article, feeds);
        return feed?.leaning != null && leanings.includes(feed.leaning);
      });
    }

    // Search filter
    if (filters.searchQuery) {
      const searchQuery = filters.searchQuery;
      result = result.filter((article) => matchesSearch(article, searchQuery));
    }

    // Sort
    const sorted = sortArticles(result, filters.sortBy || "newest");

    return sorted;
  }, [articles, filters, feeds]);

  return {
    articles: filtered,
    isLoading,
    isError,
    errors,
    refetch,
  };
}
