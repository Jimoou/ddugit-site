// The store's checkout link for a signed-in buyer. Lemon Squeezy reads
// `checkout[email]` to fill in the email field and hands `checkout[custom][…]`
// back to the webhook as `meta.custom_data`, which ls-webhook uses to put the
// license on this ddugit.com account even if they pay with another email.

/** `base` (the store's checkout link) for `email`; `base` as is without one or when it isn't a URL. */
export function checkoutUrl(base: string, email?: string | null): string {
  if (!email) return base;
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return base;
  }
  url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[custom][email]", email);
  return url.toString();
}
