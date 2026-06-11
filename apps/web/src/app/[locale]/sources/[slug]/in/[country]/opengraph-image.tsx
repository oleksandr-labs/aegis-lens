import { ImageResponse } from "next/og";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { getRegion } from "@/lib/regions-seed";

export const runtime = "edge";
export const alt = "Source × Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function SourceCountryOG({
  params,
}: {
  params: { locale: string; slug: string; country: string };
}) {
  const source = PUBLIC_SOURCES.find((s) => s.slug === params.slug);
  const region = getRegion(params.country);
  const name = source?.name ?? params.slug;
  const countryLabel = region?.name.en ?? params.country.toUpperCase();
  const kind = source?.kind ?? "—";
  const reliability = source ? Math.round(source.reliability * 100) : null;
  const language = source?.language?.toUpperCase() ?? "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at bottom left, rgba(255,107,53,0.18), transparent 60%)",
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
            Aegis Lens · source × country
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
            {`${kind} · ${countryLabel}`}
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {`${name} — ${countryLabel}`}
          </div>
          {reliability !== null && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 24,
                color: "#9ba6b8",
              }}
            >
              <span>{`reliability ${reliability}%`}</span>
              <span>·</span>
              <span>{`language ${language}`}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
