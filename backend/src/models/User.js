import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["analyste", "administrateur"], default: "analyste" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id; delete ret.__v; delete ret.passwordHash;
      },
    },
  }
);

export default mongoose.model("User", userSchema);
