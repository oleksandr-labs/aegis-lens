/**
 * SourceAdapter: normalize a CERT-UA / SSSCIP advisory into the canonical
 * Aegis Lens Event (packages/event-schema/src/v1.ts).
 *
 * Mapping notes:
 *   - class          → "cyberattack"
 *   - subclass       → sector or actor (e.g. "energy", "gov")
 *   - occurredAt     → advisory.occurredAt if known, else publishedAt (RETROSPECTIVE)
 *   - severity       → SEVERITY_RANK[advisory.severity]  (1–5)
 *   - confidence     → high (0.85) — official state-CERT source, but the EVENT is
 *                      retrospective/aggregate, so verificationState is "verified".
 *   - regionCode     → first named region (or omitted for nationwide)
 *   - location       → region centroid (for choropleth placement)
 *   - citations      → the source advisory URL (provenance preserved)
 *   - rawPayload     → the original advisory (incl. IOCs/CVEs) for ingest only.
 */

import type { AegisEventV1 } from "../../../packages/event-schema/src/v1";
import { EVENT_SCHEMA_VERSION } from "../../../packages/event-schema/src/v1";
import type { CertAdvisory, CyberSource } from "./types";
import { SEVERITY_RANK, CYBER_REGIONS, SECTOR_LABELS } from "./types";
import { tagAdvisory } from "./sector-tagging";
import { enrichAdvisoryWithIocs } from "./ioc-extractor";
import { enrichAdvisoryWithCves } from "./cve-xref";

const SOURCE_TYPE_MAP: Record<CyberSource, AegisEventV1["citations"][number]["sourceType"]> = {
  cert_ua: "official_statement",
  ssscip: "official_statement",
  misp: "api",
};

/** Fully enrich an advisory (sector + region + IOC + CVE) before normalization. */
export function enrichAdvisory(adv: CertAdvisory): CertAdvisory {
  return enrichAdvisoryWithCves(enrichAdvisoryWithIocs(tagAdvisory(adv)));
}

export function advisoryToEvent(raw: CertAdvisory, orgId = "public"): AegisEventV1 {
  const adv = enrichAdvisory(raw);
  const primaryRegion = adv.regions.find((r) => r !== "UA-ALL");
  const regionInfo = primaryRegion ? CYBER_REGIONS[primaryRegion] : undefined;
  const occurredAt = adv.occurredAt ?? adv.publishedAt;
  const now = new Date().toISOString();
  const sectorLabel = adv.sectors[0] ? SECTOR_LABELS[adv.sectors[0]] : undefined;

  return {
    eventId: `cyber-${adv.advisoryId.replace(/[^a-z0-9-]/gi, "_")}`,
    schemaVersion: EVENT_SCHEMA_VERSION,
    class: "cyberattack",
    subclass: adv.sectors[0] ?? adv.actor ?? adv.source,
    location: regionInfo ? { lat: regionInfo.center[1], lon: regionInfo.center[0], uncertaintyM: 100_000 } : undefined,
    country: "UA",
    regionCode: primaryRegion,
    severity: SEVERITY_RANK[adv.severity],
    confidence: 0.85,
    verificationState: "verified",
    occurredAt,
    ingestedAt: now,
    updatedAt: now,
    title: {
      uk: adv.titleUk,
      en: adv.titleEn ?? cyberTitleEn(adv, sectorLabel?.en),
    },
    summary: {
      uk: adv.bodyText.slice(0, 400),
      en: adv.titleEn ?? cyberTitleEn(adv, sectorLabel?.en),
    },
    originalText: adv.bodyText,
    citations: [
      {
        sourceId: adv.advisoryId,
        sourceType: SOURCE_TYPE_MAP[adv.source],
        url: adv.url,
        capturedAt: now,
      },
    ],
    orgId,
    isPublic: true,
    isRetracted: false,
    rawPayload: {
      source: adv.source,
      severity: adv.severity,
      sectors: adv.sectors,
      regions: adv.regions,
      actor: adv.actor,
      iocs: adv.iocs,
      cveIds: adv.cveIds,
      publishedAt: adv.publishedAt,
    },
  };
}

function cyberTitleEn(adv: CertAdvisory, sectorEn?: string): string {
  const who = adv.actor ? ` (${adv.actor})` : "";
  const where = sectorEn ? ` — ${sectorEn} sector` : "";
  return `Cyber advisory${where}${who}`;
}

/** Convenience: normalize many advisories. */
export function advisoriesToEvents(advs: CertAdvisory[], orgId = "public"): AegisEventV1[] {
  return advs.map((a) => advisoryToEvent(a, orgId));
}
