import { strict as assert } from "node:assert";
import { test } from "node:test";
import { GUIDES } from "./guides.ts";
import { BLOCKED_PATHS, guideData, guideMeta, jsonLd, PAGES, pageMeta, productData } from "./seo.ts";

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

test("every guide has a search-sized title and description, a unique slug and a page", async () => {
  const { existsSync } = await import("node:fs");
  const slugs = new Set<string>();
  for (const g of GUIDES) {
    assert.ok(g.title.length <= 60, `${g.slug} title is ${g.title.length} chars`);
    assert.ok(g.description.length <= 200, `${g.slug} description is ${g.description.length} chars`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(g.updated) && g.published <= g.updated, g.slug);
    assert.ok(!slugs.has(g.slug), `duplicate ${g.slug}`);
    slugs.add(g.slug);
    assert.ok(existsSync(new URL(`../app/guides/${g.slug}/page.tsx`, import.meta.url)), `no page for ${g.slug}`);
  }
});

test("a guide's metadata and structured data point at the guide", () => {
  const meta = guideMeta("interactive-rebase");
  assert.equal(meta.alternates?.canonical, "/guides/interactive-rebase");
  assert.equal((meta.openGraph as { type: string }).type, "article");
  const [article, crumbs] = guideData("interactive-rebase") as {
    url?: string;
    itemListElement?: { item: string }[];
  }[];
  assert.equal(article.url, "https://ddugit.com/guides/interactive-rebase");
  assert.deepEqual(
    crumbs.itemListElement?.map((i) => i.item),
    ["https://ddugit.com/guides", "https://ddugit.com/guides/interactive-rebase"],
  );
});
