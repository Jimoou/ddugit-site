import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { AuthSplit } from "@/components/AuthSplit";
import { Devices } from "@/components/Devices";
import { licenseLabel } from "@/lib/activate";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Account" };

export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
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
  const [{ data: licenses }, { data: devices }] = await Promise.all([
    db
      .from("licenses")
      .select("id, kind, plan, seats, status, paid_through, max_devices, text, store_test")
      .order("created_at", { ascending: false }),
    db
      .from("devices")
      .select("license_id, device_hash, name, created_at, last_seen_at")
      .order("created_at", { ascending: true }),
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
      {licenses?.length ? (
        licenses.map((l) => {
          const mine = (devices ?? []).filter((d) => d.license_id === l.id);
          const max = (l.max_devices as number | null) ?? 3;
          return (
            <section key={l.id} className="card license">
              {l.kind === "site" ? (
                <>
                  <h3>
                    Site license · {l.seats} {l.seats === 1 ? "seat" : "seats"}
                  </h3>
                  <p className="muted small">
                    In the app, choose Settings → License → “Activate with your ddugit.com account”. Offline? Paste this
                    text there instead.
                  </p>
                  {l.text && <textarea className="license-text" readOnly rows={3} value={l.text as string} />}
                </>
              ) : (
                <>
                  <h3>
                    {licenseLabel(l)} · {mine.length} of {max} devices
                  </h3>
                  <p>
                    {l.plan === "lifetime"
                      ? "Paid once. Every future update included."
                      : l.paid_through
                        ? `Paid through ${l.paid_through}`
                        : "No end date"}
                    {l.status !== "active" ? ` · ${STATUS[l.status as string] ?? l.status}` : ""}
                    {l.store_test ? " · Test order" : ""}
                  </p>
                  <p className="muted small">
                    In the app, choose Settings → License → “Activate with your ddugit.com account”. Moving to a new
                    computer? Remove the old one here or in its app first.
                  </p>
                  <Devices devices={mine} back="/account" />
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
      <form action={signOut}>
        <button className="button">Sign out</button>
      </form>
    </div>
  );
}

const STATUS: Record<string, string> = {
  refunded: "Refunded",
  cancelled: "Cancelled",
  past_due: "Payment needed",
  expired: "Expired",
};
