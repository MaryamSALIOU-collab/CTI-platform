import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import {
  generateTwoFactorSecret,
  generateQrCodeDataUrl,
  verifyTwoFactorCode,
} from "../utils/twoFactor.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function signPendingToken(user) {
  return jwt.sign({ id: user._id.toString(), stage: "2fa-pending" }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Nom, email et mot de passe sont requis." });
  if (password.length < 8) return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet email." });

  const passwordHash = await bcrypt.hash(password, 10);
  const userCount = await User.countDocuments();
  const user = await User.create({ name, email, passwordHash, role: userCount === 0 ? "administrateur" : "analyste" });

  res.status(201).json({ token: signToken(user), user: user.toJSON() });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe sont requis." });

  const user = await User.findOne({ email: email.toLowerCase() }).select("+twoFactorSecret");
  if (!user) return res.status(401).json({ error: "Identifiants incorrects." });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Identifiants incorrects." });

  if (user.twoFactorEnabled) {
    return res.json({ requiresTwoFactor: true, pendingToken: signPendingToken(user) });
  }

  res.json({ token: signToken(user), user: user.toJSON() });
});

router.post("/2fa/verify-login", async (req, res) => {
  const { pendingToken, code } = req.body;
  if (!pendingToken || !code) return res.status(400).json({ error: "Code de vérification requis." });

  let payload;
  try {
    payload = jwt.verify(pendingToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Session de connexion expirée, veuillez vous reconnecter." });
  }
  if (payload.stage !== "2fa-pending") {
    return res.status(401).json({ error: "Jeton invalide." });
  }

  const user = await User.findById(payload.id).select("+twoFactorSecret");
  if (!user || !user.twoFactorEnabled) {
    return res.status(401).json({ error: "Session de connexion invalide." });
  }

  if (!(await verifyTwoFactorCode(code, user.twoFactorSecret))) {
    return res.status(401).json({ error: "Code de vérification incorrect." });
  }

  res.json({ token: signToken(user), user: user.toJSON() });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  res.json({ user: user.toJSON() });
});

router.post("/2fa/setup", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  if (user.twoFactorEnabled) {
    return res.status(400).json({ error: "La double authentification est déjà activée." });
  }

  const { secret, otpauthUrl } = generateTwoFactorSecret(user.email);
  user.twoFactorSecret = secret;
  await user.save();

  const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);
  res.json({ qrCodeDataUrl, manualEntryKey: secret });
});

router.post("/2fa/enable", requireAuth, async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id).select("+twoFactorSecret");
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  if (!user.twoFactorSecret) {
    return res.status(400).json({ error: "Aucune configuration en attente. Lancez d'abord la configuration." });
  }

  if (!(await verifyTwoFactorCode(code, user.twoFactorSecret))) {
    return res.status(400).json({ error: "Code incorrect. Vérifiez l'heure de votre appareil et réessayez." });
  }

  user.twoFactorEnabled = true;
  await user.save();
  res.json({ message: "Double authentification activée avec succès." });
});

router.post("/2fa/disable", requireAuth, async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id).select("+twoFactorSecret");
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
  if (!user.twoFactorEnabled) {
    return res.status(400).json({ error: "La double authentification n'est pas activée." });
  }

  if (!(await verifyTwoFactorCode(code, user.twoFactorSecret))) {
    return res.status(400).json({ error: "Code incorrect." });
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  res.json({ message: "Double authentification désactivée." });
});

export default router;
