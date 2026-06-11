import { notFound } from "next/navigation";
import { buildRegionJsonFeed } from "@/lib/region-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string; oblast: string }> },
) {
  const { country, oblast } = await params;
  const body = buildRegionJsonFeed(country, oblast, "en", `/regions/${country}/${oblast}/feed.json`);
  if (!body) notFound();
  return new Response(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
