import { notFound } from "next/navigation";
import { buildRegionAtomFeed } from "@/lib/region-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ country: string; oblast: string }> },
) {
  const { country, oblast } = await params;
  const xml = buildRegionAtomFeed(country, oblast, "en", `/regions/${country}/${oblast}/atom.xml`);
  if (!xml) notFound();
  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
    },
  });
}
