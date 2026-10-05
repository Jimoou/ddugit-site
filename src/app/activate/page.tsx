import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplit } from "@/components/AuthSplit";
import { Devices } from "@/components/Devices";
import { activatePath, activationTarget, chooseLicense, licenseLabel, sha256Hex } from "@/lib/activate";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { activate } from "./actions";

export const metadata: Metadata = { title: "Activate ddugit Pro", robots: { index: false } };

type Params = { port?: string; state?: string; device?: string; name?: string };

/** Opened by the app (Settings → License → Activate): sign in, then send this computer's app its license. */
export default async function Activate({ searchParams }: { searchParams: Promise<Params> }) {
  const { port, state, device, name } = await searchParams;
  const target = activationTarget(port, state, device, name);
  if (!target)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>Open this from the app</h1>
        <p>In ddugit, go to Settings → License and choose “Activate with your ddugit.com account”.</p>
      </div>
    );

  const here = activatePath(target);
  const db = hasSupabase() ? await supabaseServer() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user)
    return (
      <AuthSplit
        eyebrow="Activate"
        title="Sign in to activate ddugit Pro"
        lead="Use the account you bought Pro with. The app on this computer turns Pro on right after."
        next={here}
        configured={!!db}
      />
    );

  const hash = target.device ? sha256Hex(target.device) : null;
  const [{ data: rows }, { data: devices }] = await Promise.all([
    db
      .from("licenses")
      .select("id, kind, plan, status, paid_through, max_devices, created_at")
      .order("created_at", { ascending: false }),
    db
      .from("devices")
      .select("license_id, device_hash, name, created_at, last_seen_at")
      .order("created_at", { ascending: true }),
  ]);
  const chosen = chooseLicense(rows ?? [], new Date().toISOString().slice(0, 10), devices ?? [], hash);
  if (!chosen)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>No ddugit Pro license</h1>
        <p>
          {user.email} has no Pro license. <Link href="/pricing">See pricing</Link>, or sign in on the{" "}
          <Link href="/account">account page</Link> with the account you bought it with.
        </p>
      </div>
    );

  const { license, slot } = chosen;
  const site = license.kind === "site";
  if (!site && !hash)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>Update ddugit first</h1>
        <p>
          This version of the app can’t activate a lifetime license. Update ddugit (it updates itself on start, or get
          the latest from the <Link href="/download">download page</Link>), then activate again.
        </p>
      </div>
    );

  const max = license.max_devices ?? 3;
  const mine = (devices ?? []).filter((d) => d.license_id === license.id);
  const full = slot === "full";
  return (
    <div className="page prose">
      <p className="eyebrow">Activate</p>
      <h1>{full ? `Your license is on ${max} devices` : "Activate ddugit Pro on this computer"}</h1>
      <section className="card">
        <h3>{licenseLabel(license)}</h3>
        <p>
          {user.email}
          {site ? "" : ` · ${mine.length} of ${max} devices`}
        </p>
      </section>
      {full ? (
        <>
          <p>
            One license works on up to {max} devices. Remove one you no longer use, then continue to add{" "}
            <strong>{target.name}</strong>.
          </p>
          <Devices devices={mine} back={here} />
          <p>
            <span className="button primary" aria-disabled="true">
              Continue
            </span>
          </p>
        </>
      ) : (
        <>
          {!site && slot === "free" && (
            <p className="muted small">
              This adds <strong>{target.name}</strong> as device {mine.length + 1} of {max}.
            </p>
          )}
          <form action={activate.bind(null, target)}>
            <button className="button primary">Activate ddugit</button>
          </form>
          <p className="muted small">
            Your browser hands the app a one-time code; the app keeps the license on this computer, with no need to go
            online again.
          </p>
        </>
      )}
    </div>
  );
}
