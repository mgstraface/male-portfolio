import { Schema, model, models, Types } from "mongoose";

const MediaSchema = new Schema(
  {
    title: {
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
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
