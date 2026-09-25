/**
 * Isomorphic Cloudinary utilities safe to use in both Client and Server Components.
 */

export interface VideoPosterOptions {
  startOffset?: "auto" | number | string;
  format?: "jpg" | "webp" | "png";
  cloudName?: string;
}

/**
 * Generate a Cloudinary video poster/thumbnail URL from a video URL or public_id.
 * By default, replaces the video extension with .jpg and applies so_auto (smart frame selection).
 */
export function getVideoPosterUrl(
  videoUrlOrPublicId: string,
  options: VideoPosterOptions = {}
): string {
  const format = options.format || "jpg";
  const startOffset = options.startOffset ?? "auto";

  if (!videoUrlOrPublicId) return "";

  // If it's a full Cloudinary URL
  if (videoUrlOrPublicId.includes("cloudinary.com")) {
    if (videoUrlOrPublicId.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i)) {
      return videoUrlOrPublicId;
    }

    const transformation = startOffset ? `so_${startOffset}/` : "";
    let url = videoUrlOrPublicId;

    if (url.includes("/video/upload/")) {
      if (!url.includes(`/video/upload/so_`)) {
        url = url.replace("/video/upload/", `/video/upload/${transformation}`);
      }
    }

    return url.replace(/\.[a-zA-Z0-9]+(\?.*)?$/, `.${format}$1`);
  }

  // If it's a publicId:
  const cloudName = options.cloudName || "poqm6bs0";
  const transformation = startOffset ? `so_${startOffset}/` : "";
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}${videoUrlOrPublicId}.${format}`;
}
