import Image from "next/image";
import Link from "next/link";
import { SignInButtons } from "@/components/SignIn";
import { SITE } from "@/site";

/**
 * The signed-out screen shared by /account and /activate: the sign-in form on the left,
 * the ddugit brand panel on the right (a short band on top on small screens).
 * `configured` is false until Supabase is set up; the buttons then give way to a note.
 */
export function AuthSplit({
  eyebrow,
  title,
  lead,
  next,
  configured,
  notice,
  aside,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  next?: string;
  configured: boolean;
  notice?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="auth">
      <section className="auth-form">
        <div className="auth-form-inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-lead">{lead}</p>
          {notice}
          {configured ? (
            <>
              <SignInButtons next={next} />
              <p className="auth-fine">
                By continuing you agree to the <Link href="/terms">Terms</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            <p className="auth-fine">Sign-in opens soon.</p>
          )}
          {aside && <p className="auth-aside">{aside}</p>}
        </div>
      </section>
      <aside className="auth-brand" aria-label={SITE.name}>
        <div className="auth-orbits" aria-hidden="true">
          <span />
          <span />
        </div>
        <Image
          className="auth-icon"
          src="/brand/ddugit-icon.svg"
          width={176}
          height={176}
          alt=""
          priority
          unoptimized
        />
        <p className="auth-tagline">{SITE.tagline}</p>
      </aside>
    </div>
  );
}
