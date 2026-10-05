import { strict as assert } from "node:assert";
import { test } from "node:test";
import { clientIp, senderHeaders } from "./report.ts";

const h = (o: Record<string, string>) => new Headers(o);

test("the visitor's IP: Netlify's header first, then the usual proxy headers", () => {
  assert.equal(
    clientIp(h({ "x-nf-client-connection-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.1" })),
    "203.0.113.9",
  );
  assert.equal(clientIp(h({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" })), "198.51.100.1");
  assert.equal(clientIp(h({ "x-real-ip": "2001:db8::1" })), "2001:db8::1");
  assert.equal(clientIp(h({ "x-forwarded-for": "not an ip" })), null);
  assert.equal(clientIp(h({})), null);
});

test("the IP rides to the report function in its own header and as x-forwarded-for", () => {
  assert.deepEqual(senderHeaders(h({ "x-nf-client-connection-ip": "203.0.113.9" })), {
    "x-ddugit-client-ip": "203.0.113.9",
    "x-forwarded-for": "203.0.113.9",
  });
  assert.deepEqual(senderHeaders(h({})), {});
});
