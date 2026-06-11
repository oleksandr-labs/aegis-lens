import { notFound } from "next/navigation";
import { buildRssFeedFiltered } from "@/lib/rss";
import { COUNTRY_BBOX } from "@/lib/events-seed";
import { getRegion } from "@/lib/regions-seed";

/**
 * Per-country RSS feed. EN canonical at root; locale-prefixed variant
 * is served under `/[locale]/country/<iso2>/feed.xml`.
 *
 * Filter is bbox-based: any event whose location falls inside the
 * country bounding box.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ iso2: string }> },
) {
  const { iso2 } = await params;
  const country = iso2.toLowerCase();
  const region = getRegion(country);
  const bbox = COUNTRY_BBOX[country];
  if (!region || !bbox) notFound();

  const [minLon, minLat, maxLon, maxLat] = bbox;
  const name = region.name.en;
  const xml = buildRssFeedFiltered(
    "en",
    `/country/${country}/feed.xml`,
    `Aegis Lens — ${name} events`,
    (e) =>
      e.location.lon >= minLon &&
      e.location.lon <= maxLon &&
      e.location.lat >= minLat &&
      e.location.lat <= maxLat,
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
