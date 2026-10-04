import type { Metadata } from "next";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Terms of use</h1>
      <p className="note">Draft. These terms will be finalized before sales open.</p>
      <h2>1. Free and Pro</h2>
      <p>
        ddugit Free can be used by anyone, for any purpose. ddugit Pro adds the features listed on the pricing page and
        needs a Pro subscription per user, or a site license for an organization. Every new install includes a 14-day
        Pro trial.
      </p>
      <h2>2. Subscriptions and cancelling</h2>
      <p>
        Pro is a monthly or yearly subscription. If you cancel, Pro stays on until the end of the paid period and you
        are not charged again. When a subscription ends, Pro features lock; nothing you made with ddugit is changed or
        removed.
      </p>
      <h2>3. Refunds</h2>
      <p>Ask within 7 days of payment for a full refund.</p>
      <h2>4. Liability</h2>
      <p>ddugit runs the Git installed on your computer. Keep important repositories backed up on a remote.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
      </p>
    </div>
  );
}
