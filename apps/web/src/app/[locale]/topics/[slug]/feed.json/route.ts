import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildTopicJsonFeed } from "@/lib/topic-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en" ? `/topics/${slug}/feed.json` : `/${locale}/topics/${slug}/feed.json`;
  const body = buildTopicJsonFeed(slug, locale, selfPath);
  if (!body) {
    return new Response(JSON.stringify({ error: "topic_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return new Response(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
