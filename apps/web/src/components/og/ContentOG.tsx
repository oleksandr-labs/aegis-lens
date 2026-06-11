import { ImageResponse } from "next/og";

/**
 * Shared Satori card factory for static content pages
 * (/faq, /methodology, /pricing, /trust, etc.).
 *
 * Each caller imports this and supplies eyebrow + title + tagline.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  eyebrow: string;
  title: string;
  tagline?: string;
  /** Optional small footer (e.g. "Aegis Lens"). */
  footer?: string;
};

export function renderContentOG({ eyebrow, title, tagline, footer = "aegislens.io" }: Props) {
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
            {`Aegis Lens · ${eyebrow}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
          {tagline && (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: "#9ba6b8",
                maxWidth: 1050,
              }}
            >
              {tagline}
            </div>
          )}
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            color: "#9ba6b8",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {footer}
        </div>
      </div>
    ),
    { ...size },
  );
}
