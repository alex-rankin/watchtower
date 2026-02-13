import type { FeedDefinition } from "./types";

export const feeds: FeedDefinition[] = [
  {
    id: "reuters-finance",
    name: "Reuters Finance",
    url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    leaning: "finance",
    industries: ["finance", "markets"],
    regions: ["US", "EU", "ASIA"],
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    leaning: "finance",
    industries: ["finance", "markets", "tech"],
    regions: ["US", "EU", "ASIA"],
  },
  {
    id: "financial-times",
    name: "Financial Times",
    url: "https://www.ft.com/?format=rss",
    leaning: "finance",
    industries: ["finance", "markets"],
    regions: ["US", "EU", "UK"],
  },
  {
    id: "wsj-markets",
    name: "Wall Street Journal Markets",
    url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
    leaning: "finance",
    industries: ["finance", "markets"],
    regions: ["US"],
  },
  {
    id: "cnbc-top",
    name: "CNBC Top News",
    url: "https://feeds.nbcnews.com/nbcnews/public/topstories",
    leaning: "center",
    industries: ["finance", "tech", "markets"],
    regions: ["US"],
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    leaning: "tech",
    industries: ["tech"],
    regions: ["US"],
  },
];
