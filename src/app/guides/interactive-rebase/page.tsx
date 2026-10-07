import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, InApp, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("interactive-rebase");

export default function InteractiveRebase() {
  return (
    <GuideArticle
      slug="interactive-rebase"
      lead="A branch full of “wip” and “fix typo” commits is hard to review. Interactive rebase lets you rewrite it into a few clear commits before anyone else sees it."
    >
      <h2 id="what">What interactive rebase does</h2>
      <p>
        <code>git rebase -i</code> replays a run of commits one by one, following a list you edit first. For each commit
        you choose what happens to it: keep it, change its message, fold it into the commit before it, or leave it out.
        You can also change the order of the list. Git then rebuilds the branch from that plan.
      </p>
      <p>
        Every rebuilt commit gets a new ID, even when its contents don&apos;t change. That is why the usual rule is:
        rewrite only commits that you haven&apos;t shared yet, or that only you work on.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>Start from the commit just before the first one you want to change. To edit the last four commits:</p>
      <Shell>{`git rebase -i HEAD~4`}</Shell>
      <p>Git opens your editor with one line per commit, oldest first:</p>
      <Shell>{`
pick a1b2c3d Add search box
pick d4e5f6a wip
pick 0718293 Fix typo in search box
pick 9a8b7c6 Add search results page
`}</Shell>
      <p>Change the word at the start of each line, move lines up or down, then save and close the editor:</p>
      <ul>
        <li>
          <code>pick</code>: keep the commit as it is.
        </li>
        <li>
          <code>reword</code>: keep it, but stop to edit its message.
        </li>
        <li>
          <code>squash</code>: fold it into the commit above and combine both messages.
        </li>
        <li>
          <code>fixup</code>: fold it into the commit above and keep only the message above.
        </li>
        <li>
          <code>drop</code>: leave the commit out. Deleting its line does the same.
        </li>
      </ul>
      <p>
        To turn the example into two clean commits, mark the “wip” and “Fix typo” lines as <code>fixup</code>. They fold
        into “Add search box”, and “Add search results page” stays on its own.
      </p>

      <h3>Fixup commits that sort themselves</h3>
      <p>
        If you already know which commit a fix belongs to, commit it with <code>--fixup</code>. A later rebase with{" "}
        <code>--autosquash</code> moves it under its target and marks it <code>fixup</code> for you:
      </p>
      <Shell>{`
git commit --fixup a1b2c3d
git rebase -i --autosquash HEAD~5
`}</Shell>

      <h3>When a step stops</h3>
      <p>
        If a reordered commit no longer applies cleanly, the rebase stops with a conflict. Fix the files, stage them and
        continue, or give up and return the branch to how it was before you started:
      </p>
      <Shell>{`
git add <file>
git rebase --continue

git rebase --abort   # back to where you started
`}</Shell>
      <p>
        See <Link href="/guides/resolve-merge-conflicts">how to resolve merge conflicts</Link> for the details.
      </p>

      <h3>After rewriting pushed commits</h3>
      <p>
        If the branch was already pushed, a normal push is rejected because the history changed. Push with{" "}
        <code>--force-with-lease</code>: it overwrites the remote branch only if nobody else has pushed to it since you
        last fetched.
      </p>
      <Shell>{`git push --force-with-lease`}</Shell>

      <InApp>
        <p>
          Right-click the commit just below the ones you want to change and choose{" "}
          <strong>Rearrange commits after this… (rebase -i)</strong>. The commits after it open in a sheet, oldest at
          the top.
        </p>
        <ul>
          <li>Drag rows to reorder them, or use the up and down buttons.</li>
          <li>
            Choose an action for each row: <strong>Keep</strong>, <strong>Squash into above</strong> (combine messages),{" "}
            <strong>Fixup into above</strong> (discard the message) or <strong>Drop</strong>.
          </li>
          <li>
            Click <strong>Apply (rebase)</strong>. The graph updates when it finishes.
          </li>
        </ul>
        <p>
          The sheet checks the plan before it runs. It won&apos;t let you squash the top commit, which has nothing above
          it, or drop every commit, and it warns you when the rewrite includes commits you already pushed. Branches with
          merge commits in them work too: ddugit keeps the merges in place and lets you reorder within each segment.
        </p>
        <p>
          For a single commit, Shift-drag it on the graph to move it. If a step conflicts, it opens in its own sheet,
          and <strong>Cancel</strong> in the banner puts the branch back the way it was.
        </p>
      </InApp>
      <Screen name="rebase" alt="ddugit's rearrange commits sheet with commits being reordered and folded" />

      <h2 id="recover">If something went wrong</h2>
      <p>
        A finished rebase can still be undone. The commits from before it stay in the reflog for weeks. See{" "}
        <Link href="/guides/undo-reset-reflog">how to undo in Git</Link> to find them and put the branch back.
      </p>
    </GuideArticle>
  );
}
