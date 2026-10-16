import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { docMeta } from "@/lib/seo";
import { DEVICES, PRO_PRICE, usd } from "@/site";

export const metadata: Metadata = docMeta("pro-features");

export default function ProFeatures() {
  return (
    <DocArticle
      slug="pro-features"
      lead="ddugit Pro adds tools for work that spans many branches and many repositories: backports, stacked branches, release notes, air-gapped transfer, dashboard batch actions and pull requests on private servers."
    >
      <h2 id="free-and-pro">Free and Pro</h2>
      <p>
        Free has no time limit and covers everyday Git: the branch map, commits and staging, merging and rebasing by
        drag, interactive rebase, conflicts, stashes, undo, bisect, worktrees, submodules and Git LFS, and pull requests
        for public repositories on GitHub and GitLab. Nothing in the earlier chapters needs Pro, except where they say
        so.
      </p>
      <p>
        Pro is a single payment of {usd(PRO_PRICE)}: you keep it for good, with every future update, on up to {DEVICES}{" "}
        of your devices at a time. There is no subscription and no trial. For a whole organization, including networks
        with no internet access, there is a site license. See <Link href="/pricing">pricing</Link> for the comparison.
      </p>
      <p>
        Pro features stay visible on Free, with a Pro badge. Clicking one explains what it does, with{" "}
        <strong>Buy Pro</strong> and <strong>I already have a license</strong>. If you had Pro and it turns off, what
        you made with it, such as stacks and backport marks, stays in your repositories.
      </p>

      <h2 id="backports">Backports</h2>
      <p>
        The backport sheet lists the commits one branch has that another doesn&apos;t yet: fixes on <code>main</code>{" "}
        that a release branch still needs, or changes in the original project (<code>upstream/main</code>) that a
        customer&apos;s fork hasn&apos;t taken.
      </p>
      <p>
        Open it from a branch&apos;s menu with <strong>Backport: commits missing from &lt;your branch&gt;…</strong>, or
        with <strong>Backport…</strong> in the ⋯ menu above the branch list. Choose <strong>From</strong> (where fixes
        land) and <strong>Into</strong> (the branch that needs them). To compare with another repository, add it as a
        remote and choose its branch as <strong>From</strong>.
      </p>
      <p>Each commit gets a state:</p>
      <ul>
        <li>
          <strong>Missing</strong>: not on the target yet.
        </li>
        <li>
          <strong>Applied</strong>: the same change is already there under another commit ID (Git&apos;s{" "}
          <code>--cherry-mark</code> compares the patches).
        </li>
        <li>
          <strong>Applied (-x)</strong>: an earlier cherry-pick recorded this commit in its message (
          <code>cherry picked from commit …</code>). It counts even when that pick needed conflict fixes and the patch
          no longer matches.
        </li>
        <li>
          <strong>Ignored</strong>: you marked it as not needed for this target.
        </li>
      </ul>
      <p>
        Merge commits are left out, since their changes arrive with their parents. The tabs show the{" "}
        <strong>Missing</strong> commits, <strong>All</strong> of them, or <strong>By target</strong>: one row per local
        branch with its missing, applied and ignored counts against the same source, for when one repository carries
        several customers&apos; branches. The refresh button fetches every remote and compares again.
      </p>
      <Screen
        name="backport"
        alt="ddugit's backport sheet listing commits missing from a branch, with their states and selection boxes"
        caption="The backport sheet: every commit on From that Into doesn’t have yet."
      />
      <p>With Pro, tick the missing commits you want (or select all missing) and:</p>
      <ul>
        <li>
          <strong>Cherry-pick onto &lt;target&gt;</strong> applies them oldest first, each with <code>-x</code> so the
          next comparison recognises it. ddugit checks out the target first when needed.
        </li>
        <li>
          <strong>Export patches…</strong> writes them as numbered <code>.patch</code> files into a folder, for a
          repository you can&apos;t push to.
        </li>
        <li>
          <strong>Ignore</strong> and <strong>Unignore</strong> mark commits the target doesn&apos;t need. Marks are
          kept per target branch, in this repository only.
        </li>
      </ul>
      <p>
        Comparing is free. The <Link href="/guides/cherry-pick-backport">cherry-pick and backport guide</Link> walks
        through a full backport.
      </p>

      <h2 id="stacks">Stacked branches</h2>
      <p>
        A stack is a chain of small branches, each built on the one below, such as <code>main ← api ← ui</code>, so each
        can be reviewed as its own pull request. When a lower branch changes, every branch above it has to be moved onto
        its new tip. ddugit remembers the chain and does that in one step.
      </p>
      <p>Build stacks from a local branch&apos;s menu:</p>
      <ul>
        <li>
          <strong>Stack a new branch on this…</strong> creates a branch at this one&apos;s tip, stacked on it, and
          switches to it.
        </li>
        <li>
          <strong>Stack on another branch…</strong> puts an existing branch on a parent you pick, or moves it to
          another.
        </li>
        <li>
          <strong>Remove from stack</strong> takes a branch out. Its commits stay.
        </li>
      </ul>
      <p>
        Stacked branches appear in the <strong>Stacks</strong> section of the sidebar: one group per stack, starting
        from what it&apos;s built on, each branch indented under its parent with its number of commits. A branch whose
        parent has moved on says <strong>Needs restack</strong>; one whose parent was deleted says{" "}
        <strong>Parent branch missing</strong>, and you right-click it to choose another parent.
      </p>
      <p>
        <strong>Restack</strong> rebases each branch onto the one below it, from the bottom up, then returns you to the
        branch you were on. For each branch it remembers the parent&apos;s tip it was last built on and replays only the
        commits after that (<code>git rebase --onto &lt;parent&gt; &lt;base&gt; &lt;branch&gt;</code>). So when you
        amend a lower branch, or it is squash-merged, its old commits aren&apos;t replayed again on top. Commit or stash
        your changes first. If a rebase stops on conflicts, resolve them and continue, then click{" "}
        <strong>Restack</strong> again to carry on from there.
      </p>
      <p>
        The parent and base live in the repository&apos;s local Git config (
        <code>branch.&lt;name&gt;.ddugit-parent</code> and <code>branch.&lt;name&gt;.ddugit-base</code>), so they follow
        a branch when you rename it.
      </p>

      <h2 id="release-notes">Release notes</h2>
      <p>
        Right-click a tag or a local branch and choose <strong>Release notes up to here…</strong>. ddugit collects the
        changes between that point and <strong>From</strong>, which starts at the previous tag. Pick another tag, or{" "}
        <strong>First commit</strong> for everything.
      </p>
      <ul>
        <li>
          It reads the first-parent line, so a branch that takes pull requests gives one line per pull request (the
          squash commit or the merge commit), not every commit inside it.
        </li>
        <li>
          Lines are grouped by their Conventional Commits type: <strong>Breaking changes</strong>,{" "}
          <strong>Features</strong>, <strong>Bug fixes</strong>, <strong>Performance</strong>,{" "}
          <strong>Refactoring</strong> and <strong>Documentation</strong>. Each line has its pull or merge request
          number and author.
        </li>
        <li>
          <strong>Include other changes (chore, ci, test…)</strong> adds an <strong>Other changes</strong> group.
        </li>
        <li>
          Set the <strong>Title</strong>, edit the Markdown as you like, and click <strong>Copy Markdown</strong>. What
          you edit is what gets copied.
        </li>
      </ul>

      <h2 id="transfer">Air-gapped transfer</h2>
      <p>
        For networks with no connection to yours, such as a customer site or a secure lab, ddugit moves commits as Git
        bundle files you carry across. Open it from the ⋯ menu above the branch list:{" "}
        <strong>Air-gapped transfer…</strong>.
      </p>
      <h3 id="export">Export</h3>
      <ol className="steps">
        <li>
          Enter a <strong>Destination</strong>, such as the customer&apos;s name.
        </li>
        <li>
          Tick the <strong>Branches to send</strong>. Each shows what will go:{" "}
          <strong>Only changes since the last export</strong> to that destination, or{" "}
          <strong>Everything from the start</strong> the first time.
        </li>
        <li>
          Click <strong>Choose folder and export</strong>. ddugit writes the bundle and a <code>.sha256</code> file next
          to it, in <code>sha256sum</code> format, so the copy can be checked on either side, even without ddugit.
        </li>
      </ol>
      <p>
        ddugit remembers what each destination received, in the repository&apos;s local config, so the next bundle holds
        only new commits. <strong>Export everything again, ignoring past exports</strong> starts over, for example when
        the other side lost a bundle. <strong>Past exports</strong> lists what each destination last got.
      </p>
      <h3 id="import">Import</h3>
      <ol className="steps">
        <li>
          Switch to <strong>Import</strong> and click <strong>Choose bundle…</strong>.
        </li>
        <li>
          ddugit checks it first: whether the checksum matches its <code>.sha256</code> file (or that there is none),
          and whether this repository has the commits the bundle builds on. If it doesn&apos;t, import the earlier
          bundle first.
        </li>
        <li>
          Under <strong>Import as</strong>, give it a name and click <strong>Import</strong>. The branches arrive under{" "}
          <code>refs/remotes/&lt;name&gt;/</code> and show on the map like a remote&apos;s branches, ready to merge or
          check out.
        </li>
      </ol>

      <h2 id="dashboard">Dashboard: all repositories and batch actions</h2>
      <p>
        On Free, the dashboard shows the status of 3 repositories. Pro shows every one, and adds <strong>Pull</strong>{" "}
        (fast-forward only) and <strong>Branch…</strong> (switch every repository to one branch, creating it where
        needed) for a group or a selection of cards. See{" "}
        <Link href="/docs/multiple-repositories#batch">Many repositories</Link> for the details.
      </p>

      <h2 id="pull-requests">Pull requests on private and company servers</h2>
      <p>
        On Free, ddugit shows open pull requests and merge requests on the map for public repositories on github.com and
        gitlab.com. Pro adds private repositories and self-hosted servers, such as GitHub Enterprise and self-managed
        GitLab. Without Pro, those show “… integration for private repositories is a Pro feature” instead. Connecting
        your account and creating pull requests are covered in{" "}
        <Link href="/docs/branches-and-remotes">Branches, merges and remotes</Link>.
      </p>

      <h2 id="activate">Activate Pro</h2>
      <p>
        After buying Pro, open Settings (the gear, or <kbd>?</kbd>) and go to <strong>License</strong>.
      </p>
      <ol className="steps">
        <li>
          Click <strong>Activate with your ddugit.com account</strong>. Your browser opens ddugit.com.
        </li>
        <li>Sign in with the account you bought Pro with. Pro turns on in the app by itself.</li>
      </ol>
      <p>
        The license is checked on your computer, so ddugit works offline once Pro is on. Each activation uses one of
        your {DEVICES} devices. If all are in use, ddugit says so: free one first.
      </p>
      <h3 id="offline">A computer without internet</h3>
      <p>
        Open <strong>Paste license</strong> in the same section, paste the offline activation code from your account
        page on ddugit.com, and click <strong>Apply license</strong>. Site licenses are pasted here too.
      </p>
      <h3 id="deactivate">Move Pro to another computer</h3>
      <p>
        On the computer you&apos;re leaving, click <strong>Deactivate this device</strong> and confirm with{" "}
        <strong>Deactivate</strong>. That frees its place for another device. You can also remove a device on your
        account page on ddugit.com, for instance one you no longer have; ddugit turns Pro off on it the next time it
        checks.
      </p>
    </DocArticle>
  );
}
