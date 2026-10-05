import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  type DeviceRow,
  activatePath,
  activationTarget,
  callbackUrl,
  chooseLicense,
  deviceName,
  deviceSlot,
  licenseLabel,
  safeNext,
  sha256Hex,
} from "./activate.ts";

const STATE = "abcDEF0123456789_-xyz";
const DEVICE = "A".repeat(42) + "_";

test("only a loopback port and a token-like state are accepted", () => {
  assert.deepEqual(activationTarget("53682", STATE), {
    port: 53682,
    state: STATE,
    device: null,
    name: "This computer",
  });
  for (const port of ["80", "70000", "1e4", "", undefined, "53682&x=1"])
    assert.equal(activationTarget(port, STATE), null);
  for (const state of ["short", "has space here!!", undefined, "a".repeat(129)])
    assert.equal(activationTarget("53682", state), null);
  assert.equal(
    callbackUrl({ port: 53682, state: STATE }, "c0de"),
    `http://127.0.0.1:53682/callback?code=c0de&state=${STATE}`,
  );
});

test("a device id is 32 bytes of base64url, and its name is cleaned up", () => {
  assert.deepEqual(activationTarget("53682", STATE, DEVICE, "Mina's MacBook"), {
    port: 53682,
    state: STATE,
    device: DEVICE,
    name: "Mina's MacBook",
  });
  for (const device of ["", "A".repeat(42), "A".repeat(44), "A".repeat(42) + "=", "A".repeat(42) + "+", ["x"]])
    assert.equal(activationTarget("53682", STATE, device), null);
  assert.equal(deviceName("  work\u0000pc\n "), "work pc");
  assert.equal(deviceName("x".repeat(80)), "x".repeat(64));
  assert.equal(deviceName("한".repeat(70)).length, 64);
  assert.equal(deviceName(undefined), "This computer");
  assert.equal(deviceName(" \t "), "This computer");
});

test("the activation page comes back with everything the app sent", () => {
  const t = activationTarget("53682", STATE, DEVICE, "Mina & Co's PC")!;
  const back = new URL(activatePath(t), "https://ddugit.com");
  assert.equal(back.pathname, "/activate");
  assert.equal(back.searchParams.get("device"), DEVICE);
  assert.equal(back.searchParams.get("name"), "Mina & Co's PC");
  assert.deepEqual(
    activationTarget(
      ...(["port", "state", "device", "name"].map((k) => back.searchParams.get(k)) as [string, string, string, string]),
    ),
    t,
  );
  assert.equal(activatePath(activationTarget("53682", STATE)!), `/activate?port=53682&state=${STATE}`);
});

test("device ids are kept as the SHA-256 hex of their text", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

const lic = (id: string, extra: Partial<Parameters<typeof deviceSlot>[0]> = {}) => ({
  id,
  kind: "personal",
  plan: "lifetime",
  status: "active",
  store_test: false,
  max_devices: 3,
  ...extra,
});
const dev = (license_id: string, device_hash: string): DeviceRow => ({
  license_id,
  device_hash,
  name: device_hash,
  created_at: "2026-10-01T00:00:00Z",
  last_seen_at: "2026-10-01T00:00:00Z",
});

test("a license has room for a device until max_devices; site licenses always do", () => {
  const devices = [dev("a", "h1"), dev("a", "h2"), dev("a", "h3"), dev("b", "h4")];
  assert.equal(deviceSlot(lic("a"), devices, "h2"), "registered");
  assert.equal(deviceSlot(lic("a"), devices, "h9"), "full");
  assert.equal(deviceSlot(lic("a", { max_devices: 4 }), devices, "h9"), "free");
  assert.equal(deviceSlot(lic("b"), devices, "h9"), "free");
  assert.equal(deviceSlot(lic("s", { kind: "site", plan: null }), devices, "h9"), "free");
});

test("the license chosen is the one this device is on, else one with room, newest first", () => {
  const full = [dev("a", "h1"), dev("a", "h2"), dev("a", "h3")];
  const rows = [lic("a"), lic("b"), lic("gone", { status: "refunded" })];
  assert.deepEqual(chooseLicense(rows, false, full, "h2"), { license: rows[0], slot: "registered" });
  assert.deepEqual(chooseLicense(rows, false, full, "h9"), { license: rows[1], slot: "free" });
  assert.deepEqual(chooseLicense([rows[0]], false, full, "h9"), { license: rows[0], slot: "full" });
  assert.equal(chooseLicense([rows[2]], false, [], "h9"), null);
  assert.equal(chooseLicense([], false, [], null), null);
});

test("only active licenses are chosen, of any kind; test orders only where allowed", () => {
  const site = lic("s", { kind: "site", plan: null });
  assert.deepEqual(chooseLicense([site], false, [], null), { license: site, slot: "free" });
  assert.equal(chooseLicense([{ ...site, status: "revoked" }], false, [], null), null);
  const test = lic("t", { store_test: true });
  assert.equal(chooseLicense([test], false, [], "h1"), null);
  assert.deepEqual(chooseLicense([test], true, [], "h1"), { license: test, slot: "free" });
});

test("licenses are labelled by kind and plan", () => {
  assert.equal(licenseLabel({ kind: "personal", plan: "lifetime" }), "Pro · lifetime");
  assert.equal(licenseLabel({ kind: "site", plan: null }), "Site license");
  assert.equal(licenseLabel({ kind: "commercial", plan: null }), "Pro");
});

test("after signing in, only paths on this site", () => {
  assert.equal(safeNext("/activate?port=1&state=x"), "/activate?port=1&state=x");
  assert.equal(safeNext("/admin?status=new&open=x#r-1"), "/admin?status=new&open=x#r-1");
  assert.equal(safeNext("/a/../account"), "/account");
  for (const bad of [
    "https://evil.example",
    "//evil.example",
    "/\\evil",
    "/\\/evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r//evil.com",
    "/\u0000/evil.com",
    "/.//evil.com",
    "/%2e//evil.com",
    "///evil.com",
    "",
    null,
    undefined,
  ])
    assert.equal(safeNext(bad), "/account", JSON.stringify(bad));
  // Whatever comes out stays on this site.
  for (const ok of ["/account", "/activate?port=1&state=x", "/a//b"])
    assert.equal(new URL(safeNext(ok), "https://ddugit.com").origin, "https://ddugit.com");
});
