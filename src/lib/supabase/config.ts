// Public Supabase project settings (Netlify env). Both are safe in the browser;
// the service-role key never belongs in this site. Supabase's own guides name the
// key differently over time (anon key → publishable key), so any of these works.
// Only server code reads them, so they are read at run time, not just at build.

/** The first of `names` set to something, as [name, value]. */
const pick = (names: string[]) => {
  const name = names.find((n) => process.env[n]?.trim());
  return [name ?? null, name ? process.env[name]!.trim() : ""] as const;
};

const URL_NAMES = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"];
const KEY_NAMES = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
];

/** Which variable each setting came from (names only), for /api/status. */
export const settingNames = () => ({ url: pick(URL_NAMES)[0], key: pick(KEY_NAMES)[0] });

export const SUPABASE_URL = pick(URL_NAMES)[1];
export const SUPABASE_ANON_KEY = pick(KEY_NAMES)[1];
export const hasSupabase = () => SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";
