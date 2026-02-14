import { Router } from "express";
import { fetchMarketQuotes } from "../services/marketData.js";

const router = Router();

router.get("/quotes", async (_req, res) => {
  try {
    const quotes = await fetchMarketQuotes();
    res.json(quotes);
  } catch (error) {
    console.error("Error fetching market quotes:", error);
    res.status(503).json({
      error: "Market data temporarily unavailable",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
