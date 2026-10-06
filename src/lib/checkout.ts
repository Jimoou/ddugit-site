// Paddle checkout: which environment the site's public settings belong to, whether they fit
// together, and what the overlay checkout opens with. Paddle.js reads `customer.email` to fill
// in (and, with `allowLogout: false`, fix) the email, and hands `customData` back to the
// webhook (`data.custom_data`), which puts the license on that ddugit.com account.

export type PaddleEnv = "sandbox" | "production";

/** NEXT_PUBLIC_PADDLE_ENV: "sandbox", otherwise live. */
export const paddleEnv = (raw: string | null | undefined): PaddleEnv =>
  raw?.trim().toLowerCase() === "sandbox" ? "sandbox" : "production";

/** A sandbox token is `test_…` and a live one `live_…`: a mix-up would open a checkout that can't load. */
export function storeReady({
  token,
  priceId,
  environment,
}: {
  token: string;
  priceId: string;
  environment: PaddleEnv;
}) {
  const prefix = environment === "sandbox" ? "test_" : "live_";
  return token.startsWith(prefix) && token.length > prefix.length && /^pri_[a-z0-9]+$/i.test(priceId);
}

/** `Paddle.Checkout.open`'s argument: one copy of Pro, for `email` (the buyer's login) when there is one. */
export function checkoutRequest(priceId: string, email: string | null, successUrl: string) {
  return {
    items: [{ priceId, quantity: 1 }],
    ...(email ? { customer: { email }, customData: { email } } : {}),
    settings: { successUrl, allowLogout: !email },
  };
}
