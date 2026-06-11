import { ImageResponse } from "next/og";
import { getEpisode, formatDuration, PODCAST_TITLE } from "@/lib/podcast-seed";

export const runtime = "edge";
export const alt = "Podcast episode";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PodcastEpisodeOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const e = getEpisode(params.slug);
  const number = e?.number ?? "—";
  const title = e?.title ?? "Podcast episode";
  const duration = e ? formatDuration(e.durationSeconds) : "—";
  const date = e?.publishedAt ?? "";
  const guests = (e?.guests ?? []).map((g) => g.name).join(", ");

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
            {PODCAST_TITLE}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 24,
              color: "#9ba6b8",
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            {`Episode ${number} · ${duration} · ${date}`}
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
          {guests && (
            <div
              style={{
                fontSize: 24,
                color: "#9ba6b8",
              }}
            >
              {`with ${guests}`}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
