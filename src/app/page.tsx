import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { SITE } from "@/site";

type Feature = { icon: IconName; name: string; body: string };

const FEATURES: Feature[] = [
  {
    icon: "graph",
    name: "A graph you can move around",
    body: "Pan, zoom and rotate your history. Each branch keeps its lane and color, so large repositories stay readable.",
  },
  {
    icon: "merge",
    name: "Drag to merge",
    body: "Drop one branch on another to merge, rebase or cherry-pick. Shift-drag a commit to move it.",
  },
  {
    icon: "list",
    name: "Interactive rebase from a list",
    body: "Reorder, squash, fixup and drop commits in a sheet. Histories with merge commits work too.",
  },
  {
    icon: "conflict",
    name: "Conflicts, file by file",
    body: "Take ours, take theirs or edit the result. Abort at any point to get back where you started.",
  },
  {
    icon: "undo",
    name: "Undo and reflog",
    body: "Reset to any earlier state. Commits no branch reaches any more are marked, so they are easy to recover.",
  },
  {
    icon: "pull",
    name: "Pull requests on the graph",
    body: "Open GitHub and GitLab pull requests show up as labels on their branches and in the sidebar.",
  },
];

const ALSO = ["Stash", "Worktrees", "Submodules", "Git LFS", "File history and blame", "Bisect", "Branch cleanup"];

const PRO: Feature[] = [
  {
    icon: "backport",
    name: "Backport tracker",
    body: "See which fixes a branch is missing. Cherry-pick them in order, or export patches where you can't push.",
  },
  {
    icon: "stack",
    name: "Stacked branches",
    body: "Build small branches on top of each other, one pull request each. Restack them all when the bottom changes.",
  },
  {
    icon: "dashboard",
    name: "Every repository at a glance",
    body: "Branch, ahead/behind and local changes for all your repositories. Pull or switch branches across many at once.",
  },
  {
    icon: "notes",
    name: "Release notes",
    body: "Markdown notes between two tags, grouped by change type and linked to their pull requests.",
  },
  {
    icon: "transfer",
    name: "Air-gapped transfer",
    body: "Move code into closed networks as Git bundles that hold only what each site is missing, with checksums.",
  },
  {
    icon: "server",
    name: "Private and self-hosted PRs",
    body: "Pull requests from private repositories and from your company's own GitHub or GitLab server.",
  },
];

function Features({ items }: { items: Feature[] }) {
  return (
    <div className="features">
      {items.map((f) => (
        <article key={f.name} className="feature">
          <Icon name={f.icon} />
          <h3>{f.name}</h3>
          <p>{f.body}</p>
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="pill">Git client for macOS and Windows</p>
        <h1>{SITE.tagline}</h1>
        <p className="lead">
          ddugit puts the commit graph at the center of your work. Merge, rebase and cherry-pick by dragging, and see
          the result right where it lands.
        </p>
        <div className="actions">
          <Link href="/download" className="button primary large">
            Download for free
          </Link>
          <Link href="/pricing" className="button large">
            See pricing
          </Link>
        </div>
        <p className="hero-note">Free for everyday Git · 14-day Pro trial, no sign-up</p>
      </section>

      <div className="hero-shot">
        <Screen
          name="graph"
          alt="ddugit showing a repository's commit graph, branches in the sidebar and a commit's details"
          priority
        />
      </div>

      <section id="features" className="section">
        <header className="section-head">
          <p className="eyebrow">Features</p>
          <h2>Everyday Git, done on the graph</h2>
          <p>All of this is free, for any repository.</p>
        </header>
        <Features items={FEATURES} />
        <p className="also">
          <span className="also-label">Also included</span>
          {ALSO.map((a) => (
            <span key={a} className="tag">
              {a}
            </span>
          ))}
        </p>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Interactive rebase</p>
          <h2>Clean up history without a text editor</h2>
          <p className="muted">
            Drag rows to reorder, choose fixup or squash, then apply. If a step conflicts, it opens in its own sheet.
            You can cancel at any time.
          </p>
        </div>
        <Screen name="rebase" alt="The tidy commits sheet with three commits being reordered and folded" />
      </section>

      <section className="section">
        <header className="section-head">
          <p className="eyebrow">ddugit Pro</p>
          <h2>For teams that ship from more than one branch</h2>
          <p>
            Backports, stacks, release notes and transfers into closed networks. Everything in Free is included, and
            every install starts with 14 days of Pro.
          </p>
        </header>
        <Screen name="backport" alt="The backport sheet listing commits missing from a branch" />
        <Features items={PRO} />
        <p className="section-link">
          <Link href="/pricing">Compare Free and Pro →</Link>
        </p>
      </section>

      <section className="cta">
        <h2>Open your repository in ddugit</h2>
        <p>No account needed to download or use it. Pro features are on for the first 14 days.</p>
        <div className="actions">
          <Link href="/download" className="button primary large">
            Download for free
          </Link>
          <Link href="/pricing" className="button large">
            See pricing
          </Link>
        </div>
      </section>
    </>
  );
}
