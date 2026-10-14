import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { PRO_PRICE, SITE, usd } from "@/site";
import { REFUND_DAYS } from "@shared/store.ts";

export const metadata: Metadata = pageMeta("/refunds");

/** Effective date of this policy; change it with every material edit (and the terms' refund section with it). */
const UPDATED = "October 14, 2026";

export default function Refunds() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Refund policy</h1>
      <p className="muted">Last updated {UPDATED}</p>

      <h2 id="what">What you can get back</h2>
      <p>
        ddugit Pro is a one-time purchase of {usd(PRO_PRICE)} (plus sales tax or VAT where it applies). If it isn&apos;t
        right for you, ask for a refund within {REFUND_DAYS} days of payment and you get the full amount back, tax
        included, no questions asked. There is no subscription, so there is nothing to cancel.
      </p>

      <h2 id="offline">Offline activation codes</h2>
      <p>
        An offline activation code turns Pro on for a computer that never goes online, and a refund can&apos;t turn it
        off there. So making the first offline code for a license ends its refund. Your account page asks before it
        makes one. Activating with your ddugit.com account keeps the refund open.
      </p>

      <h2 id="how">How to ask</h2>
      <ul>
        <li>
          On your <Link href="/account">account page</Link>: “Request a refund” on the license, until the date shown
          there.
        </li>
        <li>Through Paddle, with the link in your receipt email.</li>
        <li>
          By writing to us at <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> or through the{" "}
          <Link href="/contact?topic=question">contact form</Link>.
        </li>
      </ul>
      <p>
        Paddle, our reseller and merchant of record, processes the refund and returns the money to the way you paid. It
        can take a few business days to show up, depending on your bank.
      </p>

      <h2 id="after">After a refund</h2>
      <p>
        The license is turned off, and Pro stops working on your devices the next time ddugit checks the license. ddugit
        Free keeps working. A computer activated with an offline code never checks: after a refund you must stop using
        Pro there and remove its license (Settings → License).
      </p>

      <h2 id="later">After {REFUND_DAYS} days</h2>
      <p>
        Write to us if something went wrong, such as a duplicate charge or Pro not working on your computer. We look at
        every request.
      </p>

      <p>
        This policy is part of our <Link href="/terms#refunds">terms of use</Link>.
      </p>
    </div>
  );
}
