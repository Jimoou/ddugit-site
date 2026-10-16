// The manual: what each part of ddugit does and where to find it, one chapter per area of the app.
// The table's order is the reading order (the docs index and each chapter's previous / next links).

import type { Article } from "./guides.ts";

export const DOCS = [
  {
    slug: "getting-started",
    title: "Getting started with ddugit",
    description:
      "Install ddugit on macOS or Windows, open, clone or create a repository, and find your way around the window: tabs, sidebar, branch map and inspector.",
    summary: "Install, open your first repository, and learn the parts of the window.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "branch-map",
    title: "Reading the branch map in ddugit",
    description:
      "Move around ddugit's commit graph: zoom, find HEAD, search history, switch map styles and themes, colour or hide branches, and use the list view.",
    summary: "Navigate the graph, search history, and make the map your own.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "commits-and-changes",
    title: "Commits, staging and stashes in ddugit",
    description:
      "Stage files, hunks or single lines, write and amend commits, discard or ignore changes, stash work, and set up who you commit as and how commits are signed.",
    summary: "Stage what you mean to, commit it, and put unfinished work aside.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "branches-and-remotes",
    title: "Branches, merges and remotes in ddugit",
    description:
      "Create and switch branches, merge or rebase by dragging, tag releases, fetch, pull and push safely, manage remotes, and open pull requests on GitHub or GitLab.",
    summary: "Branch, merge by dragging, and keep in step with your remotes.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "history-tools",
    title: "Inspect, compare and rewrite history in ddugit",
    description:
      "Read diffs, compare two revisions, follow a file's history and blame, cherry-pick or revert, edit past commits, undo with the reflog, and find bugs with bisect.",
    summary: "Look into the past, compare it, and change it when you need to.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "multiple-repositories",
    title: "Many repositories, worktrees and submodules",
    description:
      "Watch all your repositories from ddugit's dashboard, group them, and work with worktrees, submodules and Git LFS without leaving the app.",
    summary: "The dashboard, repository groups, worktrees, submodules and LFS.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "pro-features",
    title: "ddugit Pro: backports, stacks and offline transfer",
    description:
      "What ddugit Pro adds: backport tracking, stacked branches, release notes, offline bundle transfer, dashboard batch actions and pull requests on private repos.",
    summary: "Backports, stacked branches, release notes and air-gapped transfer.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
  {
    slug: "settings-and-shortcuts",
    title: "ddugit settings and keyboard shortcuts",
    description:
      "Every ddugit setting in one place, the keyboard shortcuts for macOS and Windows, external editors and diff tools, updates, and how to report a problem.",
    summary: "Settings, shortcuts, outside tools, updates and getting help.",
    published: "2026-10-16",
    updated: "2026-10-16",
  },
] as const satisfies readonly Article[];

export type DocSlug = (typeof DOCS)[number]["slug"];

export const docPath = (slug: DocSlug) => `/docs/${slug}` as const;

export const docBySlug = (slug: DocSlug): Article => DOCS.find((d) => d.slug === slug)!;
