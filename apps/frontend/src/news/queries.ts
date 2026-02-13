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
const CACHE_KEY = "news.cache.v1";

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

  // Deduplicate
  const deduped = deduplicateArticles(allArticles);

  // Update cache when we have new data
  if (deduped.length > 0) {
    saveCachedArticles(deduped);
  }

  // Load cached articles as fallback
  const cachedArticles = loadCachedArticles();
  const articles = deduped.length > 0 ? deduped : cachedArticles;

  // Create a refetch function that refetches all queries
  const refetch = () => {
    queries.forEach((query) => query.refetch());
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
    if (filters.dateRange && filters.dateRange !== "all") {
      const dateRange = filters.dateRange;
      result = result.filter((article) =>
        isWithinDateRange(article, dateRange),
      );
    }

    // Industry filter
    if (filters.industries && filters.industries.length > 0) {
      const industries = filters.industries;
      result = result.filter((article) => {
        const feed = feeds.find((f) => f.url === article.sourceUrl);
        return (
          feed?.industries?.some((ind) => industries.includes(ind)) ?? false
        );
      });
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      const sources = filters.sources;
      result = result.filter((article) => sources.includes(article.sourceName));
    }

    // Leaning filter
    if (filters.leanings && filters.leanings.length > 0) {
      const leanings = filters.leanings;
      result = result.filter((article) => {
        const feed = feeds.find((f) => f.url === article.sourceUrl);
        return feed?.leaning && leanings.includes(feed.leaning);
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
