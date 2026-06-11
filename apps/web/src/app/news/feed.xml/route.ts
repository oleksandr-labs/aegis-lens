import { buildGoogleNewsRssFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

/**
 * EN canonical RSS feed with Google News-compatible enhancements.
 * (`/uk/news/feed.xml` is under [locale].)
 * Middleware skips dot-suffix paths, so this stays at root.
 */
export async function GET() {
  return new Response(buildGoogleNewsRssFeed("en", "/news/feed.xml"), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=900",
    },
  });
}
