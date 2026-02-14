import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMarketQuotes } from "../api";
import { TICKER_CATEGORIES } from "../tickers";
import { TickerCarousel } from "./TickerCarousel";
import { TickerRow } from "./TickerRow";

const QUOTES_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function MajorsWidget() {
  const {
    data: quotes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["markets", "quotes"],
    queryFn: fetchMarketQuotes,
    staleTime: QUOTES_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  const quoteMap = new Map(quotes?.map((q) => [q.id, q]) ?? []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Majors</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {TICKER_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-1">
                  {category.tickers.map((ticker) => (
                    <Skeleton key={ticker.id} className="h-14 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {TICKER_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {category.title}
                </h4>
                <TickerCarousel
                  id={category.id}
                  slides={category.tickers.map((ticker) => ({
                    id: ticker.id,
                    node: (
                      <TickerRow
                        ticker={ticker}
                        quote={quoteMap.get(ticker.id)}
                      />
                    ),
                  }))}
                />
              </div>
            ))}
          </div>
        )}
        {isError && (
          <p className="mt-2 text-sm text-muted-foreground">
            Price data unavailable. Tickers still link to charts.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
