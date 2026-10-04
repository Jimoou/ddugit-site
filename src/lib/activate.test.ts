import { strict as assert } from "node:assert";
import { test } from "node:test";
import { activationTarget, callbackUrl, safeNext, usableLicense } from "./activate.ts";

const STATE = "abcDEF0123456789_-xyz";

test("only a loopback port and a token-like state are accepted", () => {
  assert.deepEqual(activationTarget("53682", STATE), { port: 53682, state: STATE });
  for (const port of ["80", "70000", "1e4", "", undefined, "53682&x=1"])
    assert.equal(activationTarget(port, STATE), null);
  for (const state of ["short", "has space here!!", undefined, "a".repeat(129)])
    assert.equal(activationTarget("53682", state), null);
  assert.equal(
    callbackUrl({ port: 53682, state: STATE }, "c0de"),
    `http://127.0.0.1:53682/callback?code=c0de&state=${STATE}`,
  );
});

test("a site license or a subscription still paid for is used", () => {
  const sub = (id: string, paid_through: string | null) => ({ id, kind: "commercial", status: "active", paid_through });
  assert.equal(usableLicense([sub("old", "2026-09-01"), sub("new", "2026-11-04")], "2026-10-05")?.id, "new");
  assert.equal(usableLicense([sub("site", null)], "2026-10-05")?.id, "site");
  assert.equal(usableLicense([sub("old", "2026-09-01")], "2026-10-05"), null);
});

test("after signing in, only paths on this site", () => {
  assert.equal(safeNext("/activate?port=1&state=x"), "/activate?port=1&state=x");
  for (const bad of ["https://evil.example", "//evil.example", "/\\evil", "", null])
    assert.equal(safeNext(bad), "/account");
});
