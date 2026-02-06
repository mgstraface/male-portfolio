import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Faltan CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function cloudinaryDestroy(
  publicId: string,
  resourceType: "image" | "video" = "image"
) {
  ensureCloudinaryConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
