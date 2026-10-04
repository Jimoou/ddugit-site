import type { Metadata } from "next";
import Link from "next/link";
import DownloadButtons from "@/components/DownloadButtons";

export const metadata: Metadata = { title: "Download" };

export default function Download() {
  return (
    <div className="page prose">
      <p className="eyebrow">Download</p>
      <h1>Get ddugit</h1>
      <p>
        No sign-up needed. Every install starts with a 14-day <Link href="/pricing">Pro</Link> trial.
      </p>
      <DownloadButtons />

      <h2>macOS</h2>
      <p>macOS 11 or later, Apple silicon and Intel. The app is notarized by Apple, so it opens right away.</p>
      <ol className="steps">
        <li>
          Open the downloaded <code>.dmg</code>.
        </li>
        <li>Drag ddugit into Applications.</li>
      </ol>

      <h2>Windows</h2>
      <p>Windows 10 or later, 64-bit.</p>
      <div className="note">
        The Windows build isn&apos;t code-signed yet, so the first launch may show &ldquo;Windows protected your
        PC&rdquo;.
      </div>
      <ol className="steps">
        <li>
          Run the downloaded <code>.exe</code>.
        </li>
        <li>
          If &ldquo;Windows protected your PC&rdquo; appears, choose <strong>More info</strong>.
        </li>
        <li>
          Choose <strong>Run anyway</strong> to install.
        </li>
      </ol>

      <h2>Requirements</h2>
      <p>
        <a href="https://git-scm.com/downloads">Git</a> installed on your computer. ddugit updates itself when a new
        version is out.
      </p>
    </div>
  );
}
