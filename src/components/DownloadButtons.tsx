"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DOWNLOADS_URL } from "@/site";
import { type Downloads, isDownloads, megabytes, osOf } from "@/downloads";

type State = { kind: "loading" } | { kind: "ready"; data: Downloads } | { kind: "missing" };

const LABEL = { macos: "macOS용 (.dmg)", windows: "Windows용 (.exe)" } as const;

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

  if (state.kind === "loading") return <p className="muted">최신 버전을 확인하고 있어요…</p>;
  if (state.kind === "missing")
    return <p className="note">설치 파일을 준비하고 있어요. 곧 이곳에서 내려받을 수 있습니다.</p>;

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
        버전 {data.version} · {data.date}
      </p>
    </>
  );
}
