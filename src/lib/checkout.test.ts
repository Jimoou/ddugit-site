import { strict as assert } from "node:assert";
import { test } from "node:test";
import { checkoutRequest, paddleEnv, storeReady } from "./checkout.ts";

test("only an explicit sandbox setting is the sandbox", () => {
  assert.equal(paddleEnv("sandbox"), "sandbox");
  assert.equal(paddleEnv(" Sandbox "), "sandbox");
  assert.equal(paddleEnv("production"), "production");
  assert.equal(paddleEnv(""), "production");
  assert.equal(paddleEnv(undefined), "production");
});

test("the store opens only when the token fits the environment and the price is a price id", () => {
  const live = { token: "live_abc123", priceId: "pri_01h", environment: "production" as const };
  assert.equal(storeReady(live), true);
  assert.equal(storeReady({ ...live, environment: "sandbox" }), false);
  assert.equal(storeReady({ ...live, token: "test_abc123", environment: "sandbox" }), true);
  assert.equal(storeReady({ ...live, token: "live_" }), false);
  assert.equal(storeReady({ ...live, token: "" }), false);
  assert.equal(storeReady({ ...live, priceId: "pro_01h" }), false);
  assert.equal(storeReady({ ...live, priceId: "" }), false);
});

test("a signed-in buyer's checkout is fixed to their login, which rides along as custom data", () => {
  assert.deepEqual(checkoutRequest("pri_1", "ada@example.com", "https://ddugit.com/thanks"), {
    items: [{ priceId: "pri_1", quantity: 1 }],
    customer: { email: "ada@example.com" },
    customData: { email: "ada@example.com" },
    settings: { successUrl: "https://ddugit.com/thanks", allowLogout: false },
  });
  assert.deepEqual(checkoutRequest("pri_1", null, "https://ddugit.com/thanks"), {
    items: [{ priceId: "pri_1", quantity: 1 }],
    settings: { successUrl: "https://ddugit.com/thanks", allowLogout: true },
  });
});
