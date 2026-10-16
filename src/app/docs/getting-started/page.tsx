import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("getting-started");

export default function GettingStarted() {
  return (
    <DocArticle
      slug="getting-started"
      lead="Install ddugit, open or clone your first repository, and learn what each part of the window is for. It takes a few minutes, and you need no account."
    >
      <h2 id="install">Install</h2>
      <p>
        ddugit runs on macOS 11 or later (Apple silicon and Intel) and on 64-bit Windows 10 or later. Get it from the{" "}
        <Link href="/download">download page</Link>.
      </p>
      <h3 id="install-mac">macOS</h3>
      <ol className="steps">
        <li>
          Download <strong>macOS (.dmg)</strong> and open it.
        </li>
        <li>Drag ddugit into Applications.</li>
        <li>Open it. The app is notarized by Apple, so it starts without a warning.</li>
      </ol>
      <h3 id="install-windows">Windows</h3>
      <ol className="steps">
        <li>
          Choose <strong>Windows (Microsoft Store)</strong> and install ddugit from the Store.
        </li>
        <li>Open it from the Start menu. The Store keeps it up to date.</li>
      </ol>
      <p>
        If your PC has no Microsoft Store, use the <code>.exe</code> installer linked under the download buttons. It
        isn&apos;t code-signed, so Windows may show &ldquo;Windows protected your PC&rdquo;. Choose{" "}
        <strong>More info</strong>, then <strong>Run anyway</strong>. This version updates itself from inside the app
        (see <Link href="/docs/settings-and-shortcuts#updates">updates</Link>).
      </p>

      <h2 id="git">Git comes first</h2>
      <p>
        ddugit reads your repositories on its own, but it uses the Git installed on your computer for every change:
        commits, merges, pushes and the rest. Install Git from <a href="https://git-scm.com/downloads">git-scm.com</a>{" "}
        before you start, if you don&apos;t have it.
      </p>
      <p>
        If ddugit can&apos;t run Git when it starts, it shows <strong>Git not found</strong> with four buttons:{" "}
        <strong>Download Git</strong> opens the Git website, <strong>Check again</strong> looks once more after you
        install it, <strong>Set Git location</strong> takes you to <strong>Settings → Git</strong>, and{" "}
        <strong>Close</strong> dismisses the dialog.
      </p>
      <p>
        On macOS, apps opened from Finder may not see your terminal&apos;s <code>PATH</code>. If Git works in Terminal
        but not in ddugit, open <strong>Settings → Git</strong>, enter the full path in <strong>Git executable</strong>{" "}
        (for example <code>/opt/homebrew/bin/git</code>) and click <strong>Verify and apply</strong>. Leave the field
        empty to use <code>git</code> from <code>PATH</code>.
      </p>

      <h2 id="open">Open a repository you already have</h2>
      <p>The start screen offers three ways in, and you can also drop a folder on the window:</p>
      <ul>
        <li>
          <strong>Open repository…</strong> asks for a folder and opens it in a tab.
        </li>
        <li>
          <strong>Drag a folder onto the window.</strong> Drop a repository folder, or any file or folder inside one,
          and ddugit opens the repository it belongs to. If the folder isn&apos;t in a Git repository, ddugit asks{" "}
          <strong>Not a Git repository</strong> and offers <strong>Create here</strong>.
        </li>
        <li>
          <strong>Recent repositories.</strong> Every repository you open is remembered. Click the star to{" "}
          <strong>Add to favorites</strong>: favorites stay at the top and are never pushed out of the list.{" "}
          <strong>Remove from list</strong> forgets a repository without touching its files.
        </li>
      </ul>
      <p>
        Once you have opened a few repositories, the start screen shows them as cards in{" "}
        <strong>My repositories</strong>, with each one&apos;s branch, changes, and commits to pull or push. That
        dashboard is covered in <Link href="/docs/multiple-repositories">many repositories</Link>.
      </p>
      <p>
        Want to look around first? <strong>Take the tour (demo repository)</strong> opens a practice repository with a
        short tutorial. Nothing you do there touches your own work.
      </p>

      <h2 id="clone">Clone a repository</h2>
      <p>
        Click <strong>Clone repository…</strong>. The <strong>Clone repository</strong> dialog lets you choose a source:
      </p>
      <ul>
        <li>
          <strong>URL</strong>: paste the <strong>Repository URL (HTTPS or SSH)</strong>. The HTTPS / SSH switch above
          the field converts a GitHub or GitLab address from one form to the other.
        </li>
        <li>
          <strong>GitHub</strong> or <strong>GitLab</strong>: pick from your own repositories. The first time, click{" "}
          <strong>Connect GitHub</strong> (or GitLab). If you&apos;re signed in with <code>gh auth login</code> or{" "}
          <code>glab auth login</code>, that token is used; otherwise paste a token, which is stored only in your
          computer&apos;s keychain. Change <strong>Server</strong> for GitHub Enterprise or a self-managed GitLab.
        </li>
      </ul>
      <p>
        Under <strong>Save to</strong>, click <strong>Choose…</strong> to pick the parent folder. The{" "}
        <strong>Folder name</strong> follows the URL until you edit it, and the full path appears below. ddugit
        remembers the parent folder for next time. Click <strong>Clone</strong> to start; progress shows in the dialog,
        and the repository opens in a tab when it&apos;s done.
      </p>
      <h3 id="clone-options">Clone options</h3>
      <p>
        Open <strong>Advanced</strong> in the clone dialog for these:
      </p>
      <ul>
        <li>
          <strong>Branch</strong>: the branch to check out. Leave it empty for the default branch.
        </li>
        <li>
          <strong>Recent history only (shallow)</strong>: clone only the last few commits, with the number in{" "}
          <strong>Commits</strong> (<code>--depth</code>).
        </li>
        <li>
          <strong>This branch only</strong>: fetch just one branch (<code>--single-branch</code>).
        </li>
        <li>
          <strong>With submodules</strong>: check out submodules as part of the clone.
        </li>
      </ul>
      <h3 id="ssh">SSH addresses</h3>
      <p>
        When the URL is an SSH address (<code>git@github.com:owner/repo.git</code>), a <strong>Set up SSH</strong>{" "}
        section appears with four steps:
      </p>
      <ol className="steps">
        <li>
          <strong>SSH key</strong>: use your existing key, or click <strong>Generate key</strong> to create an ed25519
          key in <code>~/.ssh</code> (without a passphrase; add one later with <code>ssh-keygen -p</code>).
        </li>
        <li>
          Add the public key to your account: <strong>Copy public key</strong>. For GitHub and GitLab,{" "}
          <strong>Open github.com SSH key settings</strong> (or gitlab.com) takes you to the right page.
        </li>
        <li>
          <strong>Check server</strong>. For GitHub and GitLab, ddugit compares the server&apos;s fingerprint with the
          one they publish. Click <strong>Trust this server</strong> when it matches. For other servers, compare it with
          the fingerprint from the server&apos;s administrator first.
        </li>
        <li>
          <strong>Test</strong> the connection. You should see <strong>Authenticated</strong>.
        </li>
      </ol>
      <p>On Windows these steps need OpenSSH (ssh and ssh-keygen), which comes with Git for Windows.</p>
      <h3 id="auth">When sign-in fails</h3>
      <p>
        ddugit never shows terminal login prompts, because a hidden prompt would freeze the app. If the server rejects
        you, an <strong>Authentication required</strong> dialog explains the one-time setup for your system and the
        address you used: the macOS keychain, Git Credential Manager on Windows, or the SSH steps above (with the
        terminal commands under <strong>Use a terminal instead</strong>). Each command has a copy button,{" "}
        <strong>Show Git output</strong> shows exactly what Git said, and <strong>Retry</strong> takes you back to the
        clone dialog with everything filled in.
      </p>

      <h2 id="init">Start a new repository</h2>
      <p>
        Click <strong>New repository…</strong> and choose the <strong>Folder for the new repository</strong>. ddugit
        runs <code>git init</code> there with <code>main</code> as the first branch and opens it. If the folder is
        already a repository, it just opens it. An empty repository says{" "}
        <strong>No commits yet. Press ＋ to make the first one.</strong>: the ＋ on the map opens the commit panel.
      </p>

      <h2 id="tabs">Tabs</h2>
      <p>Each open repository gets its own tab in the row at the top of the window.</p>
      <ul>
        <li>
          The first tab, <strong>Repositories</strong>, is the home screen: the start buttons and your repositories.
          Press <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>0</kbd> to go there.
        </li>
        <li>
          <strong>+</strong> (or <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>T</kbd>) opens a new tab with the start screen, to
          open, clone or create another repository.
        </li>
        <li>
          Close a tab with its <strong>×</strong>, a middle-click, or <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>W</kbd>.
        </li>
        <li>
          The <strong>▾</strong> on the current tab opens the repository menu: <strong>Open repository…</strong>,{" "}
          <strong>Clone repository…</strong>, <strong>New repository…</strong> and your recent repositories.
        </li>
        <li>
          Switching tabs keeps each one as you left it: position on the map, selection and open sheets. Only the tab on
          screen listens to the keyboard and watches its files.
        </li>
        <li>The desktop app reopens the tabs you had open the next time you start it.</li>
      </ul>
      <Screen
        name="home"
        alt="ddugit's home tab: Open, Clone and New repository buttons above My repositories, a grid of repository cards showing branches, changes and commits to pull or push"
        caption="The Repositories tab: ways in at the top, your repositories below."
      />

      <h2 id="window">A tour of the window</h2>
      <Screen
        name="graph"
        alt="ddugit with a repository open: the top bar with the current branch and Fetch, Pull, Push and Commit, the sidebar of branches, remotes, tags and pull requests, the branch map, and a commit's details on the right"
        caption="Top bar, sidebar, branch map and inspector."
      />
      <h3 id="tab-row">Tab row</h3>
      <p>
        The wordmark, your tabs, and <strong>Settings</strong> (the gear) at the far right. On macOS the window buttons
        sit at the start of this row; on Windows, at its end. Drag an empty part of the row to move the window, and
        double-click it to maximize.
      </p>
      <h3 id="top-bar">Top bar</h3>
      <ul>
        <li>
          The current branch, with <strong>▾</strong> to switch branch, and the upstream branch it tracks.
        </li>
        <li>
          <strong>Fetch</strong>, <strong>Pull</strong> and <strong>Push</strong>. Pull shows how many commits are
          waiting on the remote; Push, how many you have to send. A running transfer shows its percentage. See{" "}
          <Link href="/docs/branches-and-remotes">branches and remotes</Link>.
        </li>
        <li>
          <strong>Commit</strong>, with the number of changed files. It opens the commit panel (
          <Link href="/docs/commits-and-changes">commits and changes</Link>).
        </li>
        <li>
          A history button for the <strong>Undo history (reflog)</strong>, and a folder button to{" "}
          <strong>Open in file manager, terminal or editor</strong>.
        </li>
      </ul>
      <h3 id="sidebar">Sidebar</h3>
      <p>
        <strong>Filter branches</strong> at the top narrows every list. Below it come <strong>Branches</strong>,{" "}
        <strong>Remotes</strong> (a fold per remote) and <strong>Tags</strong>, then sections that appear when the
        repository has them: stacks, pull or merge requests, submodules, Git LFS, <strong>Worktrees</strong> and{" "}
        <strong>Stashes</strong>. Click a section title to fold it. Click a branch to focus it on the map, double-click
        it to check it out, and right-click it for its menu. Collapse the sidebar to a thin rail with <kbd>⌘</kbd>/
        <kbd>Ctrl</kbd> + <kbd>B</kbd>, and drag its edge to resize it (double-click the edge to reset).
      </p>
      <h3 id="map">Branch map</h3>
      <p>
        The middle of the window is the history: one dot per commit, one lane per line of work. Drag to pan, zoom with{" "}
        <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + wheel, and press <kbd>H</kbd> to come back to HEAD. The controls at the bottom
        right zoom, fit, rotate, switch to a list, and toggle the minimap and map lock. Everything about the map is in{" "}
        <Link href="/docs/branch-map">reading the branch map</Link>.
      </p>
      <h3 id="panel">Right panel</h3>
      <p>
        Click a commit and the inspector opens on the right: message, author, SHA (click to copy), parents, branches
        that contain it, the changed files, and buttons for what you can do with it. The same place holds the commit
        panel when you&apos;re committing, and a stash&apos;s details when you click a stash. Drag its edge to make it
        wider.
      </p>
      <h3 id="sheets">Sheets and banners</h3>
      <p>
        Larger tasks open in a sheet that slides up under the map, so the history stays in view: diffs, resolving
        conflicts, rearranging commits, backports and branch cleanup. Drag the diff sheet&apos;s top edge to resize it,
        and press <kbd>Esc</kbd> to close it. When an operation is in progress, such as a merge, rebase or bisect, a
        banner above the map says so and offers the next step.
      </p>
      <h3 id="toasts">Notifications</h3>
      <p>
        Short messages (toasts) report what finished or failed. A toast stays while your pointer is over it, so you can
        read or select its text. Error messages have a copy button, and an unexpected error also has a{" "}
        <strong>Report</strong> button that opens a problem report with that error filled in.
      </p>

      <h2 id="next">Next</h2>
      <ul>
        <li>
          <Link href="/docs/branch-map">Reading the branch map</Link>: move around the history and make it your own.
        </li>
        <li>
          <Link href="/docs/commits-and-changes">Commits, staging and stashes</Link>: make your first commit.
        </li>
        <li>
          <Link href="/docs/settings-and-shortcuts">Settings and keyboard shortcuts</Link>: press <kbd>?</kbd> in the
          app to see every shortcut.
        </li>
      </ul>
    </DocArticle>
  );
}
