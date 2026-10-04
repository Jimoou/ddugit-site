// Site-wide facts in one place: the product's name, prices and where the
// download manifest lives (written by the app's release workflow).

export const SITE = {
  name: "ddugit",
  tagline: "See your Git history as a graph, and work right on it.",
  url: "https://ddugit.com",
  contact: "support@ddugit.com",
};

/** Subscription for work use (2026-10-04 decision). Personal, student and open-source use is free. */
export const PRICES = { monthly: 5, yearly: 50 };

/**
 * `downloads.json` in the public `releases` bucket (Supabase Storage):
 * `{ version, date, files: { macos: {name,url,size}, windows: {...} } }`.
 */
export const DOWNLOADS_URL = process.env.NEXT_PUBLIC_DOWNLOADS_URL ?? "";

/** Prices are in US dollars (the store, Lemon Squeezy, charges in USD). */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Login buttons on the account page, in order (each must be enabled in Supabase → Authentication → Providers). */
export const LOGIN_PROVIDERS = ["github", "google"] as const satisfies readonly ("github" | "google")[];
