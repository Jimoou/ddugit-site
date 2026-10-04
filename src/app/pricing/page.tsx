import type { Metadata } from "next";
import { PRICES, SITE, won } from "@/site";

export const metadata: Metadata = { title: "Pricing" };

export default function Pricing() {
  return (
    <div className="page">
      <p className="eyebrow">Pricing</p>
      <h1>Same app for everyone</h1>
      <p className="muted">Every plan has every feature. The only difference is what you use it for.</p>
      <section className="grid tight">
        <article className="card">
          <p className="eyebrow">Free</p>
          <div className="price">{won(0)}</div>
          <p>Personal projects, students and open source. No limits.</p>
        </article>
        <article className="card focus">
          <p className="eyebrow">Commercial · monthly</p>
          <div className="price">
            {won(PRICES.monthly)}
            <span className="per"> / month</span>
          </div>
          <p>One user, billed monthly. Cancel any time.</p>
        </article>
        <article className="card focus">
          <p className="eyebrow">Commercial · yearly</p>
          <div className="price">
            {won(PRICES.yearly)}
            <span className="per"> / year</span>
          </div>
          <p>One user, billed yearly. Two months free compared with monthly.</p>
        </article>
        <article className="card">
          <p className="eyebrow">Air-gapped · site</p>
          <div className="price">Contact us</div>
          <p>An offline license for an entire organization without internet access.</p>
        </article>
      </section>
      <div className="actions start">
        <span className="button primary" aria-disabled="true">
          Buy — coming soon
        </span>
        <a className="button" href={`mailto:${SITE.contact}`}>
          Contact
        </a>
      </div>
      <p className="muted small">
        Using ddugit for work at a company, for client projects or to build paid products counts as commercial use.
        Prices in Korean won, VAT included. When a subscription ends, nothing is locked; the app reminds you to renew.
      </p>
    </div>
  );
}
