// Release notes: what changed in each version of the app, newest first. Add an entry when a release ships
// (ddugit's release steps say so); the release notes page and the sitemap read this table.

export type Change = { kind: "new" | "improved" | "fixed"; text: string };

export type Release = {
  /** SemVer without the "v". */
  version: string;
  /** Shipped, YYYY-MM-DD. */
  date: string;
  changes: readonly Change[];
};

export const RELEASES: readonly Release[] = [
  {
    version: "1.4.7",
    date: "2026-10-16",
    changes: [
      {
        kind: "fixed",
        text: "Pulling with rebase no longer drops local commits that were pushed once and then overwritten on the remote. ddugit fetches and rebases onto the upstream itself, and tells you when a commit was left out because the same change is already there.",
      },
      {
        kind: "fixed",
        text: "The pull confirmation fetches first, so it no longer says there is nothing to pull when the remote has moved on.",
      },
      {
        kind: "fixed",
        text: "A branch with no upstream follows the branch of the same name on the default remote, ending the loop where pull asked you to push first and push asked you to pull first.",
      },
    ],
  },
  {
    version: "1.4.6",
    date: "2026-10-14",
    changes: [{ kind: "improved", text: "The app names Grapipe as its maker." }],
  },
  {
    version: "1.4.5",
    date: "2026-10-14",
    changes: [
      {
        kind: "improved",
        text: "Opening a repository, or pressing H, brings the map to HEAD's own lane instead of the middle of all lanes.",
      },
    ],
  },
  {
    version: "1.4.4",
    date: "2026-10-13",
    changes: [
      {
        kind: "new",
        text: "ddugit is on the Microsoft Store. Store installs are updated by the Store, and Settings › About says so.",
      },
      {
        kind: "fixed",
        text: "Shortcut keys on filled buttons and commit IDs in the light theme's blame are readable.",
      },
      { kind: "fixed", text: "A working-tree diff tab no longer stays empty after a quick switch." },
    ],
  },
  {
    version: "1.4.3",
    date: "2026-10-12",
    changes: [
      {
        kind: "new",
        text: "A real list view: one row per commit with the graph, branch, tag and pull request badges, message, author, date and SHA. It scrolls through large histories smoothly.",
      },
      {
        kind: "fixed",
        text: "Overlapping rows in the undo history, the remote rows' background in the sidebar, and spacing around header buttons.",
      },
    ],
  },
  {
    version: "1.4.2",
    date: "2026-10-12",
    changes: [
      { kind: "improved", text: "Commit messages in the list view sit on the same backing panel as on the map." },
    ],
  },
  {
    version: "1.4.1",
    date: "2026-10-12",
    changes: [
      {
        kind: "improved",
        text: "Commit messages sit centred under their commit on a backing panel, up to two lines, with wider columns and lanes so they stay readable.",
      },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-10-12",
    changes: [
      {
        kind: "new",
        text: "Branch map styles: Gauge (the new default: fine curves and small dots), Route map (bold lines, 45° bends, stations and interchanges) and Space (neon, glow and sparkle). Pick one in Settings.",
      },
    ],
  },
  {
    version: "1.3.2",
    date: "2026-10-12",
    changes: [
      {
        kind: "improved",
        text: "Ink effects on the light theme's paper, roomier commit captions on the map, and tidier sidebar rows.",
      },
    ],
  },
  {
    version: "1.3.1",
    date: "2026-10-11",
    changes: [{ kind: "improved", text: "Text on the branch map is a little larger." }],
  },
  {
    version: "1.3.0",
    date: "2026-10-11",
    changes: [
      { kind: "new", text: "Give any branch its own colour from a palette, in the sidebar or the branch's menu." },
      {
        kind: "new",
        text: "Hide a branch from the map with the eye in the sidebar: commits only it reaches drop out of view.",
      },
    ],
  },
  {
    version: "1.2.1",
    date: "2026-10-11",
    changes: [
      {
        kind: "improved",
        text: "A warmer light theme, branch highlights back in the sidebar and top bar, and long branch names that wrap in the inspector.",
      },
      { kind: "improved", text: "The list view shows the newest commit at the top." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-10-11",
    changes: [
      {
        kind: "new",
        text: "A light theme, with the dark theme as the default and a System option that follows your OS.",
      },
      { kind: "improved", text: "A quieter graphite window frame around the branch map." },
      { kind: "new", text: "A List button on the map, and release tags that stay visible when you zoom out." },
    ],
  },
  {
    version: "1.1.3",
    date: "2026-10-08",
    changes: [{ kind: "fixed", text: "A long commit message no longer overlaps the rest of the inspector." }],
  },
  {
    version: "1.1.2",
    date: "2026-10-08",
    changes: [
      {
        kind: "improved",
        text: "A rejected push says why, with Git's own output to read or copy. Error messages stay until you close them.",
      },
      {
        kind: "new",
        text: "Conflicts explain themselves: what kind of conflict it is and the last commit that changed the file on each side.",
      },
      { kind: "new", text: "Force-push a branch safely (--force-with-lease) from its menu." },
      {
        kind: "new",
        text: "Resizable sidebar and inspector, commit captions with type chips (feat, fix, merge, revert, PR number), map lock (L) and a minimap toggle (M).",
      },
    ],
  },
  {
    version: "1.1.1",
    date: "2026-10-07",
    changes: [
      { kind: "improved", text: "Squash merges start only from a clean working tree and can be cancelled cleanly." },
      {
        kind: "fixed",
        text: "Merging or rebasing onto a name picks the branch over a tag with the same name, and a failed clone leaves no folder behind.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-07",
    changes: [
      {
        kind: "new",
        text: "Merge as a merge commit, fast-forward or squash, and rebase onto another branch by ⌘/Ctrl-dragging.",
      },
      {
        kind: "new",
        text: "Stage or unstage whole files, discard single hunks or lines, add files to .gitignore or stop tracking them.",
      },
      {
        kind: "new",
        text: "Search all history by message, author, path or content, and compare any two branches or commits.",
      },
      {
        kind: "new",
        text: "Tags on remotes, deleting remote branches, setting upstreams, fast-forwarding a branch without checking it out, and renaming a branch on its remote too.",
      },
      {
        kind: "new",
        text: "Open files in your editor, terminal or file manager, use your own diff and merge tools, and save or apply patches.",
      },
      {
        kind: "new",
        text: "Cherry-pick or revert several commits at once, clone options (branch, depth, submodules) and keyboard shortcuts for repository commands.",
      },
    ],
  },
  {
    version: "1.0.2",
    date: "2026-10-07",
    changes: [
      { kind: "new", text: "Check for updates on demand in Settings › About." },
      { kind: "improved", text: "When activating Pro fails, ddugit.com says why." },
    ],
  },
  {
    version: "1.0.1",
    date: "2026-10-07",
    changes: [{ kind: "new", text: "Activate Pro on a computer without internet access with a code from ddugit.com." }],
  },
  {
    version: "1.0.0",
    date: "2026-10-06",
    changes: [
      {
        kind: "new",
        text: "The first public release: a Git client for macOS and Windows built around the commit graph. Merge, rebase and cherry-pick by dragging, resolve conflicts block by block, rearrange commits, undo from the reflog, and watch every repository from one dashboard.",
      },
    ],
  },
];

/** The anchor of a version on the release notes page. */
export const releaseId = (version: string) => `v${version.replaceAll(".", "-")}`;
