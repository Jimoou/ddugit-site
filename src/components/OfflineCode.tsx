"use client";

import { useState, useTransition } from "react";
import { type OfflineResult, getOfflineCode } from "@/app/account/actions";
import { Spinner } from "./Pending";

/**
 * "Offline activation code" on a license (as IntelliJ does it): the license as text, to paste
 * into ddugit on a computer without internet (Settings → License → Paste license).
 */
export function OfflineCode({ licenseId }: { licenseId: string }) {
  const [result, setResult] = useState<OfflineResult>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const get = () => start(async () => setResult(await getOfflineCode(licenseId)));
  const copy = (text: string) =>
    navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  const download = (text: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text + "\n"], { type: "text/plain" }));
    a.download = "ddugit-pro-offline-activation-code.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <details className="license-action">
      <summary>Offline activation code</summary>
      <p className="muted small">
        For a computer without internet: in ddugit, open Settings → License → Paste license and paste this code. Keep it
        to your own computers.
      </p>
      {result?.license ? (
        <>
          <textarea
            className="license-text"
            readOnly
            rows={4}
            value={result.license}
            aria-label="Offline activation code"
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="actions-row">
            <button type="button" className="button small primary" onClick={() => copy(result.license!)}>
              {copied ? "Copied" : "Copy code"}
            </button>
            <button type="button" className="button small" onClick={() => download(result.license!)}>
              Download .txt
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="button small" disabled={pending} onClick={get}>
          {pending ? <Spinner label="Getting the code…" /> : "Get activation code"}
        </button>
      )}
      {result?.error && <p className="note">{result.error}</p>}
    </details>
  );
}
