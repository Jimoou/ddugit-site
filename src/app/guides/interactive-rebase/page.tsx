import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("interactive-rebase");

export default function InteractiveRebase() {
  return (
    <GuideArticle
      slug="interactive-rebase"
      lead="A branch full of “wip” and “fix typo” commits is hard to review. In ddugit you turn it into a few clear commits by dragging rows in a list: no editor, no todo file."
    >
      <p>
        This is Git&apos;s interactive rebase (<code>git rebase -i</code>). ddugit builds the plan with you, checks it,
        and runs the rebase. Every rewritten commit gets a new ID, so do this on commits you haven&apos;t shared yet, or
        on a branch only you work on.
      </p>

      <h2 id="open">1. Open the commits you want to tidy</h2>
      <ol className="steps">
        <li>On the graph, find the last commit you want to keep as it is: the one just below the commits to change.</li>
        <li>
          Right-click it and choose <strong>Rearrange commits after this… (rebase -i)</strong>.
        </li>
      </ol>
      <Screen
        name="guides/rebase-menu"
        alt="ddugit's commit menu with “Rearrange commits after this… (rebase -i)” highlighted"
        caption="Right-click the commit below the ones you want to change."
      />

      <h2 id="plan">2. Reorder and fold</h2>
      <p>
        The <strong>Rearrange commits</strong> sheet lists every commit after it, oldest at the top. The header shows
        how many commits you start with and how many you&apos;ll end up with.
      </p>
      <ul>
        <li>
          <strong>Reorder:</strong> drag a row by its handle, or use the up and down arrows.
        </li>
        <li>
          <strong>Fold a fix into the commit above:</strong> choose <strong>Fixup into above</strong> to keep only the
          message above, or <strong>Squash into above</strong> to combine both messages.
        </li>
        <li>
          <strong>Leave a commit out:</strong> choose <strong>Drop</strong>.
        </li>
        <li>
          <strong>Keep</strong> leaves a commit as it is.
        </li>
      </ul>
      <Screen
        name="guides/rebase-sheet"
        alt="The rearrange commits sheet with three commits, one reordered and one set to fixup into the commit above"
        caption="“Step 2 of 3” folds into “Step 1 of 3”: three commits become two."
      />

      <h2 id="apply">3. Apply</h2>
      <p>
        Click <strong>Apply (rebase)</strong>. The graph redraws with the new commits when it finishes. ddugit checks
        the plan before it runs, so it won&apos;t let you squash the top commit (it has nothing above it) or drop every
        commit, and it tells you when the rewrite includes commits you have already pushed.
      </p>
      <p>
        If you pushed the branch before, the next push needs to replace the remote branch. ddugit offers that when the
        push is rejected.
      </p>

      <h2 id="faster">Moving a single commit</h2>
      <p>
        To move just one commit, hold <kbd>Shift</kbd> and drag it onto the commit it should follow. The same sheet
        opens with the commit already moved, ready to apply.
      </p>

      <h2 id="merges">Branches with merge commits</h2>
      <p>
        If the commits include a merge, ddugit keeps the merges where they are (Git&apos;s <code>--rebase-merges</code>)
        and lets you reorder and fold commits within each stretch between them.
      </p>

      <h2 id="stops">If a step stops on a conflict</h2>
      <p>
        Reordering can make a commit no longer apply cleanly. The rebase stops, a banner says so, and the conflicted
        files open in their own sheet: see <Link href="/guides/resolve-merge-conflicts">resolving conflicts</Link>.
        Click <strong>Continue</strong> when they are fixed, or <strong>Cancel</strong> to put the branch back exactly
        as it was.
      </p>
      <p>
        Even after a finished rebase, the old commits stay in the undo history. See{" "}
        <Link href="/guides/undo-reset-reflog">undoing in ddugit</Link> to get them back.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>The same plan with plain Git. Start the rebase from the commit below the ones to change:</p>
      <Shell>{`git rebase -i HEAD~3`}</Shell>
      <p>
        Git opens your editor with one line per commit, oldest first. Change <code>pick</code> to <code>squash</code>,{" "}
        <code>fixup</code> or <code>drop</code>, move lines to reorder, then save and close:
      </p>
      <Shell>{`
pick b7fd963 Step 1 of 3
fixup c111ff2 Step 2 of 3
pick 0c6e865 Step 3 of 3
`}</Shell>
      <p>Resolve a stopped step, or give up, and push the rewritten branch safely:</p>
      <Shell>{`
git add <file> && git rebase --continue
git rebase --abort
git push --force-with-lease
`}</Shell>
    </GuideArticle>
  );
}
