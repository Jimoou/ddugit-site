import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = { title: "Thank you", robots: NOINDEX };

/** Where the store sends the buyer after paying (Lemon Squeezy → product → button link). */
export default function Thanks() {
  return (
    <div className="page prose">
      <p className="eyebrow">Thank you</p>
      <h1>Welcome to ddugit Pro</h1>
      <p>
        Your license is on its way to your account; it usually shows up within a minute. To turn Pro on, open ddugit and
        choose Settings → License → “Activate with your ddugit.com account”.
      </p>
      <p>
        <Link href="/account" className="button primary">
          See your license
        </Link>
      </p>
      <p className="muted small">
        Don’t see it on your account page? Make sure you’re signed in with the email you bought with, refresh in a
        moment, or <Link href="/download">download ddugit</Link> if you haven’t yet. Your receipt is in your inbox.
      </p>
    </div>
  );
}
