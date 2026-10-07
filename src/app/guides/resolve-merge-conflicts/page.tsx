import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("resolve-merge-conflicts");

export default function ResolveMergeConflicts() {
  return (
    <GuideArticle
      slug="resolve-merge-conflicts"
      lead="A conflict means both branches changed the same lines and Git won't guess which one you want. In ddugit you answer it one block at a time, and you can always back out."
    >
      <p>
        Conflicts can stop a merge, a rebase, a cherry-pick or a revert. Everything Git could combine on its own is
        already done; only the blocks where both sides changed the same lines are left for you.
      </p>

      <h2 id="open">1. Open the conflicts</h2>
      <p>
        When an operation stops, a banner across the top says what is in progress and how many files conflict, and the
        graph shows the pending commit. Click <strong>Resolve conflicts</strong>. The conflicted files are listed on the
        left; the first one is open.
      </p>

      <h2 id="blocks">2. Choose a result for each block</h2>
      <p>
        Each conflict is a block with the two versions side by side, labeled with where they came from:{" "}
        <strong>Current branch</strong> and <strong>Incoming change</strong> for a merge, <strong>Base branch</strong>{" "}
        and <strong>Your commit</strong> for a rebase. You never have to work out which one Git calls “ours”. For each
        block, choose:
      </p>
      <ul>
        <li>
          <strong>Current branch</strong> or <strong>Incoming change</strong> to keep one side,
        </li>
        <li>
          <strong>Both</strong> to keep both, one after the other,
        </li>
        <li>
          <strong>Edit</strong> to write the result yourself.
        </li>
      </ul>
      <p>
        If one side is right for the whole file, use <strong>All: Current branch</strong> or{" "}
        <strong>All: Incoming change</strong> at the top. Binary files such as images can&apos;t be compared, so you
        pick a side.
      </p>
      <Screen
        name="guides/conflict-chosen"
        alt="ddugit's resolve conflicts sheet: a merge banner, two conflicted files, and two conflict blocks with Current branch, Incoming change, Both and Edit"
        caption="A merge stopped on two files. The first block keeps both sides; one block is left."
      />

      <h2 id="finish">3. Mark resolved and finish</h2>
      <ol className="steps">
        <li>
          When every block in a file has a result, click <strong>Mark as resolved</strong>. The next file opens.
        </li>
        <li>
          When no files are left, finish the operation: commit with <strong>＋</strong> to complete a merge, or click{" "}
          <strong>Continue</strong> in the banner for a rebase, cherry-pick or revert.
        </li>
      </ol>

      <h2 id="cancel">Backing out</h2>
      <p>
        <strong>Cancel</strong> in the banner aborts the whole operation and puts the branch back exactly where it was
        before, including files you already resolved. If a cherry-picked commit turns out to be on the branch already,
        ddugit says so and offers to skip it.
      </p>

      <h2 id="fewer">Getting fewer conflicts</h2>
      <ul>
        <li>Merge or rebase from the main branch often, so the two sides never drift far apart.</li>
        <li>Keep branches short-lived and pull requests small.</li>
        <li>Avoid reformatting whole files in the same branch as a real change.</li>
      </ul>
      <p>
        Conflicts also come up when you <Link href="/guides/cherry-pick-backport">cherry-pick fixes</Link> to an older
        branch and when you <Link href="/guides/interactive-rebase">reorder commits</Link>.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>
        Git writes both versions into the file between markers. Everything from the first to the last marker is one
        block:
      </p>
      <Shell>{`
<<<<<<< HEAD
  --cyan: #22e8ff;
=======
  --cyan: #19d3ff;
>>>>>>> feature/theme
`}</Shell>
      <p>
        Edit the file to the result you want, remove the markers, and stage it. To take one side for a whole file, check
        it out. During a rebase <code>--ours</code> is the branch you are rebasing onto and <code>--theirs</code> is
        your commit, the opposite of a merge.
      </p>
      <Shell>{`
git status                          # which files still conflict
git checkout --theirs src/App.css   # or --ours
git add src/App.css
git commit                          # merge; or: git rebase/cherry-pick/revert --continue
git merge --abort                   # back out (also rebase/cherry-pick --abort)
`}</Shell>
    </GuideArticle>
  );
}
