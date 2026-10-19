
import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser-side operations.
 * Will be used for login, signup, and logout.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
