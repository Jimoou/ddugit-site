import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { AuthSplit } from "@/components/AuthSplit";
import { Devices } from "@/components/Devices";
import { OfflineCode } from "@/components/OfflineCode";
import { ConfirmSubmit, ForgetNotice, SubmitButton } from "@/components/Pending";
import { testLicensesAllowed } from "@/lib/activate";
import { REFUND_REFUSED, type RefundRow, refundUntil, refundable } from "@shared/store.ts";
import { requestRefund, signOut } from "./actions";

export const metadata: Metadata = { title: "Account", robots: NOINDEX };

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; refund?: string; reason?: string; notice?: string }>;
}) {
  const { error, refund, reason, notice } = await searchParams;
  const user = hasSupabase() ? (await (await supabaseServer()).auth.getUser()).data.user : null;

  if (!user) {
    return (
      <AuthSplit
        eyebrow="Account"
        title="Sign in to your account"
        lead="See your ddugit Pro license, manage the computers it's on, and get offline activation codes."
        configured={hasSupabase()}
        notice={error && <p className="note">Sign-in didn&apos;t go through. Please try again.</p>}
        aside={
          <>
            <Link href="/download">Downloading</Link> and using the app needs no account.
          </>
        }
      />
    );
  }

  const name = (user.user_metadata.full_name ?? user.user_metadata.user_name ?? user.email) as string;
  const db = await supabaseServer();
  const [{ data: licenses }, { data: devices }, { data: admin }] = await Promise.all([
    db
      .from("licenses")
      .select(
        "id, kind, plan, seats, status, max_devices, text, store_test, store_order_id, created_at, refund_requested_at, offline_issued_at",
      )
      .order("created_at", { ascending: false }),
    db
      .from("devices")
      .select("license_id, device_hash, name, created_at, last_seen_at")
      .order("created_at", { ascending: true }),
    // RLS shows a user only their own admin row, if any.
    db.from("admins").select("email").limit(1),
  ]);
  const testAllowed = testLicensesAllowed();
  return (
    <div className="page account">
      <header className="page-head center">
        <p className="eyebrow">Account</p>
        <h1>Your account</h1>
        <p className="account-who">
          <strong>{name}</strong>
          {name !== user.email && <span className="muted"> · {user.email}</span>}
        </p>
      </header>

      <div className="account-body">
        {(notice || refund) && <ForgetNotice />}
        {notice === "removed" && <p className="note ok">Device removed. Its place is free for another computer.</p>}
        {refund === "requested" && (
          <p className="note ok">
            Refund requested. Paddle sends the money back to how you paid; Pro turns off on your devices once it goes
            through.
          </p>
        )}
        {refund === "failed" && (
          // Only our own sentences, by code: the address can't make the page say anything else.
          <p className="note">
            {reason && Object.hasOwn(REFUND_REFUSED, reason)
              ? REFUND_REFUSED[reason as keyof typeof REFUND_REFUSED]
              : REFUND_REFUSED.failed}
          </p>
        )}

        {licenses?.some((l) => l.status === "active") && <HowToActivate />}

        <h2 className="section-label">Licenses</h2>
        {licenses?.length ? (
          licenses.map((l) => {
            const mine = (devices ?? []).filter((d) => d.license_id === l.id);
            const max = (l.max_devices as number | null) ?? 3;
            // A test order is shown, but can't be used where test orders don't work (live).
            const active = l.status === "active" && (!l.store_test || testAllowed);
            const site = l.kind === "site";
            return (
              <section key={l.id} id={l.id as string} className={active ? "card license" : "card license inactive"}>
                <div className="license-head">
                  <div>
                    <h3>{site ? "Site license" : "ddugit Pro"}</h3>
                    <p className="license-meta">
                      {site
                        ? `${l.seats} ${l.seats === 1 ? "seat" : "seats"} · works offline`
                        : `Lifetime · every update · bought ${day(l.created_at as string)}`}
                    </p>
                  </div>
                  <span className="license-badges">
                    {l.store_test && !testAllowed ? (
                      <span className="badge bad">Test order · not usable</span>
                    ) : (
                      <>
                        <StatusBadge status={l.status as string} requested={Boolean(l.refund_requested_at)} />
                        {l.store_test && <span className="badge warn">Test order</span>}
                      </>
                    )}
                  </span>
                </div>

                {site
                  ? l.text &&
                    active && (
                      <>
                        <p className="license-label">License text (paste it in the app on offline computers)</p>
                        <textarea className="license-text" readOnly rows={3} value={l.text as string} />
                      </>
                    )
                  : active && (
                      <>
                        <div className="license-label devices-label">
                          <span>Devices</span>
                          <span className={mine.length >= max ? "devices-count full" : "devices-count"}>
                            {mine.length} / {max}
                          </span>
                        </div>
                        <div className="meter" aria-hidden="true">
                          <span style={{ width: `${Math.min(100, (mine.length / max) * 100)}%` }} />
                        </div>
                        <Devices devices={mine} back="/account" />
                        <div className="license-actions">
                          {!l.refund_requested_at && (
                            <OfflineCode
                              licenseId={l.id as string}
                              refundUntil={
                                refundable(l as RefundRow)
                                  ? undefined
                                  : day(`${refundUntil(l.created_at as string)}T00:00:00Z`)
                              }
                            />
                          )}
                          <Refund row={l as RefundRow & { id: string }} />
                        </div>
                      </>
                    )}
              </section>
            );
          })
        ) : (
          <section className="card empty">
            <p>No licenses bought with {user.email} yet.</p>
            <p>
              <Link href="/pricing" className="button primary small">
                See pricing
              </Link>
            </p>
          </section>
        )}

        <div className="account-foot">
          {admin?.length ? <Link href="/admin">Reports dashboard</Link> : <span />}
          <form action={signOut}>
            <SubmitButton pending="Signing out…" className="button small">
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Where a license stands, in colour: active, refund on its way, or turned off. */
function StatusBadge({ status, requested }: { status: string; requested: boolean }) {
  if (status === "active")
    return requested ? <span className="badge warn">Refund requested</span> : <span className="badge ok">Active</span>;
  return <span className="badge bad">{STATUS[status] ?? status}</span>;
}

const STATUS: Record<string, string> = {
  refunded: "Refunded",
  revoked: "Revoked",
};

/** "Request a refund" while the license is in its refund period (the dialog says what happens); a note once asked. */
function Refund({ row }: { row: RefundRow & { id: string } }) {
  const why = refundable(row);
  if (why === "requested")
    return <p className="muted small">Refund on its way: Pro turns off once Paddle completes it.</p>;
  if (why === "offline" && refundable({ ...row, offline_issued_at: null }) === null)
    return <p className="muted small">No refund: an offline activation code was made for this license.</p>;
  if (why) return null;
  return (
    <form action={requestRefund.bind(null, row.id)}>
      <ConfirmSubmit
        title="Refund your ddugit Pro purchase?"
        body={
          <>
            <p>You get the full amount back to how you paid. This can&apos;t be undone:</p>
            <ul>
              <li>Pro turns off on all your devices once Paddle completes the refund.</li>
              <li>Offline activation codes stop working on computers that go online.</li>
              <li>To use Pro again later, you&apos;d buy a new license.</li>
            </ul>
          </>
        }
        confirm="Refund my purchase"
        pending="Requesting…"
      >
        Request a refund <span className="muted">· until {day(`${refundUntil(row.created_at)}T00:00:00Z`)}</span>
      </ConfirmSubmit>
    </form>
  );
}

/** How to turn Pro on, once for the page (not on every license). */
function HowToActivate() {
  return (
    <section className="howto">
      <h2 className="section-label">Turn Pro on</h2>
      <ol>
        <li>
          Open ddugit (<Link href="/download">download</Link>) → Settings → License.
        </li>
        <li>Choose “Activate with your ddugit.com account” and sign in with this account.</li>
      </ol>
      <p className="muted small">
        No internet on that computer? Use “Offline activation code” on your license below. Moving to a new computer?
        Remove the old one first.
      </p>
    </section>
  );
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
