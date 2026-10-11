import { createClient } from "@/lib/supabase/client";

/**
 * Returns a publicly accessible URL for a listing image stored in Supabase Storage.
 * Handles full URLs, relative storage keys, or returns null if no image exists.
 */
export function getListingImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;

  // Already a full external URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const supabase = createClient();
  if (!supabase) return null;

  const { data } = supabase.storage.from("listing-images").getPublicUrl(imagePath);
  return data?.publicUrl ?? null;
}
