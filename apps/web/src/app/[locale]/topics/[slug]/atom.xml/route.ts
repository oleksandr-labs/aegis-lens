import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildTopicAtomFeed } from "@/lib/topic-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en" ? `/topics/${slug}/atom.xml` : `/${locale}/topics/${slug}/atom.xml`;
  const xml = buildTopicAtomFeed(slug, locale, selfPath);
  if (!xml) {
    return new Response(JSON.stringify({ error: "topic_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
