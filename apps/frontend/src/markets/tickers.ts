export interface Ticker {
  id: string;
  name: string;
  symbol: string;
  /** Symbol for price API (e.g. Yahoo Finance: AAPL, ^GSPC, EURUSD=X) */
  dataSymbol: string;
}

export type TickerCategoryId =
  | "stocks"
  | "indices"
  | "currencies"
  | "crypto"
  | "commodities";

export interface TickerCategory {
  id: TickerCategoryId;
  title: string;
  tickers: Ticker[];
}

export const TICKER_CATEGORIES: TickerCategory[] = [
  {
    id: "stocks",
    title: "Major stocks (US)",
    tickers: [
      { id: "aapl", name: "Apple", symbol: "NASDAQ:AAPL", dataSymbol: "AAPL" },
      { id: "msft", name: "Microsoft", symbol: "NASDAQ:MSFT", dataSymbol: "MSFT" },
      { id: "googl", name: "Alphabet (Google)", symbol: "NASDAQ:GOOGL", dataSymbol: "GOOGL" },
      { id: "amzn", name: "Amazon", symbol: "NASDAQ:AMZN", dataSymbol: "AMZN" },
      { id: "meta", name: "Meta", symbol: "NASDAQ:META", dataSymbol: "META" },
      { id: "nvda", name: "NVIDIA", symbol: "NASDAQ:NVDA", dataSymbol: "NVDA" },
      { id: "tsla", name: "Tesla", symbol: "NASDAQ:TSLA", dataSymbol: "TSLA" },
    ],
  },
  {
    id: "indices",
    title: "Major indices",
    tickers: [
      { id: "spx", name: "S&P 500", symbol: "SP:SPX", dataSymbol: "^GSPC" },
      { id: "ndx", name: "Nasdaq 100", symbol: "NASDAQ:NDX", dataSymbol: "^NDX" },
      { id: "dji", name: "Dow Jones", symbol: "DJ:DJI", dataSymbol: "^DJI" },
      { id: "rut", name: "Russell 2000", symbol: "TVC:RUT", dataSymbol: "^RUT" },
    ],
  },
  {
    id: "currencies",
    title: "Major currencies",
    tickers: [
      { id: "eurusd", name: "EUR/USD", symbol: "FX:EURUSD", dataSymbol: "EURUSD=X" },
      { id: "gbpusd", name: "GBP/USD", symbol: "FX:GBPUSD", dataSymbol: "GBPUSD=X" },
      { id: "usdjpy", name: "USD/JPY", symbol: "FX:USDJPY", dataSymbol: "USDJPY=X" },
      { id: "audusd", name: "AUD/USD", symbol: "FX:AUDUSD", dataSymbol: "AUDUSD=X" },
      { id: "usdcad", name: "USD/CAD", symbol: "FX:USDCAD", dataSymbol: "USDCAD=X" },
    ],
  },
  {
    id: "crypto",
    title: "Major crypto",
    tickers: [
      { id: "btcusd", name: "Bitcoin", symbol: "BITSTAMP:BTCUSD", dataSymbol: "BTC-USD" },
      { id: "ethusd", name: "Ethereum", symbol: "BITSTAMP:ETHUSD", dataSymbol: "ETH-USD" },
      { id: "btcusdt", name: "BTC/USDT", symbol: "BINANCE:BTCUSDT", dataSymbol: "BTC-USD" },
      { id: "ethusdt", name: "ETH/USDT", symbol: "BINANCE:ETHUSDT", dataSymbol: "ETH-USD" },
    ],
  },
  {
    id: "commodities",
    title: "Major commodities",
    tickers: [
      { id: "gold", name: "Gold", symbol: "TVC:GOLD", dataSymbol: "GC=F" },
      { id: "silver", name: "Silver", symbol: "TVC:SILVER", dataSymbol: "SI=F" },
      { id: "wti", name: "WTI Crude", symbol: "TVC:USOIL", dataSymbol: "CL=F" },
      { id: "brent", name: "Brent Crude", symbol: "TVC:UKOIL", dataSymbol: "BZ=F" },
    ],
  },
];

const allTickers = TICKER_CATEGORIES.flatMap((c) => c.tickers);

export function getTickerById(id: string): Ticker | undefined {
  return allTickers.find((t) => t.id === id);
}

export function getTradingViewChartUrl(symbol: string): string {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`;
}
