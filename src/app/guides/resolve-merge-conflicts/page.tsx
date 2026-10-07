import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, InApp, Shell } from "@/components/GuideArticle";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("resolve-merge-conflicts");

export default function ResolveMergeConflicts() {
  return (
    <GuideArticle
      slug="resolve-merge-conflicts"
      lead="A conflict means Git found two changes to the same lines and won't guess which one you want. It's a question, not an error, and you can always back out."
    >
      <h2 id="why">Why conflicts happen</h2>
      <p>
        When you merge, rebase, cherry-pick or revert, Git combines changes from two sides. Changes to different parts
        of a file merge on their own. When both sides changed the same lines, or one side edited a file the other
        deleted, Git stops and asks you. The files it couldn&apos;t combine are marked as conflicted, and everything
        else is already merged.
      </p>

      <h2 id="markers">Reading conflict markers</h2>
      <p>Git writes both versions into the file, between markers:</p>
      <Shell>{`
<<<<<<< HEAD
const timeout = 30;
=======
const timeout = 60;
>>>>>>> feature/slow-network
`}</Shell>
      <p>
        The part above <code>=======</code> is what your current branch has (<code>HEAD</code>, “ours”). The part below
        is the incoming change (“theirs”), here from <code>feature/slow-network</code>. Resolving the conflict means
        replacing the whole block, markers included, with the lines you want to keep. That can be one side, both, or
        something new.
      </p>
      <p>
        To also see what the line looked like before either side changed it, turn on the three-way style. Conflicts then
        include a <code>|||||||</code> section with the common ancestor:
      </p>
      <Shell>{`git config --global merge.conflictStyle zdiff3`}</Shell>

      <h2 id="command-line">On the command line</h2>
      <p>See which files still conflict:</p>
      <Shell>{`git status`}</Shell>
      <p>
        Edit each file and remove the markers, then stage it to mark it resolved. If one side is right for a whole file,
        check it out instead of editing:
      </p>
      <Shell>{`
git add src/config.ts            # after editing it

git checkout --ours   src/config.ts   # keep the current branch's version
git checkout --theirs src/config.ts   # keep the incoming version
git add src/config.ts
`}</Shell>
      <p>When no files are left, finish the operation you started:</p>
      <Shell>{`
git commit                 # a merge (or: git merge --continue)
git rebase --continue      # a rebase
git cherry-pick --continue # a cherry-pick
git revert --continue      # a revert
`}</Shell>
      <p>Or back out completely, as if you never started:</p>
      <Shell>{`
git merge --abort
git rebase --abort
git cherry-pick --abort
`}</Shell>

      <h3>“Ours” and “theirs” swap during a rebase</h3>
      <p>
        A rebase replays your commits on top of the other branch. While it runs, <code>HEAD</code> is the other branch
        with your earlier commits already applied, so <code>--ours</code> means the branch you are rebasing onto and{" "}
        <code>--theirs</code> means the commit of yours being replayed. It is the opposite of what most people expect,
        so check before you take a side.
      </p>

      <InApp>
        <p>
          When an operation stops on conflicts, a banner shows what is in progress and how many files conflict. Click{" "}
          <strong>Resolve conflicts</strong> to open them.
        </p>
        <ul>
          <li>
            Each conflict is its own block, labeled with where each side came from: the <strong>current branch</strong>{" "}
            and the <strong>incoming change</strong> for a merge, the <strong>base branch</strong> and{" "}
            <strong>your commit</strong> for a rebase, so you don&apos;t have to remember which one is “ours”.
          </li>
          <li>
            For each block, take one side, take <strong>both</strong>, or <strong>edit</strong> the result by hand. To
            take one side for the whole file, use <strong>All</strong>.
          </li>
          <li>
            When every block in a file is chosen, click <strong>Mark as resolved</strong>. Binary files can&apos;t be
            compared, so you pick a side.
          </li>
          <li>
            When no files are left, commit with <strong>＋</strong> to finish a merge, or click{" "}
            <strong>Continue</strong> for a rebase, cherry-pick or revert.
          </li>
        </ul>
        <p>
          <strong>Cancel</strong> in the banner aborts the operation and returns the branch to where it was. If a
          cherry-picked commit turns out to be on the branch already, ddugit says so and offers to skip it.
        </p>
      </InApp>

      <h2 id="fewer">Getting fewer conflicts</h2>
      <ul>
        <li>Merge or rebase from the main branch often, so the two sides never drift far apart.</li>
        <li>Keep branches short-lived and pull requests small.</li>
        <li>Avoid reformatting whole files in the same branch as a real change.</li>
        <li>
          Turn on <code>git config --global rerere.enabled true</code> so Git remembers how you resolved a conflict and
          reuses it when the same one comes back.
        </li>
      </ul>
      <p>
        Conflicts also come up when you <Link href="/guides/cherry-pick-backport">cherry-pick fixes</Link> to an older
        branch, and when you <Link href="/guides/interactive-rebase">reorder commits</Link>.
      </p>
    </GuideArticle>
  );
}
