import { urls } from "@aegis/url-builder";
import { CASE_STUDIES } from "@/lib/case-studies-seed";
import { EPISODES as PODCAST_EPISODES } from "@/lib/podcast-seed";
import { VIDEOS } from "@/lib/videos-seed";
import { sitemapResponse, type ShardRoute } from "@/lib/sitemap-shard";

/**
 * Media shard: case studies + podcast + videos. These surfaces typically
 * refresh on different cadences from event data and benefit from a separate
 * crawler hint.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const routes: ShardRoute[] = [];

  routes.push({ pathFor: (lc) => urls.caseStudies(lc), priority: 0.65 });
  for (const c of CASE_STUDIES) {
    routes.push({ pathFor: (lc) => urls.caseStudy(lc, c.slug), priority: 0.6 });
  }

  routes.push({ pathFor: (lc) => urls.podcast(lc), priority: 0.6 });
  for (const e of PODCAST_EPISODES) {
    routes.push({
      pathFor: (lc) => urls.podcastEpisode(lc, e.slug),
      priority: 0.55,
    });
  }

  routes.push({ pathFor: (lc) => urls.videos(lc), priority: 0.6 });
  for (const v of VIDEOS) {
    routes.push({ pathFor: (lc) => urls.video(lc, v.slug), priority: 0.55 });
  }

  return sitemapResponse(routes);
}
