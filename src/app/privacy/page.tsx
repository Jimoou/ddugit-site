import type { Metadata } from "next";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Privacy</h1>
      <p className="note">Draft. This policy will be finalised before sales open.</p>
      <h2>The app</h2>
      <p>
        ddugit never sends your repositories, commits or files anywhere. It contacts ddugit.com only to check for app
        updates and, with a subscription license, to renew that license.
      </p>
      <h2>This site</h2>
      <p>
        Downloading needs no sign-in. When you buy or manage a license, signing in with GitHub or Google gives us your
        email address and name.
      </p>
      <h2>Payments</h2>
      <p>Payments are handled by our payment provider. ddugit never receives or stores card details.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
      </p>
    </div>
  );
}
