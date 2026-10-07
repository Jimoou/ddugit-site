import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { AuthSplit } from "@/components/AuthSplit";
import { Devices } from "@/components/Devices";
import { licenseLabel } from "@/lib/activate";
import { OfflineCode } from "@/components/OfflineCode";
import { ConfirmSubmit, SubmitButton } from "@/components/Pending";
import { REFUND_DAYS, REFUND_REFUSED, type RefundRow, refundUntil, refundable } from "@shared/store.ts";
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
        title="Sign in to ddugit"
        lead="Buy ddugit Pro and manage your license and devices here."
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
        "id, kind, plan, seats, status, max_devices, text, store_test, store_order_id, created_at, refund_requested_at",
      )
      .order("created_at", { ascending: false }),
    db
      .from("devices")
      .select("license_id, device_hash, name, created_at, last_seen_at")
      .order("created_at", { ascending: true }),
    // RLS shows a user only their own admin row, if any.
    db.from("admins").select("email").limit(1),
  ]);
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

        <h2 className="section-label">Licenses</h2>
        {licenses?.length ? (
          licenses.map((l) => {
            const mine = (devices ?? []).filter((d) => d.license_id === l.id);
            const max = (l.max_devices as number | null) ?? 3;
            const active = l.status === "active";
            return (
              <section key={l.id} id={l.id as string} className={active ? "card license" : "card license inactive"}>
                <div className="license-head">
                  <h3>
                    {l.kind === "site"
                      ? `Site license · ${l.seats} ${l.seats === 1 ? "seat" : "seats"}`
                      : licenseLabel(l)}
                  </h3>
                  <span className="license-badges">
                    <StatusBadge status={l.status as string} requested={Boolean(l.refund_requested_at)} />
                    {l.store_test && <span className="badge warn">Test order</span>}
                  </span>
                </div>
                {l.kind === "site" ? (
                  <>
                    <p className="muted small">
                      In the app, choose Settings → License → “Activate with your ddugit.com account”. Offline? Paste
                      this text there instead.
                    </p>
                    {l.text && active && (
                      <textarea className="license-text" readOnly rows={3} value={l.text as string} />
                    )}
                  </>
                ) : (
                  <>
                    <p className="license-facts">
                      <span>Paid once · every future update included</span>
                      <span className={mine.length >= max ? "devices-count full" : "devices-count"}>
                        {mine.length} of {max} devices
                      </span>
                    </p>
                    {active && (
                      <p className="muted small">
                        To turn Pro on, open ddugit → Settings → License → “Activate with your ddugit.com account”.
                        Moving to a new computer? Remove the old one below first.
                      </p>
                    )}
                    <Devices devices={mine} back="/account" />
                    {active && <OfflineCode licenseId={l.id as string} />}
                    <Refund row={l as RefundRow & { id: string }} />
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

/** "Request a refund" while the license is in its refund period; "Refund requested" once asked. */
function Refund({ row }: { row: RefundRow & { id: string } }) {
  const why = refundable(row);
  if (why === "requested" && row.status === "active")
    return <p className="muted small">Pro turns off once Paddle completes the refund.</p>;
  if (why) return null;
  return (
    <details className="license-action">
      <summary>Request a refund</summary>
      <p className="muted small">
        Within {REFUND_DAYS} days of payment (until {refundUntil(row.created_at)}) you get the full amount back, no
        questions asked. Pro stops working on all your devices once the refund goes through.
      </p>
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
          Refund my purchase
        </ConfirmSubmit>
      </form>
    </details>
  );
}
