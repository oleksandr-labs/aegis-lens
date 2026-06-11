import { notFound } from "next/navigation";
import { buildRssFeedFiltered } from "@/lib/rss";
import { getOblast } from "@/lib/oblasts-seed";

/**
 * Per-oblast RSS feed — EN canonical. Bbox-filtered events within the
 * admin-1's bounding box.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string; oblast: string }> },
) {
  const { country, oblast } = await params;
  const o = getOblast(country, oblast);
  if (!o) notFound();

  const [minLon, minLat, maxLon, maxLat] = o.bbox;
  const xml = buildRssFeedFiltered(
    "en",
    `/regions/${country}/${oblast}/feed.xml`,
    `Aegis Lens — ${o.name.en} (${country.toUpperCase()}) events`,
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
