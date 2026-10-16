import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { DocArticle } from "@/components/GuideArticle";
import { docMeta } from "@/lib/seo";

export const metadata: Metadata = docMeta("settings-and-shortcuts");

/** Keys pressed together, e.g. combo("⌘", "Shift", "F"). */
const combo = (...keys: string[]) =>
  keys.map((k, i) => (
    <Fragment key={k}>
      {i > 0 && " + "}
      <kbd>{k}</kbd>
    </Fragment>
  ));

/** Alternatives, e.g. either(combo("H"), combo("Esc")). */
const either = (...alts: ReactNode[]) =>
  alts.map((a, i) => (
    <Fragment key={i}>
      {i > 0 && " / "}
      {a}
    </Fragment>
  ));

/** A shortcut: what it does (the app's own words) and its keys on each system. */
interface Row {
  what: string;
  mac: ReactNode;
  win: ReactNode;
}

/** The same keys on both systems. */
const same = (what: string, keys: ReactNode): Row => ({ what, mac: keys, win: keys });
/** ⌘ on macOS, Ctrl on Windows, plus `keys`. */
const mod = (what: string, ...keys: string[]): Row => ({
  what,
  mac: combo("⌘", ...keys),
  win: combo("Ctrl", ...keys),
});

const SHORTCUTS: { group: string; rows: Row[] }[] = [
  {
    group: "Graph",
    rows: [
      same("Scroll along the timeline", "Wheel"),
      {
        what: "Zoom around the cursor",
        mac: <>{combo("⌘")} + wheel, pinch</>,
        win: <>{combo("Ctrl")} + wheel, pinch</>,
      },
      same("Move up and down", <>{combo("Shift")} + wheel</>),
      same("Zoom in / out", either(combo("+"), combo("-"))),
      same("Fit to view", combo("0")),
      same("Go to HEAD", combo("H")),
      same("Rotate the graph 90°", combo("R")),
      same("Lock or unlock the map (locked: no merge, cherry-pick or rebase by dragging)", combo("L")),
      same("Show or hide the minimap", combo("M")),
      mod("Collapse or expand the sidebar", "B"),
      mod("Reload the repository", "R"),
      same("Merge", "Drag a commit onto a branch tip"),
      { what: "Cherry-pick", mac: <>{combo("⌥ Option")} + drag</>, win: <>{combo("Alt")} + drag</> },
      same("Reorder commits on the current branch (rebase)", <>{combo("Shift")} + drag</>),
      {
        what: "Rebase the current branch onto another branch",
        mac: <>{combo("⌘")} + drag</>,
        win: <>{combo("Ctrl")} + drag</>,
      },
      same("Commit and branch menu", "Right-click"),
      {
        what: "Pick several commits (Shift: a line of them)",
        mac: (
          <>
            {combo("⌘")} + click, {combo("Shift")} + click
          </>
        ),
        win: (
          <>
            {combo("Ctrl")} + click, {combo("Shift")} + click
          </>
        ),
      },
      same("Previous (parent) / next (child) commit", either(combo("←"), combo("→"))),
      same("Nearest commit in the lane above / below", either(combo("↑"), combo("↓"))),
      same("Open the menu for the selected commit", combo("Enter")),
      same("Clear selection", combo("Esc")),
    ],
  },
  {
    group: "Search",
    rows: [mod("Search commits", "F"), same("Next / previous result", either(combo("Enter"), combo("Shift", "Enter")))],
  },
  {
    group: "Repository",
    rows: [
      mod("Fetch", "Shift", "F"),
      mod("Pull", "Shift", "P"),
      mod("Push", "Shift", "U"),
      mod("New branch", "Shift", "B"),
      mod("Stash all changes", "Shift", "S"),
      mod("Open the commit panel", "Shift", "C"),
    ],
  },
  {
    group: "Commits and changes",
    rows: [
      mod("Commit (in the message box)", "Enter"),
      same("Previous / next file in the diff", either(combo("["), combo("]"))),
      same("Select lines to stage", <>Click a line number, {combo("Shift")} + click</>),
    ],
  },
  {
    group: "Tabs",
    rows: [
      mod("Go to My repositories", "0"),
      mod("New tab (open, clone or create)", "T"),
      mod("Close tab", "W"),
      {
        what: "Next / previous tab",
        mac: either(combo("Control", "Tab"), combo("Control", "Shift", "Tab")),
        win: either(combo("Ctrl", "Tab"), combo("Ctrl", "Shift", "Tab")),
      },
      { what: "Go to tab 1–9", mac: combo("⌘", "1…9"), win: combo("Ctrl", "1…9") },
    ],
  },
  { group: "App", rows: [same("Settings and shortcuts", combo("?"))] },
];

