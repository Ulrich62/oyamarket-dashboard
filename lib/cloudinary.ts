import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "poqm6bs0",
  api_key: process.env.CLOUDINARY_API_KEY || "632735129768113",
  api_secret: process.env.CLOUDINARY_API_SECRET || "LFHySr21pKN41nzE5g-TBTHE_pw",
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  poster_url?: string;
}

import { getVideoPosterUrl, type VideoPosterOptions } from "./cloudinary-utils";
export { getVideoPosterUrl, type VideoPosterOptions };

/**
 * Upload an in-memory buffer to Cloudinary in the dedicated oyamarket folder/bucket.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: "image" | "video" | "auto";
  } = {}
): Promise<CloudinaryUploadResult> {
  const folder = options.folder || "oyamarket/media";
  const resourceType = options.resourceType || "auto";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: options.publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(error ?? new Error("Upload Cloudinary échoué"));
        }

        const isVideo = result.resource_type === "video";
        const posterUrl = isVideo ? getVideoPosterUrl(result.secure_url) : undefined;

        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          poster_url: posterUrl,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete a resource from Cloudinary by its publicId or full secure_url.
 */
export async function deleteFromCloudinary(
  publicIdOrUrl: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  let publicId = publicIdOrUrl;
  const match = publicIdOrUrl.match(/\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  if (match) {
    publicId = match[1];
  }

  const determinedType = publicIdOrUrl.includes("/video/upload/") ? "video" : resourceType;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: determinedType as any });
  } catch (err) {
    console.warn(`Could not destroy Cloudinary resource ${publicId}:`, err);
  }
}
