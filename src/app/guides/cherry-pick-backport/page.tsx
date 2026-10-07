import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, InApp, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("cherry-pick-backport");

export default function CherryPickBackport() {
  return (
    <GuideArticle
      slug="cherry-pick-backport"
      lead="A bug fixed on main often needs to reach a release branch, too. Cherry-pick copies that one commit across without merging everything else."
    >
      <h2 id="what">What cherry-pick does</h2>
      <p>
        <code>git cherry-pick</code> takes the change a commit made and applies it as a new commit on your current
        branch. The new commit has the same message and changes but a different ID, because it has a different parent.
        Unlike a merge, nothing else from the other branch comes with it.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>Check out the branch that needs the fix, then pick the commit:</p>
      <Shell>{`
git switch release/2.4
git cherry-pick -x 3f9c2e1
`}</Shell>
      <p>
        <code>-x</code> adds a line like <code>(cherry picked from commit 3f9c2e1…)</code> to the message. Use it
        whenever the original commit is public: later you can tell which fixes a branch already has, even though the IDs
        differ.
      </p>
      <p>To pick several commits, list them or give a range. They are applied in the order given:</p>
      <Shell>{`
git cherry-pick -x 3f9c2e1 8b1d0aa
git cherry-pick -x 3f9c2e1^..7e44b09   # 3f9c2e1 through 7e44b09
`}</Shell>
      <p>
        If a commit doesn&apos;t apply cleanly, Git stops with a conflict.{" "}
        <Link href="/guides/resolve-merge-conflicts">Resolve it</Link>, then continue, skip that commit, or abort:
      </p>
      <Shell>{`
git cherry-pick --continue
git cherry-pick --skip
git cherry-pick --abort
`}</Shell>

      <h2 id="missing">Finding the fixes a branch is missing</h2>
      <p>
        Comparing commit IDs doesn&apos;t work after a cherry-pick, because the copies have new IDs. Git can compare the
        changes instead. This lists commits on <code>main</code> whose changes are not on <code>release/2.4</code>:
      </p>
      <Shell>{`git log --oneline --no-merges --cherry-pick --right-only release/2.4...main`}</Shell>
      <p>
        <code>git cherry -v release/2.4 main</code> gives the same answer with a <code>+</code> (missing) or{" "}
        <code>-</code> (already there) in front of each commit. Both match on the diff itself, so a fix that needed
        edits to apply on the older branch still shows as missing. The <code>-x</code> line is how you catch those.
      </p>

      <h3>Where you can&apos;t push</h3>
      <p>
        If the branch lives somewhere you can&apos;t push to, such as a customer&apos;s repository, send the fixes as
        patch files and apply them there:
      </p>
      <Shell>{`
git format-patch -o patches/ 3f9c2e1^..7e44b09
git am patches/*.patch     # on the other side
`}</Shell>

      <InApp>
        <p>
          To pick one commit, hold <kbd>Alt</kbd> (<kbd>⌥</kbd> on a Mac) and drag it onto the tip of the branch that
          needs it, or right-click the commit and choose <strong>Cherry-pick onto…</strong>.
        </p>
        <p>
          For a whole release branch, right-click it and choose <strong>Backport: commits missing from …</strong>. The
          backport sheet compares <strong>From</strong> (where fixes land, such as <code>main</code> or{" "}
          <code>upstream/main</code>) with <strong>Into</strong> (the branch that needs them) and labels every commit:
        </p>
        <ul>
          <li>
            <strong>Missing</strong>: not on the target yet.
          </li>
          <li>
            <strong>Applied</strong>: the same change is already there, and <strong>Applied (-x)</strong> when an
            earlier cherry-pick recorded it.
          </li>
          <li>
            <strong>Ignored</strong>: commits you marked as not needed on this target, saved in this repository.
          </li>
        </ul>
        <p>
          Select the missing commits and choose <strong>Cherry-pick onto …</strong>. They are applied oldest first, each
          with <code>-x</code>. Or choose <strong>Export patches…</strong> to save them as files. Comparing branches is
          free; cherry-picking, exporting and ignoring from the sheet are part of{" "}
          <Link href="/pricing">ddugit Pro</Link>.
        </p>
      </InApp>
      <Screen name="backport" alt="ddugit's backport sheet listing commits missing from a release branch" />

      <h2 id="when-not">When not to cherry-pick</h2>
      <p>
        Cherry-picking suits a few fixes. If a branch needs most of another branch, merge it instead: you get one
        history and no duplicate commits. To take a commit back off a branch, use <code>git revert</code>, covered in{" "}
        <Link href="/guides/undo-reset-reflog">how to undo in Git</Link>.
      </p>
    </GuideArticle>
  );
}
