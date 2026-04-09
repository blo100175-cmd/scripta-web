import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    __supabase?: SupabaseClient;
  }
}

export function getSupabase(): SupabaseClient {
  if (!window.__supabase) {
    window.__supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return window.__supabase;
}