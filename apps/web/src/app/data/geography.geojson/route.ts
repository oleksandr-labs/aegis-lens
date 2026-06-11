import { OBLASTS } from "@/lib/oblasts-seed";
import { CITIES } from "@/lib/cities-seed";

/**
 * Administrative geography as a GeoJSON FeatureCollection.
 * Each oblast = Point at center (with bbox in properties).
 * Each city  = Point at center (with population, oblastSlug).
 * License: CC-BY-4.0.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const features = [
    ...OBLASTS.map((o) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: o.center },
      properties: {
        kind: "admin1",
        iso2: o.iso2,
        slug: o.slug,
        name_en: o.name.en,
        name_uk: o.name.uk,
        capital: o.capital,
        kindLabel: o.kindLabel,
        bbox: o.bbox,
      },
    })),
    ...CITIES.map((c) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: c.center },
      properties: {
        kind: "admin2",
        iso2: c.iso2,
        oblastSlug: c.oblastSlug,
        slug: c.slug,
        name_en: c.name.en,
        name_uk: c.name.uk,
        capital: c.capital ?? false,
        population: c.population ?? null,
      },
    })),
  ];

  const body = {
    type: "FeatureCollection",
    license: "CC-BY-4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    generatedAt: new Date().toISOString(),
    features,
  };

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/geo+json; charset=utf-8",
      "content-disposition": 'inline; filename="aegis-geography.geojson"',
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });
}
