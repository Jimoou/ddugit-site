import type { Metadata } from "next";
import Link from "next/link";
import { PRICES, SITE, usd } from "@/site";

export const metadata: Metadata = { title: "Pricing" };

/** A table cell: included, not included, or a short note. */
type Cell = boolean | string;

/** What each plan covers; mirrors the app's Free / Pro lines (ddugit `pro.rs`). */
const GROUPS: { name: string; rows: { feature: string; free: Cell; pro: Cell }[] }[] = [
  {
    name: "Everyday Git",
    rows: [
      { feature: "Commit graph, commits, staging, diff", free: true, pro: true },
      { feature: "Drag to merge, rebase, cherry-pick", free: true, pro: true },
      { feature: "Interactive rebase, conflicts, stash, undo", free: true, pro: true },
      { feature: "Worktrees, submodules, Git LFS", free: true, pro: true },
      { feature: "GitHub and GitLab pull requests", free: "Public repositories", pro: "Private and self-hosted too" },
    ],
  },
  {
    name: "Many branches, many repositories",
    rows: [
      { feature: "Backport tracker", free: "Compare branches", pro: "Cherry-pick, export patches, ignore" },
      { feature: "Repositories dashboard", free: "Up to 3 repositories", pro: "Unlimited, batch pull and switch" },
      { feature: "Stacked branches", free: false, pro: "Stack and restack" },
      { feature: "Release notes", free: false, pro: "Markdown, grouped by type" },
      { feature: "Air-gapped transfer", free: false, pro: "Incremental bundles, checksums" },
    ],
  },
];

const PRO_LINES = [
  "Everything in Free",
  "Backports, stacked branches, release notes",
  "Unlimited dashboard with batch actions",
  "Private and self-hosted pull requests",
  "Air-gapped transfer",
];

const FAQ = [
  {
    q: "How does the trial work?",
    a: "Every new install runs with Pro on for 14 days. No account, no card. When the trial ends, the app moves to Free by itself.",
  },
  {
    q: "Do I need an account?",
    a: "Not to download or use ddugit. An account on ddugit.com is only for buying Pro and turning it on in the app.",
  },
  {
    q: "What happens if I cancel?",
    a: "Pro stays on until the end of the period you paid for. After that, Pro features lock. Your repositories and settings stay as they are.",
  },
  {
    q: "Does it work offline or in an air-gapped network?",
    a: "Licenses are verified on your computer, so ddugit works offline. A subscription renews itself online once a period. For a network with no internet access at all, a site license works fully offline: paste it into Settings → License.",
  },
  {
    q: "Is Pro per user?",
    a: "Yes, one subscription per person. For a larger team or an entire organization, a site license is usually simpler.",
  },
  {
    q: "Are taxes included?",
    a: "Prices are in US dollars. Sales tax or VAT is added at checkout where it applies.",
  },
];

function Mark({ value }: { value: Cell }) {
  if (value === true)
    return (
      <span className="yes" role="img" aria-label="Included">
        ✓
      </span>
    );
  if (value === false)
    return (
      <span className="no" role="img" aria-label="Not included">
        –
      </span>
    );
  return <>{value}</>;
}

function Lines({ items }: { items: string[] }) {
  return (
    <ul className="plan-lines">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export default function Pricing() {
  return (
    <div className="page">
      <header className="page-head center">
        <p className="eyebrow">Pricing</p>
        <h1>Free for everyday Git. Pro for teams.</h1>
        <p className="lead">
          Every new install includes a 14-day Pro trial. No sign-up and no card. When it ends, only Pro features lock.
        </p>
      </header>

      <section className="plans" aria-label="Plans">
        <article className="plan">
          <h2>Free</h2>
          <p className="price">
            {usd(0)}
            <span className="per">forever</span>
          </p>
          <p className="plan-desc">Everything you need for day-to-day Git. For anyone, for any use.</p>
          <Link href="/download" className="button">
            Download
          </Link>
          <Lines
            items={[
              "Commit graph with drag to merge",
              "Interactive rebase and conflicts",
              "Worktrees, submodules, Git LFS",
              "Public GitHub and GitLab PRs",
              "Dashboard for 3 repositories",
            ]}
          />
        </article>
        <article className="plan featured">
          <h2>Pro monthly</h2>
          <p className="price">
            {usd(PRICES.monthly)}
            <span className="per">per month</span>
          </p>
          <p className="plan-desc">One user, billed monthly. Cancel any time.</p>
          <span className="button primary" aria-disabled="true">
            Available soon
          </span>
          <Lines items={PRO_LINES} />
        </article>
        <article className="plan featured">
          <h2>
            Pro yearly <span className="badge">2 months free</span>
          </h2>
          <p className="price">
            {usd(PRICES.yearly)}
            <span className="per">per year</span>
          </p>
          <p className="plan-desc">One user, billed once a year.</p>
          <span className="button primary" aria-disabled="true">
            Available soon
          </span>
          <Lines items={PRO_LINES} />
        </article>
        <article className="plan">
          <h2>Site license</h2>
          <p className="price">Custom</p>
          <p className="plan-desc">Pro for an entire organization, online or offline.</p>
          <a className="button" href={`mailto:${SITE.contact}?subject=ddugit%20site%20license`}>
            Contact us
          </a>
          <Lines items={["Everything in Pro", "Seats for the whole organization", "Works fully offline"]} />
        </article>
      </section>
      <p className="plans-note">
        Checkout opens once our store is verified. Until then, the 14-day trial gives you every Pro feature.
      </p>

      <section className="section narrow" aria-labelledby="compare">
        <h2 id="compare" className="center">
          Compare plans
        </h2>
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Feature</span>
                </th>
                <th scope="col">Free</th>
                <th scope="col" className="pro-col">
                  Pro
                </th>
              </tr>
            </thead>
            {GROUPS.map((g) => (
              <tbody key={g.name}>
                <tr className="group">
                  <th scope="colgroup" colSpan={3}>
                    {g.name}
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.feature}>
                    <th scope="row">{r.feature}</th>
                    <td>
                      <Mark value={r.free} />
                    </td>
                    <td className="pro-col">
                      <Mark value={r.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="section narrow" aria-labelledby="faq">
        <h2 id="faq" className="center">
          Questions
        </h2>
        <dl className="faq">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="center muted">
          Something else? Write to <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
        </p>
      </section>
    </div>
  );
}
