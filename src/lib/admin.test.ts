import { strict as assert } from "node:assert";
import { test } from "node:test";
import { adminHref, excerpt, isStatus, parseFilters } from "./admin.ts";

const ID = "0b7f8c2e-5d1a-4c3b-9e2f-1a2b3c4d5e6f";

test("only known filter values survive the query string", () => {
  assert.deepEqual(
    parseFilters({ status: "new", kind: "bug", source: "web", open: ID, before: "2026-10-05T10:00:00Z" }),
    {
      status: "new",
      kind: "bug",
      source: "web",
      open: ID,
      before: "2026-10-05T10:00:00Z",
    },
  );
  assert.deepEqual(
    parseFilters({ status: "deleted", kind: ["bug", "question"], source: "", open: "1; drop", before: "soon" }),
    {
      status: undefined,
      kind: undefined,
      source: undefined,
      open: undefined,
      before: undefined,
    },
  );
});

test("dashboard links keep the other filters and drop empty ones", () => {
  const f = parseFilters({ status: "new", kind: "bug" });
  assert.equal(adminHref(f), "/admin?status=new&kind=bug");
  assert.equal(adminHref(f, { status: undefined }), "/admin?kind=bug");
  assert.equal(adminHref(f, { source: "app", open: ID }), `/admin?status=new&kind=bug&source=app&open=${ID}`);
  assert.equal(adminHref({}), "/admin");
});

test("statuses are new, read and done", () => {
  assert.equal(isStatus("read"), true);
  assert.equal(isStatus("archived"), false);
});

test("an excerpt is the first line, cut at a character boundary", () => {
  assert.equal(excerpt("  Crash on start\nstack…"), "Crash on start");
  assert.equal(excerpt("🐛".repeat(10), 5), "🐛🐛🐛🐛…");
  assert.equal(excerpt("short", 5), "short");
});
