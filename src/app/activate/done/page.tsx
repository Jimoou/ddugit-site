import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activate ddugit Pro", robots: { index: false } };

/** Where the app sends the browser once it has (or hasn't) got its license. */
export default async function Done({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const ok = (await searchParams).result === "ok";
  return (
    <div className="page prose">
      <p className="eyebrow">Activate</p>
      <h1>{ok ? "ddugit Pro is on" : "Activation didn’t finish"}</h1>
      <p>
        {ok
          ? "You can close this tab and go back to the app."
          : "Go back to the app and try again from Settings → License. If it keeps failing, write to us."}
      </p>
    </div>
  );
}
