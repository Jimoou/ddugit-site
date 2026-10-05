import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { ALL_HOUR, PER_SENDER_HOUR, allowed, checkReport, isBot, senderHash, senderIp } from "./report.ts";

const base = { kind: "bug", message: "The graph froze.", source: "app" };
const err = (body: unknown) => {
  const r = checkReport(body);
  return r.ok ? null : r.error;
};

test("a minimal report passes, with every optional field null", () => {
  assert.deepEqual(checkReport(base), {
    ok: true,
    report: {
      kind: "bug",
      message: "The graph froze.",
      email: null,
      diagnostics: null,
      source: "app",
      app_version: null,
      os: null,
    },
  });
});

test("a full report keeps its fields, trimmed, and ignores unknown ones", () => {
  const r = checkReport({
    kind: "question",
    message: "  How do I rebase?\n",
    email: " ada@example.com ",
    diagnostics: "ddugit 0.9.0\nlog…",
    source: "web",
    appVersion: "0.9.0",
    os: "macOS 15.1 (arm64)",
    website: "",
    extra: 1,
  });
  assert.ok(r.ok);
  assert.deepEqual(r.report, {
    kind: "question",
    message: "How do I rebase?",
    email: "ada@example.com",
    diagnostics: "ddugit 0.9.0\nlog…",
    source: "web",
    app_version: "0.9.0",
    os: "macOS 15.1 (arm64)",
  });
});

test("blank optional fields count as absent", () => {
  const r = checkReport({ ...base, email: "  ", diagnostics: "", appVersion: null, os: undefined });
  assert.ok(r.ok);
  assert.equal(r.report.email, null);
  assert.equal(r.report.diagnostics, null);
});

test("kind, source and message are required and checked", () => {
  assert.match(err({ ...base, kind: "praise" })!, /Kind/);
  assert.match(err({ ...base, source: undefined })!, /Source/);
  assert.match(err({ ...base, message: "   " })!, /message/);
  assert.match(err({ ...base, message: 42 })!, /message/);
  assert.ok(err(null));
  assert.ok(err([base]));
  assert.ok(err("bug"));
});

test("lengths are counted in characters, not UTF-16 units", () => {
  assert.equal(err({ ...base, message: "🐛".repeat(5000) }), null);
  assert.match(err({ ...base, message: "a".repeat(5001) })!, /too long/);
  assert.equal(err({ ...base, diagnostics: "x".repeat(20000) }), null);
  assert.match(err({ ...base, diagnostics: "x".repeat(20001) })!, /diagnostics/);
  assert.match(err({ ...base, appVersion: "1".repeat(33) })!, /version/);
  assert.match(err({ ...base, os: "o".repeat(65) })!, /OS/);
  assert.match(err({ ...base, os: 7 })!, /OS/);
});

test("an email must look like one and fit in 254 characters", () => {
  assert.equal(err({ ...base, email: "a@b.co" }), null);
  for (const bad of ["ada", "ada@", "@x.com", "a b@x.com", "ada@example", 5])
    assert.match(err({ ...base, email: bad })!, /email/, String(bad));
  assert.match(err({ ...base, email: `${"a".repeat(245)}@example.com` })!, /email/);
});

test("the honeypot catches any non-empty website", () => {
  assert.equal(isBot(base), false);
  assert.equal(isBot({ ...base, website: "" }), false);
  assert.equal(isBot({ ...base, website: null }), false);
  assert.equal(isBot({ ...base, website: "http://spam" }), true);
  assert.equal(isBot({ ...base, website: 0 }), true);
  assert.equal(isBot(null), false);
});

test("the sender IP comes from the site's header first, then the proxies'", () => {
  const h = (o: Record<string, string>) => new Headers(o);
  assert.equal(
    senderIp(
      h({ "x-ddugit-client-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1", "cf-connecting-ip": "1.1.1.1" }),
    ),
    "203.0.113.9",
  );
  assert.equal(senderIp(h({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" })), "198.51.100.1");
  assert.equal(senderIp(h({ "cf-connecting-ip": "2001:DB8::1" })), "2001:db8::1");
  assert.equal(senderIp(h({ "x-ddugit-client-ip": "evil<script>", "cf-connecting-ip": "1.1.1.1" })), "1.1.1.1");
  assert.equal(senderIp(h({})), null);
});

test("the sender hash is the salted SHA-256, never the IP", async () => {
  const hash = await senderHash("pepper", "203.0.113.9");
  assert.equal(hash, createHash("sha256").update("pepper:203.0.113.9").digest("hex"));
  assert.notEqual(hash, await senderHash("salt", "203.0.113.9"));
  assert.match(await senderHash("pepper", null), /^[0-9a-f]{64}$/);
});

test("five reports per sender per hour, with a cap for everyone", () => {
  assert.equal(allowed(0, 0), true);
  assert.equal(allowed(PER_SENDER_HOUR - 1, 10), true);
  assert.equal(allowed(PER_SENDER_HOUR, 10), false);
  assert.equal(allowed(0, ALL_HOUR - 1), true);
  assert.equal(allowed(0, ALL_HOUR), false);
});
