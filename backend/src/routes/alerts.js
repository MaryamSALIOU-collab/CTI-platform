import { Router } from "express";
import Alert from "../models/Alert.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const VALID_CRITICALITY = ["Critique", "Haute", "Moyenne", "Faible"];
const VALID_STATUS = ["Nouvelle", "En cours", "Résolue"];

router.get("/", requireAuth, async (req, res) => {
  const { criticality, status } = req.query;
  const filter = {};
  if (criticality) filter.criticality = criticality;
  if (status) filter.status = status;
  const items = await Alert.find(filter).sort({ createdAt: -1 });
  res.json({ items: items.map((a) => a.toJSON()) });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, type, criticality, source } = req.body;
  if (!title || !criticality) return res.status(400).json({ error: "Titre et criticité sont requis." });
  if (!VALID_CRITICALITY.includes(criticality)) return res.status(400).json({ error: `Criticité invalide (${VALID_CRITICALITY.join(", ")}).` });
  const alert = await Alert.create({ title, type: type || "Autre", criticality, source: source || "Manuel" });
  res.status(201).json({ alert: alert.toJSON() });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { status, criticality } = req.body;
  if (status && !VALID_STATUS.includes(status)) return res.status(400).json({ error: `Statut invalide (${VALID_STATUS.join(", ")}).` });
  if (criticality && !VALID_CRITICALITY.includes(criticality)) return res.status(400).json({ error: `Criticité invalide (${VALID_CRITICALITY.join(", ")}).` });
  const update = {};
  if (status) update.status = status;
  if (criticality) update.criticality = criticality;
  const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!alert) return res.status(404).json({ error: "Alerte introuvable." });
  res.json({ alert: alert.toJSON() });
});

router.post("/:id/notes", requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "Le contenu de la note est requis." });
  const alert = await Alert.findById(req.params.id);
  if (!alert) return res.status(404).json({ error: "Alerte introuvable." });
  alert.notes.push({ author: req.user.name, content: content.trim() });
  await alert.save();
  res.status(201).json({ alert: alert.toJSON() });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const deleted = await Alert.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Alerte introuvable." });
  res.status(204).send();
});

export default router;
