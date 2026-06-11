import { urls } from "@aegis/url-builder";
import { ALL_CLASSES } from "@/lib/filter-config";
import { eventsInCountry, listEvents } from "@/lib/events-seed";
import { listRegions } from "@/lib/regions-seed";
import { THREATS } from "@/lib/threats-seed";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";
import { listEquipmentOperatorPairs } from "@/lib/equipment-operators";
import { USE_CASE_TASKS } from "@/lib/use-case-tasks";
import { sitemapResponse, type ShardRoute } from "@/lib/sitemap-shard";

/**
 * Cross-cut multiplier shard. Mirrors the cross-cut blocks from the main
 * sitemap so this URL collection can be crawled / refreshed independently.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const routes: ShardRoute[] = [];

  // topic × country
  for (const cls of ALL_CLASSES) {
    for (const r of listRegions()) {
      const has = eventsInCountry(r.iso2).some((e) => e.class === cls.id);
      if (!has) continue;
      routes.push({
        pathFor: (lc) => urls.topicCountry(lc, cls.id, r.iso2),
        priority: 0.5,
      });
    }
  }

  // topic × year
  {
    const yearsByClass = new Map<string, Set<number>>();
    for (const e of listEvents()) {
      const y = new Date(e.occurredAt).getUTCFullYear();
      if (!yearsByClass.has(e.class)) yearsByClass.set(e.class, new Set());
      yearsByClass.get(e.class)!.add(y);
    }
    for (const cls of ALL_CLASSES) {
      const set = yearsByClass.get(cls.id);
      if (!set) continue;
      for (const y of set) {
        routes.push({
          pathFor: (lc) => urls.topicYear(lc, cls.id, y),
          priority: 0.5,
        });
      }
    }
  }

  // threat × country
  for (const t of THREATS) {
    for (const iso2 of t.affectedRegions) {
      if (!listRegions().some((r) => r.iso2 === iso2)) continue;
      routes.push({
        pathFor: (lc) => urls.threatCountry(lc, t.slug, iso2),
        priority: 0.55,
      });
    }
  }

  // equipment × operator
  for (const p of listEquipmentOperatorPairs()) {
    routes.push({
      pathFor: (lc) => urls.equipmentOperator(lc, p.equipmentSlug, p.operatorSlug),
      priority: 0.45,
    });
  }

  // source × country
  for (const s of PUBLIC_SOURCES) {
    const iso2 = s.country.toLowerCase();
    if (!listRegions().some((r) => r.iso2 === iso2)) continue;
    routes.push({
      pathFor: (lc) => urls.sourceCountry(lc, s.slug, iso2),
      priority: 0.5,
    });
  }

  // 3D: use-case task × country
  for (const t of USE_CASE_TASKS) {
    for (const r of listRegions()) {
      routes.push({
        pathFor: (lc) => urls.useCaseTaskCountry(lc, t.vertical, t.slug, r.iso2),
        priority: 0.5,
      });
    }
  }

  return sitemapResponse(routes);
}
