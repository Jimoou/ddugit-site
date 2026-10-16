import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle, Shell } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("history-tools");

export default function HistoryTools() {
  return (
    <DocArticle
      slug="history-tools"
      lead="Everything that looks back: what a commit changed, how two points in history differ, who wrote a line, and the tools that change past commits or take you back to where you were."
    >
      <p>
        Most of this chapter starts from one place: a commit on the branch map. Click it to read it, right-click it to
        act on it. Entries that don&apos;t apply to that commit stay in the menu but are greyed out, so you can always
        see what exists.
      </p>

      <h2 id="inspector">The inspector</h2>
      <p>Click a commit and the inspector opens on the right. From the top, it shows:</p>
      <ul>
        <li>The whole commit message, summary first.</li>
        <li>
          The author and how long ago, with the exact time on hover. Signed commits get a badge: <strong>Signed</strong>
          , <strong>Signed (unverified)</strong> when this computer can&apos;t check the key, or{" "}
          <strong>Bad signature</strong>. Hover it to see who signed and with which key.
        </li>
        <li>The commit ID (click to copy) and its parents. Click a parent to move to it; a merge commit has two.</li>
        <li>
          Branches, tags and pull requests that point at the commit, and under <strong>Branches</strong> the branches
          whose history contains it.
        </li>
        <li>
          A toolbar with the most common actions. The <strong>More</strong> button (⋯) opens the full commit menu, the
          same one you get by right-clicking the commit on the map.
        </li>
        <li>
          <strong>Changed files</strong>, grouped by folder, with lines added and removed.
        </li>
      </ul>
      <Screen
        name="graph"
        alt="ddugit with a commit selected on the branch map and the inspector on the right showing its message, author, parent, branches and changed files"
        caption="The inspector for “Tune particle speed”: message, author, IDs, branches, actions and changed files."
      />

      <h2 id="diff">The diff sheet</h2>
      <p>
        Click a file under <strong>Changed files</strong> to open the diff sheet under the graph: the commit&apos;s
        files on the left, the selected file&apos;s unified diff on the right. Press <kbd>]</kbd> and <kbd>[</kbd> for
        the next and previous file and <kbd>Esc</kbd> to close. Drag the sheet&apos;s top edge to make it taller. Binary
        files and files that only changed mode or name say so instead of showing lines, and files stored in Git LFS show
        the pointer&apos;s size and object ID before and after.
      </p>
      <p>
        The same sheet shows your uncommitted changes, where you can also stage single hunks and lines: see{" "}
        <Link href="/docs/commits-and-changes">Commits, staging and stashes</Link>.
      </p>

      <h2 id="compare">Compare two revisions</h2>
      <p>
        Comparing opens the diff sheet with the title <strong>Compare</strong> and the two sides in its header.
      </p>
      <ul>
        <li>
          <strong>A branch with yours:</strong> right-click a branch (in the sidebar or its label on the map) and choose{" "}
          <strong>Compare with &lt;your branch&gt;</strong>. You see what that branch adds since the two split, like a
          pull request shows it (<code>git diff HEAD...branch</code>).
        </li>
        <li>
          <strong>A commit with HEAD:</strong> right-click the commit and choose <strong>Compare with HEAD</strong>.
        </li>
        <li>
          <strong>Any two commits:</strong> right-click the first and choose <strong>Select for compare</strong>. A
          banner says which commit you picked. Right-click the second and choose{" "}
          <strong>Compare with selected &lt;sha&gt;</strong>. The banner also has <strong>Compare with HEAD</strong> and{" "}
          <strong>Cancel</strong>.
        </li>
      </ul>
      <p>
        In the sheet, switch between <strong>Since they split</strong> (changes on the second side since the merge base)
        and <strong>Tip to tip</strong> (the plain difference between the two snapshots). <strong>Swap sides</strong>{" "}
        reverses the direction. Renamed files are shown as renames.
      </p>

      <h2 id="files">File history, blame and old versions</h2>
      <p>Right-click a file in the inspector&apos;s changed files for everything about that one file.</p>
      <h3 id="file-history">File history</h3>
      <p>
        <strong>Show this file&apos;s history</strong> lists every commit that changed the file, following it through
        renames. A banner says how many commits changed it. <strong>Newer</strong> and <strong>Older</strong> step
        through them on the map, <strong>Blame</strong> opens the blame sheet at the selected commit, and{" "}
        <strong>Close</strong> ends it.
      </p>
      <h3 id="blame">Blame</h3>
      <p>
        <strong>Show who last changed each line (blame)</strong> opens the file as of that commit, in blocks of lines
        with the commit, author and date of their last change. Blue is newer, red is older. Click a block&apos;s left
        margin to go to its commit on the map.
      </p>
      <h3 id="versions">Open, save or restore a version</h3>
      <ul>
        <li>
          <strong>Open this version</strong> opens a read-only copy of the file as that commit had it, in your editor if
          you set one, otherwise in the default app.
        </li>
        <li>
          <strong>Save this version as…</strong> writes that copy wherever you choose. The suggested name includes the
          short commit ID, such as <code>app (4c1e9b2).ts</code>.
        </li>
        <li>
          <strong>Restore file to this commit</strong> puts the file in your working tree back to how this commit left
          it. <strong>Restore file to before this commit</strong> uses the commit&apos;s parent instead, which undoes
          what this commit did to the file. Either way the change is staged, ready to commit. If the file didn&apos;t
          exist at that point, restoring removes it.
        </li>
      </ul>

      <h2 id="cherry-pick-revert">Cherry-pick and revert</h2>
      <p>
        To copy a commit onto another branch, hold <kbd>Alt</kbd> (<kbd>⌥</kbd> on a Mac) and drag it onto that
        branch&apos;s tip, or right-click it and choose <strong>Cherry-pick onto &lt;your branch&gt;…</strong>. The
        dialog says what will be copied, and if the target isn&apos;t checked out, that ddugit checks it out first. The
        original commit ID is recorded in the new commit&apos;s message.
      </p>
      <p>
        To pick several, <kbd>⌘</kbd>/<kbd>Ctrl</kbd>-click commits on the map (<kbd>Shift</kbd>-click picks a line of
        them), then right-click one of them:
      </p>
      <ul>
        <li>
          <strong>Cherry-pick N commits onto &lt;branch&gt;…</strong> applies them oldest first. It&apos;s unavailable
          when some of them are already on your branch; the menu says how many.
        </li>
        <li>
          <strong>Revert N commits…</strong> adds commits that undo them, newest first.
        </li>
        <li>
          <strong>Unpick N commits</strong> clears the selection.
        </li>
      </ul>
      <p>
        <strong>Revert commit…</strong> undoes one commit on your branch with a new commit. For a merge commit the entry
        reads <strong>Revert merge commit…</strong>, and the dialog asks <strong>Which side should stay?</strong>: pick{" "}
        <strong>Parent 1</strong> (usually the branch you merged into) or <strong>Parent 2</strong>. Each option shows
        the parent&apos;s ID, message and branches.
      </p>
      <p>
        If a pick or revert stops on conflicts, a banner offers <strong>Resolve conflicts</strong>,{" "}
        <strong>Continue</strong>, <strong>Skip</strong> and <strong>Cancel</strong>. The step-by-step version, and the
        backport sheet for many fixes at once, are in the{" "}
        <Link href="/guides/cherry-pick-backport">cherry-pick and backport guide</Link>.
      </p>

      <h2 id="rewrite">Rearrange and edit past commits</h2>
      <p>
        <strong>Rearrange commits after this… (rebase -i)</strong> on a commit&apos;s menu opens a list of the commits
        after it to reorder, squash, fix up or drop. <kbd>Shift</kbd>-dragging a commit onto another opens the same list
        with that move made. See the <Link href="/guides/interactive-rebase">interactive rebase guide</Link>.
      </p>
      <p>To change one older commit without the full list, right-click it:</p>
      <ul>
        <li>
          <strong>Edit message…</strong> rewrites its message.
        </li>
        <li>
          <strong>Change author…</strong> sets a new name and email.
        </li>
        <li>
          <strong>Split commit…</strong> splits it in two by files: tick the files for the first commit, write both
          messages, and the rest go into the second. A commit that changed only one file can&apos;t be split.
        </li>
      </ul>
      <p>
        Each dialog says how many commits will be rewritten (this one and every commit after it on your branch) and
        warns when any of them were already pushed, since pushing again will then need a force push. Your uncommitted
        changes are set aside and put back. The entries are available for commits on your current branch that
        aren&apos;t merges and have no merge commit after them.
      </p>
      <p>
        Rewriting runs your Git hooks. If a hook such as <code>pre-commit</code> rejects a commit, ddugit cancels the
        whole rewrite, leaves your branch and files as they were, and shows what the hook printed.
      </p>

      <h2 id="undo">Reset and the undo history</h2>
      <p>
        <strong>Undo last commit (keep changes)</strong> takes the newest commit off your branch and stages its changes.{" "}
        <strong>Reset to here…</strong> moves your branch to the commit you right-clicked and asks what happens to the
        changes of the commits that leave it:
      </p>
      <ul>
        <li>
          <strong>Keep changes staged (soft)</strong>
        </li>
        <li>
          <strong>Keep changes in the working tree (mixed)</strong>
        </li>
        <li>
          <strong>Discard everything (hard)</strong>, which also throws away uncommitted changes. The dialog counts them
          first.
        </li>
      </ul>
      <p>
        A remote branch&apos;s menu has <strong>Reset &lt;your branch&gt; to here…</strong> too, for going back to{" "}
        <code>origin/main</code> after your branch went its own way.
      </p>
      <p>
        The clock button in the top bar, <strong>Undo history (reflog)</strong>, lists every commit HEAD has pointed to:
        commits, resets, checkouts, merges, rebases, pulls and more. Commits no branch reaches any more are marked{" "}
        <strong>Lost</strong>. Choose <strong>Recover as branch</strong> to put a branch on one, or{" "}
        <strong>Reset to here…</strong> to go back to it. The{" "}
        <Link href="/guides/undo-reset-reflog">undo, reset and reflog guide</Link> walks through each case.
      </p>

      <h2 id="bisect">Find the commit that broke something (bisect)</h2>
      <p>
        Bisect finds the first bad commit by halving the range until one is left. You need one commit that has the bug
        and an older one that doesn&apos;t.
      </p>
      <ol className="steps">
        <li>
          Right-click a commit with the bug and choose <strong>Mark as bad (has the bug)</strong>. A banner asks for the
          other end.
        </li>
        <li>
          Right-click an older commit without it and choose <strong>Mark as good (no bug)</strong>. The good commit has
          to be an ancestor of the bad one. Bisect starts.
        </li>
        <li>
          ddugit checks out a commit in the middle and centres the map on it. Commits that can&apos;t be the culprit
          fade back. The banner says how many candidates and roughly how many steps are left.
        </li>
        <li>
          Build or test that commit, then click <strong>Good</strong>, <strong>Bad</strong>, or <strong>Skip</strong>{" "}
          when it can&apos;t be tested.
        </li>
        <li>
          When one commit is left, the banner shows <strong>First bad commit</strong>. <strong>Show</strong> takes you
          to it.
        </li>
        <li>
          Click <strong>Finish</strong> to end bisect and go back to your branch.
        </li>
      </ol>

      <h2 id="patches">Patches</h2>
      <p>
        A patch carries one commit as a text file, for a repository you can&apos;t push to or a mailing list. On a
        commit&apos;s menu:
      </p>
      <ul>
        <li>
          <strong>Save as patch…</strong> writes it the way <code>git format-patch</code> does, named like{" "}
          <code>0001-fix-the-thing.patch</code>.
        </li>
        <li>
          <strong>Copy as patch</strong> puts the same text on the clipboard.
        </li>
      </ul>
      <p>A merge commit has no single patch, so both are unavailable for merges.</p>
      <p>
        To apply one, open the branch switcher on the left of the top bar and choose <strong>Apply patch…</strong>, then
        pick the file. It goes onto your current branch:
      </p>
      <ul>
        <li>
          <strong>A mailed patch</strong> (from <code>format-patch</code>, with author and subject) is applied with{" "}
          <code>git am --3way</code> and becomes commits. If it stops on a conflict, the banner reads{" "}
          <strong>Applying a patch in progress</strong>: resolve the conflicts, then <strong>Continue</strong>, or{" "}
          <strong>Skip</strong> that patch, or <strong>Cancel</strong> to go back.
        </li>
        <li>
          <strong>A plain diff</strong> is applied with <code>git apply --3way</code> and left in your working tree for
          you to review and commit. Conflicted files are left for you to resolve.
        </li>
      </ul>
      <Shell>{`
git format-patch -1 --stdout 7e44b09 > fix.patch   # save a commit as a patch
git am --3way fix.patch                            # apply a mailed patch as commits
git apply --3way change.diff                       # apply a plain diff to the working tree
`}</Shell>

      <h2 id="external-tools">External diff and merge tools</h2>
      <p>If you prefer a separate program for reading diffs or merging, ddugit hands off to it:</p>
      <ul>
        <li>
          <strong>View all changes in diff tool</strong> on a commit&apos;s menu compares the commit with its parent.
          The same entry in the top bar&apos;s <strong>Open in file manager, terminal or editor</strong> menu shows your
          uncommitted changes.
        </li>
        <li>
          <strong>Open in diff tool</strong> on a file&apos;s menu shows just that file.
        </li>
        <li>
          <strong>Open in merge tool</strong> in the conflict sheet opens a conflicted file in your merge tool. ddugit
          waits until you close the tool, then reads the result.
        </li>
      </ul>
      <p>
        These run <code>git difftool</code> and <code>git mergetool</code>. Choose the tools in Settings under{" "}
        <strong>External apps</strong>, or keep <strong>As set in git</strong>: see{" "}
        <Link href="/docs/settings-and-shortcuts">Settings and keyboard shortcuts</Link>.
      </p>
    </DocArticle>
  );
}
