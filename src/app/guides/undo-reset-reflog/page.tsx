import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("undo-reset-reflog");

export default function UndoResetReflog() {
  return (
    <GuideArticle
      slug="undo-reset-reflog"
      lead="Almost nothing you commit is truly lost. ddugit puts every undo on the commit's right-click menu, and keeps a list of every place your branch has been so you can get back."
    >
      <h2 id="which">Which undo do you need?</h2>
      <ul>
        <li>
          <strong>The last commit was wrong and isn&apos;t pushed:</strong> Undo last commit.
        </li>
        <li>
          <strong>The branch should go back to an earlier commit:</strong> Reset to here.
        </li>
        <li>
          <strong>The commit is already pushed and shared:</strong> Revert commit, which adds a new commit instead of
          rewriting history.
        </li>
        <li>
          <strong>Commits disappeared after a reset, rebase or deleted branch:</strong> the undo history.
        </li>
      </ul>

      <h2 id="last-commit">Undo the last commit</h2>
      <p>
        Right-click the newest commit on your branch and choose <strong>Undo last commit (keep changes)</strong>. The
        commit is gone from the branch and its changes come back staged, ready to fix and commit again. To change only
        the message or add a forgotten file, use <strong>Amend last commit</strong> instead.
      </p>

      <h2 id="reset">Reset a branch to an earlier commit</h2>
      <ol className="steps">
        <li>
          Right-click the commit the branch should point to and choose <strong>Reset to here…</strong>.
        </li>
        <li>
          Choose what happens to the changes in the commits you remove:
          <ul>
            <li>
              <strong>Keep changes staged (soft):</strong> only the commits go; their changes stay staged.
            </li>
            <li>
              <strong>Keep changes in the working tree (mixed):</strong> the changes stay in your files, unstaged.
            </li>
            <li>
              <strong>Discard everything (hard):</strong> your files go back exactly to that commit. Uncommitted changes
              are lost too.
            </li>
          </ul>
        </li>
        <li>
          Read the dialog: it says how many commits leave the branch, warns if any were pushed, and, for a hard reset,
          how many uncommitted changes would be lost for good. Then click <strong>Reset</strong>.
        </li>
      </ol>
      <Screen
        name="guides/reset-dialog"
        alt="ddugit's reset dialog with soft, mixed and hard options; hard is selected and a warning says 3 uncommitted changes will be lost"
        caption="A hard reset warns about uncommitted changes before anything happens."
      />

      <h2 id="revert">Undo a pushed commit</h2>
      <p>
        Right-click the commit and choose <strong>Revert commit…</strong>. ddugit adds a new commit on your branch that
        undoes it, so nobody who already pulled has to rewrite anything. If later changes touch the same lines, the
        revert stops like a merge: see <Link href="/guides/resolve-merge-conflicts">resolving conflicts</Link>.
      </p>

      <h2 id="reflog">Get back lost commits from the undo history</h2>
      <p>
        Every time your branch moves (a commit, reset, rebase, checkout, merge or pull), Git remembers where it was.
        ddugit shows that list as the <strong>undo history</strong>.
      </p>
      <ol className="steps">
        <li>
          Click the <strong>Undo history</strong> button (the clock) at the right end of the top bar.
        </li>
        <li>
          Find the entry from before things went wrong. Commits no branch reaches any more are marked{" "}
          <strong>Lost</strong>.
        </li>
        <li>
          Choose <strong>Recover as branch</strong> to put a new branch on it, or <strong>Reset to here…</strong> to
          move your current branch back to it.
        </li>
      </ol>
      <Screen
        name="guides/reflog"
        alt="ddugit's undo history listing a reset, a lost commit with Recover as branch and Reset to here buttons, and a checkout"
        caption="After a hard reset, the removed commit is marked Lost and can be recovered."
      />
      <p>
        The undo history lives in your local repository and doesn&apos;t last forever: by default Git keeps entries for
        lost commits for 30 days. Recover what you need soon. Changes that were never committed aren&apos;t in it at
        all, which is why the hard reset warns you.
      </p>
      <p>Deleting a branch with unmerged commits also warns you first, and those commits stay in the undo history.</p>

      <h2 id="command-line">On the command line</h2>
      <Shell>{`
git reset --soft HEAD~1          # undo the last commit, keep its changes staged
git reset --mixed 4c1e9b2        # move the branch back, keep changes unstaged
git reset --hard 4c1e9b2         # move back and discard changes
git revert 7e44b09               # undo a pushed commit with a new one
git reflog                       # where HEAD has been
git branch rescued HEAD@{1}      # recover a lost commit as a branch
`}</Shell>
      <p>
        A rebase that went wrong is undone the same way: find the entry from just before it. See{" "}
        <Link href="/guides/interactive-rebase">interactive rebase</Link>.
      </p>
    </GuideArticle>
  );
}
