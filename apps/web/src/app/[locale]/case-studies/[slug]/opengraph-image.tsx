import { ImageResponse } from "next/og";
import { getCaseStudy } from "@/lib/case-studies-seed";

export const runtime = "edge";
export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CaseStudyOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const c = getCaseStudy(params.slug);
  const client = c?.client ?? "Aegis Lens customer";
  const industry = c?.industry ?? "—";
  const region = c?.region ?? "—";
  const oneLiner = c?.oneLiner ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top right, rgba(255,107,53,0.18), transparent 60%)",
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
            Aegis Lens · case study
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
            {`${industry} · ${region}`}
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {client}
          </div>
          {oneLiner && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.35,
                color: "#9ba6b8",
                maxWidth: 1050,
              }}
            >
              {oneLiner.slice(0, 180)}
              {oneLiner.length > 180 ? "…" : ""}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
