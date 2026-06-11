import { ImageResponse } from "next/og";
import { getReport } from "@/lib/reports-seed";

export const runtime = "edge";
export const alt = "Report detail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ReportOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const report = getReport(params.slug);
  const locale = (params.locale ?? "en") as keyof NonNullable<typeof report>["title"];
  const title = report
    ? (report.title as Record<string, string | undefined>)[locale as string] ?? report.title.en
    : "Aegis Lens";
  const tag = report?.kind ?? "report";
  const date = report
    ? new Date(report.publishedAt).toISOString().slice(0, 10)
    : "";
  const author = report?.author ?? "";

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
            Aegis Lens · report
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 18,
                height: 18,
                backgroundColor: "#ff6b35",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: "#9ba6b8",
              }}
            >
              {`${tag}${date ? ` · ${date}` : ""}`}
            </div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 1050 }}>
            {title}
          </div>
          {report && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 22,
                color: "#9ba6b8",
              }}
            >
              <span>{`by ${author}`}</span>
              <span>·</span>
              <span>{`${report.citations.length} citations`}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
