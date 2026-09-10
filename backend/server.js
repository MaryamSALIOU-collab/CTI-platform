import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./src/config/database.js";
import authRoutes from "./src/routes/auth.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import iocRoutes from "./src/routes/ioc.js";
import feedsRoutes from "./src/routes/feeds.js";
import alertsRoutes from "./src/routes/alerts.js";
import usersRoutes from "./src/routes/users.js";
import { ensureSeedData } from "./seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS : en production, restreint aux origines listées dans CORS_ORIGIN
// (séparées par des virgules), ex. CORS_ORIGIN=https://mon-site.vercel.app
// En développement (variable absente), toutes les origines sont acceptées.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "cti-platform-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ioc", iocRoutes);
app.use("/api/feeds", feedsRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.use((req, res) => res.status(404).json({ error: "Route non trouvée." }));

async function start() {
  await connectDB();
  await ensureSeedData();
  app.listen(PORT, () => {
    console.log(`✔ API CTI Platform démarrée sur http://localhost:${PORT}`);
  });
}

start();
