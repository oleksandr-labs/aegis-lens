import { ImageResponse } from "next/og";
import { getTask, VERTICAL_LABEL, type UseCaseVertical } from "@/lib/use-case-tasks";
import { getRegion } from "@/lib/regions-seed";

export const runtime = "edge";
export const alt = "Use case × Country";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function UseCaseCountryOG({
  params,
}: {
  params: { locale: string; vertical: string; task: string; country: string };
}) {
  const t = getTask(params.vertical, params.task);
  const r = getRegion(params.country);
  const title = t?.title ?? params.task;
  const verticalLabel = t
    ? VERTICAL_LABEL[t.vertical as UseCaseVertical]
    : params.vertical;
  const countryLabel = r?.name.en ?? params.country.toUpperCase();
  const problem = t?.problem ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at center, rgba(255,107,53,0.18), transparent 60%)",
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
            Aegis Lens · use case × country
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
            {`${verticalLabel} · ${countryLabel}`}
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 1050,
            }}
          >
            {`${title} in ${countryLabel}`}
          </div>
          {problem && (
            <div
              style={{
                fontSize: 24,
                lineHeight: 1.35,
                color: "#9ba6b8",
                maxWidth: 1050,
              }}
            >
              {problem.slice(0, 180)}
              {problem.length > 180 ? "…" : ""}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
