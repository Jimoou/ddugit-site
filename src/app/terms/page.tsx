import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { DEVICES, PRO_PRICE, SITE, usd } from "@/site";

export const metadata: Metadata = pageMeta("/terms");

/** Effective date of these terms; change it with every material edit. */
const UPDATED = "October 14, 2026";

export default function Terms() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Terms of use</h1>
      <p className="muted">Last updated {UPDATED}</p>
      <p>
        ddugit is a desktop Git client for macOS and Windows, made and sold by {SITE.maker}, the name under which{" "}
        {SITE.legalName}, an individual developer, publishes software (&ldquo;we&rdquo;). These terms cover the ddugit
        app, ddugit Pro and this website, {SITE.url.replace("https://", "")}. By downloading ddugit or buying Pro you
        agree to them.
      </p>

      <h2 id="free">1. ddugit Free</h2>
      <p>
        ddugit Free can be downloaded and used by anyone, for any purpose, personal or commercial, with no time limit
        and no account.
      </p>

      <h2 id="pro">2. ddugit Pro</h2>
      <p>
        ddugit Pro adds the features listed on the <Link href="/pricing">pricing page</Link>. It is a lifetime license
        bought with a single payment of {usd(PRO_PRICE)} (plus sales tax or VAT where it applies): it does not expire,
        there is no subscription, and it covers every future version of ddugit.
      </p>
      <p>
        A Pro license is for one person. It can be active on up to {DEVICES} of that person&apos;s devices at a time; to
        use it on another one, first remove a device in the app or on your account page. Don&apos;t share, resell or
        publish your license. An organization that wants Pro for many people can ask us for a site license.
      </p>
      <p>
        The license is delivered digitally: after payment it appears on your ddugit.com account, and you turn Pro on by
        signing in from the app. No physical goods are shipped.
      </p>

      <h2 id="payments">3. Payments</h2>
      <p>
        Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all
        our orders. Paddle provides all customer service inquiries and handles returns.
      </p>

      <h2 id="refunds">4. Refunds</h2>
      <p>
        If ddugit Pro isn&apos;t right for you, ask for a refund within 14 days of payment and you get the full amount
        back, no questions asked, unless you made an offline activation code for that license (a computer that never
        goes online would keep Pro, so the first code ends the refund). Request it on your account page, through Paddle
        (the link in your receipt email) or by writing to us. Once the refund goes through, the license is turned off
        and Pro stops working on your devices at their next check. A computer activated offline never checks: after a
        refund you must stop using Pro there and remove its license (Settings → License). The{" "}
        <Link href="/refunds">refund policy</Link> has the details.
      </p>

      <h2 id="use">5. Using ddugit</h2>
      <p>
        ddugit works on your repositories through the Git installed on your computer. It never uploads your code. Keep
        important repositories backed up on a remote: we are not responsible for lost work. Don&apos;t try to get around
        the license check or the device limit.
      </p>

      <h2 id="warranty">6. Warranty and liability</h2>
      <p>
        ddugit is provided &ldquo;as is&rdquo;, without warranties of any kind. To the extent the law allows, we are not
        liable for indirect or consequential damages, and our total liability is limited to the amount you paid for
        ddugit Pro. Nothing here limits rights you have under consumer protection law.
      </p>

      <h2 id="changes">7. Changes</h2>
      <p>
        We may update these terms; the date above shows the latest version. Changes never take away a Pro license you
        already bought.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        {SITE.maker} ({SITE.legalName}) · <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> ·{" "}
        <Link href="/contact">contact form</Link>
      </p>
    </div>
  );
}
