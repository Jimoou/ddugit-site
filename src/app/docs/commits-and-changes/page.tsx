import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle, Shell } from "@/components/GuideArticle";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("commits-and-changes");

export default function CommitsAndChanges() {
  return (
    <DocArticle
      slug="commits-and-changes"
      lead="Everything between editing a file and having a commit: choosing what goes in, down to single lines, writing the message, fixing the last commit, and putting work aside in a stash. It also covers who your commits are made as and how they are signed."
    >
      <h2 id="changes">Open the commit panel</h2>
      <p>When files change on disk, ddugit picks it up on its own. There are three ways to open the commit panel:</p>
      <ul>
        <li>
          Click <strong>＋</strong> next to HEAD on the branch map.
        </li>
        <li>
          Click <strong>Commit</strong> in the top bar. Its badge shows how many files have changed.
        </li>
        <li>
          Press <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>.
        </li>
      </ul>
      <p>
        The panel opens on the right and lists every changed file. A letter shows what happened to each one:{" "}
        <strong>M</strong> modified, <strong>A</strong> added, <strong>U</strong> untracked (new), <strong>D</strong>{" "}
        deleted, <strong>R</strong> renamed, and <strong>!</strong> for a file with conflicts. A <strong>½</strong> mark
        means the file is partially staged: some of its changes are staged and some are not. Click a file&apos;s path to
        open its diff in the <strong>Changes</strong> sheet under the graph. A file with conflicts opens in the conflict
        sheet instead.
      </p>

      <h2 id="what-goes-in">Two ways to choose what goes in</h2>
      <h3 id="pick-files">Pick files (the default)</h3>
      <p>
        Every changed file starts ticked. Untick the ones that should wait. When you commit, ddugit adds and commits
        exactly the ticked files, whatever is or isn&apos;t staged. You never have to think about the index. The header
        counts how many files are selected.
      </p>
      <h3 id="staged-only">Commit staged changes only</h3>
      <p>
        Tick <strong>Commit staged changes only</strong> to commit the index as it is, the way <code>git commit</code>{" "}
        does. In this mode a file&apos;s checkbox stages and unstages it, and the checkbox in the header is{" "}
        <strong>Stage all</strong> or <strong>Unstage all</strong>. The header counts staged files instead.
      </p>
      <p>
        You rarely have to switch by hand. The panel starts in this mode when a file is already partially staged. It
        also switches as soon as you stage something yourself, whether from the diff sheet, a file&apos;s menu or a
        terminal. That way a hunk you staged carefully is never committed together with the rest of its file.
      </p>

      <h2 id="stage">Stage files, hunks and single lines</h2>
      <p>
        The <strong>Changes</strong> sheet for the working tree has two tabs, <strong>Unstaged</strong> and{" "}
        <strong>Staged</strong>. A file that is fully staged opens on the Staged tab.
      </p>
      <ul>
        <li>
          <strong>Whole files:</strong> <strong>Stage file</strong> above the diff stages the file shown, and{" "}
          <strong>Stage all</strong> in the header stages every file in the tab.
        </li>
        <li>
          <strong>A hunk:</strong> each hunk header has a <strong>Stage this hunk</strong> button.
        </li>
        <li>
          <strong>Single lines:</strong> click a changed line&apos;s line number to select it, and <kbd>Shift</kbd>
          -click to select a range. The hunk&apos;s button then reads <strong>Stage 2 selected lines</strong> (or
          however many). You can select lines in one hunk at a time.
        </li>
      </ul>
      <p>
        On the Staged tab the same buttons unstage: <strong>Unstage file</strong>, <strong>Unstage all</strong>,{" "}
        <strong>Unstage this hunk</strong> and <strong>Unstage 2 selected lines</strong>. Press <kbd>[</kbd> and{" "}
        <kbd>]</kbd> to move to the previous or next file, and <kbd>Esc</kbd> to close the sheet. A file that still has
        conflicts can&apos;t be staged until you resolve it, because staging it would mark it resolved with the conflict
        markers still inside.
      </p>
      <p>
        Right-clicking a file in the commit panel also gives you <strong>Stage</strong> and <strong>Unstage</strong> for
        the whole file.
      </p>

      <h2 id="discard">Discard changes</h2>
      <p>
        To throw away the changes in whole files, select them in the commit panel and click{" "}
        <strong>Discard selected</strong>. A confirmation lists the files first. They go back to how they were in the
        last commit, and new files are deleted. This can&apos;t be undone, because the changes were never committed.
      </p>
      <p>
        To throw away part of a file, use the Unstaged tab of the diff sheet. Each hunk has{" "}
        <strong>Discard hunk</strong>, or <strong>Discard 2 selected lines</strong> once you have selected lines. Only
        the working tree changes. Whatever you already staged stays.
      </p>

      <h2 id="ignore">Ignore files and stop tracking them</h2>
      <p>Right-click a file in the commit panel. For a new, untracked file you can add a pattern to .gitignore:</p>
      <ul>
        <li>
          <strong>Ignore this file</strong> adds that one path, anchored at the top, such as{" "}
          <code>/logs/debug.log</code>.
        </li>
        <li>
          <strong>Ignore all *.log files</strong> adds <code>*.log</code>, for every file with that extension anywhere.
        </li>
        <li>
          <strong>Ignore folder logs/</strong> adds <code>/logs/</code>.
        </li>
      </ul>
      <p>
        ddugit appends the pattern to the <code>.gitignore</code> at the top of the repository and skips patterns that
        are already there. Characters that mean something special in a pattern are escaped.
      </p>
      <p>
        A file Git already tracks needs to come out of the repository first. <strong>Stop tracking (keep file)</strong>{" "}
        removes it from Git but leaves it on your disk (<code>git rm --cached</code>).{" "}
        <strong>Stop tracking and ignore</strong> also adds it to .gitignore. Both ask first. Once you commit and push,
        other people lose their copy of the file when they pull. Either way, commit the changed .gitignore and the
        removal like any other change.
      </p>

      <h2 id="commit">Write the message and commit</h2>
      <p>
        Type the message in the box. The first line is the summary. Click <strong>Commit</strong> or press{" "}
        <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd>. To start a branch for this work at the same time, tick{" "}
        <strong>Commit on a new branch</strong> and type its name. ddugit creates the branch, switches to it and commits
        there.
      </p>
      <p>
        If the repository sets <code>commit.template</code>, an empty message starts with the template&apos;s text,
        minus its <code>#</code> comment lines. Committing the template unchanged is refused with{" "}
        <em>This is still the commit template. Fill it in first</em>, just as Git refuses it.
      </p>
      <h3 id="options">Commit options</h3>
      <ul>
        <li>
          <strong>Skip hooks</strong> commits without running the pre-commit and commit-msg hooks (
          <code>--no-verify</code>).
        </li>
        <li>
          <strong>Add Signed-off-by</strong> ends the message with a <code>Signed-off-by</code> line in your name and
          email (<code>-s</code>), as some projects require.
        </li>
      </ul>
      <h3 id="hooks">When a hook rejects the commit</h3>
      <p>
        Hooks run as usual. If one fails, nothing is committed and the error notification shows Git&apos;s output,
        including what the hook printed. You can select and copy that text. Fix the problem and commit again, or tick{" "}
        <strong>Skip hooks</strong> if you really mean to commit past it.
      </p>

      <h2 id="amend">Amend the last commit</h2>
      <p>
        Tick <strong>Amend last commit</strong> in the commit panel. If the message box is empty, the last commit&apos;s
        message fills it so you can edit it, and the button becomes <strong>Amend commit</strong>. The selected files
        are added to that commit. With no files selected, only the message changes.
      </p>
      <p>
        You can also right-click the HEAD commit on the map and choose <strong>Amend last commit</strong>. The panel
        then opens in amend mode with nothing selected, ready for a new message. If the commit is already on the remote,
        the panel warns you: amending it means you will need to force push.
      </p>
      <p>
        To take the last commit back entirely, see <Link href="/guides/undo-reset-reflog">undoing in ddugit</Link>.
      </p>

      <h2 id="identity">Who you commit as</h2>
      <p>
        The top of the commit panel shows the name and email your next commit will use. Next to it, a tag says where
        that identity comes from: <strong>local</strong> means this repository sets its own (
        <code>git config --local</code>), and <strong>global</strong> means your global Git settings. A{" "}
        <strong>Signed</strong> tag means the commit will be signed. If no name or email is set anywhere, the panel
        warns you that commits will fail.
      </p>
      <p>
        Click the name to open <strong>Commit in this repository as</strong>:
      </p>
      <ul>
        <li>Pick a saved profile to write its name, email and signing settings into this repository&apos;s config.</li>
        <li>
          <strong>Use the global identity</strong> removes the repository&apos;s own setting again.
        </li>
        <li>
          <strong>Sign commits in this repository</strong> or <strong>Stop signing commits in this repository</strong>{" "}
          appears when a signing key is configured.
        </li>
        <li>
          <strong>Save the current identity as a profile</strong> keeps what is set now for other repositories.
        </li>
      </ul>
      <h3 id="profiles">Profiles</h3>
      <p>
        Profiles live in <strong>Settings</strong> → <strong>Profiles</strong>. Use them when you commit as different
        people in different places, for example a work email for company repositories and a personal one for your own
        projects. The page shows your global identity and, when a signing key is set, a{" "}
        <strong>Sign commits in every repository (global)</strong> switch. If you have no profiles yet, ddugit offers to
        create one from your global identity.
      </p>
      <p>
        Click <strong>+ Add profile</strong> and fill in <strong>Name</strong>, <strong>Email</strong> and{" "}
        <strong>Signing</strong>: <strong>Don&apos;t sign</strong>, <strong>GPG</strong> or <strong>SSH</strong>. For
        signing, the <strong>Signing key</strong> field suggests the keys found on this computer: GPG secret keys from{" "}
        <code>gpg</code>, or SSH public keys in <code>~/.ssh</code>. <strong>Use globally</strong> makes a profile your
        global Git identity.
      </p>
      <h3 id="signing">Signing commits</h3>
      <p>
        ddugit runs Git without a terminal, so it can&apos;t ask for a key&apos;s passphrase. A GPG key with a
        passphrase needs a graphical pinentry (pinentry-mac on macOS, Gpg4win on Windows) or a gpg-agent that already
        holds it. Add an SSH key with a passphrase to ssh-agent first (<code>ssh-add</code>). When signing fails, the
        error says which of these to check.
      </p>
      <p>
        Signed commits get a badge in the inspector when you select them: <strong>Signed</strong>,{" "}
        <strong>Signed (unverified)</strong> or <strong>Bad signature</strong>. Hover over it to see who signed and with
        which key, or a note that this computer can&apos;t verify the signing key.
      </p>

      <h2 id="stash">Stash work for later</h2>
      <p>
        A stash puts changes aside and gives you a clean working tree, for example to switch branches or pull. In the
        commit panel, choose the files and click <strong>Stash</strong>. In staged-only mode it stashes the staged
        files. The <strong>Stash changes</strong> window asks for:
      </p>
      <ul>
        <li>
          a <strong>Message</strong> (optional; it starts with whatever you typed as a commit message),
        </li>
        <li>
          <strong>Include untracked files</strong>, on by default, so new files go into the stash too,
        </li>
        <li>
          <strong>Keep staged changes in the working tree too (--keep-index)</strong>, to stash everything but leave
          what you staged in place.
        </li>
      </ul>
      <p>
        <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> stashes all changes at once, untracked files included,
        without asking.
      </p>
      <h3 id="stash-list">Find and restore a stash</h3>
      <p>
        Stashes are listed in the sidebar under <strong>Stashes</strong>. On the map, each one is a small diamond
        hanging off the commit it was taken on. Click either to open the stash panel. It shows when you stashed, the
        base commit and the changed files. Untracked files aren&apos;t listed there, but they are in the stash if you
        included them. Then choose:
      </p>
      <ul>
        <li>
          <strong>Pop</strong> to apply the changes and remove the stash,
        </li>
        <li>
          <strong>Apply (keep stash)</strong> to apply them and keep the stash,
        </li>
        <li>
          <strong>Create branch from stash…</strong> to make a new branch at the commit the stash was taken on, switch
          to it and pop the stash there. This is the safe choice when the stash no longer applies cleanly where you are,
        </li>
        <li>
          <strong>Drop</strong> to delete it. This can&apos;t be undone.
        </li>
      </ul>
      <p>Right-click a stash in the sidebar for the same actions.</p>
      <p>
        For branches, merges and syncing with remotes, see{" "}
        <Link href="/docs/branches-and-remotes">Branches, merges and remotes</Link>.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>Roughly what ddugit runs for you:</p>
      <Shell>{`
git add -A -- <files> && git commit -m "message" -- <files>   # pick files
git commit -m "message"                                         # staged changes only
git add -p                                                      # hunks and lines
git commit --amend
git commit --no-verify -s -m "message"
git rm --cached <file> && echo "/<file>" >> .gitignore
git stash push --include-untracked -m "message"
git stash pop        # or: git stash apply, git stash branch <name>, git stash drop
`}</Shell>
    </DocArticle>
  );
}
