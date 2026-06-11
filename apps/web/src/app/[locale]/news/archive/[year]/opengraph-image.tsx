import { ImageResponse } from "next/og";
import { eventsInYear, parseYearSlug } from "@/lib/news-archive";

export const runtime = "edge";
export const alt = "News archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function NewsArchiveYearOG({
  params,
}: {
  params: { locale: string; year: string };
}) {
  const y = parseYearSlug(params.year);
  const events = y ? eventsInYear(y) : [];
  const eventCount = events.length;
  const monthsCovered = new Set(
    events.map((e) => new Date(e.occurredAt).getUTCMonth() + 1),
  ).size;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at bottom right, rgba(255,107,53,0.18), transparent 60%)",
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
            Aegis Lens · news archive
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 26,
              color: "#9ba6b8",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Archive
          </div>
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            {y ?? params.year}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#e8edf5",
            }}
          >
            {`${eventCount} verified events across ${monthsCovered} month${monthsCovered === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
