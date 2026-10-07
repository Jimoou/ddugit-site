import type { NextConfig } from "next";

/**
 * Security headers on every response. The CSP only sets what can't break the site:
 * no framing (clickjacking on /account, /activate, /admin), no plugins, no <base> tricks.
 * A script-src policy would need per-request nonces for Next's inline scripts, and
 * form-action can't be set because server actions redirect to GitHub / Google sign-in
 * and to the app's 127.0.0.1 listener.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  headers: async () => [
    { source: "/:path*", headers: SECURITY_HEADERS },
    // The app's device id is in this page's address: never send it on, not even the path.
    { source: "/activate/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
  ],
};

export default nextConfig;
