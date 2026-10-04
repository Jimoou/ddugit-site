import type { Metadata } from "next";
import Link from "next/link";
import { SignInButtons } from "@/components/SignIn";
import { activationTarget, usableLicense } from "@/lib/activate";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { activate } from "./actions";

export const metadata: Metadata = { title: "Activate ddugit Pro", robots: { index: false } };

/** Opened by the app (Settings → License → Activate): sign in, then send this computer's app its license. */
export default async function Activate({ searchParams }: { searchParams: Promise<{ port?: string; state?: string }> }) {
  const { port, state } = await searchParams;
  const target = activationTarget(port, state);
  if (!target)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>Open this from the app</h1>
        <p>In ddugit, go to Settings → License and choose “Activate with your ddugit.com account”.</p>
      </div>
    );

  const here = `/activate?port=${target.port}&state=${target.state}`;
  const db = hasSupabase() ? await supabaseServer() : null;
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (!db || !user)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>Sign in to activate ddugit Pro</h1>
        <p>Use the account you bought Pro with. The app on this computer turns Pro on right after.</p>
        {db ? <SignInButtons next={here} /> : <p className="muted small">Sign-in opens soon.</p>}
      </div>
    );

  const { data: rows } = await db
    .from("licenses")
    .select("id, kind, plan, seats, status, paid_through, created_at")
    .order("created_at", { ascending: false });
  const license = usableLicense(rows ?? [], new Date().toISOString().slice(0, 10));
  if (!license)
    return (
      <div className="page prose">
        <p className="eyebrow">Activate</p>
        <h1>No active Pro subscription</h1>
        <p>
          {user.email} has no Pro subscription running. <Link href="/pricing">See pricing</Link>, or sign in on the{" "}
          <Link href="/account">account page</Link> with the account you bought it with.
        </p>
      </div>
    );

  return (
    <div className="page prose">
      <p className="eyebrow">Activate</p>
      <h1>Activate ddugit Pro on this computer</h1>
      <section className="card">
        <h3>
          {license.kind === "site" ? "Site license" : license.plan === "yearly" ? "Pro · yearly" : "Pro · monthly"}
        </h3>
        <p>
          {user.email}
          {license.paid_through ? ` · paid through ${license.paid_through}` : ""}
        </p>
      </section>
      <form action={activate.bind(null, String(target.port), target.state)}>
        <button className="button primary">Activate ddugit</button>
      </form>
      <p className="muted small">
        Your browser hands the app a one-time code; the app keeps the license and renews it by itself.
      </p>
    </div>
  );
}
