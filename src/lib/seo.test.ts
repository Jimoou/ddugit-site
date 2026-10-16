import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DOCS } from "./docs.ts";
import { GUIDES } from "./guides.ts";
import { RELEASES, releaseId } from "./releases.ts";
import { BLOCKED_PATHS, docData, guideData, guideMeta, jsonLd, PAGES, pageMeta, productData } from "./seo.ts";

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

test("every guide and chapter has a search-sized title and description, a unique slug and a page", async () => {
  const { existsSync } = await import("node:fs");
  for (const [dir, list] of [
    ["guides", GUIDES],
    ["docs", DOCS],
  ] as const) {
    const slugs = new Set<string>();
    for (const a of list) {
      assert.ok(a.title.length <= 60, `${a.slug} title is ${a.title.length} chars`);
      assert.ok(a.description.length <= 200, `${a.slug} description is ${a.description.length} chars`);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(a.updated) && a.published <= a.updated, a.slug);
      assert.ok(!slugs.has(a.slug), `duplicate ${a.slug}`);
      slugs.add(a.slug);
      assert.ok(existsSync(new URL(`../app/${dir}/${a.slug}/page.tsx`, import.meta.url)), `no page for ${a.slug}`);
    }
  }
});

test("a chapter's breadcrumb points at the user guide", () => {
  const [article, crumbs] = docData("branch-map") as { url?: string; itemListElement?: { item: string }[] }[];
  assert.equal(article.url, "https://ddugit.com/docs/branch-map");
  assert.equal(crumbs.itemListElement?.[0].item, "https://ddugit.com/docs");
});

test("releases run newest first with one entry per version", () => {
  const key = (v: string) => v.split(".").map(Number);
  for (const [newer, older] of RELEASES.slice(0, -1).map((r, i) => [r, RELEASES[i + 1]] as const)) {
    const [a, b] = [key(newer.version), key(older.version)];
    const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    assert.ok(cmp > 0, `${newer.version} should come before ${older.version}`);
    assert.ok(newer.date >= older.date, `${newer.version} is dated before ${older.version}`);
  }
  for (const r of RELEASES) {
    assert.ok(/^\d+\.\d+\.\d+$/.test(r.version) && /^\d{4}-\d{2}-\d{2}$/.test(r.date), r.version);
    assert.ok(r.changes.length > 0, `${r.version} lists no changes`);
  }
  assert.equal(releaseId("1.4.7"), "v1-4-7");
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
