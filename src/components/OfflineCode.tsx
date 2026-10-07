"use client";

import { useRef, useState, useTransition } from "react";
import { type OfflineResult, getOfflineCode } from "@/app/account/actions";
import { Spinner } from "./Pending";

/**
 * "Offline activation code" on a license (as IntelliJ does it): a button that opens a dialog
 * with the license as text, to paste into ddugit on a computer without internet
 * (Settings → License → Paste license). The code is made when the dialog first opens.
 */
export function OfflineCode({ licenseId }: { licenseId: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<OfflineResult>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const open = () => {
    ref.current?.showModal();
    if (!result?.license) start(async () => setResult(await getOfflineCode(licenseId)));
  };
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
    <>
      <button type="button" className="button small" onClick={open}>
        Offline activation code
      </button>
      <dialog
        ref={ref}
        className="confirm"
        aria-label="Offline activation code"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="confirm-box">
          <h3>Offline activation code</h3>
          <div className="confirm-body">
            <p>
              For a computer without internet: in ddugit, open Settings → License → Paste license and paste this code.
              Keep it to your own computers.
            </p>
            {pending && <Spinner label="Making the code…" />}
            {result?.error && <p className="note">{result.error}</p>}
            {result?.license && (
              <textarea
                className="license-text"
                readOnly
                rows={5}
                value={result.license}
                aria-label="Offline activation code"
                onFocus={(e) => e.currentTarget.select()}
              />
            )}
          </div>
          <div className="confirm-actions">
            {result?.license && (
              <>
                <button type="button" className="button small" onClick={() => download(result.license!)}>
                  Download .txt
                </button>
                <button type="button" className="button small primary" onClick={() => copy(result.license!)}>
                  {copied ? "Copied" : "Copy code"}
                </button>
              </>
            )}
            <button type="button" className="button small" onClick={() => ref.current?.close()}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
