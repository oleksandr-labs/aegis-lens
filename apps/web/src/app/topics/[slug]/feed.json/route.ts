import { buildTopicJsonFeed } from "@/lib/topic-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = buildTopicJsonFeed(slug, "en", `/topics/${slug}/feed.json`);
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
