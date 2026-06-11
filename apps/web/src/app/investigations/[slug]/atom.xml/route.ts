import { notFound } from "next/navigation";
import { buildInvestigationAtomFeed } from "@/lib/investigation-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const xml = buildInvestigationAtomFeed(slug, "en", `/investigations/${slug}/atom.xml`);
  if (!xml) notFound();
  return new Response(xml, {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
