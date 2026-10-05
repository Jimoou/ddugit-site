// Site-wide facts in one place: the product's name, price and where the
// download manifest lives (written by the app's release workflow).

export const SITE = {
  name: "ddugit",
  tagline: "Your Git history, as a graph you can work on.",
  url: "https://ddugit.com",
  contact: "support@ddugit.com",
};

/** Pro: one payment in US dollars, used forever with every future update, on up to `DEVICES` devices. */
export const PRO_PRICE = 29;

/** Devices one Pro license can be activated on at a time. */
export const DEVICES = 3;

/**
 * `downloads.json` in the public `releases` bucket (Supabase Storage):
 * `{ version, date, files: { macos: {name,url,size}, windows: {...} } }`.
 */
export const DOWNLOADS_URL = process.env.NEXT_PUBLIC_DOWNLOADS_URL ?? "";

/** Prices are in US dollars (the store, Lemon Squeezy, charges in USD). */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Login buttons on the account page, in order (each must be enabled in Supabase → Authentication → Providers). */
export const LOGIN_PROVIDERS = ["github", "google"] as const satisfies readonly ("github" | "google")[];
