import { urls } from "@aegis/url-builder";
import { listEvents } from "@/lib/events-seed";
import { sitemapResponse, type ShardRoute } from "@/lib/sitemap-shard";

/**
 * Events shard: per-event detail + 4 sub-pages (timeline / sources / media /
 * related). High-volume bucket — at scale this can grow into the tens of
 * thousands of URLs and is best served separately from marketing/programmatic.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const routes: ShardRoute[] = [];
  for (const e of listEvents()) {
    routes.push({ pathFor: (lc) => urls.event(lc, e.eventId), priority: 0.55 });
    routes.push({
      pathFor: (lc) => urls.eventTimeline(lc, e.eventId),
      priority: 0.45,
    });
    routes.push({
      pathFor: (lc) => urls.eventSources(lc, e.eventId),
      priority: 0.45,
    });
    routes.push({
      pathFor: (lc) => urls.eventMedia(lc, e.eventId),
      priority: 0.4,
    });
    routes.push({
      pathFor: (lc) => urls.eventRelated(lc, e.eventId),
      priority: 0.45,
    });
  }
  return sitemapResponse(routes);
}