export default function SettingsAndShortcuts() {
  return (
    <DocArticle
      slug="settings-and-shortcuts"
      lead="Where every ddugit setting lives and what it does, the full keyboard shortcut table for macOS and Windows, opening files in your own editor and diff tools, updates, your license, and how to reach us from the app."
    >
      <h2 id="open">Opening settings</h2>
      <p>
        Click <strong>Settings</strong> (the gear at the right end of the tab row), or press <kbd>?</kbd> anywhere
        outside a text field to open it straight at the shortcuts. Settings has seven sections, listed on the left:{" "}
        <strong>Appearance</strong>, <strong>Profiles</strong>, <strong>License</strong>, <strong>Git</strong>,{" "}
        <strong>External apps</strong>, <strong>Shortcuts</strong> and <strong>About</strong>. Changes apply at once;
        there is no save button.
      </p>
      <p>
        Settings are kept on this computer. ddugit also remembers your layout as you go: sidebar and panel widths,
        folded sidebar sections, the list or map view and the map&apos;s rotation. Branch colours and hidden branches
        are saved per repository.
      </p>

      <h2 id="appearance">Appearance</h2>
      <ul>
        <li>
          <strong>Language</strong>: <strong>Follow system</strong> (Korean if your system is set to Korean, English
          otherwise), 한국어 or English.
        </li>
        <li>
          <strong>Theme</strong>: <strong>System</strong>, <strong>Dark</strong> (the default) or <strong>Light</strong>
          .
        </li>
        <li>
          <strong>Map style</strong>: <strong>Gauge</strong> (the default), <strong>Route map</strong> or{" "}
          <strong>Space</strong>. See <Link href="/docs/branch-map#look">map styles and themes</Link>.
        </li>
        <li>
          <strong>Effects</strong>: <strong>Sparkle effects</strong>, <strong>Map backdrop (star chart / space)</strong>{" "}
          and <strong>Glow (space, dark theme)</strong>. Glow can only be changed with the Space style.
        </li>
        <li>
          <strong>Branch map</strong>: <strong>Show the minimap (M)</strong> and{" "}
          <strong>Lock the map: no merge, cherry-pick or rebase by dragging (L)</strong>.
        </li>
        <li>
          <strong>Confirm before</strong>: <strong>Fetch</strong>, <strong>Pull</strong> and <strong>Push</strong>. When
          ticked, ddugit shows what the operation will do and asks first. Pull and push are ticked by default; fetch
          only downloads, so it isn&apos;t. Ticking <strong>Don&apos;t ask again</strong> in one of those confirmations
          unticks it here.
        </li>
        <li>
          <strong>Commits to load at a time</strong>: 1,000, 3,000 (the default) or 10,000. This is how much history the
          map reads at once, and how much each <strong>Load older commits</strong> adds. Lower it if a very large
          repository feels slow.
        </li>
      </ul>

      <h2 id="profiles">Profiles</h2>
      <p>
        Profiles let you commit with a different name, email and signing key in different repositories, for example work
        and personal. Click <strong>+ Add profile</strong> to create one, with <strong>Signing</strong> set to a GPG or
        SSH key or <strong>Don&apos;t sign</strong>. The <strong>Global</strong> row shows your global Git identity;{" "}
        <strong>Use globally</strong> makes a profile your global identity, and{" "}
        <strong>Sign commits in every repository (global)</strong> turns signing on everywhere. You apply a profile to
        one repository from the name in the commit panel. More in{" "}
        <Link href="/docs/commits-and-changes">commits, staging and stashes</Link>.
      </p>

      <h2 id="license">License</h2>
      <p>
        ddugit is free to use without a license. A license unlocks <Link href="/docs/pro-features">Pro features</Link>.
        This section shows your plan and lets you activate or deactivate this computer.
      </p>
      <ul>
        <li>
          <strong>Activate with your ddugit.com account</strong> opens your browser. Sign in there, and Pro turns on in
          the app by itself. A license works on up to 3 devices.
        </li>
        <li>
          <strong>Paste license</strong> is for computers without internet access, and for site licenses: paste the
          offline activation code from <code>ddugit.com/account</code>, then click <strong>Apply license</strong>.
        </li>
        <li>
          <strong>Deactivate this device</strong> frees a slot for another computer. If ddugit.com can&apos;t be
          reached, the license is still removed here; remove the device at <code>ddugit.com/account</code> as well.{" "}
          <strong>Open ddugit.com/account</strong> takes you to your devices.
        </li>
      </ul>
      <p>
        No license yet? <strong>Buy a license</strong> goes to the purchase page, or see{" "}
        <Link href="/pricing">pricing</Link>.
      </p>

      <h2 id="git">Git</h2>
      <p>
        <strong>Git executable</strong> is the Git ddugit runs for every change. Leave it empty to use <code>git</code>{" "}
        from <code>PATH</code>, or enter a full path and click <strong>Verify and apply</strong>: ddugit runs it and
        shows its version, or the error. Apps opened from Finder on macOS may not see your terminal&apos;s{" "}
        <code>PATH</code>; if so, enter a path such as <code>/opt/homebrew/bin/git</code>. The{" "}
        <strong>Set Git location</strong> button in the <strong>Git not found</strong> dialog brings you here.
      </p>

      <h2 id="external">External apps</h2>
      <p>Pick the programs ddugit hands files to:</p>
      <ul>
        <li>
          <strong>Open files with</strong>: <strong>System default app</strong>, an editor by name (Visual Studio Code,
          Cursor, Windsurf, Zed, Sublime Text, IntelliJ IDEA, WebStorm or PyCharm, found on your <code>PATH</code>), or{" "}
          <strong>Other program…</strong> with its full path. ddugit shows the path and asks once more before it uses a
          program you entered yourself. Shells, interpreters, and programs inside a repository or a temporary folder are
          refused.
        </li>
        <li>
          <strong>External diff tool</strong> and <strong>External merge tool</strong>: by default ddugit uses whatever
          Git is set up with (<strong>As set in git</strong>). You can pick another tool Git knows, including ones you
          defined in Git config as <code>difftool.NAME.cmd</code>. ddugit opens them with <code>git difftool</code> and{" "}
          <code>git mergetool</code>.
        </li>
      </ul>
      <p>Where you use them:</p>
      <ul>
        <li>
          The folder button in the top bar (<strong>Open in file manager, terminal or editor</strong>):{" "}
          <strong>Reveal in Finder</strong> or <strong>Show in Explorer</strong>, <strong>Open folder</strong>,{" "}
          <strong>Open repository in</strong> your editor (once you have chosen one),{" "}
          <strong>Open terminal here</strong> and <strong>View all changes in diff tool</strong>.
        </li>
        <li>
          File menus in the commit panel, diffs and a commit&apos;s file list offer <strong>Open in default app</strong>
          , <strong>Open in</strong> your editor, <strong>Open terminal here</strong> and{" "}
          <strong>Open in diff tool</strong>. A file in a past commit also has <strong>Open this version</strong>, which
          opens a read-only copy, and a commit&apos;s menu has <strong>View all changes in diff tool</strong>.
        </li>
        <li>
          In the conflict sheet, <strong>Open in merge tool</strong> resolves one file in your merge tool. ddugit waits
          until you close the tool, then reads the result.
        </li>
      </ul>

      <h2 id="shortcuts">Keyboard shortcuts</h2>
      <p>
        The same table is in <strong>Settings → Shortcuts</strong>; press <kbd>?</kbd> to open it. Map keys such as{" "}
        <kbd>H</kbd> or <kbd>L</kbd> work whenever you&apos;re not typing in a field or using a dialog. The repository
        shortcuts use <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Shift</kbd> and work with a Korean input mode on, too.
      </p>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">macOS</th>
              <th scope="col">Windows</th>
            </tr>
          </thead>
          {SHORTCUTS.map((g) => (
            <tbody key={g.group}>
              <tr className="group">
                <th scope="colgroup" colSpan={3}>
                  {g.group}
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.what}>
                  <th scope="row">{r.what}</th>
                  <td>{r.mac}</td>
                  <td>{r.win}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p>
        <kbd>F5</kbd> also reloads the repository. ddugit watches your files and refreshes on its own, so you rarely
        need to. <strong>Stash all changes</strong> includes untracked files.
      </p>

      <h2 id="updates">Updates</h2>
      <p>
        ddugit checks for a new version when it starts and every six hours after that. When one is out, a notice says{" "}
        <strong>
          ddugit <em>version</em> is available.
        </strong>{" "}
        with <strong>Update and restart</strong> and <strong>Later</strong>. Later hides that version until the next
        time you start the app.
      </p>
      <p>
        To check yourself, open <strong>Settings → About</strong> and click <strong>Check for updates</strong>. It says{" "}
        <strong>You&apos;re on the latest version.</strong>, offers the update, or tells you why it couldn&apos;t check.
      </p>
      <p>
        If you installed ddugit from the Microsoft Store, the Store updates it instead. About then says{" "}
        <strong>Installed from the Microsoft Store, which keeps it up to date.</strong> and has no update button.
      </p>

      <h2 id="about">About</h2>
      <p>
        <strong>Settings → About</strong> shows the <strong>Version</strong> and your <strong>Plan</strong> (
        <strong>Pro</strong>, or <strong>Free · Pro features locked</strong>), with links to ddugit.com and the{" "}
        <strong>Privacy policy</strong>.
      </p>

      <h2 id="report">Reporting a problem or asking a question</h2>
      <p>
        You can write to us without leaving the app. Click <strong>Report a problem or ask a question</strong> in{" "}
        <strong>Settings → About</strong>. An unexpected error toast also has a <strong>Report</strong> button, and if a
        tab or the app stops working, the error screen has <strong>Report a problem</strong>.
      </p>
      <ol className="steps">
        <li>
          Choose <strong>Report a problem</strong> or <strong>Question</strong>.
        </li>
        <li>
          Describe <strong>What happened?</strong> (what you were doing and what went wrong), or write{" "}
          <strong>Your question</strong>.
        </li>
        <li>
          Add an <strong>Email for a reply (optional)</strong> if you want an answer.
        </li>
        <li>
          Decide on <strong>Include diagnostics</strong>: the app version, operating system, Git version, language, plan
          and recent errors. It&apos;s on for problems and off for questions. File and branch names, paths, addresses,
          emails and tokens are hidden, and you can edit or delete anything in the text before it goes.
        </li>
        <li>
          Click <strong>Send</strong>. Nothing is sent before that. <strong>Copy</strong> puts the whole report on your
          clipboard instead, if you&apos;d rather paste it somewhere yourself.
        </li>
      </ol>
      <p>
        Reports and questions go to ddugit.com. You can also reach us from the <Link href="/contact">contact page</Link>
        .
      </p>
    </DocArticle>
  );
}
