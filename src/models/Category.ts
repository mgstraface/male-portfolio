import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ["photo", "video"], required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = models.Category || model("Category", CategorySchema);
