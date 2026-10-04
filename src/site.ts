// Site-wide facts in one place: the product's name, prices and where the
// download manifest lives (written by the app's release workflow).

export const SITE = {
  name: "ddugit",
  tagline: "그래프로 보고, 그래프로 다루는 Git.",
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

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** Login buttons on the account page, in order (each must be enabled in Supabase → Authentication → Providers). */
export const LOGIN_PROVIDERS = ["github", "google"] as const satisfies readonly ("github" | "google")[];
