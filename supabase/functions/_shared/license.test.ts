import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type LicenseInfo,
  LIFETIME_UPDATES,
  allowTestLicenses,
  checkActivationDevice,
  checkDeactivation,
  deviceBound,
  deviceSlot,
  fullMessage,
  lifetimeLicense,
  readLicense,
  refreshStatus,
  sha256Hex,
  signLicense,
  unusable,
} from "./license.ts";

const info: LicenseInfo = {
  id: "lic_1",
  name: "Acme",
  email: "it@acme.example",
  kind: "site",
  seats: 10,
  issued: "2026-10-04",
  updatesUntil: "2027-10-04",
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

test("keys in the formats scripts/license.mjs writes (PKCS#8 PEM, base64url public)", async () => {
  const { generateKeyPairSync } = await import("node:crypto");
  const pair = generateKeyPairSync("ed25519");
  const pem = pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const pub = pair.publicKey.export({ format: "jwk" }).x!;
  const { privateKey, publicKey } = await import("./license.ts");
  const text = await signLicense(await privateKey(pem), info);
  assert.deepEqual(await readLicense(await publicKey(pub), text), info);
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
  text: null,
};

test("a lifetime license is signed for one device, with every update and no expiry", async () => {
  const { privateKey, publicKey } = await keys();
  const text = await signLicense(privateKey, lifetimeLicense(lifetimeRow, "2026-10-05", HASH));
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
});

test("every kind of license needs to be active; test orders only where allowed", () => {
  assert.equal(unusable(lifetimeRow, false), null);
  for (const status of ["refunded", "revoked", "cancelled", "expired"]) {
    assert.equal(unusable({ ...lifetimeRow, status }, true), "inactive", status);
    assert.equal(unusable({ ...lifetimeRow, kind: "site", plan: null, status }, true), "inactive", `site ${status}`);
  }
  assert.equal(unusable({ ...lifetimeRow, store_test: true }, false), "test");
  assert.equal(unusable({ ...lifetimeRow, store_test: true }, true), null);
  assert.equal(unusable({ ...lifetimeRow, store_test: true, status: "refunded" }, true), "inactive");
  for (const on of ["true", "TRUE", " 1 "]) assert.equal(allowTestLicenses(on), true, on);
  for (const off of [undefined, null, "", "false", "0", "yes"])
    assert.equal(allowTestLicenses(off), false, String(off));
});

test("refresh: a missing row removes a device-bound license; an unusable one expires", () => {
  assert.equal(refreshStatus({ device: HASH }, null, false), "removed");
  assert.equal(refreshStatus({}, null, false), "unknown");
  assert.equal(refreshStatus({ device: HASH }, { status: "refunded" }, false), "expired");
  assert.equal(refreshStatus({}, { status: "revoked" }, false), "expired");
  assert.equal(refreshStatus({ device: HASH }, { status: "active", store_test: true }, false), "expired");
  assert.equal(refreshStatus({ device: HASH }, { status: "active", store_test: true }, true), null);
  assert.equal(refreshStatus({}, { status: "active" }, false), null);
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

test("an offline activation code is a lifetime license signed for no device", async () => {
  const { privateKey, publicKey } = await keys();
  const text = await signLicense(privateKey, lifetimeLicense(lifetimeRow, "2026-10-07"));
  const info = await readLicense(publicKey, text);
  assert.equal(info?.plan, "lifetime");
  assert.equal(info?.updatesUntil, LIFETIME_UPDATES);
  assert.equal("device" in (info ?? {}), false);
  // Refunded later: refresh tells an online app to drop it (a lifetime license "expires" only then).
  assert.equal(refreshStatus(info!, { status: "refunded", store_test: false }, false), "expired");
});
