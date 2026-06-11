import { ImageResponse } from "next/og";
import { getInvestigation } from "@/lib/investigations-seed";

export const runtime = "edge";
export const alt = "Investigation detail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function InvestigationOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const inv = getInvestigation(params.slug);
  const title = inv?.title ?? "Aegis Lens — investigation";
  const date = inv?.date ?? "";
  const analyst = inv?.analyst ?? "";
  const tags = (inv?.tags ?? []).slice(0, 4);

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
            Aegis Lens · investigation
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
          {inv && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 22,
                color: "#9ba6b8",
              }}
            >
              <span>{date}</span>
              <span>·</span>
              <span>{`lead: ${analyst}`}</span>
              <span>·</span>
              <span>{`${inv.findings.length} findings`}</span>
              <span>·</span>
              <span>{`${inv.sources.length} sources`}</span>
            </div>
          )}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    padding: "6px 12px",
                    border: "1px solid #2a3142",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: 18,
                    color: "#9ba6b8",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
