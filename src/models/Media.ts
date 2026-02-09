import { Schema, model, models, Types } from "mongoose";

const MediaSchema = new Schema(
  {
    title: { type: String, trim: true },

    name: { type: String, trim: true },
    description: { type: String, trim: true },

    type: { type: String, enum: ["photo", "video"], required: true, default: "photo" },

    // ✅ NUEVO: album para agrupar Projects
    album: { type: String, trim: true, default: null, index: true },

    category: { type: Types.ObjectId, ref: "Category", required: true },

    url: { type: String, required: true },
    thumbnail: { type: String },

    isFeatured: { type: Boolean, default: false },

    publicId: { type: String },
    resourceType: { type: String, enum: ["image", "video"] },

    fullVideoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
