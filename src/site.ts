// Site-wide facts in one place: the product's name, prices and where the
// download manifest lives (written by the app's release workflow).

export const SITE = {
  name: "ddugit",
  tagline: "See your Git as a graph. Work it as a graph.",
  url: "https://ddugit.com",
  contact: "support@ddugit.com",
};

/** Subscription for work use (2026-10-04 decision). Personal, student and open-source use is free. */
export const PRICES = { monthly: 4900, yearly: 49000 };

/**
 * `downloads.json` in the public `releases` bucket (Supabase Storage):
 * `{ version, date, files: { macos: {name,url,size}, windows: {...} } }`.
 */
export const DOWNLOADS_URL = process.env.NEXT_PUBLIC_DOWNLOADS_URL ?? "";

/** Prices are in Korean won (the store charges in KRW). */
export const won = (n: number) => `₩${n.toLocaleString("en-US")}`;

/** Login buttons on the account page, in order (each must be enabled in Supabase → Authentication → Providers). */
export const LOGIN_PROVIDERS = ["github", "google"] as const satisfies readonly ("github" | "google")[];
