import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import Alert from "./src/models/Alert.js";

const SAMPLE_ALERTS = [
  { title: "Communication C2 détectée", type: "Malware", criticality: "Critique", source: "AlienVault OTX" },
  { title: "Campagne de hameçonnage ciblant le secteur bancaire", type: "Hameçonnage", criticality: "Haute", source: "Flux RSS" },
  { title: "Pic de trafic anormal sur le pare-feu périmétrique", type: "DDoS", criticality: "Moyenne", source: "VirusTotal" },
  { title: "Tentative d'exploitation d'une CVE non corrigée", type: "Vulnérabilité", criticality: "Haute", source: "AbuseIPDB" },
  { title: "Identifiants exposés sur un forum clandestin", type: "Fuite de données", criticality: "Critique", source: "Flux RSS" },
  { title: "Adresse IP suspecte bloquée par le pare-feu", type: "Malware", criticality: "Faible", source: "AbuseIPDB" },
];

export async function ensureSeedData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@cti-platform.local";
    const password = process.env.ADMIN_PASSWORD || "Admin123!";
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name: "Administrateur", email, passwordHash, role: "administrateur" });
    console.log(`✔ Compte administrateur créé : ${email} / ${password}`);
  }
  const alertCount = await Alert.countDocuments();
  if (alertCount === 0) {
    const now = Date.now();
    await Alert.insertMany(SAMPLE_ALERTS.map((a, i) => ({
      ...a, status: i % 3 === 0 ? "Résolue" : i % 3 === 1 ? "En cours" : "Nouvelle",
      createdAt: new Date(now - i * 36 * 3600 * 1000),
    })));
  }
}
