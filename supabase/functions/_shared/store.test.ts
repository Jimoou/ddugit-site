import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import {
  type StoreEvent,
  SIGNATURE_MAX_AGE_S,
  decide,
  newLicenseId,
  paddleApi,
  productIds,
  purchaseRow,
  refundUntil,
  refundable,
  verifySignature,
} from "./store.ts";

const PRO = ["pro_77"];
const NOW = 1_760_000_000;

const h1 = (secret: string, ts: number | string, body: string) =>
  createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
const bytes = (s: string) => new TextEncoder().encode(s);

test("only the HMAC-SHA256 of ts:body under the secret, signed recently, passes", async () => {
  const body = '{"event_type":"transaction.completed"}';
  const ok = (header: string | null, secret = "pdl_ntfset_s3cret", raw = body, now = NOW) =>
    verifySignature(secret, bytes(raw), header, now);
  const sig = h1("pdl_ntfset_s3cret", NOW, body);
  assert.equal(await ok(`ts=${NOW};h1=${sig}`), true);
  assert.equal(await ok(`ts=${NOW}; h1=${sig.toUpperCase()}`), true);
  // While a secret is rotated, either signature may be the right one.
  assert.equal(await ok(`ts=${NOW};h1=${"0".repeat(64)};h1=${sig}`), true);
  assert.equal(await ok(`ts=${NOW};h1=${sig}`, "pdl_ntfset_s3cret", body + " "), false);
  assert.equal(await ok(`ts=${NOW};h1=${sig}`, "other"), false);
  assert.equal(await ok(`ts=${NOW + 1};h1=${sig}`), false); // the timestamp is signed too
  assert.equal(await ok(`h1=${sig}`), false);
  assert.equal(await ok(`ts=${NOW}`), false);
  assert.equal(await ok(null), false);
  assert.equal(await ok(`ts=${NOW};h1=${sig}`, ""), false);
  // Too old or too far ahead: a replayed notification.
  const late = NOW + SIGNATURE_MAX_AGE_S + 1;
  assert.equal(await ok(`ts=${NOW};h1=${sig}`, "pdl_ntfset_s3cret", body, late), false);
  assert.equal(await ok(`ts=${NOW};h1=${sig}`, "pdl_ntfset_s3cret", body, NOW + SIGNATURE_MAX_AGE_S), true);
});

test("license ids look like the ones scripts/license.mjs makes", () => {
  const a = newLicenseId();
  assert.match(a, /^lic_[A-Za-z0-9_-]{12}$/);
  assert.notEqual(a, newLicenseId());
});

const txn = (over: { type?: string; custom?: unknown; customer?: string | null; items?: unknown } = {}) =>
  ({
    event_id: "evt_1",
    event_type: over.type ?? "transaction.completed",
    data: {
      id: "txn_1234",
      status: "completed",
      customer_id: over.customer === undefined ? "ctm_9" : over.customer,
      custom_data: over.custom === undefined ? { email: "login@example.com" } : over.custom,
      items: over.items ?? [{ quantity: 1, price: { id: "pri_1", product_id: "pro_77" } }],
    },
  }) as StoreEvent;

const adjustment = (over: { type?: string; action?: string; status?: string; kind?: string } = {}) =>
  ({
    event_type: over.type ?? "adjustment.updated",
    data: {
      id: "adj_1",
      action: over.action ?? "refund",
      status: over.status ?? "approved",
      ...(over.kind === undefined ? { type: "full" } : over.kind === "" ? {} : { type: over.kind }),
      transaction_id: "txn_1234",
    },
  }) as StoreEvent;

test("a completed Pro transaction makes a lifetime license for three devices, for the login passed at checkout", () => {
  const d = decide(txn(), PRO);
  assert.deepEqual(d, {
    action: "create",
    order: "txn_1234",
    customer: "ctm_9",
    email: "login@example.com",
    copies: 1,
  });
  assert.deepEqual(purchaseRow(d as Extract<typeof d, { action: "create" }>, "login@example.com", " Ada ", false), {
    email: "login@example.com",
    name: "Ada",
    kind: "personal",
    plan: "lifetime",
    status: "active",
    seats: 1,
    max_devices: 3,
    text: null,
    store_order_id: "txn_1234",
    store_test: false,
  });
});

