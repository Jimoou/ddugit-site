import type { Metadata } from "next";
import Link from "next/link";
import { NOINDEX } from "@/lib/seo";
import { CONTACT_EMAIL } from "@shared/contact.ts";

export const metadata: Metadata = { title: "Activate ddugit Pro", robots: NOINDEX };

/** Why the app couldn't finish, as it reports it (ddugit `activate.rs`, `failure_reason`). */
const REASONS: Record<string, { title: string; body: string }> = {
  signature: {
    title: "The app couldn’t verify the license",
    body: "ddugit.com sent the license, but this copy of ddugit didn’t accept its signature. Update ddugit to the latest version (Settings → About → Check for updates) and try again.",
  },
  "other-device": {
    title: "This license was made for another computer",
    body: "Try again from Settings → License on this computer.",
  },
  server: {
    title: "Activation didn’t finish",
    body: "The app shows the reason in Settings → License. Try again from there.",
  },
};

/** Where the app sends the browser once it has (or hasn't) got its license. */
export default async function Done({ searchParams }: { searchParams: Promise<{ result?: string; reason?: string }> }) {
  const { result, reason } = await searchParams;
  if (result === "ok")
    return (
      <div className="page prose center">
        <p className="eyebrow">Activate</p>
        <h1>ddugit Pro is on</h1>
        <p className="lead">You can close this tab and go back to the app.</p>
      </div>
    );
  const why = (reason && Object.hasOwn(REASONS, reason) ? REASONS[reason] : null) ?? REASONS.server;
  return (
    <div className="page prose center">
      <p className="eyebrow">Activate</p>
      <h1>{why.title}</h1>
      <p className="lead">{why.body}</p>
      <p className="muted small">
        If this computer now shows on your <Link href="/account">account page</Link>, that’s fine: trying again uses the
        same place. Still stuck? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
