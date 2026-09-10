import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("administrateur"), async (req, res) => {
  const items = await User.find().sort({ createdAt: -1 });
  res.json({ items: items.map((u) => u.toJSON()) });
});

router.patch("/:id/role", requireAuth, requireRole("administrateur"), async (req, res) => {
  const { role } = req.body;
  if (!["analyste", "administrateur"].includes(role)) return res.status(400).json({ error: "Rôle invalide." });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json({ user: user.toJSON() });
});

router.delete("/:id", requireAuth, requireRole("administrateur"), async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: "Impossible de supprimer votre propre compte." });
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.status(204).send();
});

export default router;
