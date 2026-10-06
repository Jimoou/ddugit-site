import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/site";

// The picture shown when a ddugit.com link is shared (Open Graph and Twitter), for every page.
export const alt = `${SITE.name}: graph-first Git client for macOS and Windows`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const icon = await readFile(join(process.cwd(), "public/brand/ddugit-icon.svg"), "base64");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 96px",
        background: "radial-gradient(circle at 20% 15%, #1d1b4a 0%, #05040e 65%)",
        color: "#f3f1ff",
      }}
    >
      <img src={`data:image/svg+xml;base64,${icon}`} width={260} height={260} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>{SITE.name}</div>
        <div style={{ fontSize: 40, lineHeight: 1.25, maxWidth: 680 }}>{SITE.tagline}</div>
        <div style={{ fontSize: 28, color: "#22e8ff" }}>Git client for macOS and Windows</div>
      </div>
    </div>,
    size,
  );
}
