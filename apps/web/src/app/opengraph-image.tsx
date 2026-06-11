import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(78,161,255,0.25), transparent 60%)",
          color: "#e8edf5",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: "#4ea1ff",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 24,
              letterSpacing: 2,
              color: "#4ea1ff",
              textTransform: "uppercase",
            }}
          >
            Aegis Lens
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
            {SITE.tagline}
          </div>
          <div style={{ fontSize: 28, color: "#9ba6b8", maxWidth: 900 }}>
            AI-native OSINT intelligence — Ukraine first, global next.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
