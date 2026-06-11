import { ImageResponse } from "next/og";
import { getEquipmentOperatorPair } from "@/lib/equipment-operators";

export const runtime = "edge";
export const alt = "Equipment × Operator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EquipmentOperatorOG({
  params,
}: {
  params: { locale: string; slug: string; operator: string };
}) {
  const pair = getEquipmentOperatorPair(params.slug, params.operator);
  const name = pair?.equipment.name.en ?? params.slug;
  const operatorLabel = pair?.operatorLabel ?? params.operator;
  const type = pair?.equipment.type ?? "—";

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
            Aegis Lens · equipment × operator
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
            {`${type} · operator: ${operatorLabel}`}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#9ba6b8",
            }}
          >
            {`operated by ${operatorLabel}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
