import { v2 as cloudinary } from "cloudinary";
import { getServerEnv, isCloudinaryConfigured } from "@/lib/env";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Max upload size for member photos (5 MB). */
export const MAX_MEMBER_PHOTO_BYTES = 5 * 1024 * 1024;

let configured = false;

function ensureCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  if (!configured) {
    const env = getServerEnv();
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export function assertAllowedImageMime(mime: string) {
  if (!ALLOWED_IMAGE_TYPES.has(mime)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
}

export function assertPhotoSize(byteLength: number) {
  if (byteLength > MAX_MEMBER_PHOTO_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
}

/**
 * Signed upload params for client-side uploads.
 * Prefer signed uploads over unsigned presets in production.
 */
export function createMemberPhotoUploadSignature(folder = "speak-up-gen/members") {
  const api = ensureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = api.utils.api_sign_request(
    paramsToSign,
    getServerEnv().CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    folder,
    signature,
    cloudName: getServerEnv().CLOUDINARY_CLOUD_NAME!,
    apiKey: getServerEnv().CLOUDINARY_API_KEY!,
  };
}

export { cloudinary };
