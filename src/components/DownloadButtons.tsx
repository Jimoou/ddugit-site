"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DOWNLOADS_URL } from "@/site";
import { type Downloads, isDownloads, megabytes, osOf } from "@/downloads";

type State = { kind: "loading" } | { kind: "ready"; data: Downloads } | { kind: "missing" };

const LABEL = { macos: "macOS (.dmg)", windows: "Windows (.exe)" } as const;

export default function DownloadButtons() {
  const [state, setState] = useState<State>(DOWNLOADS_URL ? { kind: "loading" } : { kind: "missing" });
  const os = useSyncExternalStore(
    () => () => {},
    () => osOf(navigator.userAgent),
    () => "other",
  );

  useEffect(() => {
    if (!DOWNLOADS_URL) return;
    fetch(DOWNLOADS_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setState(isDownloads(d) ? { kind: "ready", data: d } : { kind: "missing" }))
      .catch(() => setState({ kind: "missing" }));
  }, []);

  if (state.kind === "loading") return <p className="muted">Checking the latest version…</p>;
  if (state.kind === "missing")
    return <p className="note">The installers are being prepared. They will be here soon.</p>;

  const { data } = state;
  const order: (keyof Downloads["files"])[] = os === "windows" ? ["windows", "macos"] : ["macos", "windows"];
  return (
    <>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        {order.map((k, i) => (
          <a key={k} href={data.files[k].url} className={i === 0 ? "button primary" : "button"}>
            {LABEL[k]} <span className="small">{megabytes(data.files[k].size)}</span>
          </a>
        ))}
      </div>
      <p className="muted small">
        Version {data.version} · {data.date.slice(0, 10)}
      </p>
    </>
  );
}
