import type { Metadata } from "next";
import Link from "next/link";
import { GuideArticle, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { guideMeta } from "@/lib/seo";

export const metadata: Metadata = guideMeta("cherry-pick-backport");

export default function CherryPickBackport() {
  return (
    <GuideArticle
      slug="cherry-pick-backport"
      lead="A bug fixed on main often needs to reach a release branch too. In ddugit you drag the fix across, or let the backport sheet list every fix a branch is still missing."
    >
      <p>
        Cherry-picking copies the change one commit made onto another branch as a new commit. Nothing else from the
        source branch comes with it, which is what makes it the tool for backports.
      </p>

      <h2 id="drag">Cherry-pick one commit by dragging</h2>
      <ol className="steps">
        <li>Find the commit with the fix and the tip of the branch that needs it on the graph.</li>
        <li>
          Hold <kbd>Alt</kbd> (<kbd>⌥</kbd> on a Mac) and drag the commit onto the tip of that branch. The hint at the
          top changes to “Release to cherry-pick this commit”.
        </li>
        <li>Release, check the commit in the dialog, and confirm.</li>
      </ol>
      <Screen
        name="guides/pick-drag"
        alt="A commit being Alt-dragged across the graph onto the tip of feature/graph-zoom, with the hint “Release to cherry-pick this commit”"
        caption="Alt-drag “Tune particle speed” onto the current branch’s tip."
      />
      <p>
        Prefer menus? With the target branch checked out, right-click the commit and choose{" "}
        <strong>Cherry-pick onto &lt;your branch&gt;…</strong>. A plain drag (without <kbd>Alt</kbd>) merges instead, so
        watch the hint.
      </p>

      <h2 id="backport">Find and apply every missing fix</h2>
      <p>
        For a release branch that should get many fixes from main, open the backport sheet. With the release branch
        checked out, right-click the branch the fixes come from (such as <code>main</code>) and choose{" "}
        <strong>Backport: commits missing from &lt;your branch&gt;…</strong>. Or use <strong>Backport…</strong> in the ⋯
        menu above the branch list and pick both branches in the sheet.
      </p>
      <ol className="steps">
        <li>
          Set <strong>From</strong> to where fixes land (such as <code>main</code> or <code>origin/main</code>) and{" "}
          <strong>Into</strong> to the branch that needs them.
        </li>
        <li>
          Every commit gets a state: <strong>Missing</strong>, <strong>Applied</strong> (the same change is already
          there, even with a different commit ID), <strong>Applied (-x)</strong> (an earlier cherry-pick recorded it),
          or <strong>Ignored</strong> (you marked it as not needed for this branch).
        </li>
        <li>
          Tick the missing commits you want and click <strong>Cherry-pick onto …</strong>. They are applied oldest
          first, each recording where it came from (<code>-x</code>), so the next comparison counts them as applied.
        </li>
      </ol>
      <Screen
        name="guides/backport-sheet"
        alt="ddugit's backport sheet comparing origin/main into feature/graph-zoom, with one missing commit selected"
        caption="One fix on origin/main is missing from feature/graph-zoom."
      />
      <p>
        Can&apos;t push to the target, such as a customer&apos;s repository? <strong>Export patches…</strong> saves the
        selected commits as patch files to apply there. To compare with another repository, add it as a remote first and
        pick its branch as <strong>From</strong>.
      </p>
      <p>
        Comparing branches is free. Cherry-picking, exporting and ignoring from the backport sheet are part of{" "}
        <Link href="/pricing">ddugit Pro</Link>; single cherry-picks by drag or menu are free.
      </p>

      <h2 id="conflicts">If a fix doesn&apos;t apply cleanly</h2>
      <p>
        An older branch may have changed the same lines. The cherry-pick stops and the conflict opens in its own sheet:
        see <Link href="/guides/resolve-merge-conflicts">resolving conflicts</Link>. Then click{" "}
        <strong>Continue</strong>, <strong>Skip</strong> to leave that commit out, or <strong>Cancel</strong>.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>Check out the target branch and pick by commit ID. Several commits are applied in the order given:</p>
      <Shell>{`
git switch release/2.4
git cherry-pick -x 3f9c2e1
git cherry-pick -x 3f9c2e1^..7e44b09    # a range, 3f9c2e1 through 7e44b09
git cherry-pick --continue              # or --skip, --abort after a conflict
`}</Shell>
      <p>List the commits on main whose changes aren&apos;t on the release branch yet, or send them as patches:</p>
      <Shell>{`
git log --oneline --no-merges --cherry-pick --right-only release/2.4...main
git format-patch -o patches/ 3f9c2e1^..7e44b09
`}</Shell>
    </GuideArticle>
  );
}
