import { Schema, model, models } from "mongoose";

const MediaSchema = new Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    type: { type: String, enum: ["photo", "video"], required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    thumbnailUrl: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },

    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Media = models.Media || model("Media", MediaSchema);
