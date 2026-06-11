import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildRegionJsonFeed } from "@/lib/region-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; country: string; oblast: string }> },
) {
  const { locale: raw, country, oblast } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en"
      ? `/regions/${country}/${oblast}/feed.json`
      : `/${locale}/regions/${country}/${oblast}/feed.json`;
  const body = buildRegionJsonFeed(country, oblast, locale, selfPath);
  if (!body) notFound();
  return new Response(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
