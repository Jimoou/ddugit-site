import Link from "next/link";

/** Any address the site doesn't have. */
export default function NotFound() {
  return (
    <div className="page prose center">
      <p className="eyebrow">404</p>
      <h1>This page isn’t here</h1>
      <p className="lead">The link may be old or mistyped. These are the places most people are looking for:</p>
      <p className="actions center-actions">
        <Link href="/" className="button primary">
          Home
        </Link>
        <Link href="/download" className="button">
          Download
        </Link>
        <Link href="/pricing" className="button">
          Pricing
        </Link>
        <Link href="/account" className="button">
          Account
        </Link>
      </p>
    </div>
  );
}
