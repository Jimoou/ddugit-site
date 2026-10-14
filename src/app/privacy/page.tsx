import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/site";

export const metadata: Metadata = pageMeta("/privacy");

/** Effective date of this policy; change it with every material edit. */
const UPDATED = "October 14, 2026";

export default function Privacy() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Privacy</h1>
      <p className="muted">Last updated {UPDATED}</p>
      <p>
        {SITE.maker} (&ldquo;we&rdquo;), the name under which {SITE.legalName}, an individual developer, publishes
        software, makes ddugit and runs {SITE.url.replace("https://", "")}. This page says what we collect, why, and who
        else handles it.
      </p>

      <h2>The app</h2>
      <p>
        ddugit never sends your repositories, commits or files anywhere. It contacts our servers only to check for app
        updates, when you send a problem report, and when you activate or remove Pro on a device (and once a day while
        Pro is on, to check the license is still valid). For that it sends a random id made for this computer;
        ddugit.com keeps only a hash of it, with the device name you see on your account page.
      </p>

      <h2>This site</h2>
      <p>
        Downloading needs no sign-in. When you buy or manage a license, signing in with GitHub or Google gives us your
        email address and name. We keep them with your license so you can manage it. We don&apos;t use advertising or
        tracking cookies; the only cookies keep you signed in.
      </p>

      <h2>Payments</h2>
      <p>
        Purchases are handled by Paddle.com, our reseller and merchant of record. Paddle collects your payment and
        billing details and processes them under{" "}
        <a href="https://www.paddle.com/legal/privacy">its own privacy policy</a>. We receive the order, your email
        address and name, never your card details.
      </p>

      <h2>Problem reports and questions</h2>
      <p>
        When you report a problem or ask a question, from the app or the <Link href="/contact">contact form</Link>, we
        keep what you send: your message, the email address if you give one, and from the app its version, your
        operating system and the diagnostics you see before sending. We use them only to answer you and fix ddugit. To
        limit abuse we keep a salted hash of your IP address, never the address itself.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Licenses, devices and reports are stored with Supabase; the site is hosted by Netlify. We don&apos;t sell or
        share your data with anyone else.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us for a copy of your data, or to delete it, at any time. Deleting your account data also removes
        your license, so tell us if you want to keep Pro.
      </p>

      <h2>Contact</h2>
      <p>
        {SITE.maker} ({SITE.legalName}) · <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
      </p>
    </div>
  );
}
