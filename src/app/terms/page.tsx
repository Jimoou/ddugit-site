import type { Metadata } from "next";
import { DEVICES, SITE } from "@/site";

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
        needs a Pro license per person, or a site license for an organization.
      </p>
      <h2>2. Lifetime license and devices</h2>
      <p>
        A Pro license is a single payment. It does not expire and covers every future version of ddugit. One license can
        be active on up to {DEVICES} devices at a time; to use it on another one, first remove a device in the app or on
        your account page.
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
