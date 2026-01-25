import imageCompression from "browser-image-compression";
import { supabase } from "./client";

const BUCKET_NAME = "media-images";
const MAX_FILE_SIZE_MB = 2;
const MAX_WIDTH_HEIGHT = 1920;

export async function uploadReviewImage(
  file: File,
  userId: string
): Promise<string> {
  // Compress image before upload
  const compressedFile = await imageCompression(file, {
    maxSizeMB: MAX_FILE_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_HEIGHT,
    useWebWorker: true,
  });

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, compressedFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteReviewImage(url: string): Promise<void> {
  // Extract path from URL
  const pathMatch = url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
  if (pathMatch && pathMatch[1]) {
    await supabase.storage.from(BUCKET_NAME).remove([pathMatch[1]]);
  }
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<string> {
  // Compress image before upload (smaller for avatars)
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true,
  });

  // Generate unique filename in user's avatars subfolder
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/avatars/${crypto.randomUUID()}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, compressedFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
