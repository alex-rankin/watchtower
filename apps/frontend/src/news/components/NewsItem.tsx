import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NewsArticle } from "../types";
import { formatRelativeTime } from "../utils";

interface NewsItemProps {
  article: NewsArticle;
  feedLeaning?: string;
  industries?: string[];
}

export function NewsItem({ article, feedLeaning, industries }: NewsItemProps) {
  const handleClick = () => {
    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex-1 text-base font-semibold leading-tight">
              <button
                type="button"
                onClick={handleClick}
                className="text-left hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                {article.title}
              </button>
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClick}
              aria-label="Open article in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {formatRelativeTime(article.publishedAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{new Date(article.publishedAt).toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>•</span>
            <Badge variant="secondary" className="text-xs">
              {article.sourceName}
            </Badge>
            {feedLeaning && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {feedLeaning}
                </Badge>
              </>
            )}
            {article.author && (
              <>
                <span>•</span>
                <span>{article.author}</span>
              </>
            )}
          </div>

          {industries && industries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {industries.map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  {industry}
                </Badge>
              ))}
            </div>
          )}

          {article.summary && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {article.summary}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
