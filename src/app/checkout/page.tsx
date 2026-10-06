import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthSplit } from "@/components/AuthSplit";
import { PaddleCheckout } from "@/components/PaddleCheckout";
import { NOINDEX } from "@/lib/seo";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { PADDLE, PRO_PRICE, STORE_OPEN, usd } from "@/site";

export const metadata: Metadata = { title: "Buy ddugit Pro", robots: NOINDEX };

/**
 * The pricing page's Pro button: sign in first (so the license lands on this ddugit.com
 * account), then Paddle's checkout with that email. `?guest` checks out without signing in
 * (the license goes to the email paid with). This is also the Paddle "default payment link":
 * `?_ptxn=txn_…` opens that transaction for anyone.
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
  if (transaction || query.guest !== undefined || !hasSupabase()) return checkout(null);

  const user = (await (await supabaseServer()).auth.getUser()).data.user;
  if (user?.email) return checkout(user.email);

  return (
    <AuthSplit
      eyebrow="Buy Pro"
      title="Sign in to buy ddugit Pro"
      lead={`Your ${usd(PRO_PRICE)} lifetime license goes to this account; the app turns Pro on when you sign in from it.`}
      next="/checkout"
      configured
      aside={
        <>
          Rather not? <Link href="/checkout?guest">Check out without signing in</Link>: the license goes to the email
          you pay with, and you sign in with that email later. <Link href="/pricing">Back to pricing</Link>
        </>
      }
    />
  );
}
