import { ImageResponse } from "next/og";
import {
  getVideo,
  formatVideoDuration,
  VIDEO_CATEGORY_LABEL,
} from "@/lib/videos-seed";

export const runtime = "edge";
export const alt = "Video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function VideoOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const v = getVideo(params.slug);
  const title = v?.title ?? "Aegis Lens video";
  const duration = v ? formatVideoDuration(v.durationSeconds) : "—";
  const category = v ? VIDEO_CATEGORY_LABEL[v.category] : "—";
  const date = v?.publishedAt ?? "";
  const summary = v?.summary ?? "";

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
            Aegis Lens · video
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
            {`${category} · ${duration} · ${date}`}
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 1050,
            }}
          >
            {title}
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
