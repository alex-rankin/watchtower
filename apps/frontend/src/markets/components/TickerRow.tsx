import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Ticker } from "../tickers";
import type { MarketQuote } from "../types";

interface TickerRowProps {
  ticker: Ticker;
  quote: MarketQuote | undefined;
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 64;
  const height = 28;
  const stepX = (width - 2) / (points.length - 1);

  const pathD = points
    .map((v, i) => {
      const x = 1 + i * stepX;
      const y = height - 1 - ((v - min) / range) * (height - 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const isPositive = points[points.length - 1] >= points[0];

  return (
    <svg
      width={width}
      height={height}
      className="shrink-0"
      role="img"
      aria-hidden
    >
      <title>Price trend</title>
      <path
        d={pathD}
        fill="none"
        className={isPositive ? "stroke-green-500" : "stroke-destructive"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TickerRow({ ticker, quote }: TickerRowProps) {
  const hasQuote = quote && typeof quote.price === "number";
  const change = quote?.change ?? 0;
  const isPositive = change >= 0;
  const isZero = change === 0;

  return (
    <Link
      to="/markets/$symbol"
      params={{ symbol: ticker.id }}
      className="flex min-w-[260px] shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition-colors hover:bg-accent/50"
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground"
        aria-hidden
      >
        {!hasQuote || isZero ? null : isPositive ? (
          <ChevronUp className="h-5 w-5 text-green-600 dark:text-green-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-destructive" />
        )}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-semibold">{ticker.dataSymbol}</p>
        <p className="truncate text-xs text-muted-foreground">{ticker.name}</p>
      </div>
      {quote?.sparkline && quote.sparkline.length > 0 && (
        <Sparkline points={quote.sparkline} />
      )}
      <div className="shrink-0 text-left">
        <p className="font-semibold tabular-nums">
          {hasQuote
            ? formatNumber(quote.price, quote.price < 1 ? 4 : 2)
            : "—"}
        </p>
        <p
          className={`text-xs tabular-nums ${
            !hasQuote || isZero
              ? "text-muted-foreground"
              : isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-destructive"
          }`}
        >
          {hasQuote && (change !== 0 || quote.changePercent !== 0)
            ? `${isPositive ? "+" : ""}${formatNumber(change, 2)}`
            : "—"}
        </p>
      </div>
    </Link>
  );
}
