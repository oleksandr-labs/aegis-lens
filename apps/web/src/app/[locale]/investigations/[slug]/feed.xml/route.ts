import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildInvestigationRssFeed } from "@/lib/investigation-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en"
      ? `/investigations/${slug}/feed.xml`
      : `/${locale}/investigations/${slug}/feed.xml`;
  const xml = buildInvestigationRssFeed(slug, locale, selfPath);
  if (!xml) notFound();
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
