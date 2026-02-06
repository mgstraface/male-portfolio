import { Schema, model, models, Types } from "mongoose";

const MediaSchema = new Schema(
  {
    title: { type: String, trim: true },

    type: {
      type: String,
      enum: ["photo", "video"],
      required: true,
    },

    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Cloudinary secure_url
    url: { type: String, required: true },

    thumbnail: { type: String },

    isFeatured: { type: Boolean, default: false },

    // ✅ para borrado completo en Cloudinary
    publicId: { type: String },
    resourceType: { type: String, enum: ["image", "video"] },

    // ✅ SOLO para teaser de video: link al video completo (YouTube, etc.)
    fullVideoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
