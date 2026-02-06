import { Schema, model, models, Types } from "mongoose";

const MediaSchema = new Schema(
  {
    // título “técnico” opcional (o nombre de archivo)
    title: {
      type: String,
      trim: true,
    },

    // ✅ para Projects (y si quieren, para otros)
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

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

    url: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Cloudinary helpers
    publicId: { type: String },
    resourceType: { type: String, enum: ["image", "video"] },

    // ✅ para teasers
    fullVideoUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
