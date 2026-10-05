import { strict as assert } from "node:assert";
import { test } from "node:test";
import { isEmail, isReplyEmail, replyLink } from "./email.ts";

test("an email is one @ with a dotted domain and no spaces", () => {
  for (const ok of ["a@b.co", "Ada+pro@Example.com", "한글@예시.한국"]) assert.equal(isEmail(ok), true, ok);
  for (const bad of ["ada", "ada@", "@x.com", "a b@x.com", "ada@example", "a@b.co\n"])
    assert.equal(isEmail(bad), false);
});

test("a reply address has no URL or header syntax", () => {
  assert.equal(isReplyEmail("ada+pro@example.com"), true);
  for (const bad of [
    "a@b.co?cc=x%40evil.com&body=hi",
    "a@b.co&bcc=x@evil.com",
    "a%0a@b.co",
    "a#x@b.co",
    "a@b.co/x",
    'a"b@c.co',
    "a\u0007@b.co",
  ])
    assert.equal(isReplyEmail(bad), false, bad);
});

test("the reply link is encoded and only for safe addresses", () => {
  assert.equal(
    replyLink("ada+pro@example.com", "Re: your message"),
    "mailto:ada%2Bpro@example.com?subject=Re%3A%20your%20message",
  );
  assert.equal(replyLink("a@b.co?cc=x%40evil.com", "Re"), null);
});
