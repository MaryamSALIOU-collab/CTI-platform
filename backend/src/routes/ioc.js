import { Router } from "express";
import Ioc from "../models/Ioc.js";
import { requireAuth } from "../middleware/auth.js";
import { lookupIndicator } from "../utils/threatIntel.js";

const router = Router();

router.get("/search", requireAuth, async (req, res) => {
  const value = (req.query.value || "").toString().trim();
  if (!value) return res.status(400).json({ error: "Le paramètre 'value' est requis (IP, domaine ou hash)." });
  const result = await lookupIndicator(value);
  await Ioc.create({ indicator: result.indicator, type: result.type, globalScore: result.globalScore, verdict: result.verdict, sources: result.sources, checkedAt: result.checkedAt, searchedBy: req.user.name });
  res.json(result);
});

router.get("/history", requireAuth, async (req, res) => {
  const items = await Ioc.find().sort({ checkedAt: -1 }).limit(50);
  res.json({ items: items.map((i) => i.toJSON()) });
});

export default router;
