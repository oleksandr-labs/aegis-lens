/**
 * Per-sector threat pages data provider (task 11).
 *
 * Aggregates advisories by critical-infrastructure sector (energy / telecom /
 * finance / gov / media / …) into a page-ready model: headline stats, severity
 * distribution, named threat actors, recent advisories, and a de-duplicated IOC
 * roll-up. Powers /threats/<sector> pages. Bilingual (UK + EN).
 */

import type { CertAdvisory, Sector, Ioc, IocType } from "./types";
import { SECTOR_LABELS } from "./types";
import { enrichAdvisory } from "./adapter";
import { buildWidget, type WidgetItem } from "./widget";

export interface SectorThreatPage {
  sector: Sector;
  label: { en: string; uk: string };
  generatedAt: string;
  stats: {
    advisoryCount: number;
    criticalCount: number;
    last30dCount: number;
  };
  /** Threat actors named across this sector's advisories. */
  actors: string[];
  /** Severity histogram. */
  severityBreakdown: Record<"info" | "low" | "medium" | "high" | "critical", number>;
  /** Recent advisories (widget-item shaped) for the sector. */
  recent: WidgetItem[];
  /** De-duplicated IOCs observed across the sector, counted by type. */
  iocs: Ioc[];
  iocByType: Record<IocType, number>;
  disclaimer: { en: string; uk: string };
}

const ALL_SECTORS: Sector[] = [
  "energy", "telecom", "finance", "gov", "media", "transport", "defense", "healthcare", "other",
];

const RETRO_DISCLAIMER = {
  en: "Retrospective data: cyber advisories lag the underlying activity by days. Counts reflect published advisories, not live incidents.",
  uk: "Ретроспективні дані: кіберсповіщення відстають від подій на дні. Лічильники відображають опубліковані оповіщення, а не активні інциденти.",
};

function emptyIocByType(): Record<IocType, number> {
  return { ipv4: 0, ipv6: 0, domain: 0, url: 0, md5: 0, sha1: 0, sha256: 0, email: 0, cve: 0 };
}

/** Build a single sector page. */
export function buildSectorPage(sector: Sector, all: CertAdvisory[], now = Date.now()): SectorThreatPage {
  const enriched = all.map(enrichAdvisory);
  const inSector = enriched.filter((a) => a.sectors.includes(sector));

  const severityBreakdown = { info: 0, low: 0, medium: 0, high: 0, critical: 0 };
  const actors = new Set<string>();
  const iocSeen = new Set<string>();
  const iocs: Ioc[] = [];
  const iocByType = emptyIocByType();
  let last30d = 0;
  let critical = 0;

  for (const a of inSector) {
    severityBreakdown[a.severity]++;
    if (a.severity === "critical") critical++;
    if (a.actor) a.actor.split(/[,/]/).map((s) => s.trim()).filter(Boolean).forEach((s) => actors.add(s));
    if (now - Date.parse(a.publishedAt) <= 30 * 86_400_000) last30d++;
    for (const ioc of a.iocs ?? []) {
      const key = `${ioc.type}:${ioc.value}`;
      if (iocSeen.has(key)) continue;
      iocSeen.add(key);
      iocs.push(ioc);
      iocByType[ioc.type]++;
    }
  }

  return {
    sector,
    label: SECTOR_LABELS[sector],
    generatedAt: new Date(now).toISOString(),
    stats: { advisoryCount: inSector.length, criticalCount: critical, last30dCount: last30d },
    actors: Array.from(actors),
    severityBreakdown,
    recent: buildWidget(inSector, 10, now).items,
    iocs,
    iocByType,
    disclaimer: RETRO_DISCLAIMER,
  };
}

/** Build pages for every sector that has at least one advisory. */
export function buildAllSectorPages(all: CertAdvisory[], now = Date.now()): SectorThreatPage[] {
  return ALL_SECTORS
    .map((s) => buildSectorPage(s, all, now))
    .filter((p) => p.stats.advisoryCount > 0);
}

export { ALL_SECTORS };
