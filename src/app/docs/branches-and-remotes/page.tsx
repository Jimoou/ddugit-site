import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle, Shell } from "@/components/GuideArticle";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("branches-and-remotes");

export default function BranchesAndRemotes() {
  return (
    <DocArticle
      slug="branches-and-remotes"
      lead="Branches, tags, merges and rebases happen on the map, mostly by dragging. Fetch, pull and push tell you what will move before it moves, and when a branch has diverged, ddugit asks how to combine the two sides."
    >
      <h2 id="create">Create a branch</h2>
      <ul>
        <li>
          Click <strong>+</strong> next to <strong>Branches</strong> in the sidebar, choose <strong>New branch…</strong>{" "}
          in the top bar&apos;s branch switcher, or press <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>. The
          branch starts where HEAD is.
        </li>
        <li>
          Right-click any commit or branch and choose <strong>New branch here…</strong> to start it somewhere else.
        </li>
        <li>
          In the commit panel, tick <strong>Commit on a new branch</strong> to create one as you commit.
        </li>
      </ul>
      <p>
        Type a name and click <strong>Create and switch</strong>. The new branch is checked out right away.
      </p>

      <h2 id="switch">Switch branches</h2>
      <p>
        Double-click a branch in the sidebar, right-click it and choose <strong>Check out</strong>, or pick it from the
        branch switcher: the current branch&apos;s name at the left of the top bar. The switcher lists local branches
        first, then remote branches that have no local branch yet. If the branch is checked out in another worktree,
        ddugit opens that worktree in a tab instead, since Git can&apos;t check out one branch in two places.
      </p>
      <h3 id="remote-branches">Remote branches</h3>
      <p>
        Double-click a remote branch, or click the <strong>+</strong> on its row, to create a local branch that tracks
        it. Its menu has the same thing as <strong>Check out as local branch</strong>, plus{" "}
        <strong>Check out under another name…</strong>. When a local branch with that name already exists and points
        somewhere else (say <code>upstream/main</code> next to your own <code>main</code>), ddugit doesn&apos;t switch
        to yours silently. It asks for a new name for the tracking branch.
      </p>
      <h3 id="detached">Tags and single commits (detached HEAD)</h3>
      <p>
        A tag&apos;s <strong>Check out</strong> and a commit&apos;s <strong>Check out this commit (detached)…</strong>{" "}
        put you on that commit without a branch. ddugit says so before it does it: commits you make there belong to no
        branch and are hard to find once you check out something else. The top bar then reads{" "}
        <strong>Detached HEAD @</strong> and the commit ID. To keep work you did there, use{" "}
        <strong>New branch here…</strong> on it.
      </p>

      <h2 id="rename-delete">Rename and delete branches</h2>
      <p>
        Right-click a branch and choose <strong>Rename…</strong>. If the branch tracks a branch of the same name on a
        remote you can push to, the window offers <strong>Also rename on origin</strong> (or whichever remote it is).
        ddugit then pushes the new name and deletes the old one there. If one of those steps fails, it tells you which.
      </p>
      <p>
        <strong>Delete branch…</strong> removes the local branch only. Branches on remotes aren&apos;t affected. If the
        branch has commits that aren&apos;t merged into any other branch, a second window,
        <strong>Unmerged branch</strong>, asks again. <strong>Delete anyway</strong> leaves those commits only in the
        undo history (see <Link href="/guides/undo-reset-reflog">undoing in ddugit</Link>). You can&apos;t delete the
        branch you are on. To tidy up many old branches at once, use <strong>Clean up branches…</strong> in the{" "}
        <strong>⋯</strong> menu next to Branches.
      </p>

      <h2 id="tags">Tags</h2>
      <p>
        Right-click a commit or branch and choose <strong>Tag here…</strong>. Give the tag a name such as{" "}
        <code>v1.0.0</code>. Add a message to make an annotated tag, or leave the message empty for a lightweight one.
        Tick <strong>Push it to origin right away</strong> to publish it in the same step.
      </p>
      <p>A tag&apos;s menu, on the map or under Tags in the sidebar, has:</p>
      <ul>
        <li>
          <strong>Go to tag</strong> and <strong>Check out</strong> (detached, as above),
        </li>
        <li>
          <strong>Push to origin</strong>, one entry for each remote you can push to. Git refuses the push if that
          remote already has the tag on a different commit. ddugit never force-pushes tags,
        </li>
        <li>
          <strong>Delete tag</strong>, which deletes only your local tag,
        </li>
        <li>
          <strong>Delete on origin…</strong>, which deletes the tag on that remote for everyone who uses it. Your local
          tag stays, and clones that already fetched it keep their copy.
        </li>
      </ul>
      <p>
        To publish every tag at once, open a remote&apos;s <strong>⋯</strong> menu in the sidebar and choose{" "}
        <strong>Push all tags</strong>.
      </p>

      <h2 id="merge">Merge by dragging</h2>
      <p>
        Drag a branch tip, or any commit, onto the tip of the branch it should go into. While you drag, the hint reads{" "}
        <strong>Release to merge</strong> over a valid target. You can also right-click a branch and choose{" "}
        <strong>Merge into main…</strong> (with the name of your current branch). If the target isn&apos;t the branch
        you have checked out, ddugit checks it out first. To avoid merging by accident, lock the map with <kbd>L</kbd>.
        Dragging then only moves the view.
      </p>
      <p>
        The <strong>Merge</strong> window shows which branch goes where. Under <strong>How to merge</strong>, choose:
      </p>
      <ul>
        <li>
          <strong>Merge commit</strong>: always makes a merge commit, even when a fast-forward would do (
          <code>--no-ff</code>). Type a message, or leave it empty for Git&apos;s default.
        </li>
        <li>
          <strong>Fast-forward</strong>: moves the target branch forward without a merge commit. If the branches have
          diverged, a fast-forward isn&apos;t possible and the window says a merge commit will be made instead.
        </li>
        <li>
          <strong>Squash</strong>: combines all the incoming changes into one and stages them, without committing. The
          button reads <strong>Stage</strong>. The commit panel then opens in staged-only mode with a message built from
          the merged commits, for you to review and commit. A squash needs a clean working tree: commit or stash changes
          to tracked files first.
        </li>
      </ul>
      <p>ddugit remembers the mode you picked last and offers it first next time.</p>
      <h3 id="conflicts">If the merge stops on conflicts</h3>
      <p>
        A banner reads <strong>Merge in progress — 2 conflicted files</strong>. Click <strong>Resolve conflicts</strong>{" "}
        to work through them, then commit with <strong>＋</strong> to finish the merge. <strong>Cancel</strong> puts
        everything back as it was before the merge, for a squash merge too. The full walkthrough is in{" "}
        <Link href="/guides/resolve-merge-conflicts">resolving merge conflicts</Link>.
      </p>

      <h2 id="rebase">Rebase onto another branch</h2>
      <p>
        To replay your branch&apos;s own commits on top of another branch, right-click that branch and choose{" "}
        <strong>Rebase feature onto main…</strong>. Or hold <kbd>⌘/Ctrl</kbd> and drag your current branch&apos;s tip
        onto the other branch&apos;s tip, local or remote. The confirmation says how many commits move and warns you
        when:
      </p>
      <ul>
        <li>some of them are merge commits: a rebase leaves merges out and lines the commits up in a row,</li>
        <li>some of them were already pushed: you will need to force push afterwards,</li>
        <li>you have uncommitted changes: they are put aside and restored when the rebase is done.</li>
      </ul>
      <p>
        Every replayed commit gets a new ID. To reorder, squash or drop commits instead, see{" "}
        <Link href="/guides/interactive-rebase">interactive rebase</Link>.
      </p>

      <h2 id="sync">Fetch, pull and push</h2>
      <p>
        The top bar has <strong>Fetch</strong>, <strong>Pull</strong> and <strong>Push</strong>, also on{" "}
        <kbd>⌘/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>, <kbd>P</kbd> and <kbd>U</kbd>. The badge on Pull counts the
        remote commits your branch doesn&apos;t have, and the badge on Push counts your commits the remote doesn&apos;t
        have, both as of the last fetch. The name of the remote branch you track appears next to the branch name.
      </p>
      <ul>
        <li>
          <strong>Fetch</strong> downloads new commits from every remote and drops remote branches that were deleted
          there. Your branches and files stay as they are.
        </li>
        <li>
          <strong>Pull</strong> brings the remote&apos;s commits into your branch. It only fast-forwards. If both sides
          have new commits, ddugit asks how to combine them (see below).
        </li>
        <li>
          <strong>Push</strong> sends your commits. The first push of a new branch creates a branch with the same name
          on the remote (<code>origin</code>, or the first remote you can push to) and tracks it.
        </li>
      </ul>
      <h3 id="confirm">Confirmation before pull and push</h3>
      <p>
        By default, Pull and Push ask first. Pull fetches, then lists the commits that will come in and warns you if
        uncommitted changes might get in the way. Push lists the commits that will go out and the remote and URL they go
        to. Tick <strong>Don&apos;t ask again</strong> to skip a window from then on. To turn it back on, or to confirm
        fetches too, use <strong>Confirm before</strong> in <strong>Settings</strong> → <strong>Appearance</strong>.
      </p>
      <h3 id="diverged">When branches have diverged</h3>
      <p>
        If you and someone else both added commits, a pull can&apos;t fast-forward. The{" "}
        <strong>Branches diverged</strong> window draws the fork with your commits and the remote&apos;s, and offers two
        ways forward:
      </p>
      <ul>
        <li>
          <strong>Merge</strong> joins both lines of history with a merge commit.
        </li>
        <li>
          <strong>Rebase</strong> replays your commits on top of the remote&apos;s, for a linear history. Avoid it for
          commits you have already shared.
        </li>
      </ul>
      <p>
        ddugit&apos;s rebase pull fetches and then rebases onto the remote branch by name. Plain{" "}
        <code>git pull --rebase</code> can silently drop a local commit that was once on the remote and later
        overwritten there. ddugit&apos;s way keeps every commit of yours whose change the remote doesn&apos;t already
        have. Commits the remote already has are left out, and ddugit tells you how many.
      </p>
      <h3 id="rejected">Rejected pushes and force push</h3>
      <p>
        If the remote has commits you haven&apos;t pulled, Git rejects the push. ddugit fetches and opens{" "}
        <strong>Push rejected</strong>, with Git&apos;s output and three choices: <strong>Merge and push</strong>,{" "}
        <strong>Rebase and push</strong>, or <strong>Overwrite (force push)</strong>. Overwrite throws away the
        remote-only commits, so pick it only when they are yours, for example after you amended or rebased.
      </p>
      <p>
        You can also force push any local branch from its menu with <strong>Force push (overwrite)…</strong>. The window
        says how many commits will drop off the remote branch, as of your last fetch. Every force push from ddugit uses{" "}
        <code>--force-with-lease</code>: if someone pushed after your last fetch, nothing is overwritten and ddugit
        tells you to fetch and look first.
      </p>

      <h2 id="upstream">Upstream branches</h2>
      <p>A local branch&apos;s menu manages the remote branch it follows:</p>
      <ul>
        <li>
          <strong>Track remote branch…</strong> lists remote branches, with the one of the same name first. The current
          one is marked <strong>now</strong>.
        </li>
        <li>
          <strong>Stop tracking origin/feature</strong> removes the link.
        </li>
        <li>
          <strong>Push feature</strong> pushes that branch without checking it out, and it tracks the pushed branch from
          then on.
        </li>
        <li>
          <strong>Fast-forward to origin/feature</strong> moves a branch you haven&apos;t checked out up to its remote
          branch. When it can&apos;t, the menu says why: <strong>Pull the checked-out branch</strong>,{" "}
          <strong>Diverged</strong>, <strong>Up to date</strong> or <strong>Gone on the remote</strong>.
        </li>
      </ul>
      <p>
        A branch without an upstream still works. When you pull or push it and the remote has a branch of the same name,
        ddugit makes your branch follow that one, so a pull never says “push first” while a push says “pull first”.
      </p>
      <h3 id="delete-remote">Delete a branch on its remote</h3>
      <p>
        Right-click the remote branch and choose <strong>Delete on origin…</strong>. It is deleted for everyone who uses
        that remote. Your local branches stay. Pull requests from that branch can no longer be merged.
      </p>

      <h2 id="remotes">Remotes</h2>
      <p>
        Remotes are listed in the sidebar under <strong>Remotes</strong>, one fold per remote. Click <strong>+</strong>{" "}
        to <strong>Add remote</strong>: enter a <strong>Name</strong> and <strong>URL</strong>, or pick from your GitHub
        or GitLab repositories, then click <strong>Add and fetch</strong>.
      </p>
      <p>
        Any remote not named <code>origin</code> is added as <strong>fetch-only</strong>, because it is usually someone
        else&apos;s project, such as the original of your fork. ddugit never pushes there. If a branch tracks a
        fetch-only remote, the push window explains this and offers <strong>Push to origin</strong> instead. After that,
        the branch tracks origin.
      </p>
      <p>
        A remote&apos;s <strong>⋯</strong> menu has <strong>Fetch origin only</strong>, <strong>Copy URL</strong>,{" "}
        <strong>Push all tags</strong>, <strong>Make origin fetch-only (block pushes)</strong> or{" "}
        <strong>Allow pushing to origin</strong>, <strong>Rename…</strong>, <strong>Edit URL…</strong> (a fetch-only
        remote stays fetch-only) and <strong>Remove remote origin…</strong>. Removing a remote deletes its
        remote-tracking branches from your repository. The remote repository itself and your local branches are not
        affected.
      </p>
      <h3 id="auth">Sign-in and SSH problems</h3>
      <p>
        ddugit runs Git without terminal prompts, so a password or passphrase prompt would never appear. When a remote
        needs a sign-in, <strong>Authentication required</strong> opens instead, with steps for your system: a
        credential helper or Git Credential Manager for HTTPS, or the GitHub CLI. For SSH, it can set things up in the
        window: <strong>Generate key</strong> (an ed25519 key without a passphrase), <strong>Copy public key</strong> to
        add it to your account, <strong>Check server</strong> to compare the host key with the fingerprint GitHub or
        GitLab publishes, then <strong>Trust this server</strong> and <strong>Test</strong>.{" "}
        <strong>Show Git output</strong> has the exact error. Click <strong>Retry</strong> when you are done.
      </p>

      <h2 id="pull-requests">Pull requests and merge requests</h2>
      <p>
        When a remote is on GitHub or GitLab, open pull requests (merge requests on GitLab) appear as badges such as{" "}
        <code>#12</code> or <code>!12</code> on their head commits, coloured by the state of their checks. The
        sidebar&apos;s <strong>PRs</strong> (or <strong>MRs</strong>) section lists them with their checks, review state
        (<strong>Approved</strong>, <strong>Changes requested</strong>) and <strong>Draft</strong> mark. Merged and
        closed ones are folded below. Click one to show it on the map, double-click to open it in your browser, or
        right-click for <strong>Open in browser</strong>, <strong>Show in graph</strong> and <strong>Check out</strong>{" "}
        its branch.
      </p>
      <h3 id="connect">Connecting GitHub or GitLab</h3>
      <p>
        If you are signed in with <code>gh auth login</code> or <code>glab auth login</code>, ddugit uses that token.
        Otherwise click <strong>Connect GitHub</strong> (or GitLab) and paste a token that can read and create pull
        requests. <strong>Create a token</strong> opens the right page. The token is stored only in your system&apos;s
        keychain, never in ddugit&apos;s settings. The key button in the section header lets you replace it, or{" "}
        <strong>Remove saved token</strong>. For a server other than github.com or gitlab.com, ddugit only uses the
        CLI&apos;s token if the CLI is signed in to that server, and warns you before you paste a token for it.
      </p>
      <h3 id="create-pr">Create a pull request</h3>
      <p>
        Right-click a local branch and choose <strong>Create PR…</strong>, or click <strong>+</strong> in the PR
        section&apos;s header for the current branch. Choose <strong>From</strong> and <strong>Into</strong> (it starts
        with the repository&apos;s default branch), and <strong>Remote</strong> if there are several. The{" "}
        <strong>Title</strong> and <strong>Description</strong> are filled in from the commits, which are listed below.
        Tick <strong>Create as draft</strong> if it isn&apos;t ready. If the branch isn&apos;t on the remote yet, or has
        newer commits, the button reads <strong>Push and create PR</strong> and pushes first. If a pull request is
        already open for the branch, ddugit links to it instead of making another.
      </p>
      <p>
        Public repositories on github.com and gitlab.com work in the free version. Private repositories and company
        servers (GitHub Enterprise, self-managed GitLab) need <Link href="/docs/pro-features">ddugit Pro</Link> for pull
        request features.
      </p>

      <h2 id="command-line">On the command line</h2>
      <p>Roughly what ddugit runs for you:</p>
      <Shell>{`
git switch -c feature/x                     # new branch
git switch --track origin/feature/x         # remote branch as local
git merge --no-ff feature/x                 # or --ff, or --squash
git rebase --autostash main
git fetch --all --prune
git pull --ff-only
git push -u origin feature/x                # first push
git push --force-with-lease
git branch --set-upstream-to=origin/feature/x
git fetch . origin/feature/x:feature/x      # fast-forward without checkout
git push origin --delete feature/x
git tag -a v1.0.0 -m "message" && git push origin v1.0.0
`}</Shell>
    </DocArticle>
  );
}
