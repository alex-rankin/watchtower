export interface MarketQuote {
  id: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: number[];
}
