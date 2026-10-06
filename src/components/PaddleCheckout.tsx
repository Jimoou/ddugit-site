"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useState } from "react";
import { checkoutRequest, type PaddleEnv } from "@/lib/checkout";

/** The part of Paddle.js (v2) this page uses. */
interface PaddleJs {
  Environment: { set(environment: "sandbox"): void };
  Initialize(options: {
    token: string;
    checkout?: { settings: Record<string, unknown> };
    eventCallback?: (event: { name?: string }) => void;
  }): void;
  Checkout: { open(options: ReturnType<typeof checkoutRequest>): void };
}

declare global {
  interface Window {
    Paddle?: PaddleJs;
  }
}

type State = "loading" | "open" | "closed" | "failed";

// Paddle.js is initialized once per page load, but this component can mount again (client
// navigation): its events go to whichever instance is mounted now.
let initialized = false;
let onEvent: (event: { name?: string }) => void = () => {};

/**
 * Paddle's overlay checkout on ddugit.com. Opens for one copy of Pro at once: for `email`
 * (the signed-in buyer, fixed in the form) or for anyone when it is null. With `transaction`
 * (Paddle's `?_ptxn=` payment links) Paddle.js opens that transaction by itself.
 */
export function PaddleCheckout({
  token,
  environment,
  priceId,
  email,
  transaction,
}: {
  token: string;
  environment: PaddleEnv;
  priceId: string;
  email: string | null;
  transaction: boolean;
}) {
  const [state, setState] = useState<State>("loading");

  const open = useCallback(() => {
    const paddle = window.Paddle;
    if (!paddle) return setState("failed");
    setState("open");
    if (!transaction) paddle.Checkout.open(checkoutRequest(priceId, email, `${window.location.origin}/thanks`));
  }, [email, priceId, transaction]);

  const start = useCallback(() => {
    const paddle = window.Paddle;
    if (!paddle) return setState("failed");
    onEvent = (e) => {
      if (e.name === "checkout.closed") setState("closed");
    };
    if (!initialized) {
      initialized = true;
      if (environment === "sandbox") paddle.Environment.set("sandbox");
      paddle.Initialize({
        token,
        checkout: { settings: { displayMode: "overlay", theme: "dark", locale: "en" } },
        eventCallback: (e) => onEvent(e),
      });
    }
    open();
  }, [environment, open, token]);

  return (
    <div className="page prose center">
      {/* onReady also runs on every later mount, when Paddle.js is already loaded. */}
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" onReady={start} onError={() => setState("failed")} />
      <p className="eyebrow">Buy Pro</p>
      {state === "failed" ? (
        <>
          <h1>The checkout didn&apos;t load</h1>
          <p>
            Something blocked Paddle, our payment provider (an ad or script blocker, often). Allow cdn.paddle.com and
            reload, or <Link href="/contact?topic=question">tell us</Link>.
          </p>
        </>
      ) : (
        <>
          <h1>{state === "closed" ? "Checkout closed" : "Opening secure checkout…"}</h1>
          <p className="muted">
            Payment is handled by Paddle, our reseller and merchant of record.
            {email ? ` The license goes to ${email}.` : ""}
          </p>
          {state === "closed" && (
            <p className="actions">
              <button type="button" className="button primary" onClick={open}>
                Open checkout again
              </button>
              <Link href="/pricing" className="button">
                Back to pricing
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
