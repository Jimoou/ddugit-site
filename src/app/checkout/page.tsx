import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthSplit } from "@/components/AuthSplit";
import { checkoutUrl } from "@/lib/checkout";
import { hasSupabase } from "@/lib/supabase/config";
import { supabaseServer } from "@/lib/supabase/server";
import { CHECKOUT_URL, PRO_PRICE, usd } from "@/site";

export const metadata: Metadata = { title: "Buy ddugit Pro", robots: { index: false } };

/**
 * The pricing page's Pro button: sign in first (so the license lands on this
 * ddugit.com account), then on to the store's checkout with that email.
 */
export default async function Checkout() {
  await connection(); // per visitor: who is signed in decides where this goes
  if (!CHECKOUT_URL) redirect("/pricing");
  if (!hasSupabase()) redirect(CHECKOUT_URL);
  const user = (await (await supabaseServer()).auth.getUser()).data.user;
  if (user?.email) redirect(checkoutUrl(CHECKOUT_URL, user.email));

  return (
    <AuthSplit
      eyebrow="Buy Pro"
      title="Sign in to buy ddugit Pro"
      lead={`Your ${usd(PRO_PRICE)} lifetime license goes to this account; the app turns Pro on when you sign in from it.`}
      next="/checkout"
      configured
      aside={
        <>
          Rather not? <a href={CHECKOUT_URL}>Check out without signing in</a>: the license goes to the email you pay
          with, and you sign in with that email later. <Link href="/pricing">Back to pricing</Link>
        </>
      }
    />
  );
}
