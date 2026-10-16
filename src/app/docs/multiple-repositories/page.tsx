import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("multiple-repositories");

export default function MultipleRepositories() {
  return (
    <DocArticle
      slug="multiple-repositories"
      lead="ddugit keeps an eye on every repository you have opened, and handles the cases where one repository is really several folders: worktrees, submodules and large files in Git LFS."
    >
      <h2 id="dashboard">The dashboard</h2>
      <p>
        The first tab, <strong>Repositories</strong>, is your home. Press <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>0</kbd> to
        get there from any tab. Under the open, clone and new buttons, <strong>My repositories</strong> shows a card for
        every repository you have opened in ddugit, read without loading any history, so it stays quick with many of
        them. ddugit reads them again whenever the window comes back to the front.
      </p>
      <p>Each card shows:</p>
      <ul>
        <li>The repository&apos;s name and folder.</li>
        <li>
          The checked-out branch and the remote branch it tracks, or <strong>Detached HEAD</strong>.
        </li>
        <li>
          What needs attention, most urgent first: <strong>In progress</strong> (a merge, rebase or similar stopped
          half-way), <strong>N changed</strong> (uncommitted files), <strong>↓ N</strong> commits to pull,{" "}
          <strong>↑ N</strong> commits to push, and <strong>N stashed</strong>. A repository with none of these says{" "}
          <strong>Clean</strong>.
        </li>
        <li>The last commit&apos;s message and how long ago it was made.</li>
      </ul>
      <p>
        The heading counts the same things across all cards, such as “3 with changes” or “7 to pull”, so you can tell at
        a glance where work is waiting.
      </p>
      <Screen
        name="home"
        alt="ddugit's Repositories tab with eight repository cards, each showing its branch, upstream, changes, commits to pull and push, stashes and last commit"
        caption="My repositories: one card per repository, with what each needs."
      />
      <ul>
        <li>Click a card to open the repository in a tab.</li>
        <li>
          The star (<strong>Add to favorites</strong>) keeps a repository at the front.
        </li>
        <li>
          The × (<strong>Remove from list</strong>) takes the card off the dashboard. The folder isn&apos;t touched. If
          you moved or deleted a repository, its card says <strong>Missing</strong>; this is how you clear it.
        </li>
      </ul>
      <p>
        <strong>Fetch all</strong> fetches every repository on the dashboard that has a remote, a few at a time. Working
        trees and branches stay as they are. Each card shows its own progress and result, including{" "}
        <strong>Sign-in required</strong> when a remote needs credentials. If you have asked ddugit to confirm fetches,
        it asks first.
      </p>

      <h2 id="groups">Repository groups</h2>
      <p>
        With many repositories, group them, for example by product or by client. Each repository belongs to at most one
        group.
      </p>
      <ul>
        <li>
          <strong>Create a group:</strong> click <strong>Group</strong> next to <strong>Fetch all</strong> and name it.
        </li>
        <li>
          <strong>Move a repository:</strong> open a card&apos;s ⋯ menu (<strong>Move to a group</strong>) and choose{" "}
          <strong>Move to &lt;group&gt;</strong>, <strong>Move to new group…</strong> or{" "}
          <strong>Remove from group</strong>. You can also drag a card onto a group, or onto <strong>Ungrouped</strong>.
        </li>
        <li>
          <strong>Move several:</strong> <kbd>⌘</kbd>/<kbd>Ctrl</kbd>- or <kbd>Shift</kbd>-click cards to select them. A
          bar appears with the same moves, plus <strong>Clear selection</strong>. Dragging one selected card moves them
          all.
        </li>
        <li>
          <strong>Fold:</strong> click a group&apos;s name to collapse or expand it.
        </li>
        <li>
          <strong>Open all</strong> on a group&apos;s header opens each of its repositories in a tab.
        </li>
        <li>
          A group&apos;s ⋯ menu has <strong>Rename</strong>, <strong>Change color</strong>, <strong>Move up</strong>,{" "}
          <strong>Move down</strong> and <strong>Ungroup (repositories are kept)</strong>.
        </li>
      </ul>
      <p>
        When several ungrouped repositories share an owner on their remote or sit in the same parent folder, ddugit
        suggests a group for them. Choose <strong>Group them</strong> or <strong>No thanks</strong>.
      </p>
      <p>
        Groups also have their own <strong>Fetch</strong> button, and the selection bar has one too, so you can fetch
        just one client&apos;s repositories.
      </p>

      <h3 id="free-limit">Free and Pro on the dashboard</h3>
      <p>
        On Free, the dashboard shows the status of 3 repositories: your favourites first, then the most recently used.
        Other cards show only the name and folder, with a <strong>Show status</strong> button. They still open with a
        click. With <Link href="/docs/pro-features">ddugit Pro</Link>, every card shows its status.
      </p>

      <h3 id="batch">Batch actions (Pro)</h3>
      <p>Group headers and the selection bar have two more buttons, which work on all of those repositories at once:</p>
      <ul>
        <li>
          <strong>Pull</strong> fast-forwards each repository&apos;s current branch to its upstream (
          <code>git pull --ff-only</code>). It goes to repositories on a branch with an upstream and no operation in
          progress. A repository whose branch has diverged is left alone and its card says <strong>Diverged</strong>.
        </li>
        <li>
          <strong>Branch…</strong> asks for a branch name and switches every repository to it. Where the branch
          doesn&apos;t exist, it&apos;s created at the current commit. Repositories whose uncommitted changes would be
          overwritten are skipped.
        </li>
      </ul>
      <p>
        Results show on each card, and a message sums up how many succeeded and failed. On Free, the buttons carry a Pro
        badge and explain what they do.
      </p>

      <h2 id="worktrees">Worktrees</h2>
      <p>
        A worktree is a second (or third) folder for the same repository, with another branch checked out. Commits,
        branches and stashes are shared, so you can, for example, fix a bug on <code>main</code> without stashing your
        half-done feature.
      </p>
      <p>
        The <strong>Worktrees</strong> section in the sidebar lists every worktree, the main one included. The one this
        tab shows is marked <strong>here</strong>, and a folder that no longer exists says{" "}
        <strong>folder missing</strong>. Click a worktree to open it in its own tab.
      </p>
      <h3 id="add-worktree">Add a worktree</h3>
      <ol className="steps">
        <li>
          Click <strong>+</strong> (<strong>Add worktree</strong>) on the section, or right-click a branch and choose{" "}
          <strong>Open in a new worktree…</strong>.
        </li>
        <li>
          Choose <strong>Existing branch</strong> or <strong>New branch</strong>. A branch can be checked out in only
          one worktree at a time, so the list offers only free branches.
        </li>
        <li>
          Pick the <strong>Worktree folder</strong> and click <strong>Add and open in a tab</strong>.
        </li>
      </ol>
      <p>
        If you check out a branch that&apos;s already checked out in another worktree, ddugit opens that worktree in a
        tab instead.
      </p>
      <h3 id="remove-worktree">Remove and prune</h3>
      <p>
        Right-click a worktree for <strong>Open in a tab</strong>, <strong>Copy path</strong> and{" "}
        <strong>Remove worktree…</strong>. Removing deletes the folder; the branch and its commits stay. If the folder
        has uncommitted changes, ddugit warns you and asks again with <strong>Remove with changes</strong>. For a
        worktree whose folder is already gone, choose <strong>Prune missing folders</strong> to clear Git&apos;s record
        of it.
      </p>

      <h2 id="submodules">Submodules</h2>
      <p>
        When a repository has submodules, the <strong>Submodules</strong> section in the sidebar lists them with their
        state:
      </p>
      <ul>
        <li>
          <strong>not initialized</strong>: not checked out yet.
        </li>
        <li>
          <strong>up to date</strong>: at the commit the parent repository records.
        </li>
        <li>
          <strong>different commit</strong>: checked out at another commit; hover to see both.
        </li>
        <li>
          <strong>modified</strong>: has uncommitted changes.
        </li>
      </ul>
      <p>
        The refresh button on the section, <strong>Update all (init as needed)</strong>, runs{" "}
        <code>git submodule update --init --recursive</code>: every submodule, nested ones included, is checked out at
        its recorded commit. Click a checked-out submodule to open it in a tab as a repository of its own.
      </p>
      <p>
        Right-click a submodule for <strong>Open in a tab</strong>, <strong>Update to the recorded commit</strong>,{" "}
        <strong>Copy URL</strong> and <strong>Sync URL from .gitmodules</strong> (<code>git submodule sync</code>, after
        someone changed a submodule&apos;s URL). If fetching a submodule needs credentials, ddugit says so; set up
        access to its remote first. To get submodules while cloning, open <strong>Advanced</strong> in the clone dialog
        and tick <strong>With submodules</strong>.
      </p>

      <h2 id="lfs">Git LFS</h2>
      <p>
        Git LFS keeps large files, such as images or design files, outside the repository: Git stores a small pointer
        and LFS downloads the content. The <strong>Git LFS</strong> section in the sidebar appears when Git LFS is
        installed on your computer or the repository already uses it. It lists the tracked patterns, such as{" "}
        <code>*.psd</code>.
      </p>
      <ul>
        <li>
          <strong>Track a pattern:</strong> click <strong>+</strong> (<strong>Track files with Git LFS</strong>), enter
          a pattern and click <strong>Track</strong>. This updates <code>.gitattributes</code>, which you then commit.
        </li>
        <li>
          <strong>Stop tracking:</strong> click the × next to a pattern. Again, commit the updated{" "}
          <code>.gitattributes</code>.
        </li>
        <li>
          <strong>Files not downloaded:</strong> when some LFS files are still pointers in your working tree, the
          section says how many. Click <strong>Download</strong> (<code>git lfs pull</code>).
        </li>
        <li>
          <strong>LFS not enabled:</strong> if the repository uses LFS but this computer hasn&apos;t set it up,
          checkouts don&apos;t download the real files. Click <strong>Enable Git LFS</strong> (
          <code>git lfs install</code>).
        </li>
        <li>
          <strong>Git LFS not installed:</strong> large files appear only as pointers. Follow{" "}
          <strong>How to install Git LFS</strong>, then come back.
        </li>
      </ul>
      <p>
        In the diff sheet, a file stored in LFS shows as a <strong>Git LFS object</strong>: its size and object ID{" "}
        <strong>Before</strong> and <strong>After</strong>, rather than the pointer&apos;s text.
      </p>
      <p>
        Worktrees, submodules and Git LFS are all part of Free. See <Link href="/pricing">pricing</Link> for what Pro
        adds.
      </p>
    </DocArticle>
  );
}
