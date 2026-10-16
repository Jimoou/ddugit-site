// How-to guides: everyday Git tasks done in ddugit, step by step, with the git commands behind them.
// One table feeds the guides index, each guide's metadata and structured data, and the sitemap.
// The manual (`docs.ts`) is a second table of the same articles.

/** An article on the site: a guide or a chapter of the manual. */
export type Article = {
  slug: string;
  /** Search result title: at most 60 characters, without the "· ddugit" suffix. */
  title: string;
  /** Search result description: at most 200 characters. */
  description: string;
  /** Shown in the guides index. */
  summary: string;
  /** First published, YYYY-MM-DD. */
  published: string;
  /** Last real content change, YYYY-MM-DD (the sitemap's lastmod and the article's dateModified). */
  updated: string;
};

export const GUIDES = [
  {
    slug: "interactive-rebase",
    title: "Squash and reorder commits (interactive rebase) in ddugit",
    description:
      "Clean up a branch before you share it: reorder, squash, fixup and drop commits by dragging rows in ddugit, with the git rebase -i commands for reference.",
    summary: "Drag rows to reorder, fold fixups into their commit, and apply the plan.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "resolve-merge-conflicts",
    title: "Resolve Git merge conflicts block by block in ddugit",
    description:
      "Resolve merge, rebase and cherry-pick conflicts in ddugit: pick a side or both for each block, edit by hand, finish or cancel. Plus the git commands behind it.",
    summary: "Pick a side or both for each block, then finish or cancel from the banner.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "cherry-pick-backport",
    title: "Cherry-pick and backport Git commits in ddugit",
    description:
      "Alt-drag a commit onto a branch to cherry-pick it, and use ddugit's backport sheet to find and apply the fixes a release branch is missing.",
    summary: "Alt-drag a commit onto a branch, or list every fix a release is missing.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "undo-reset-reflog",
    title: "Undo commits and recover them from the reflog in ddugit",
    description:
      "Undo the last commit, reset a branch soft, mixed or hard, revert a pushed commit, and recover lost commits from ddugit's undo history (the reflog).",
    summary: "Undo a commit, reset a branch, and get back commits you thought were gone.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
] as const satisfies readonly Article[];

export type GuideSlug = (typeof GUIDES)[number]["slug"];

export const guidePath = (slug: GuideSlug) => `/guides/${slug}` as const;

export const guideBySlug = (slug: GuideSlug): Article => GUIDES.find((g) => g.slug === slug)!;

/** The newest change in a table of articles: its index page's lastmod. */
export const newest = (list: readonly Article[]) =>
  list
    .map((a) => a.updated)
    .sort()
    .at(-1)!;
