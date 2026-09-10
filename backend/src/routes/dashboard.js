import { Router } from "express";
import Alert from "../models/Alert.js";
import Ioc from "../models/Ioc.js";
import FeedCache from "../models/FeedCache.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const [alerts, iocs, feedCache] = await Promise.all([Alert.find(), Ioc.find(), FeedCache.findOne()]);

  const kpis = {
    activeThreats: alerts.filter((a) => a.status !== "Résolue").length,
    iocAnalyzed24h: iocs.filter((i) => Date.now() - new Date(i.checkedAt).getTime() < 24 * 3600 * 1000).length,
    criticalAlerts: alerts.filter((a) => a.criticality === "Critique" && a.status !== "Résolue").length,
    feedsConnected: feedCache?.mode === "live" ? 2 : 3,
  };

  const byType = {};
  for (const a of alerts) byType[a.type] = (byType[a.type] || 0) + 1;

  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = alerts.filter((a) => a.createdAt.toISOString().slice(0, 10) === key).length;
    days.push({ date: key, count });
  }

  const countryCounts = {};
  for (const i of iocs) {
    const abuse = i.sources?.find((s) => s.source === "AbuseIPDB");
    const cc = abuse?.details?.countryCode;
    if (cc) countryCounts[cc] = (countryCounts[cc] || 0) + 1;
  }
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, count]) => ({ country, count }));

  const recentAlerts = [...alerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map((a) => a.toJSON());

  res.json({ kpis, threatsByType: Object.entries(byType).map(([type, count]) => ({ type, count })), threatsOverTime: days, topCountries, recentAlerts });
});

export default router;
