import { notFound } from "next/navigation";
import { buildEntityJsonFeed } from "@/lib/entity-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = buildEntityJsonFeed(slug, "en", `/entities/${slug}/feed.json`);
  if (!body) notFound();

  return new Response(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
