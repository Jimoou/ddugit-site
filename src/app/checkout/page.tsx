import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthSplit } from "@/components/AuthSplit";
import { PaddleCheckout } from "@/components/PaddleCheckout";
import { ownsPro } from "@/lib/activate";
import { NOINDEX } from "@/lib/seo";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { PADDLE, PRO_PRICE, STORE_OPEN, usd } from "@/site";

export const metadata: Metadata = { title: "Buy ddugit Pro", robots: NOINDEX };

/**
 * The pricing page's Pro button: sign in first (so the license lands on this ddugit.com
 * account, and one account holds one Pro license), then Paddle's checkout with that email.
 * Someone who already owns Pro is sent to their account instead of buying it again. This is
 * also the Paddle "default payment link": `?_ptxn=txn_…` opens that transaction for anyone.
 */
export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await connection(); // per visitor: who is signed in decides what opens
  if (!STORE_OPEN) redirect("/pricing");
  const query = await searchParams;
  const transaction = /^txn_[a-z0-9]+$/i.test(query._ptxn ?? "");
  const checkout = (email: string | null) => <PaddleCheckout {...PADDLE} email={email} transaction={transaction} />;
  if (transaction || !hasSupabase()) return checkout(null);

  const db = await supabaseServer();
  const user = (await db.auth.getUser()).data.user;
  if (user?.email) {
    const { data: licenses } = await db.from("licenses").select("kind, status");
    return ownsPro(licenses ?? []) ? <AlreadyPro /> : checkout(user.email);
  }

  return (
    <AuthSplit
      eyebrow="Buy Pro"
      title="Sign in to buy ddugit Pro"
      lead={`Your ${usd(PRO_PRICE)} lifetime license is added to this account. To turn Pro on, you sign in with it from the app.`}
      next="/checkout"
      configured
      aside={
        <>
          Signing in keeps your license and devices in one place. <Link href="/pricing">Back to pricing</Link>
        </>
      }
    />
  );
}

/** For a buyer who already owns Pro: one lifetime license per person already covers every update. */
function AlreadyPro() {
  return (
    <div className="page prose center">
      <p className="eyebrow">Buy Pro</p>
      <h1>You already own ddugit Pro</h1>
      <p>
        Your lifetime license covers every future update. To use it on another computer, remove one you no longer use on
        your account page, or activate an offline computer there.
      </p>
      <p className="actions">
        <Link href="/account" className="button primary">
          Go to your account
        </Link>
      </p>
      <p className="muted small">
        Need Pro for more people? <Link href="/contact?topic=site-license">Ask about a site license</Link>.
      </p>
    </div>
  );
}
