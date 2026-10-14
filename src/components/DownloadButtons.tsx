"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DOWNLOADS_URL, MICROSOFT_STORE_URL } from "@/site";
import { type Downloads, isDownloads, megabytes, osOf } from "@/downloads";

type State = { kind: "loading" } | { kind: "ready"; data: Downloads } | { kind: "missing" };

const button = (primary: boolean) => (primary ? "button primary large" : "button large");

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

  const data = state.kind === "ready" ? state.data : null;
  const windowsFirst = os === "windows";
  // Windows comes from the Microsoft Store, which doesn't depend on the download manifest.
  const store = (
    <a key="store" href={MICROSOFT_STORE_URL} className={button(windowsFirst)}>
      Windows (Microsoft Store)
    </a>
  );
  const mac = data && (
    <a key="mac" href={data.files.macos.url} className={button(!windowsFirst)}>
      macOS (.dmg) <span className="size">{megabytes(data.files.macos.size)}</span>
    </a>
  );

  return (
    <>
      <div className="actions">{windowsFirst ? [store, mac] : [mac, store]}</div>
      {state.kind === "loading" && <p className="muted small download-meta">Checking the latest version…</p>}
      {state.kind === "missing" && (
        <p className="note">The macOS installer is being prepared and will be here shortly.</p>
      )}
      {data && (
        <p className="muted small download-meta">
          Version {data.version} · {data.date.slice(0, 10)} · No Microsoft Store?{" "}
          <a href={data.files.windows.url}>Windows installer (.exe, {megabytes(data.files.windows.size)})</a>
        </p>
      )}
    </>
  );
}
