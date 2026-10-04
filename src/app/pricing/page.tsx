import type { Metadata } from "next";
import Link from "next/link";
import { PRICES, SITE, usd } from "@/site";

export const metadata: Metadata = { title: "Pricing" };

/** What each plan covers; mirrors the app's Free / Pro lines (ddugit `pro.rs`). */
const ROWS: { feature: string; free: string; pro: string }[] = [
  { feature: "Commit graph, commits, staging, diff", free: "✓", pro: "✓" },
  { feature: "Drag to merge, rebase, cherry-pick", free: "✓", pro: "✓" },
  { feature: "Interactive rebase, conflicts, stash, undo", free: "✓", pro: "✓" },
  { feature: "Worktrees, submodules, Git LFS", free: "✓", pro: "✓" },
  { feature: "GitHub / GitLab pull requests", free: "Public repositories", pro: "Private and self-hosted too" },
  { feature: "Backport tracker", free: "Compare branches", pro: "Cherry-pick, export patches, ignore" },
  {
    feature: "Repositories dashboard",
    free: "3 repositories, fetch all",
    pro: "All of them, batch pull and branch switch",
  },
  { feature: "Stacked branches", free: "—", pro: "Stack branches, restack in one go" },
  { feature: "Release notes", free: "—", pro: "Markdown by type, with pull requests" },
  { feature: "Air-gapped transfer", free: "—", pro: "Incremental bundles with checksums" },
];

export default function Pricing() {
  return (
    <div className="page">
      <p className="eyebrow">Pricing</p>
      <h1>Free for everyday Git. Pro for teams.</h1>
      <p className="muted">
        Every new install gets a 14-day Pro trial. No sign-up, no card. When it ends, only Pro features lock.
      </p>

      <section className="grid tight">
        <article className="card">
          <p className="eyebrow">Free</p>
          <div className="price">{usd(0)}</div>
          <p>Everything you need to work with Git, for anyone.</p>
        </article>
        <article className="card focus">
          <p className="eyebrow">Pro · monthly</p>
          <div className="price">
            {usd(PRICES.monthly)}
            <span className="per"> / month</span>
          </div>
          <p>One user. Cancel any time.</p>
        </article>
        <article className="card focus">
          <p className="eyebrow">Pro · yearly</p>
          <div className="price">
            {usd(PRICES.yearly)}
            <span className="per"> / year</span>
          </div>
          <p>One user. Two months free compared with monthly.</p>
        </article>
        <article className="card">
          <p className="eyebrow">Air-gapped · site</p>
          <div className="price">Contact us</div>
          <p>Pro for an entire organization without internet access, as an offline license.</p>
        </article>
      </section>

      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">Free</th>
              <th scope="col">Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.feature}>
                <th scope="row">{r.feature}</th>
                <td>{r.free}</td>
                <td>{r.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions start">
        <Link href="/download" className="button primary">
          Download and try Pro
        </Link>
        <span className="button" aria-disabled="true">
          Buy Pro — coming soon
        </span>
        <a className="button" href={`mailto:${SITE.contact}`}>
          Contact
        </a>
      </div>
      <p className="muted small">
        Prices in US dollars. Sales tax or VAT is added at checkout where it applies. When a subscription ends, nothing
        you made changes; Pro features lock until you renew.
      </p>
    </div>
  );
}
