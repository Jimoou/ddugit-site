// How-to guides: everyday Git tasks, each shown on the command line and in ddugit.
// One table feeds the guides index, each guide's metadata and structured data, and the sitemap.

export type Guide = {
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
    title: "Git interactive rebase: squash, reorder and drop commits",
    description:
      "Clean up a branch before you share it: squash fixups, reorder and drop commits with git rebase -i, and how to do the same by dragging rows in ddugit.",
    summary: "Squash, reorder, reword and drop commits before you share a branch.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "resolve-merge-conflicts",
    title: "How to resolve merge conflicts in Git",
    description:
      "What a Git merge conflict is, how to read conflict markers, how to finish or abort a merge, rebase or cherry-pick, and how to resolve conflicts block by block in ddugit.",
    summary: "Read the markers, pick a side or combine both, and finish or abort safely.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "cherry-pick-backport",
    title: "Git cherry-pick and backporting fixes between branches",
    description:
      "Copy commits from one branch to another with git cherry-pick, find which fixes a release branch is still missing, and backport them in order with ddugit.",
    summary: "Copy fixes to another branch and find the ones a release is still missing.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
  {
    slug: "undo-reset-reflog",
    title: "How to undo in Git: reset, revert and the reflog",
    description:
      "Undo the last commit, choose between git reset soft, mixed and hard, revert pushed commits, and recover lost commits from the reflog, on the command line and in ddugit.",
    summary: "Undo a commit, reset a branch, and get back commits you thought were gone.",
    published: "2026-10-07",
    updated: "2026-10-07",
  },
] as const satisfies readonly Guide[];

export type GuideSlug = (typeof GUIDES)[number]["slug"];

export const guidePath = (slug: GuideSlug) => `/guides/${slug}` as const;

export const guideBySlug = (slug: GuideSlug): Guide => GUIDES.find((g) => g.slug === slug)!;

/** The newest guide change: the index page's lastmod. */
export const guidesUpdated = () =>
  GUIDES.map((g) => g.updated as string)
    .sort()
    .at(-1)!;
