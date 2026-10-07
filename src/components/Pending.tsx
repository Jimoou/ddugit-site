"use client";

// Showing that the site is working: a spinner for buttons that wait on the server, a submit
// button that turns into one while its form is sent, and a bar at the top of the window while
// a link or a form takes the browser to the next page.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

/** A small spinner with its text. */
export function Spinner({ label }: { label: string }) {
  return (
    <span className="spinner-label">
      <span className="spinner" aria-hidden="true" />
      {label}
    </span>
  );
}

/** A form's submit button: disabled, with a spinner and `pending` text, while the form is sent. */
export function SubmitButton({
  children,
  pending: pendingText,
  className = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  pending: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={disabled || pending} aria-busy={pending}>
      {pending ? <Spinner label={pendingText} /> : children}
    </button>
  );
}

/** How long the bar may run without the page changing (a form that answers in place). */
const GIVE_UP_MS = 12_000;

/**
 * The bar at the top while the next page loads: it starts when a link to another page on
 * this site is clicked or a form is sent (forms marked `data-no-progress` answer in place),
 * and ends when the address changes.
 */
export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = `${pathname}?${search}`;
  // The address the bar started on: it runs only while the browser is still there.
  const [startedOn, setStartedOn] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setStartedOn(here);
      clearTimeout(timer);
      timer = setTimeout(() => setStartedOn(null), GIVE_UP_MS);
    };
    const onClick = (e: MouseEvent) => {
      // Not `defaultPrevented`: next/link prevents the default to navigate itself.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page (or a #hash)
      start();
    };
    const onSubmit = (e: SubmitEvent) => {
      if ((e.target as HTMLFormElement).dataset.noProgress !== undefined) return;
      start();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      clearTimeout(timer);
    };
  }, [here]);

  return <div className={startedOn === here ? "nav-progress on" : "nav-progress"} aria-hidden="true" />;
}
