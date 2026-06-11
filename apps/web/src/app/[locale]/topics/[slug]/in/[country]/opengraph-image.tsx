import { ImageResponse } from "next/og";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { getRegion } from "@/lib/regions-seed";
import { eventsInCountry } from "@/lib/events-seed";

export const runtime = "edge";
export const alt = "Topic × Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TopicCountryOG({
  params,
}: {
  params: { locale: string; slug: string; country: string };
}) {
  const cls = ALL_CLASSES.find((c) => c.id === params.slug);
  const r = getRegion(params.country);
  const label = cls?.label ?? "Topic";
  const countryLabel = r?.name.en ?? params.country.toUpperCase();
  const color = (cls && CLASS_COLOR[cls.id]) ?? "#ff6b35";
  const eventCount = cls
    ? eventsInCountry(params.country).filter((e) => e.class === cls.id).length
    : 0;

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
              backgroundColor: color,
              borderRadius: 999,
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 2,
              color: color,
              textTransform: "uppercase",
            }}
          >
            {`Aegis Lens · topic × country`}
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
            {`${label} · ${countryLabel}`}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {`${label} events in ${countryLabel}`}
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              fontFamily: "monospace",
              fontSize: 24,
              color: "#9ba6b8",
            }}
          >
            <span>{`${eventCount} verified events`}</span>
            <span>·</span>
            <span>{`updated ${new Date().toISOString().slice(0, 10)}`}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
