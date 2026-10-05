import { strict as assert } from "node:assert";
import { test } from "node:test";
import { checkoutUrl } from "./checkout.ts";

const BASE = "https://ddugit.lemonsqueezy.com/buy/abc-123";

test("the signed-in email fills in the checkout and rides along as custom data", () => {
  const url = new URL(checkoutUrl(BASE, "ada+pro@example.com"));
  assert.equal(url.origin + url.pathname, BASE);
  assert.equal(url.searchParams.get("checkout[email]"), "ada+pro@example.com");
  assert.equal(url.searchParams.get("checkout[custom][email]"), "ada+pro@example.com");
  assert.match(url.search, /checkout%5Bemail%5D=ada%2Bpro%40example\.com/);
});

test("the link's own parameters stay; no email, no change", () => {
  const url = new URL(checkoutUrl(`${BASE}?embed=1`, "a@b.co"));
  assert.equal(url.searchParams.get("embed"), "1");
  assert.equal(checkoutUrl(BASE, null), BASE);
  assert.equal(checkoutUrl("not a url", "a@b.co"), "not a url");
});
