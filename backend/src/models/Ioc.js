import mongoose from "mongoose";

const sourceResultSchema = new mongoose.Schema(
  { source: String, mode: String, score: Number, details: mongoose.Schema.Types.Mixed, warning: String },
  { _id: false }
);

const iocSchema = new mongoose.Schema(
  {
    indicator: { type: String, required: true },
    type: { type: String, enum: ["ip", "domain", "hash", "unknown"], required: true },
    globalScore: { type: Number, required: true },
    verdict: { type: String, required: true },
    sources: [sourceResultSchema],
    searchedBy: { type: String },
    checkedAt: { type: Date, default: Date.now },
  },
  { toJSON: { transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; } } }
);

export default mongoose.model("Ioc", iocSchema);
