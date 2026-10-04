// Public Supabase project settings (Netlify env). Both are safe in the browser;
// the service-role key never belongs in this site. Supabase's own guides name the
// key differently over time (anon key → publishable key), so any of these works.
// Only server code reads them, so they are also read at run time, not just at build.
const env = (...names: string[]) =>
  names
    .map((n) => process.env[n])
    .find((v) => v && v.trim())
    ?.trim() ?? "";

export const SUPABASE_URL = env("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
export const SUPABASE_ANON_KEY = env(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
);
export const hasSupabase = () => SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
