import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key. This bypasses RLS for
// Storage operations performed on the server. DO NOT expose the service key to the client.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
