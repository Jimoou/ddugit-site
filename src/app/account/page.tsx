import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { SignInButtons } from "@/components/SignIn";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Account" };

export default async function Account({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const user = hasSupabase() ? (await (await supabaseServer()).auth.getUser()).data.user : null;

  if (!user) {
    return (
      <div className="page prose">
        <p className="eyebrow">Account</p>
        <h1>Sign in</h1>
        <p>Buy and manage ddugit Pro here. Downloading and using the app needs no account.</p>
        {error && <p className="note">Sign-in didn&apos;t go through. Please try again.</p>}
        {hasSupabase() ? <SignInButtons /> : <p className="muted small">Sign-in opens soon.</p>}
      </div>
    );
  }

  const name = (user.user_metadata.full_name ?? user.user_metadata.user_name ?? user.email) as string;
  const { data: licenses } = await (
    await supabaseServer()
  )
    .from("licenses")
    .select("id, kind, plan, seats, status, paid_through, text")
    .order("created_at", { ascending: false });
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
        licenses.map((l) => (
          <section key={l.id} className="card license">
            <h3>
              {l.kind === "site" ? "Site license" : (PLAN[l.plan as string] ?? "Commercial")} · {l.seats}{" "}
              {l.seats === 1 ? "seat" : "seats"}
            </h3>
            <p>
              {l.paid_through ? `Paid through ${l.paid_through}` : "No end date"} ·{" "}
              {STATUS[l.status as string] ?? l.status}
            </p>
            <p className="muted small">
              In the app, choose Settings → License → “Activate with your ddugit.com account”. Offline? Paste this text
              there instead. While the subscription runs, the app renews it by itself.
            </p>
            <textarea className="license-text" readOnly rows={3} value={l.text as string} />
          </section>
        ))
      ) : (
        <p>
          No licenses bought with {user.email} yet. Subscriptions open soon. <Link href="/pricing">See pricing</Link>
        </p>
      )}
      <form action={signOut}>
        <button className="button">Sign out</button>
      </form>
    </div>
  );
}

const PLAN: Record<string, string> = { monthly: "Monthly subscription", yearly: "Yearly subscription" };
const STATUS: Record<string, string> = {
  active: "Active",
  on_trial: "Trial",
  cancelled: "Cancelled (runs to the end of the period)",
  past_due: "Payment needed",
  expired: "Expired",
};
