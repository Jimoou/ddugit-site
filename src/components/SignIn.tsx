import { signIn } from "@/app/account/actions";
import { LOGIN_PROVIDERS } from "@/site";
import { OAuthButton } from "./OAuthButton";

/** The sign-in buttons; after signing in the browser comes back to `next` (the account page by default). */
export function SignInButtons({ next }: { next?: string }) {
  return (
    <div className="oauth-list">
      {/* Google's button guidelines ask for Roboto Medium; only sign-in pages need it. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router hoists this link (precedence) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
        precedence="default"
      />
      {LOGIN_PROVIDERS.map((p) => (
        <form key={p} action={signIn.bind(null, p, next)}>
          <OAuthButton provider={p} />
        </form>
      ))}
    </div>
  );
}
