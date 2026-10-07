import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { AuthSplit } from "@/components/AuthSplit";
import { Devices } from "@/components/Devices";
import { licenseLabel } from "@/lib/activate";
import { OfflineActivate } from "@/components/OfflineActivate";
import { REFUND_DAYS, REFUND_REFUSED, type RefundRow, refundUntil, refundable } from "@shared/store.ts";
import { requestRefund, signOut } from "./actions";

export const metadata: Metadata = { title: "Account", robots: NOINDEX };

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; refund?: string; reason?: string }>;
}) {
  const { error, refund, reason } = await searchParams;
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
    <div className="page prose">
      <p className="eyebrow">Account</p>
      <h1>Your account</h1>
      <section className="card">
        <h3>{name}</h3>
        <p>{user.email}</p>
      </section>
      <h2>Licenses</h2>
      {refund === "requested" && (
        <p className="note">
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
      {licenses?.length ? (
        licenses.map((l) => {
          const mine = (devices ?? []).filter((d) => d.license_id === l.id);
          const max = (l.max_devices as number | null) ?? 3;
          return (
            <section key={l.id} id={l.id as string} className="card license">
              {l.kind === "site" ? (
                <>
                  <h3>
                    Site license · {l.seats} {l.seats === 1 ? "seat" : "seats"}
                  </h3>
                  <p className="muted small">
                    In the app, choose Settings → License → “Activate with your ddugit.com account”. Offline? Paste this
                    text there instead.
                  </p>
                  {l.text && l.status === "active" && (
                    <textarea className="license-text" readOnly rows={3} value={l.text as string} />
                  )}
                </>
              ) : (
                <>
                  <h3>
                    {licenseLabel(l)} · {mine.length} of {max} devices
                  </h3>
                  <p>
                    Paid once. Every future update included.
                    {l.status !== "active" ? ` · ${STATUS[l.status as string] ?? l.status}` : ""}
                    {l.store_test ? " · Test order" : ""}
                  </p>
                  <p className="muted small">
                    In the app, choose Settings → License → “Activate with your ddugit.com account”. Moving to a new
                    computer? Remove the old one here or in its app first.
                  </p>
                  <Devices devices={mine} back="/account" />
                  {l.status === "active" && <OfflineActivate licenseId={l.id as string} />}
                  <Refund row={l as RefundRow & { id: string }} />
                </>
              )}
            </section>
          );
        })
      ) : (
        <p>
          No licenses bought with {user.email} yet. <Link href="/pricing">See pricing</Link>
        </p>
      )}
      {admin?.length ? (
        <p>
          <Link href="/admin">Reports dashboard</Link>
        </p>
      ) : null}
      <form action={signOut}>
        <button className="button">Sign out</button>
      </form>
    </div>
  );
}

const STATUS: Record<string, string> = {
  refunded: "Refunded",
  revoked: "Revoked",
};

/** "Request a refund" while the license is in its refund period; "Refund requested" once asked. */
function Refund({ row }: { row: RefundRow & { id: string } }) {
  const why = refundable(row);
  if (why === "requested" && row.status === "active")
    return <p className="muted small">Refund requested · Pro turns off once Paddle completes it.</p>;
  if (why) return null;
  return (
    <details className="refund">
      <summary>Request a refund</summary>
      <p className="muted small">
        Within {REFUND_DAYS} days of payment (until {refundUntil(row.created_at)}) you get the full amount back, no
        questions asked. Pro stops working on all your devices once the refund goes through.
      </p>
      <form action={requestRefund.bind(null, row.id)}>
        <button className="button small">Refund my purchase</button>
      </form>
    </details>
  );
}
