import { Router } from "express";
import FeedCache from "../models/FeedCache.js";
import { requireAuth } from "../middleware/auth.js";
import { fetchThreatFeed } from "../utils/threatFeed.js";

const router = Router();
const CACHE_TTL_MS = 5 * 60 * 1000;

router.get("/", requireAuth, async (req, res) => {
  let cache = await FeedCache.findOne();
  const isStale = !cache || Date.now() - new Date(cache.updatedAt).getTime() > CACHE_TTL_MS;
  if (isStale) {
    const fresh = await fetchThreatFeed();
    cache = await FeedCache.findOneAndUpdate({}, { items: fresh.items, mode: fresh.mode, updatedAt: new Date() }, { new: true, upsert: true });
  }
  const { category, severity } = req.query;
  let filtered = cache.items;
  if (category) filtered = filtered.filter((i) => i.category === category);
  if (severity) filtered = filtered.filter((i) => i.severity === severity);
  filtered = [...filtered].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  res.json({ items: filtered, mode: cache.mode, updatedAt: cache.updatedAt });
});

export default router;
