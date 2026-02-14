import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import marketsRouter from "./routes/markets.js";
import newsRouter from "./routes/news.js";
import healthRouter from "./routes/health.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

// API routes
app.use("/api/markets", marketsRouter);
app.use("/api/news", newsRouter);
app.use("/api/health", healthRouter);

// In production, serve static files and handle SPA routing
if (isProduction) {
  const distPath = join(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA fallback)
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log(`Serving static files from ${join(__dirname, "../../frontend/dist")}`);
  }
});
