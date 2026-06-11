import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildEntityJsonFeed } from "@/lib/entity-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const selfPath =
    locale === "en"
      ? `/entities/${slug}/feed.json`
      : `/${locale}/entities/${slug}/feed.json`;
  const body = buildEntityJsonFeed(slug, locale, selfPath);
  if (!body) notFound();

  return new Response(body, {
    headers: {
      "content-type": "application/feed+json; charset=utf-8",
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
    },
  });
}
