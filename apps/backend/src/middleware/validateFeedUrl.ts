import type { Request, Response, NextFunction } from "express";

export function validateFeedUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { feedUrl } = req.query;

  if (!feedUrl || typeof feedUrl !== "string") {
    res.status(400).json({ error: "feedUrl query parameter is required" });
    return;
  }

  // Basic URL validation
  try {
    new URL(feedUrl);
    next();
  } catch {
    res.status(400).json({ error: "Invalid feedUrl" });
  }
}