test("without a usable login email the function looks up the customer; with neither, nothing happens", () => {
  for (const custom of [null, {}, { email: "not an email" }, { email: 3 }]) {
    const d = decide(txn({ custom }), PRO);
    assert.equal(d.action === "create" && d.email, null);
    assert.equal(d.action === "create" && d.customer, "ctm_9");
  }
  assert.equal(decide(txn({ custom: null, customer: null }), PRO).action, "ignore");
});

test("more copies, more devices; other products in the same transaction don't count", () => {
  const d = decide(
    txn({
      items: [
        { quantity: 2, price: { product_id: "pro_77" } },
        { quantity: 5, price: { product_id: "pro_other" } },
        { quantity: 0, price: { product_id: "pro_77" } },
      ],
    }),
    PRO,
  );
  assert.equal(d.action === "create" && d.copies, 3);
  assert.equal(purchaseRow(d as Extract<typeof d, { action: "create" }>, "a@b.co", null, true).max_devices, 9);
  assert.equal(purchaseRow(d as Extract<typeof d, { action: "create" }>, "a@b.co", null, true).name, "a@b.co");
});

test("an approved full refund or chargeback takes the license back; anything less doesn't", () => {
  assert.deepEqual(decide(adjustment(), PRO), { action: "refund", order: "txn_1234" });
  assert.equal(decide(adjustment({ type: "adjustment.created" }), PRO).action, "refund");
  assert.equal(decide(adjustment({ action: "chargeback" }), PRO).action, "refund");
  assert.equal(decide(adjustment({ kind: "" }), PRO).action, "refund");
  assert.equal(decide(adjustment({ status: "pending_approval" }), PRO).action, "ignore");
  assert.equal(decide(adjustment({ status: "rejected" }), PRO).action, "ignore");
  assert.equal(decide(adjustment({ kind: "partial" }), PRO).action, "ignore");
  assert.equal(decide(adjustment({ action: "credit" }), PRO).action, "ignore");
  assert.equal(decide(adjustment({ action: "chargeback_reverse" }), PRO).action, "ignore");
});

test("other events and other products change nothing", () => {
  assert.equal(decide(txn({ type: "transaction.paid" }), PRO).action, "ignore");
  assert.equal(decide(txn({ type: "subscription.created" }), PRO).action, "ignore");
  assert.equal(decide(txn(), ["pro_99", "pro_77"]).action, "create");
  assert.equal(decide(txn(), ["pro_99"]).action, "ignore");
  assert.equal(decide(txn({ items: [] }), PRO).action, "ignore");
  assert.equal(decide({ event_type: "transaction.completed" }, PRO).action, "ignore");
});

test("without product ids nothing makes a license; the setting is a comma-separated list", () => {
  assert.equal(decide(txn(), []).action, "ignore");
  assert.deepEqual(productIds(" pro_77, pro_78 ,,"), ["pro_77", "pro_78"]);
  assert.deepEqual(productIds(""), []);
  assert.deepEqual(productIds(undefined), []);
});

test("sandbox notifications go back to the sandbox API", () => {
  assert.equal(paddleApi("sandbox"), "https://sandbox-api.paddle.com");
  assert.equal(paddleApi("production"), "https://api.paddle.com");
  assert.equal(paddleApi(""), "https://api.paddle.com");
});

test("a store license can be refunded by its buyer for 14 days, once, while active", () => {
  const bought = "2026-10-01T12:00:00Z";
  const row = {
    kind: "personal",
    status: "active",
    store_order_id: "txn_1",
    created_at: bought,
    refund_requested_at: null,
  };
  const at = (iso: string) => Date.parse(iso);
  assert.equal(refundable(row, at("2026-10-01T13:00:00Z")), null);
  assert.equal(refundable(row, at("2026-10-15T12:00:00Z")), null);
  assert.equal(refundable(row, at("2026-10-15T12:00:01Z")), "too-late");
  assert.equal(refundable({ ...row, refund_requested_at: "2026-10-02T00:00:00Z" }, at(bought)), "requested");
  assert.equal(refundable({ ...row, status: "refunded" }, at(bought)), "inactive");
  assert.equal(refundable({ ...row, store_order_id: null }, at(bought)), "not-bought");
  assert.equal(refundable({ ...row, store_order_id: "1234" }, at(bought)), "not-bought");
  assert.equal(refundable({ ...row, kind: "site" }, at(bought)), "not-bought");
  assert.equal(refundable({ ...row, created_at: "garbage" }, at(bought)), "too-late");
  assert.equal(refundUntil(bought), "2026-10-15");
});
