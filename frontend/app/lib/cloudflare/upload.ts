import imageCompression from "browser-image-compression";
import { api } from "~/lib/api/client";

interface UploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
};

const AVATAR_OPTIONS: UploadOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 500,
};

/**
 * Upload an image to Cloudflare Images via direct upload.
 *
 * Flow:
 * 1. Get a direct upload URL from our backend
 * 2. Compress the image
 * 3. Upload directly to Cloudflare
 * 4. Return the public image URL
 */
export async function uploadImage(
  file: File,
  accessToken: string,
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> {
  // 1. Get direct upload URL from our backend
  const response = await api.uploads.uploadsControllerGetDirectUploadUrl({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const uploadUrl = response.data.data?.uploadUrl;
  if (!uploadUrl) {
    throw new Error("Failed to get upload URL");
  }

  // 2. Compress the image
  const compressedFile = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB ?? 2,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
    useWebWorker: true,
  });

  // 3. Upload directly to Cloudflare
  const formData = new FormData();
  formData.append("file", compressedFile, file.name);

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    console.error("Cloudflare upload failed:", text);
    throw new Error("Failed to upload image to Cloudflare");
  }

  const result = await uploadResponse.json();

  if (!result.success) {
    console.error("Cloudflare upload error:", result.errors);
    throw new Error("Failed to upload image to Cloudflare");
  }

  // 4. Return the public URL
  // Cloudflare returns variants, we use 'public' as default
  const variants = result.result?.variants as string[] | undefined;
  if (variants && variants.length > 0) {
    // Return the first variant (usually 'public')
    return variants[0];
  }

  // Fallback: construct URL manually
  // This requires knowing the account hash, which we'd need to expose
  // For now, throw if no variants returned
  throw new Error("No image URL returned from Cloudflare");
}

/**
 * Upload an avatar image (smaller size limits)
 */
export async function uploadAvatar(
  file: File,
  accessToken: string
): Promise<string> {
  return uploadImage(file, accessToken, AVATAR_OPTIONS);
}

/**
 * Upload a review image
 */
export async function uploadReviewImage(
  file: File,
  accessToken: string
): Promise<string> {
  return uploadImage(file, accessToken, DEFAULT_OPTIONS);
}
