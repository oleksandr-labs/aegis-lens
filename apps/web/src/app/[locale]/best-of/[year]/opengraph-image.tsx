import { ImageResponse } from "next/og";
import { eventsInYear, parseYearSlug } from "@/lib/news-archive";

export const runtime = "edge";
export const alt = "Year in review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BestOfYearOG({
  params,
}: {
  params: { locale: string; year: string };
}) {
  const y = parseYearSlug(params.year);
  const events = y ? eventsInYear(y) : [];
  const eventCount = events.length;
  const avgDanger =
    events.length > 0
      ? Math.round(events.reduce((s, e) => s + e.dangerScore, 0) / events.length)
      : 0;
  const classCount = new Set(events.map((e) => e.class)).size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(255,107,53,0.20), transparent 60%)",
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
            Aegis Lens · year in review
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {y ?? params.year}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#e8edf5",
              lineHeight: 1.25,
            }}
          >
            {`${eventCount} events · avg danger ${avgDanger} · ${classCount} classes`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
