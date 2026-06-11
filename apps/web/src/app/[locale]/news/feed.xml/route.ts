import { buildGoogleNewsRssFeed } from "@/lib/rss";
import { isLocale, type Locale } from "@aegis/i18n-config";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath = locale === "en" ? "/news/feed.xml" : `/${locale}/news/feed.xml`;

  return new Response(buildGoogleNewsRssFeed(locale, selfPath), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=900",
    },
  });
}
