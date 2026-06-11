import { notFound } from "next/navigation";
import { buildEntityRssFeed } from "@/lib/entity-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const xml = buildEntityRssFeed(slug, "en", `/entities/${slug}/feed.xml`);
  if (!xml) notFound();

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
