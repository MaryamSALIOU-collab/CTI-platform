import mongoose from "mongoose";

const feedItemSchema = new mongoose.Schema(
  { title: String, source: String, category: String, severity: String, link: String, publishedAt: Date },
  { _id: false }
);

const feedCacheSchema = new mongoose.Schema({
  items: [feedItemSchema],
  mode: { type: String, enum: ["live", "demo"], default: "demo" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("FeedCache", feedCacheSchema);
