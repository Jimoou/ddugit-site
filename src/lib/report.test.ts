import { strict as assert } from "node:assert";
import { test } from "node:test";
import { clientIp, forwardHeaders } from "./report.ts";

const h = (o: Record<string, string>) => new Headers(o);

test("the visitor's IP is Netlify's header only; headers a visitor can write are ignored", () => {
  assert.equal(
    clientIp(h({ "x-nf-client-connection-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1" })),
    "203.0.113.9",
  );
  assert.equal(clientIp(h({ "x-forwarded-for": "198.51.100.1" })), null);
  assert.equal(clientIp(h({ "x-real-ip": "2001:db8::1" })), null);
  assert.equal(clientIp(h({ "x-nf-client-connection-ip": "not an ip" })), null);
  assert.equal(clientIp(h({})), null);
});

test("the report function gets the forwarding secret, and the IP when known", () => {
  assert.deepEqual(forwardHeaders(h({ "x-nf-client-connection-ip": "203.0.113.9" }), "s3cret"), {
    "x-ddugit-forward": "s3cret",
    "x-ddugit-client-ip": "203.0.113.9",
  });
  assert.deepEqual(forwardHeaders(h({}), "s3cret"), { "x-ddugit-forward": "s3cret" });
});
