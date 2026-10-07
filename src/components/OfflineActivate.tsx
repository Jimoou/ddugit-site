"use client";

import { useActionState } from "react";
import { type OfflineResult, activateOffline } from "@/app/account/actions";

/**
 * "Activate an offline computer" on a license: paste the code the app shows (Settings →
 * License → Paste license), get back the license signed for that computer, paste it there.
 */
export function OfflineActivate({ licenseId }: { licenseId: string }) {
  const [result, act, pending] = useActionState<OfflineResult, FormData>(activateOffline.bind(null, licenseId), null);
  return (
    <details className="offline">
      <summary>Activate an offline computer</summary>
      <p className="muted small">
        On the computer without internet, open ddugit → Settings → License → Paste license and copy its code. Paste it
        here, then paste the license you get back into that computer&apos;s app. It counts as one of your devices.
      </p>
      <form action={act} className="offline-form">
        <div className="field">
          <label htmlFor={`${licenseId}-code`}>Device code</label>
          <input
            id={`${licenseId}-code`}
            name="code"
            required
            autoComplete="off"
            spellCheck={false}
            pattern="[A-Za-z0-9_\-]{43}"
            placeholder="43 letters and digits from the app"
          />
        </div>
        <div className="field">
          <label htmlFor={`${licenseId}-name`}>
            Name <span className="muted">(optional)</span>
          </label>
          <input id={`${licenseId}-name`} name="name" maxLength={64} placeholder="Offline computer" />
        </div>
        <button className="button small" disabled={pending}>
          {pending ? "Activating…" : "Get license"}
        </button>
      </form>
      {result?.error && <p className="note">{result.error}</p>}
      {result?.license && (
        <>
          <p className="small">Paste this into the offline computer&apos;s app (Settings → License → Paste license):</p>
          <textarea
            className="license-text"
            readOnly
            rows={4}
            value={result.license}
            aria-label="License for the offline computer"
          />
        </>
      )}
    </details>
  );
}
