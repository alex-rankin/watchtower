import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { feeds } from "../feeds";
import { getFeedForArticle, useFilteredNews } from "../queries";
import type { NewsFilters } from "../types";
import { NewsItem } from "./NewsItem";

interface NewsListProps {
  filters: NewsFilters;
}

export function NewsList({ filters }: NewsListProps) {
  const { articles, isLoading, isError, errors, refetch } =
    useFilteredNews(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (isError && articles.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading news</AlertTitle>
        <AlertDescription>
          {errors.length > 0
            ? errors.map((err, i) => (
                <p key={`error-${i}`}>
                  {err instanceof Error ? err.message : String(err)}
                </p>
              ))
            : "Failed to fetch news feeds. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">No articles found</p>
        <p className="mt-2 text-sm">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-4">
          {articles.map((article) => {
            const feed = getFeedForArticle(article, feeds);
            return (
              <NewsItem
                key={article.guid || article.url}
                article={article}
                feedLeaning={feed?.leaning}
                industries={feed?.industries}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
