import { strict as assert } from "node:assert";
import { test } from "node:test";
import { BLOCKED_PATHS, jsonLd, PAGES, pageMeta, productData } from "./seo.ts";

test("every public page has a search-sized title and description", () => {
  for (const [path, page] of Object.entries(PAGES)) {
    assert.ok(page.title.length <= 60, `${path} title is ${page.title.length} chars`);
    assert.ok(page.description.length <= 200, `${path} description is ${page.description.length} chars`);
  }
});

test("a page's metadata points its canonical URL and share card at itself", () => {
  const meta = pageMeta("/pricing");
  assert.equal(meta.alternates?.canonical, "/pricing");
  assert.equal((meta.openGraph as { url: string }).url, "/pricing");
  assert.equal(meta.title, PAGES["/pricing"].title);
  assert.deepEqual(pageMeta("/").title, { absolute: PAGES["/"].title });
});

test("signed-in pages are not blocked, so crawlers can read their noindex", () => {
  for (const path of ["/account", "/activate", "/admin", "/checkout", "/thanks"]) {
    assert.ok(!BLOCKED_PATHS.some((b) => path.startsWith(b)), path);
  }
});

test("structured data offers Free and the lifetime Pro price and can't close its script tag", () => {
  const data = productData() as { offers: { price: string }[] };
  assert.deepEqual(
    data.offers.map((o) => o.price),
    ["0", "29"],
  );
  assert.ok(!jsonLd({ s: "</script><script>" }).__html.includes("</script>"));
});
