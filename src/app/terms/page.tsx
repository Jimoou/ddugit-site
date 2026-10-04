import type { Metadata } from "next";
import { SITE } from "@/site";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <div className="page prose">
      <p className="eyebrow">Legal</p>
      <h1>Terms of use</h1>
      <p className="note">Draft. These terms will be finalised before sales open.</p>
      <h2>1. Who may use ddugit for free</h2>
      <p>
        Personal projects, students and open-source projects may use ddugit for free. Using it for work at a company or
        for any paid activity needs a commercial license per user.
      </p>
      <h2>2. Subscriptions and cancelling</h2>
      <p>
        Commercial licenses are monthly or yearly subscriptions. If you cancel, you keep using it until the end of the
        paid period and are not charged again. When a subscription ends nothing is locked; the app shows a reminder.
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
