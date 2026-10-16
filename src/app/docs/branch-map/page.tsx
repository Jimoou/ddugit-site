import type { Metadata } from "next";
import Link from "next/link";
import { DocArticle } from "@/components/GuideArticle";
import { Screen } from "@/components/Screen";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("branch-map");

export default function BranchMap() {
  return (
    <DocArticle
      slug="branch-map"
      lead="The branch map is ddugit's main view: your whole history drawn as lines and stops, which you pan and zoom like a map. This chapter covers how to move around it, what each mark means, how to search it, and how to change the way it looks."
    >
      <h2 id="move">Moving around</h2>
      <p>
        By default, time runs from left to right, so the newest commits are on the right. Each line of work keeps its
        own lane, and merges draw lines between lanes.
      </p>
      <ul>
        <li>
          <strong>Pan:</strong> drag an empty part of the map. A trackpad scrolls in both directions.
        </li>
        <li>
          <strong>Scroll:</strong> the mouse wheel scrolls along the timeline; <kbd>Shift</kbd> + wheel moves up and
          down across the lanes.
        </li>
        <li>
          <strong>Zoom:</strong> <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + wheel, or pinch on a trackpad, zooms around the pointer.{" "}
          <kbd>+</kbd> and <kbd>-</kbd> zoom in and out, and <kbd>0</kbd> fits the view. The map zooms from 8% to 300%.
        </li>
        <li>
          <strong>Go to HEAD:</strong> press <kbd>H</kbd> to centre the map on the commit you have checked out.
        </li>
        <li>
          <strong>Rotate:</strong> press <kbd>R</kbd> to turn the map 90°. Turned so time runs down the screen, the
          wheel scrolls history like a list.
        </li>
        <li>
          <strong>Keyboard:</strong> the arrow keys step through commits. <kbd>←</kbd> / <kbd>→</kbd> go to the parent
          or child, <kbd>↑</kbd> / <kbd>↓</kbd> to the nearest commit in the lane above or below, <kbd>Enter</kbd> opens
          the selected commit&apos;s menu, and <kbd>Esc</kbd> clears the selection.
        </li>
      </ul>
      <p>
        The controls at the bottom right of the map do the same: <strong>Zoom out (-)</strong>, the current zoom,{" "}
        <strong>Zoom in (+)</strong>, <strong>Fit to view (0)</strong>, <strong>Go to HEAD (H)</strong>, rotate (with
        the current angle), <strong>List</strong>, the minimap and the map lock.
      </p>
      <p>
        ddugit loads the most recent commits first: 3,000 by default, set under{" "}
        <strong>Commits to load at a time</strong> in{" "}
        <Link href="/docs/settings-and-shortcuts#appearance">settings</Link>. When there is more, the hint line at the
        bottom says <strong>showing the latest</strong> that many, and <strong>⋯ Load older commits</strong> at the old
        end of the map reads the next batch.
      </p>

      <h2 id="marks">What&apos;s on the map</h2>
      <ul>
        <li>
          <strong>Commits</strong> are the dots. Hover one for a card with its summary, the start of its message, who
          made it and when, and the files it changed. Click it to open it in the inspector on the right; right-click it
          for everything you can do with it.
        </li>
        <li>
          <strong>HEAD</strong> is the commit you have checked out, ringed and labelled with its branch. Next to it, the{" "}
          <strong>＋</strong> opens the commit panel and counts the files you have changed.
        </li>
        <li>
          <strong>Badges</strong> name the commits that branches and tags point to: local branches, remote branches
          (with a cloud mark), tags, and open pull or merge requests (<code>#12</code> on GitHub, <code>!12</code> on
          GitLab) with a mark for their checks or review. Right-click a badge for that branch&apos;s or tag&apos;s menu.
        </li>
        <li>
          <strong>Stashes</strong> are small diamonds next to the commit they were taken on. Click one to see what it
          holds.
        </li>
      </ul>
      <p>
        Pull request badges need GitHub or GitLab connected from the pull request section of the sidebar. For private
        repositories and self-hosted servers they are a <Link href="/pricing">Pro</Link> feature.
      </p>
      <Screen
        name="guides/pick-drag"
        alt="The branch map with branch and remote badges, a pull request badge #12 with a check mark, commit captions with docs and refactor chips, a stash diamond, and the ＋ node with 3 changes beside HEAD"
        caption="Badges, captions with type chips, a stash diamond, and ＋ beside HEAD."
      />

      <h3 id="captions">Commit captions and type chips</h3>
      <p>
        Each commit&apos;s summary is printed under its dot, on a small backing panel, in up to two lines. When a
        summary follows a known pattern, ddugit puts a coloured chip in front of it and shortens the text:
      </p>
      <ul>
        <li>
          Conventional Commits types such as <code>feat</code>, <code>fix</code>, <code>docs</code>, <code>perf</code>,{" "}
          <code>refactor</code>, <code>test</code> and <code>chore</code> (and close relatives like <code>build</code>{" "}
          or <code>ci</code>), with the scope kept: <code>feat(graph): Zoom to cursor</code> shows a <code>feat</code>{" "}
          chip and <code>graph Zoom to cursor</code>.
        </li>
        <li>
          <code>merge</code> for merge commits, shortened to <code>branch → target</code>; <code>revert</code> for
          reverts; <code>fixup!</code>, <code>squash!</code>, <code>amend!</code> and <code>WIP</code> commits.
        </li>
        <li>
          A pull request number at the end, such as <code>(#123)</code>, is pulled out and shown on its own.
        </li>
      </ul>

      <h3 id="zoom-levels">What changes as you zoom</h3>
      <p>The map shows less text the further out you go, so you can still read its shape:</p>
      <ul>
        <li>
          <strong>60% and closer:</strong> full captions with their chips.
        </li>
        <li>
          <strong>30% to 60%:</strong> captions become a short single line without the chip, and neighbours give way
          when there is no room. The commit you hover or select always shows its full caption.
        </li>
        <li>
          <strong>Below 80%:</strong> remote branch badges are hidden. Local branches, tags and pull requests stay.
        </li>
        <li>
          <strong>Below 50%:</strong> long straight runs of commits fold into a bar labelled with the number of commits.
          Click a bar to open it up.
        </li>
        <li>
          <strong>Below 30%:</strong> labels are hidden and only the lines remain.
        </li>
      </ul>

      <h2 id="minimap">Minimap and map lock</h2>
      <p>
        The minimap is a strip along the bottom of the map (or down the side, when the map is rotated) showing all the
        loaded history, with a box around the part on screen. Click or drag in it to jump. Press <kbd>M</kbd> or use the
        map button to show or hide it.
      </p>
      <p>
        Dragging one commit onto another merges, cherry-picks or rebases (see <a href="#drag">dragging on the map</a>).
        If you&apos;d rather not do that by accident, press <kbd>L</kbd> or click the lock to{" "}
        <strong>Lock the map</strong>. A locked map only pans when you drag; menus and buttons still work. Press{" "}
        <kbd>L</kbd> again to unlock. Both choices are also in <strong>Settings → Appearance → Branch map</strong>.
      </p>

      <h2 id="list">List view</h2>
      <p>
        Click <strong>List</strong> in the map controls to see history as a table instead: one row per commit with the
        graph lines, its branch, tag and pull request badges, the <strong>Message</strong>, <strong>Author</strong>,{" "}
        <strong>Date</strong> and <strong>Commit</strong> SHA. When you have uncommitted changes, a row at the top
        counts them; click it to open the commit panel. Use <kbd>↑</kbd> / <kbd>↓</kbd> to move, <kbd>Enter</kbd> or
        right-click for the menu, and <kbd>H</kbd> to jump to HEAD. Search, menus and multi-select work the same as on
        the map. Click the button again to go back to the map; ddugit remembers which one you used.
      </p>

      <h2 id="look">Map styles and themes</h2>
      <p>
        Open <strong>Settings → Appearance</strong> to change how the map is drawn. <strong>Map style</strong> has three
        choices:
      </p>
      <ul>
        <li>
          <strong>Gauge</strong> (the default): an instrument panel, with thin curved lines, small dots and plain text
          labels.
        </li>
        <li>
          <strong>Route map</strong>: a transit map, with thick lines that bend at 45°, stations for commits,
          interchanges for merges and route signs for branch names.
        </li>
        <li>
          <strong>Space</strong>: neon lines on a night sky with pill-shaped labels, and glow and twinkling stars in the
          dark theme.
        </li>
      </ul>
      <p>
        <strong>Theme</strong> is <strong>System</strong>, <strong>Dark</strong> (the default) or <strong>Light</strong>
        . System follows your operating system and switches when it does. Every map style has colours for both themes;
        in the light theme the map is drawn like a printed chart.
      </p>
      <p>
        Under <strong>Effects</strong>:
      </p>
      <ul>
        <li>
          <strong>Map backdrop (star chart / space)</strong>: a faint star chart behind Gauge and Route map, or a galaxy
          behind Space. Turn it off for a plain background. It also sets the home screen&apos;s background.
        </li>
        <li>
          <strong>Glow (space, dark theme)</strong>: the light around lines and commits. It only applies to the Space
          style in the dark theme.
        </li>
        <li>
          <strong>Sparkle effects</strong>: small animations, such as sparkles along the lines and a burst when a new
          commit appears. They start off if your system asks for reduced motion.
        </li>
      </ul>

      <h2 id="branches">Branch colours, focus and hiding</h2>
      <p>
        ddugit gives each lane a colour automatically. To choose your own, click the coloured dot next to a branch in
        the sidebar, or right-click a branch and choose <strong>Change branch colour…</strong>. Pick a hue and a shade,
        or type a <strong>Colour code</strong>; <strong>Auto</strong> goes back to the automatic colour. A local branch
        and its remote branch share the colour, and ddugit adjusts it so it stays readable in both themes. Colours are
        saved per repository.
      </p>
      <p>
        Click a branch in the sidebar to <strong>focus</strong> it: the map centres on its tip and highlights its
        history, dimming the rest. Click more branches to add them to the focus, click a focused one again to remove it,
        or click an empty part of the map to clear it.
      </p>
      <p>
        The eye next to a branch hides it: <strong>Hide on the branch map</strong> removes the commits that only that
        branch reaches, which is useful for old experiments or noisy bot branches. Hiding a local branch also hides the
        remote branch it tracks. The current branch can&apos;t be hidden. Click the eye again (
        <strong>Show on the branch map</strong>) to bring it back. Hidden branches are saved per repository.
      </p>

      <h2 id="select">Selecting several commits</h2>
      <p>
        <kbd>⌘</kbd>/<kbd>Ctrl</kbd>-click commits to pick them one at a time; <kbd>Shift</kbd>-click picks a whole line
        of commits up to the one you click. Right-click any picked commit to act on all of them:
      </p>
      <ul>
        <li>
          <strong>Cherry-pick 3 commits onto main…</strong> copies them onto the current branch, oldest first.
        </li>
        <li>
          <strong>Revert 3 commits…</strong> undoes commits that are on the current branch, newest first.
        </li>
        <li>
          <strong>Unpick 3 commits</strong> clears the selection.
        </li>
      </ul>
      <p>
        See <Link href="/guides/cherry-pick-backport">cherry-picking and backporting</Link> for the details.
      </p>

      <h2 id="search">Searching history</h2>
      <p>
        Press <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>F</kbd> to open the search bar over the map. Choose where to search
        under <strong>Search in</strong>:
      </p>
      <ul>
        <li>
          <strong>Graph</strong> (the default) filters the commits already loaded as you type. It matches the message,
          author name or email, branch and tag names, and SHA prefixes of four characters or more. Matching commits
          light up on the map; <kbd>Enter</kbd> and <kbd>Shift</kbd> + <kbd>Enter</kbd> step through them.{" "}
          <strong>Search all history</strong> repeats the search by message over everything.
        </li>
        <li>
          <strong>Message</strong>, <strong>Author</strong>, <strong>File</strong> and <strong>Content</strong> ask Git
          about the whole history when you press <kbd>Enter</kbd>, across all branches, remote branches and tags. File
          takes a path, folder or pattern such as <code>docs/*.md</code>, and follows a single file through renames.
          Content finds commits that added or removed some code or text. Message, Author and Content have a{" "}
          <strong>Regex</strong> option.
        </li>
      </ul>
      <p>
        Whole-history results are listed newest first, up to 200 at a time; narrow the search to see others. A search
        that runs for too long stops and shows what it found so far. Picking a result older than the loaded history
        loads more of it first, then centres the map on that commit.
      </p>

      <h2 id="drag">Dragging on the map</h2>
      <p>
        Commits can be dragged onto branch tips. Hold a key while you drag to choose what happens; a hint at the top of
        the map says what releasing will do before you let go.
      </p>
      <ul>
        <li>
          <strong>Drag</strong> a commit onto a branch tip to merge it into that branch. See{" "}
          <Link href="/docs/branches-and-remotes">branches, merges and remotes</Link>.
        </li>
        <li>
          <kbd>⌥ Option</kbd>/<kbd>Alt</kbd> + drag onto a branch tip to cherry-pick the commit onto it. See{" "}
          <Link href="/guides/cherry-pick-backport">cherry-picking</Link>.
        </li>
        <li>
          <kbd>Shift</kbd> + drag a commit of the current branch onto another of its commits to place it right after
          that one. The rearrange sheet opens with the new order for you to review. See{" "}
          <Link href="/guides/interactive-rebase">interactive rebase</Link>.
        </li>
        <li>
          <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + drag from the current branch&apos;s tip onto another branch&apos;s tip to
          rebase the current branch onto it. See{" "}
          <Link href="/docs/branches-and-remotes">branches, merges and remotes</Link>.
        </li>
      </ul>
      <p>
        Each drag asks you to confirm before anything changes. To turn dragging off, <a href="#minimap">lock the map</a>
        . Every shortcut for the map is in the <Link href="/docs/settings-and-shortcuts#shortcuts">shortcut table</Link>
        .
      </p>
    </DocArticle>
  );
}
