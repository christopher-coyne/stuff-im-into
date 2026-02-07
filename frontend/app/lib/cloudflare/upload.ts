import { api } from "~/lib/api/client";

/**
 * Upload an image to Cloudflare Images via direct upload.
 * Cloudflare handles resizing via variants (e.g., 'public', 'thumbnail').
 *
 * Flow:
 * 1. Get a direct upload URL from our backend
 * 2. Upload directly to Cloudflare
 * 3. Return the public image URL
 */
export async function uploadImage(
  file: File,
  accessToken: string
): Promise<string> {
  // 1. Get direct upload URL from our backend
  const response = await api.uploads.uploadsControllerGetDirectUploadUrl({
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const uploadUrl = response.data.data?.uploadUrl;
  if (!uploadUrl) {
    throw new Error("Failed to get upload URL");
  }

  // 2. Upload directly to Cloudflare (no client-side compression)
  const formData = new FormData();
  formData.append("file", file, file.name);

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

  // 3. Return the public URL
  // Cloudflare returns an array of variant URLs, find the 'public' one
  const variants = result.result?.variants as string[] | undefined;
  if (variants && variants.length > 0) {
    // Find the variant URL ending with '/public'
    const publicVariant = variants.find((v) => v.endsWith('/public'));
    if (publicVariant) {
      return publicVariant;
    }
    // Fallback: take first variant and replace the variant name with 'public'
    return variants[0].replace(/\/[^/]+$/, '/public');
  }

  throw new Error("No image URL returned from Cloudflare");
}

/**
 * Upload an avatar image
 */
export async function uploadAvatar(
  file: File,
  accessToken: string
): Promise<string> {
  return uploadImage(file, accessToken);
}

/**
 * Upload a review image
 */
export async function uploadReviewImage(
  file: File,
  accessToken: string
): Promise<string> {
  return uploadImage(file, accessToken);
}
