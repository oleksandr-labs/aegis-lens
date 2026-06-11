import { ImageResponse } from "next/og";
import { eventById } from "@/lib/events-seed";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";

export const runtime = "edge";
export const alt = "Event detail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CLASS_LABEL = Object.fromEntries(ALL_CLASSES.map((c) => [c.id, c.label])) as Record<
  string,
  string
>;

export default async function EventOG({ params }: { params: { id: string } }) {
  const ev = eventById(params.id);
  const color = ev ? CLASS_COLOR[ev.class] : "#4ea1ff";
  const classLabel = ev ? CLASS_LABEL[ev.class] : "Event";
  const title = ev?.summary.en ?? "Event detail";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(78,161,255,0.18), transparent 60%)",
          color: "#e8edf5",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, backgroundColor: "#4ea1ff", borderRadius: 999 }} />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 2,
              color: "#4ea1ff",
              textTransform: "uppercase",
            }}
          >
            Aegis Lens · event
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 18, height: 18, backgroundColor: color, borderRadius: 999 }} />
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#9ba6b8",
                display: "flex",
              }}
            >
              {`${classLabel}${ev?.subclass ? ` · ${ev.subclass}` : ""}`}
            </div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 1050 }}>
            {title}
          </div>
          {ev && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 22,
                color: "#9ba6b8",
              }}
            >
              <span>severity {ev.severity}/5</span>
              <span>·</span>
              <span>danger {ev.dangerScore}</span>
              <span>·</span>
              <span>conf {Math.round(ev.confidence * 100)}%</span>
              <span>·</span>
              <span>{ev.verificationState}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
