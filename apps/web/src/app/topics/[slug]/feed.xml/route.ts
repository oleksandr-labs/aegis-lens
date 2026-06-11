import { buildRssFeedFiltered } from "@/lib/rss";
import { ALL_CLASSES } from "@/lib/filter-config";

export const dynamic = "force-dynamic";

/**
 * EN canonical per-topic RSS feed. (`/uk/topics/<slug>/feed.xml` is under [locale].)
 * Middleware skips dot-suffix paths, so this stays at root.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const topic = ALL_CLASSES.find((c) => c.id === slug);
  if (!topic) {
    return new Response(JSON.stringify({ error: "topic_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const xml = buildRssFeedFiltered(
    "en",
    `/topics/${slug}/feed.xml`,
    `Aegis Lens — ${topic.label} events`,
    (e) => e.class === slug,
  );

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
