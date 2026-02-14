import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { feeds } from "../feeds";
import { getFeedForArticle, useAllNews } from "../queries";
import { NewsItem } from "./NewsItem";

export function NewsTapeWidget() {
  const { articles, isLoading } = useAllNews();

  // Show latest 10 articles
  const latestArticles = articles.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">Latest Global News</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/news">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-20 w-full" />
            ))}
          </div>
        ) : latestArticles.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No news available. Check back later.
          </p>
        ) : (
          <ScrollArea className="h-[68vh]">
            <div className="space-y-3 pr-4">
              {latestArticles.map((article) => {
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
        )}
      </CardContent>
    </Card>
  );
}
