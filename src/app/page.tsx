import Link from "next/link";
import { Screen } from "@/components/Screen";
import { SITE } from "@/site";

const FEATURES = [
  {
    name: "Graph first",
    body: "History is a map you can pan, zoom and rotate. Each branch keeps its lane and color, so even a large repository reads at a glance.",
  },
  {
    name: "Drag to merge",
    body: "Drop a branch on another to merge, rebase or cherry-pick. Shift-drag a commit to reorder it.",
  },
  {
    name: "Tidy commits from a list",
    body: "Interactive rebase without an editor: reorder, squash, fixup and drop in a sheet. Histories with merges work too.",
  },
  {
    name: "Backport tracker (Pro)",
    body: "See which fixes one branch has and another lacks, cherry-pick them in order, or export patches for places you can't push to.",
  },
  {
    name: "All your repositories (Pro)",
    body: "One dashboard for every repository: current branch, ahead/behind, local changes and paused work, without opening each one.",
  },
  {
    name: "Worktrees, submodules, LFS",
    body: "The tools large projects need live in the sidebar, next to your branches and pull requests.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Git client · macOS · Windows</p>
        <h1>{SITE.tagline}</h1>
        <p className="lead">
          ddugit puts the commit graph at the center of your Git work. Free for everyday Git, with a 14-day Pro trial
          built in.
        </p>
        <div className="actions">
          <Link href="/download" className="button primary">
            Download
          </Link>
          <Link href="/pricing" className="button">
            Pricing
          </Link>
        </div>
      </section>

      <Screen
        name="graph"
        alt="ddugit showing a repository's commit graph, branches in the sidebar and a commit's details"
        priority
      />

      <section className="grid">
        {FEATURES.map((f) => (
          <article key={f.name} className="card">
            <p className="eyebrow">{f.name}</p>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <section className="showcase">
        <div>
          <p className="eyebrow">Interactive rebase</p>
          <h2>Tidy history without a text editor</h2>
          <p className="muted">
            Drag rows to reorder, pick fixup or squash, and apply. Conflicts open in their own sheet and you can cancel
            any time.
          </p>
        </div>
        <Screen name="rebase" alt="The tidy commits sheet with three commits being reordered and folded" />
      </section>

      <section className="showcase">
        <div>
          <p className="eyebrow">Backports</p>
          <h2>Know what each branch is missing</h2>
          <p className="muted">
            Compare an upstream with a customer branch, cherry-pick the fixes it lacks, and mark the ones it never
            needs.
          </p>
        </div>
        <Screen name="backport" alt="The backport sheet listing commits missing from a branch" />
      </section>

      <p className="muted small center">No sign-up to download or use. An account is only for buying Pro.</p>
    </>
  );
}
