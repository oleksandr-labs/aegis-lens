import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildRssFeedFiltered } from "@/lib/rss";
import { getOblast } from "@/lib/oblasts-seed";

/** Locale-prefixed per-oblast RSS — `/uk/regions/ua/donetsk-oblast/feed.xml` etc. */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ locale: string; country: string; oblast: string }>;
  },
) {
  const { locale: raw, country, oblast } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const o = getOblast(country, oblast);
  if (!o) notFound();

  const [minLon, minLat, maxLon, maxLat] = o.bbox;
  const name = o.name[locale] ?? o.name.en;
  const selfPath =
    locale === "en"
      ? `/regions/${country}/${oblast}/feed.xml`
      : `/${locale}/regions/${country}/${oblast}/feed.xml`;

  const xml = buildRssFeedFiltered(
    locale,
    selfPath,
    `Aegis Lens — ${name} (${country.toUpperCase()}) events`,
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
