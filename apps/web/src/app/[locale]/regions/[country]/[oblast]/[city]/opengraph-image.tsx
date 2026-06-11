import { ImageResponse } from "next/og";
import { getCity } from "@/lib/cities-seed";

export const runtime = "edge";
export const alt = "City detail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAG: Record<string, string> = {
  ua: "🇺🇦",
  pl: "🇵🇱",
  de: "🇩🇪",
};

const COUNTRY_LABEL: Record<string, string> = {
  ua: "Ukraine",
  pl: "Poland",
  de: "Germany",
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export default async function CityOG({
  params,
}: {
  params: { locale: string; country: string; oblast: string; city: string };
}) {
  const city = getCity(params.country, params.oblast, params.city);
  const locale = params.locale ?? "en";
  const cityName = city
    ? (city.name as Record<string, string | undefined>)[locale] ?? city.name.en
    : "Aegis Lens";
  const oblastLabel = city ? titleCase(city.oblastSlug) : "";
  const iso2 = (city?.iso2 ?? params.country ?? "").toLowerCase();
  const flag = FLAG[iso2] ?? "";
  const countryLabel = COUNTRY_LABEL[iso2] ?? iso2.toUpperCase();
  const population = city?.population;

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
            Aegis Lens · city
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 24,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "#9ba6b8",
            }}
          >
            {`${flag} ${countryLabel}${oblastLabel ? ` · ${oblastLabel}` : ""}`}
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, maxWidth: 1050 }}>
            {cityName}
          </div>
          {city && (
            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "monospace",
                fontSize: 22,
                color: "#9ba6b8",
              }}
            >
              <span>{city.capital ? "capital" : "city"}</span>
              {population !== undefined && <span>·</span>}
              {population !== undefined && (
                <span>{`pop ${population.toLocaleString("en-US")}`}</span>
              )}
              <span>·</span>
              <span>{`${city.center[1].toFixed(2)}, ${city.center[0].toFixed(2)}`}</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
