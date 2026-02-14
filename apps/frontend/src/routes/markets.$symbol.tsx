import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradingViewWidget } from "@/markets/components/TradingViewWidget";
import { getTickerById, getTradingViewChartUrl } from "@/markets/tickers";

export const Route = createFileRoute("/markets/$symbol")({
  component: MarketSymbolPage,
});

function MarketSymbolPage() {
  const { symbol } = Route.useParams();
  const ticker = getTickerById(symbol);

  if (!ticker) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">Ticker not found.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const chartUrl = getTradingViewChartUrl(ticker.symbol);

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <Link
        to="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        Back to Dashboard
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{ticker.name}</h1>
          <p className="text-sm text-muted-foreground">{ticker.symbol}</p>
        </div>
        <Button asChild variant="default">
          <a
            href={chartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            Open in TradingView
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="min-h-[500px] rounded-lg border bg-card overflow-hidden">
        <TradingViewWidget symbol={ticker.symbol} height={500} />
      </div>
    </div>
  );
}
