import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { feeds } from "../feeds";
import { useFilteredNews } from "../queries";
import type { NewsFilters } from "../types";
import { NewsItem } from "./NewsItem";

interface NewsListProps {
  filters: NewsFilters;
}

export function NewsList({ filters }: NewsListProps) {
  const { articles, isLoading, isError, errors } = useFilteredNews(filters);

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
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 pr-4">
        {articles.map((article) => {
          const feed = feeds.find((f) => f.url === article.sourceUrl);
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
  );
}
