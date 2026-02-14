import { memo, useEffect, useRef } from "react";

const COPYRIGHT_HEIGHT = 28;

interface TradingViewWidgetProps {
  symbol: string;
  className?: string;
  height?: number | string;
}

function TradingViewWidgetInner({
  symbol,
  className,
  height = 500,
}: TradingViewWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetEl = widgetRef.current;
    if (!widgetEl) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      autosize: true,
      backgroundColor: "rgba(15, 15, 15, 1)",
      calendar: false,
      details: false,
      gridColor: "rgba(242, 242, 242, 0.06)",
      hide_legend: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_volume: false,
      hotlist: false,
      interval: "D",
      locale: "en",
      save_image: true,
      style: "1",
      symbol,
      theme: "dark",
      timezone: "Etc/UTC",
      watchlist: [],
      withdateranges: false,
    });

    const mount = () => {
      widgetEl.appendChild(script);
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(mount));

    return () => {
      cancelAnimationFrame(id);
      if (script.parentNode === widgetEl) widgetEl.removeChild(script);
      widgetEl.innerHTML = "";
    };
  }, [symbol]);

  const displaySymbol = symbol.replace(":", "-");
  const totalHeight =
    typeof height === "number" ? height : String(height);
  const chartHeightPx =
    typeof height === "number"
      ? height - COPYRIGHT_HEIGHT
      : `calc(${totalHeight} - ${COPYRIGHT_HEIGHT}px)`;

  return (
    <div
      className={`tradingview-widget-container flex flex-col ${className ?? ""}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
      }}
    >
      <div
        ref={widgetRef}
        className="tradingview-widget-container__widget w-full"
        style={{
          height:
            typeof chartHeightPx === "number"
              ? `${chartHeightPx}px`
              : chartHeightPx,
          minHeight: 0,
        }}
      />
      <div
        className="tradingview-widget-copyright shrink-0 text-[10px] opacity-60 py-1"
        style={{ height: COPYRIGHT_HEIGHT }}
      >
        <a
          href={`https://www.tradingview.com/symbols/${displaySymbol}/`}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="text-blue-400">{displaySymbol} chart</span>
        </a>
        <span> by TradingView</span>
      </div>
    </div>
  );
}

export const TradingViewWidget = memo(TradingViewWidgetInner);
