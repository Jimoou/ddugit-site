"use client";

import Link from "next/link";

/** A page that failed while rendering: say so in the site's own look, and offer to try again. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page prose center">
      <p className="eyebrow">Something went wrong</p>
      <h1>This page didn’t load</h1>
      <p className="lead">It may be a hiccup on our side. Try again in a moment.</p>
      <p className="actions center-actions">
        <button type="button" className="button primary" onClick={reset}>
          Try again
        </button>
        <Link href="/" className="button">
          Home
        </Link>
        <Link href="/contact" className="button">
          Tell us
        </Link>
      </p>
    </div>
  );
}
