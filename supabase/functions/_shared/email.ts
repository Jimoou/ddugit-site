// Email address checks shared by the functions and the site. Pure, so they run in
// Edge Functions (Deno), Next and Node tests alike.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Something shaped like an email address: one @, a dot in the domain, no spaces. Loose on purpose (store orders). */
export const isEmail = (s: string) => EMAIL.test(s);

/**
 * An address that is safe to reply to through a `mailto:` link: an email with no URL or
 * header syntax in it (`? & % #`, slashes, quotes, angle brackets, control characters),
 * so it can't add cc, bcc or a body to the reply.
 */
export const isReplyEmail = (s: string) => isEmail(s) && !/[?&%#/\\<>"\p{Cc}]/u.test(s);

/** A `mailto:` link to reply to `email` with `subject`, or null when the address isn't a safe one. */
export function replyLink(email: string, subject: string): string | null {
  if (!isReplyEmail(email)) return null;
  const at = email.lastIndexOf("@");
  const to = `${encodeURIComponent(email.slice(0, at))}@${encodeURIComponent(email.slice(at + 1))}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}
