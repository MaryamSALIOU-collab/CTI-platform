import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  { author: { type: String, required: true }, content: { type: String, required: true } },
  {
    timestamps: { createdAt: "date", updatedAt: false },
    toJSON: { transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; } },
  }
);

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["Malware", "Hameçonnage", "DDoS", "Vulnérabilité", "Fuite de données", "Autre"], default: "Autre" },
    criticality: { type: String, enum: ["Critique", "Haute", "Moyenne", "Faible"], required: true },
    status: { type: String, enum: ["Nouvelle", "En cours", "Résolue"], default: "Nouvelle" },
    source: { type: String, default: "Manuel" },
    notes: [noteSchema],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    toJSON: { transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; } },
  }
);

export default mongoose.model("Alert", alertSchema);
