import { ImageResponse } from "next/og";
import { getThreat } from "@/lib/threats-seed";
import { getRegion } from "@/lib/regions-seed";

export const runtime = "edge";
export const alt = "Threat × Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ThreatCountryOG({
  params,
}: {
  params: { locale: string; slug: string; country: string };
}) {
  const t = getThreat(params.slug);
  const r = getRegion(params.country);
  const name = t?.name.en ?? "Threat";
  const countryLabel = r?.name.en ?? params.country.toUpperCase();
  const category = t?.category ?? "—";
  const summary = t?.summary.en ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top left, rgba(255,107,53,0.20), transparent 60%)",
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
            {`Aegis Lens · threat × country`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              color: "#9ba6b8",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {`${category} · ${countryLabel}`}
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {`${name} in ${countryLabel}`}
          </div>
          {summary && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.35,
                color: "#9ba6b8",
                maxWidth: 1050,
              }}
            >
              {summary.slice(0, 180)}
              {summary.length > 180 ? "…" : ""}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
