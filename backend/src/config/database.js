import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cti-platform";
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✔ Connecté à MongoDB (${uri})`);
  } catch (err) {
    console.error("✖ Échec de connexion à MongoDB :", err.message);
    console.error("  Vérifiez que MongoDB est démarré et que MONGODB_URI est correct dans votre .env.");
    process.exit(1);
  }
}
