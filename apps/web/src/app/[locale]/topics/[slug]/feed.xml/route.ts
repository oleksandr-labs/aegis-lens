import { buildRssFeedFiltered } from "@/lib/rss";
import { ALL_CLASSES } from "@/lib/filter-config";
import { isLocale, type Locale } from "@aegis/i18n-config";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;

  const topic = ALL_CLASSES.find((c) => c.id === slug);
  if (!topic) {
    return new Response(JSON.stringify({ error: "topic_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en" ? `/topics/${slug}/feed.xml` : `/${locale}/topics/${slug}/feed.xml`;
  const channelTitleOverride = `Aegis Lens — ${topic.label} events`;

  const xml = buildRssFeedFiltered(
    locale,
    selfPath,
    channelTitleOverride,
    (e) => e.class === slug,
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
