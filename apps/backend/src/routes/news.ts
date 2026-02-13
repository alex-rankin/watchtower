import { Router } from "express";
import { rateLimit } from "../utils/rateLimit.js";
import { parseFeed } from "../utils/rssParser.js";
import { validateFeedUrl } from "../middleware/validateFeedUrl.js";

const router = Router();

router.get("/rss", validateFeedUrl, async (req, res) => {
  const feedUrl = req.query.feedUrl as string;

  // Rate limiting
  if (!rateLimit(feedUrl)) {
    res.status(429).json({
      error:
        "Rate limit exceeded. Please wait before fetching this feed again.",
    });
    return;
  }

  try {
    const result = await parseFeed(feedUrl);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    res.status(500).json({
      error: "Failed to fetch or parse RSS feed",
      message,
    });
  }
});

export default router;
