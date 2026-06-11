/**
 * Dynamic OG image generation — /api/og
 *
 * Query parameters:
 *   type      "default" | "event" | "region" | "report" | "blog"
 *   title     Main heading text (max ~60 chars looks best)
 *   subtitle  Supporting line below the title
 *   id        Event or entity ID (for event type)
 *   class     Event class label (for event type)
 *   name      Region name (for region type)
 *   events    Event count string (for region type)
 *   date      ISO date string (for report type)
 *
 * Usage:
 *   /api/og?type=default
 *   /api/og?type=event&title=Missile+Strike+Kharkiv&class=missile_strike
 *   /api/og?type=region&name=Kharkiv&events=18
 *   /api/og?type=report&title=Weekly+Brief&date=2026-06-03
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";

const ACCENT = "#4ea1ff";
const BG = "#0a0f1a";
const SURFACE = "#111827";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#64748b";

/** Human-readable label for each OG image type */
function typeBadge(type: string, eventClass?: string): string {
  switch (type) {
    case "event":
      return eventClass ? eventClass.replace(/_/g, " ").toUpperCase() : "INTELLIGENCE EVENT";
    case "region":
      return "REGION PROFILE";
    case "report":
      return "INTELLIGENCE REPORT";
    case "blog":
      return "AEGIS LENS BLOG";
    default:
      return "AEGIS LENS";
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type") ?? "default";
  const title = searchParams.get("title") ?? "Aegis Lens";
  const subtitle =
    searchParams.get("subtitle") ??
    "AI-native OSINT intelligence platform for conflict monitoring.";
  const eventClass = searchParams.get("class") ?? undefined;
  const regionName = searchParams.get("name") ?? undefined;
  const eventCount = searchParams.get("events") ?? undefined;
  const date = searchParams.get("date") ?? undefined;

  // Resolved display values
  const displayTitle =
    type === "region" && regionName ? regionName : title;
  const displaySubtitle =
    type === "region" && eventCount
      ? `${eventCount} verified events · Aegis Lens`
      : type === "report" && date
        ? `Intelligence Report · ${date}`
        : subtitle;

  return new ImageResponse(
    (
      <div
        style={{
          background: BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 64px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: ACCENT,
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(78,161,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(78,161,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(78,161,255,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 0, maxWidth: 960 }}>
          {/* Type badge */}
          <div
            style={{
              color: ACCENT,
              fontSize: 13,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {typeBadge(type, eventClass)}
          </div>

          {/* Title */}
          <div
            style={{
              color: TEXT_PRIMARY,
              fontSize: displayTitle.length > 50 ? 40 : 52,
              fontWeight: 600,
              lineHeight: 1.15,
              marginBottom: 20,
              display: "flex",
            }}
          >
            {displayTitle}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: TEXT_SECONDARY,
              fontSize: 22,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {displaySubtitle}
          </div>
        </div>

        {/* Bottom-right logo */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: SURFACE,
              border: `1.5px solid ${ACCENT}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ACCENT,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ color: TEXT_MUTED, fontSize: 14, fontFamily: "monospace" }}>
            aegislens.io
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
