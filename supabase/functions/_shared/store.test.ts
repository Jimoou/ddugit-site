import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { type StoreEvent, decide, newLicenseId, productIds, verifySignature } from "./store.ts";

const PRO = ["77"];

const sign = (secret: string, body: string) => createHmac("sha256", secret).update(body).digest("hex");
const bytes = (s: string) => new TextEncoder().encode(s);

test("only the HMAC-SHA256 of the exact body under the secret passes", async () => {
  const body = '{"meta":{"event_name":"order_created"}}';
  const sig = sign("s3cret", body);
  assert.equal(await verifySignature("s3cret", bytes(body), sig), true);
  assert.equal(await verifySignature("s3cret", bytes(body), sig.toUpperCase()), true);
  assert.equal(await verifySignature("s3cret", bytes(body + " "), sig), false);
  assert.equal(await verifySignature("other", bytes(body), sig), false);
  assert.equal(await verifySignature("s3cret", bytes(body), sig.slice(0, 62) + "00"), false);
  assert.equal(await verifySignature("s3cret", bytes(body), null), false);
  assert.equal(await verifySignature("s3cret", bytes(body), "zz" + sig.slice(2)), false);
  assert.equal(await verifySignature("", bytes(body), sign("", body)), false);
});

test("license ids look like the ones scripts/license.mjs makes", () => {
  const a = newLicenseId();
  assert.match(a, /^lic_[A-Za-z0-9_-]{12}$/);
  assert.notEqual(a, newLicenseId());
});

const order = (over: { event?: string; status?: string; custom?: unknown; quantity?: number; test?: boolean } = {}) =>
  ({
    meta: {
      event_name: over.event ?? "order_created",
      test_mode: over.test ?? false,
      ...(over.custom === undefined ? {} : { custom_data: over.custom }),
    },
    data: {
      type: "orders",
      id: "1234",
      attributes: {
        user_name: "Ada Lovelace",
        user_email: "pay@example.com",
        status: over.status ?? "paid",
        refunded: over.status === "refunded",
        first_order_item: { product_id: 77, variant_id: 88, quantity: over.quantity ?? 1 },
      },
    },
  }) as StoreEvent;

test("a paid order makes a lifetime license for three devices", () => {
  assert.deepEqual(decide(order(), PRO), {
    action: "create",
    row: {
      email: "pay@example.com",
      name: "Ada Lovelace",
      kind: "personal",
      plan: "lifetime",
      status: "active",
      seats: 1,
      max_devices: 3,
      text: null,
      store_order_id: "1234",
      store_test: false,
    },
  });
});

test("the license goes to the ddugit login passed at checkout, when it is an email", () => {
  const to = (custom: unknown) => {
    const d = decide(order({ custom }), PRO);
    return d.action === "create" ? d.row.email : null;
  };
  assert.equal(to({ email: "Login@Example.com" }), "Login@Example.com");
  assert.equal(to({ email: "not an email" }), "pay@example.com");
  assert.equal(to({ email: 3 }), "pay@example.com");
  assert.equal(to(null), "pay@example.com");
});

test("more copies, more devices; test mode is marked", () => {
  const d = decide(order({ quantity: 2, test: true }), PRO);
  assert.equal(d.action, "create");
  if (d.action === "create") {
    assert.equal(d.row.max_devices, 6);
    assert.equal(d.row.store_test, true);
  }
  const zero = decide(order({ quantity: 0 }), PRO);
  assert.equal(zero.action === "create" && zero.row.max_devices, 3);
});

test("a full refund takes the license back; a partial one doesn't", () => {
  const full = decide(order({ event: "order_refunded", status: "refunded" }), PRO);
  assert.equal(full.action, "refund");
  assert.equal(full.action === "refund" && full.row.status, "refunded");
  assert.equal(decide(order({ event: "order_refunded", status: "partial_refund" }), PRO).action, "ignore");
  // A retried order_created that already reads refunded never makes an active license.
  assert.equal(decide(order({ status: "refunded" }), PRO).action, "refund");
});

test("other events, unpaid orders and other products change nothing", () => {
  assert.equal(decide(order({ event: "subscription_created" }), PRO).action, "ignore");
  assert.equal(decide(order({ status: "pending" }), PRO).action, "ignore");
  assert.equal(decide(order({ status: "fraudulent" }), PRO).action, "ignore");
  assert.equal(decide(order(), ["99", "77"]).action, "create");
  assert.equal(decide(order(), ["99"]).action, "ignore");
  assert.equal(
    decide({ meta: { event_name: "order_created" }, data: { type: "subscriptions", id: 1 } }, PRO).action,
    "ignore",
  );
  const noEmail = order();
  noEmail.data!.attributes!.user_email = "";
  assert.equal(decide(noEmail, PRO).action, "ignore");
});

test("without product ids nothing makes a license; the setting is a comma-separated list", () => {
  assert.equal(decide(order(), []).action, "ignore");
  assert.equal(decide(order({ event: "order_refunded", status: "refunded" }), []).action, "ignore");
  assert.deepEqual(productIds(" 77, 78 ,,"), ["77", "78"]);
  assert.deepEqual(productIds(""), []);
  assert.deepEqual(productIds(undefined), []);
});
