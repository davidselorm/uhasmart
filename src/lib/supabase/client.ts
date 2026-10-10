"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) return null;

  browserClient ??= createBrowserClient(config.url, config.key);
  return browserClient;
}
