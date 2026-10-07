import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, InApp, Shell } from "@/components/GuideArticle";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("undo-reset-reflog");

export default function UndoResetReflog() {
  return (
    <GuideArticle
      slug="undo-reset-reflog"
      lead="Almost nothing you commit in Git is truly lost. Knowing which undo to reach for, and where Git keeps the old commits, makes every other command less scary."
    >
      <h2 id="which">Which undo do you need?</h2>
      <ul>
        <li>
          <strong>The last commit was wrong, and it isn&apos;t pushed:</strong> reset it and commit again.
        </li>
        <li>
          <strong>A branch should point at an earlier commit:</strong> <code>git reset</code>, choosing what happens to
          the files.
        </li>
        <li>
          <strong>A commit is already pushed and shared:</strong> <code>git revert</code>, which adds a new commit
          instead of rewriting history.
        </li>
        <li>
          <strong>Commits disappeared after a reset, rebase or deleted branch:</strong> find them in the reflog.
        </li>
      </ul>

      <h2 id="last-commit">Undo the last commit</h2>
      <p>To take back the last commit but keep its changes staged, ready to commit again:</p>
      <Shell>{`git reset --soft HEAD~1`}</Shell>
      <p>
        If you only need to fix the message or add a forgotten file, you don&apos;t need to undo at all. Stage the file
        and amend:
      </p>
      <Shell>{`git commit --amend`}</Shell>

      <h2 id="reset">git reset: soft, mixed and hard</h2>
      <p>
        <code>git reset &lt;commit&gt;</code> moves the current branch to that commit. The commits after it are no
        longer on the branch. The mode decides what happens to their changes and to your files:
      </p>
      <ul>
        <li>
          <code>--soft</code>: the changes stay staged. Nothing in your files changes.
        </li>
        <li>
          <code>--mixed</code> (the default): the changes stay in your files but are unstaged.
        </li>
        <li>
          <code>--hard</code>: your files are put back exactly as they were at that commit. Uncommitted changes are lost
          too, and the reflog can&apos;t bring those back.
        </li>
      </ul>
      <Shell>{`
git reset --mixed 4c1e9b2
git reset --hard origin/main   # throw away local commits and changes
`}</Shell>
      <p>
        If the removed commits were already pushed, the next push needs <code>--force-with-lease</code>, and anyone who
        pulled them will have trouble. For shared commits, revert instead.
      </p>

      <h2 id="revert">git revert: undo a pushed commit</h2>
      <p>
        <code>git revert</code> creates a new commit that does the opposite of an earlier one. History stays as it was,
        so it is safe on shared branches:
      </p>
      <Shell>{`git revert 7e44b09`}</Shell>
      <p>
        Reverting a merge commit needs <code>-m 1</code> to say which parent is the mainline. If the revert conflicts
        with later changes, it stops like a merge does (see{" "}
        <Link href="/guides/resolve-merge-conflicts">resolving conflicts</Link>).
      </p>

      <h2 id="reflog">The reflog: Git&apos;s undo history</h2>
      <p>
        Every time <code>HEAD</code> moves (commit, reset, rebase, checkout, merge, pull), Git writes the old position
        to the reflog. Commits that no branch points to any more are still there:
      </p>
      <Shell>{`
git reflog
# 4c1e9b2 HEAD@{0}: reset: moving to 4c1e9b2
# 9a8b7c6 HEAD@{1}: commit: Add search results page
# ...
`}</Shell>
      <p>To bring a lost commit back, put a branch on it, or move the current branch back to it:</p>
      <Shell>{`
git branch rescued 9a8b7c6
git reset --hard HEAD@{1}
`}</Shell>
      <p>
        The reflog is local to your clone and doesn&apos;t last forever. By default, Git expires entries for commits no
        branch reaches after 30 days, and other entries after 90 days. After that, garbage collection can delete those
        commits.
      </p>

      <InApp>
        <ul>
          <li>
            Right-click the latest commit and choose <strong>Undo last commit (keep changes)</strong>. Its changes come
            back staged.
          </li>
          <li>
            Right-click any earlier commit and choose <strong>Reset to here…</strong>. Pick soft, mixed or hard. The
            dialog tells you how many commits leave the branch, warns when some were pushed, and says which uncommitted
            changes a hard reset would lose.
          </li>
          <li>
            For a commit that is already shared, choose <strong>Revert commit…</strong>.
          </li>
          <li>
            Open <strong>Undo history</strong> in the top bar to see the reflog as a list of what happened. Commits no
            branch reaches any more are marked <strong>Lost</strong>. Choose <strong>Recover as branch</strong> to get
            one back, or <strong>Reset to here…</strong> to move the current branch to it.
          </li>
        </ul>
        <p>
          Deleting a branch with unmerged commits warns you first and tells you those commits will only be in the undo
          history.
        </p>
      </InApp>

      <h2 id="related">Related</h2>
      <p>
        A rebase that went wrong is undone the same way: find the entry from just before it in the reflog. See{" "}
        <Link href="/guides/interactive-rebase">interactive rebase</Link>.
      </p>
    </GuideArticle>
  );
}
