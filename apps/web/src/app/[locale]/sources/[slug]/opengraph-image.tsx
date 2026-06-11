import { ImageResponse } from "next/og";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";

export const runtime = "edge";
export const alt = "Source detail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function tierLabel(reliability: number): string {
  if (reliability >= 0.9) return "Tier A";
  if (reliability >= 0.8) return "Tier B";
  if (reliability >= 0.7) return "Tier C";
  return "Tier D";
}

export default async function SourceOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const source = PUBLIC_SOURCES.find((s) => s.slug === params.slug);
  const name = source?.name ?? "Aegis Lens";
  const tier = source ? tierLabel(source.reliability) : "Source";
  const reliabilityPct = source ? Math.round(source.reliability * 100) : null;
  const kindLabel = source ? source.kind.replace(/_/g, " ") : "source";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(255,107,53,0.18), transparent 60%)",
          color: "#e8edf5",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: "#ff6b35",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 2,
              color: "#ff6b35",
              textTransform: "uppercase",
            }}
          >
            Aegis Lens · source
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                backgroundColor: "#ff6b35",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#9ba6b8",
              }}
            >
              {`${tier} · ${kindLabel}`}
            </div>
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1050 }}>
            {name}
          </div>
          {reliabilityPct !== null && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 24,
                color: "#9ba6b8",
              }}
            >
              <span>{`reliability ${reliabilityPct}%`}</span>
              <span>·</span>
              <span>{`country ${source?.country ?? "—"}`}</span>
              <span>·</span>
              <span>{`lang ${source?.language ?? "—"}`}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
