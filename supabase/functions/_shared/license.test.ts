import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type LicenseInfo,
  LIFETIME_UPDATES,
  addDays,
  checkActivationDevice,
  checkDeactivation,
  currentText,
  deviceBound,
  deviceSlot,
  fullMessage,
  readLicense,
  renewed,
  sha256Hex,
  signLicense,
} from "./license.ts";

const info: LicenseInfo = {
  id: "lic_1",
  name: "Acme",
  email: "it@acme.example",
  kind: "commercial",
  seats: 1,
  issued: "2026-10-04",
  updatesUntil: "2026-11-11",
  expires: "2026-11-11",
  plan: "monthly",
};

async function keys() {
  const pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])) as CryptoKeyPair;
  return pair;
}

test("a signed license reads back, wrapped or not", async () => {
  const { privateKey, publicKey } = await keys();
  const text = await signLicense(privateKey, info);
  assert.deepEqual(await readLicense(publicKey, text), info);
  assert.deepEqual(await readLicense(publicKey, `  ${text.slice(0, 30)}\n ${text.slice(30)} `), info);
});

test("a tampered, foreign or garbled license is refused", async () => {
  const a = await keys();
  const b = await keys();
  const text = await signLicense(a.privateKey, info);
  const [, , sig] = text.split(".");
  const more = Buffer.from(JSON.stringify({ ...info, seats: 99 })).toString("base64url");
  assert.equal(await readLicense(a.publicKey, `DDUGIT1.${more}.${sig}`), null);
  assert.equal(await readLicense(b.publicKey, text), null);
  assert.equal(await readLicense(a.publicKey, "hello"), null);
  assert.equal(await readLicense(a.publicKey, "DDUGIT1.abc"), null);
});

test("a renewal runs to the paid date plus the grace week", () => {
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
  const r = renewed(info, "2026-12-04", "2026-11-04");
  assert.equal(r.expires, "2026-12-11");
  assert.equal(r.updatesUntil, "2026-12-11");
  assert.equal(r.issued, "2026-11-04");
  assert.equal(r.id, info.id);
});

test("keys in the formats scripts/license.mjs writes (PKCS#8 PEM, base64url public)", async () => {
  const { generateKeyPairSync } = await import("node:crypto");
  const pair = generateKeyPairSync("ed25519");
  const pem = pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const pub = pair.publicKey.export({ format: "jwk" }).x!;
  const { privateKey, publicKey } = await import("./license.ts");
  const text = await signLicense(await privateKey(pem), info);
  assert.deepEqual(await readLicense(await publicKey(pub), text), info);
});

test("a row's license today: site as it is, paid subscriptions renewed, lapsed ones none", async () => {
  const { privateKey, publicKey } = await keys();
  const keysFor = { sign: privateKey, verify: publicKey };
  const text = await signLicense(privateKey, info);
  const row = { id: info.id, name: "Acme Corp", email: info.email, seats: 3, paid_through: "2026-12-04", text };

  const fresh = await readLicense(publicKey, (await currentText(row, "2026-11-04", keysFor))!);
  assert.equal(fresh?.expires, "2026-12-11");
  assert.equal(fresh?.seats, 3);
  assert.equal(fresh?.name, "Acme Corp");
  assert.equal(await currentText(row, "2026-12-05", keysFor), null);
  assert.equal(await currentText({ ...row, paid_through: null }, "2030-01-01", keysFor), text);
});

const HASH = "a".repeat(64);
const lifetimeRow = {
  id: "lic_9",
  name: "Mina",
  email: "mina@example.com",
  kind: "personal",
  plan: "lifetime",
  status: "active",
  seats: 1,
  max_devices: 3,
  paid_through: null,
  text: null,
};

test("a lifetime license is signed for one device, with every update and no expiry", async () => {
  const { privateKey, publicKey } = await keys();
  const keysFor = { sign: privateKey, verify: publicKey };
  const text = (await currentText(lifetimeRow, "2026-10-05", keysFor, undefined, HASH))!;
  assert.deepEqual(await readLicense(publicKey, text), {
    id: "lic_9",
    name: "Mina",
    email: "mina@example.com",
    kind: "personal",
    seats: 1,
    issued: "2026-10-05",
    updatesUntil: LIFETIME_UPDATES,
    plan: "lifetime",
    device: HASH,
  });
  // The payload the app parses: camelCase, no `expires` (absent reads as none), `device` last.
  const payload = JSON.parse(Buffer.from(text.split(".")[1], "base64url").toString());
  assert.deepEqual(Object.keys(payload), [
    "id",
    "name",
    "email",
    "kind",
    "seats",
    "issued",
    "updatesUntil",
    "plan",
    "device",
  ]);
  // No paid period needed; never without a device; not once the purchase is undone.
  assert.equal(await currentText(lifetimeRow, "2099-01-01", keysFor), null);
  assert.equal(await currentText({ ...lifetimeRow, status: "refunded" }, "2026-10-05", keysFor, undefined, HASH), null);
  const again = await currentText(lifetimeRow, "2030-01-01", keysFor, { ...info, device: HASH });
  assert.equal((await readLicense(publicKey, again!))?.device, HASH);
});

test("a subscription activated on a device keeps the device through renewals", async () => {
  const { privateKey, publicKey } = await keys();
  const keysFor = { sign: privateKey, verify: publicKey };
  const row = {
    ...lifetimeRow,
    kind: "commercial",
    plan: "monthly",
    paid_through: "2026-12-04",
    text: await signLicense(privateKey, info),
  };
  const text = await currentText(row, "2026-11-04", keysFor, undefined, HASH);
  assert.equal((await readLicense(publicKey, text!))?.device, HASH);
  const plain = await currentText(row, "2026-11-04", keysFor);
  assert.equal((await readLicense(publicKey, plain!))?.device, undefined);
});

test("device ids are hashed as SHA-256 hex of their text", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("only site licenses are free of devices; three devices fill a license", () => {
  assert.equal(deviceBound({ kind: "site" }), false);
  assert.equal(deviceBound({ kind: "personal" }), true);
  assert.equal(deviceBound({ kind: "commercial" }), true);
  assert.equal(deviceSlot(["x", "y", "z"], "y", 3), "registered");
  assert.equal(deviceSlot(["x", "y"], "z", 3), "free");
  assert.equal(deviceSlot(["x", "y", "z"], "w", 3), "full");
  assert.equal(fullMessage(3), "This license is already on 3 devices. Remove one at ddugit.com/account.");
});

test("a code is traded only by the device it was issued for", () => {
  assert.equal(checkActivationDevice(true, null, null), null);
  assert.equal(checkActivationDevice(false, HASH, HASH), null);
  assert.equal(checkActivationDevice(false, HASH, "b".repeat(64))?.status, 403);
  assert.equal(checkActivationDevice(false, HASH, null)?.status, 403);
  assert.equal(checkActivationDevice(false, null, HASH)?.status, 400);
});

test("a device is released only with its own license and device id", () => {
  const held = { ...info, device: HASH };
  assert.equal(checkDeactivation(held, HASH), null);
  assert.equal(checkDeactivation(held, "b".repeat(64))?.status, 403);
  assert.equal(checkDeactivation(info, HASH)?.status, 400);
  assert.equal(checkDeactivation(null, HASH)?.status, 400);
});
