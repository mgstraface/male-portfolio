import { Schema, model, models, Types } from "mongoose";

const MediaSchema = new Schema(
  {
    // Para media general (si querés seguir usando title)
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
    url: {
      type: String,
      required: true,
    },
    thumbnail: { type: String },

    isFeatured: { type: Boolean, default: false },

    // ✅ NUEVO: para projects (y si querés también para otros)
    name: { type: String, trim: true },
    description: { type: String, trim: true },

    // ya lo venías usando para “video completo / link externo”
    fullVideoUrl: { type: String, trim: true },

    // recomendado si querés borrar Cloudinary confiable
    publicId: { type: String, trim: true },
    resourceType: { type: String, enum: ["image", "video"] },
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
