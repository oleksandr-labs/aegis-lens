import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildRegionAtomFeed } from "@/lib/region-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; country: string; oblast: string }> },
) {
  const { locale: raw, country, oblast } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en"
      ? `/regions/${country}/${oblast}/atom.xml`
      : `/${locale}/regions/${country}/${oblast}/atom.xml`;
  const xml = buildRegionAtomFeed(country, oblast, locale, selfPath);
  if (!xml) notFound();
  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
