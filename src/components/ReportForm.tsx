"use client";

import { useState } from "react";

export type ReportKind = "bug" | "question";

const KINDS: { value: ReportKind; label: string; hint: string }[] = [
  { value: "bug", label: "Problem", hint: "Something in ddugit or on this site doesn't work" },
  { value: "question", label: "Question", hint: "Licensing, site licenses, or anything else" },
];

type State = { step: "edit" | "sending" } | { step: "sent" } | { step: "failed"; error: string };

/** The /contact form: posts to /api/report (source "web"), like the app's Report a problem. */
export function ReportForm({
  kind: initialKind = "bug",
  message: initialMessage = "",
}: {
  kind?: ReportKind;
  message?: string;
}) {
  const [kind, setKind] = useState<ReportKind>(initialKind);
  const [state, setState] = useState<State>({ step: "edit" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ step: "sending" });
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          message: String(form.get("message") ?? ""),
          email: String(form.get("email") ?? "").trim() || null,
          source: "web",
          website: String(form.get("website") ?? ""),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) setState({ step: "sent" });
      else setState({ step: "failed", error: body.error ?? "Couldn't send your message. Try again later." });
    } catch {
      setState({ step: "failed", error: "Couldn't reach ddugit.com. Check your connection and try again." });
    }
  }

  if (state.step === "sent")
    return (
      <div className="card report-sent" role="status">
        <h3>Thanks, we got it.</h3>
        <p>
          {kind === "bug"
            ? "We read every report. If you left an email address, we may write back with questions or a fix."
            : "We'll answer at the email address you gave, usually within a few days."}
        </p>
        <button className="button small" onClick={() => setState({ step: "edit" })}>
          Send another
        </button>
      </div>
    );

  const sending = state.step === "sending";
  return (
    <form className="report-form" onSubmit={submit}>
      <fieldset className="kind-choice">
        <legend>What is it about?</legend>
        {KINDS.map((k) => (
          <label key={k.value} className="kind-option">
            <input
              type="radio"
              name="kind"
              value={k.value}
              checked={kind === k.value}
              onChange={() => setKind(k.value)}
            />
            <span>
              <strong>{k.label}</strong>
              <span className="muted small">{k.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor="report-message">{kind === "bug" ? "What happened?" : "Your question"}</label>
        <textarea
          id="report-message"
          name="message"
          required
          rows={8}
          maxLength={5000}
          defaultValue={initialMessage}
          placeholder={
            kind === "bug"
              ? "What you did, what you expected, and what happened instead. Your ddugit version and OS help too."
              : "How can we help?"
          }
        />
      </div>

      <div className="field">
        <label htmlFor="report-email">
          Email{" "}
          <span className="muted">{kind === "bug" ? "(optional, if you'd like a reply)" : "(so we can answer)"}</span>
        </label>
        <input
          id="report-email"
          name="email"
          type="email"
          maxLength={254}
          autoComplete="email"
          required={kind === "question"}
        />
      </div>

      {/* Left empty by people, filled in by bots. */}
      <div className="trap" aria-hidden="true">
        <label htmlFor="report-website">Website</label>
        <input id="report-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.step === "failed" && (
        <p className="note" role="alert">
          {state.error}
        </p>
      )}

      <button className="button primary" disabled={sending}>
        {sending ? "Sending…" : "Send"}
      </button>
      <p className="muted small">
        We keep your message and email address only to answer you. The ddugit app can send a problem report too, with
        diagnostics you review before sending.
      </p>
    </form>
  );
}
