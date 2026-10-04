import { strict as assert } from "node:assert";
import { test } from "node:test";
import { type LicenseInfo, addDays, readLicense, renewed, signLicense } from "./license.ts";

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
