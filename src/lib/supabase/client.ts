import { type CookieMethodsServer, createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * How the session cookies are set. HttpOnly: this site has no browser Supabase client
 * (every Supabase call runs on the server), so scripts never need to read them.
 * Secure outside local development (http://localhost), Lax so the OAuth return works.
 */
export const AUTH_COOKIE = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const;

/** The one Supabase client factory, for a cookie adapter (Next's cookie store, or the proxy's request/response). */
export const supabaseWith = (cookies: CookieMethodsServer) =>
  createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies, cookieOptions: AUTH_COOKIE });
