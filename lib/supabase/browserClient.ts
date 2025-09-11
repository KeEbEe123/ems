import { createClient } from "@supabase/supabase-js";

function loggingFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : (input as Request).url;
  const method = (init?.method || "GET").toUpperCase();
  // Only log Supabase REST/Realtime calls (avoid Next/HMR endpoints)
  const isSupabase = typeof url === "string" && url.includes("/rest/v1/");
  if (isSupabase) {
    // Keep it lightweight—heavy logs can slow dev
    console.debug("[SB] →", method, url, init);
  }
  return fetch(input as any, init).then(async (res) => {
    if (isSupabase) {
      console.debug("[SB] ←", res.status, res.statusText, method, url);
      if (!res.ok) {
        try {
          const text = await res.clone().text();
          console.debug("[SB] body:", text);
        } catch {}
      }
    }
    return res;
  });
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: { fetch: loggingFetch }, // ✅ scoped logging
    auth: { persistSession: true, autoRefreshToken: true },
  }
);
