import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import DownloadButtons from "@/components/DownloadButtons";

export const metadata: Metadata = pageMeta("/download");

export default function Download() {
  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">Download</p>
        <h1>Get ddugit</h1>
        <p className="lead">
          No sign-up needed. Free has no time limit, <Link href="/pricing">Pro</Link> is a one-time purchase, and the
          app keeps itself up to date.
        </p>
        <div className="download-box">
          <DownloadButtons />
        </div>
      </header>

      <section className="platforms" aria-label="Install steps">
        <article className="panel">
          <h2>macOS</h2>
          <p className="muted small">macOS 11 or later · Apple silicon and Intel</p>
          <ol className="steps">
            <li>
              Open the downloaded <code>.dmg</code>.
            </li>
            <li>Drag ddugit into Applications.</li>
            <li>Open it. The app is notarized by Apple, so it starts right away.</li>
          </ol>
        </article>
        <article className="panel">
          <h2>Windows</h2>
          <p className="muted small">Windows 10 or later · 64-bit</p>
          <ol className="steps">
            <li>
              Run the downloaded <code>.exe</code>.
            </li>
            <li>
              If &ldquo;Windows protected your PC&rdquo; appears, choose <strong>More info</strong>, then{" "}
              <strong>Run anyway</strong>.
            </li>
          </ol>
          <p className="note">
            The Windows build isn&apos;t code-signed yet, which is why Windows shows that warning on first launch.
          </p>
        </article>
      </section>

      <section className="requirements">
        <h2>Requirements</h2>
        <p>
          ddugit uses the <a href="https://git-scm.com/downloads">Git</a> installed on your computer. Install it first
          if you don&apos;t have it.
        </p>
      </section>
    </div>
  );
}
