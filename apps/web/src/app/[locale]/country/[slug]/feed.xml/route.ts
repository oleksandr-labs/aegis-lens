import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildRssFeedFiltered } from "@/lib/rss";
import { COUNTRY_BBOX } from "@/lib/events-seed";
import { getRegion } from "@/lib/regions-seed";

/**
 * Locale-prefixed per-country RSS — e.g. `/uk/country/ua/feed.xml`.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const country = slug.toLowerCase();
  const region = getRegion(country);
  const bbox = COUNTRY_BBOX[country];
  if (!region || !bbox) notFound();

  const [minLon, minLat, maxLon, maxLat] = bbox;
  const name = region.name[locale] ?? region.name.en;
  const selfPath =
    locale === "en"
      ? `/country/${country}/feed.xml`
      : `/${locale}/country/${country}/feed.xml`;

  const xml = buildRssFeedFiltered(
    locale,
    selfPath,
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
