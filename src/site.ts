// Site-wide facts in one place: the product's name, price and where the
// download manifest lives (written by the app's release workflow).

import { CONTACT_EMAIL } from "../supabase/functions/_shared/contact.ts";
import { paddleEnv, storeReady } from "./lib/checkout.ts";

export const SITE = {
  name: "ddugit",
  tagline: "Your Git history, as a graph you can work on.",
  url: "https://ddugit.com",
  contact: CONTACT_EMAIL,
  /** Who sells ddugit: the legal name on the Paddle account (an individual), named in the terms. */
  seller: "Kim Jiwoon",
};

/** Pro: one payment in US dollars, used forever with every future update, on up to `DEVICES` devices. */
export const PRO_PRICE = 29;

/** Devices one Pro license can be activated on at a time (the store webhook's `DEVICES_PER_COPY`). */
export { DEVICES_PER_COPY as DEVICES } from "../supabase/functions/_shared/store.ts";

/**
 * `downloads.json` in the public `releases` bucket (Supabase Storage):
 * `{ version, date, files: { macos: {name,url,size}, windows: {...} } }`.
 */
export const DOWNLOADS_URL = process.env.NEXT_PUBLIC_DOWNLOADS_URL ?? "";

/**
 * ddugit in the Microsoft Store: Windows' main download. Microsoft signs the package and the
 * Store keeps it up to date, so it installs without a SmartScreen warning. The unsigned `.exe`
 * from `downloads.json` stays for PCs without the Store.
 */
export const MICROSOFT_STORE_URL = "https://apps.microsoft.com/detail/9MW648MCPQPQ";

/**
 * Paddle Billing, which sells Pro (merchant of record). Public values only, from Netlify's
 * environment: the client-side token (Developer tools → Authentication; `test_…` in the sandbox,
 * `live_…` live), the Pro price (`pri_…`) and which environment they belong to.
 * Until all three fit together the pricing page says "Available soon".
 */
export const PADDLE = {
  token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() ?? "",
  priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID?.trim() ?? "",
  environment: paddleEnv(process.env.NEXT_PUBLIC_PADDLE_ENV),
};

/** Whether Pro can be bought. */
export const STORE_OPEN = storeReady(PADDLE);

/** Prices are in US dollars (the Paddle price is set in USD). */
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Login buttons on the account page, in order (each must be enabled in Supabase → Authentication → Providers). */
export const LOGIN_PROVIDERS = ["github", "google"] as const satisfies readonly ("github" | "google")[];
