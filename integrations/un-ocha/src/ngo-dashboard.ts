/**
 * Data provider for the NGO persona dashboard.
 *
 * NGOs are the primary beneficiary of this integration (see TODO notes). This
 * module assembles a dashboard view: displacement intensity by oblast, cluster
 * needs/coverage, latest situation reports, and aid-corridor status — all from
 * ALREADY-redacted aggregate data.
 *
 * EN canonical; uk summaries included for the UI.
 */

import type {
  DtmDisplacementRecord,
  ClusterReport,
  ReliefWebReport,
  HumanitarianCluster,
  LocalizedSummary,
} from "./types";
import { CLUSTER_META, CLUSTERS, DEMO_CLUSTER_REPORTS } from "./clusters";
import { DEMO_DTM_RECORDS } from "./dtm-client";
import { DEMO_RELIEFWEB_REPORTS } from "./reliefweb-client";
import { redactRecord } from "./pii-redaction";

export interface OblastDisplacement {
  admin1Name: string;
  admin1Pcode?: string;
  totalIdps: number;
  centroid?: { lat: number; lon: number };
}

export interface ClusterCoverage {
  cluster: HumanitarianCluster;
  nameEn: string;
  nameUk: string;
  peopleInNeed: number;
  peopleReached: number;
  /** reached / inNeed, 0–1. */
  coverageRatio: number;
  worstSeverity: 1 | 2 | 3 | 4 | 5;
}

export interface NgoDashboard {
  generatedAt: string;
  country: string;
  headline: LocalizedSummary;
  totalIdps: number;
  displacementByOblast: OblastDisplacement[];
  clusterCoverage: ClusterCoverage[];
  recentReports: Array<{ id: string; title: string; url: string; publishedAt: string }>;
  /** Coverage gap = clusters under 60% reached. */
  underservedClusters: HumanitarianCluster[];
}

function aggregateDisplacement(records: DtmDisplacementRecord[]): { byOblast: OblastDisplacement[]; total: number } {
  const map = new Map<string, OblastDisplacement>();
  let total = 0;
  for (const r of records) {
    if (r.measure !== "stock") continue;
    total += r.individuals;
    const key = r.admin1Pcode ?? r.admin1Name;
    const existing = map.get(key);
    if (existing) {
      existing.totalIdps += r.individuals;
    } else {
      map.set(key, {
        admin1Name: r.admin1Name,
        admin1Pcode: r.admin1Pcode,
        totalIdps: r.individuals,
        centroid: r.centroid,
      });
    }
  }
  return {
    byOblast: [...map.values()].sort((a, b) => b.totalIdps - a.totalIdps),
    total,
  };
}

function aggregateClusters(reports: ClusterReport[]): ClusterCoverage[] {
  const byCluster = new Map<HumanitarianCluster, ClusterCoverage>();
  for (const rep of reports) {
    const meta = CLUSTER_META[rep.cluster];
    const cur = byCluster.get(rep.cluster) ?? {
      cluster: rep.cluster,
      nameEn: meta.nameEn,
      nameUk: meta.nameUk,
      peopleInNeed: 0,
      peopleReached: 0,
      coverageRatio: 0,
      worstSeverity: 1 as 1 | 2 | 3 | 4 | 5,
    };
    cur.peopleInNeed += rep.peopleInNeed ?? 0;
    cur.peopleReached += rep.peopleReached ?? 0;
    cur.worstSeverity = Math.max(cur.worstSeverity, rep.severity) as 1 | 2 | 3 | 4 | 5;
    byCluster.set(rep.cluster, cur);
  }
  for (const c of byCluster.values()) {
    c.coverageRatio = c.peopleInNeed > 0
      ? Math.round((c.peopleReached / c.peopleInNeed) * 100) / 100
      : 0;
  }
  return CLUSTERS.map((cl) => byCluster.get(cl)).filter(Boolean) as ClusterCoverage[];
}

export interface BuildDashboardInput {
  country?: string;
  displacement?: DtmDisplacementRecord[];
  clusters?: ClusterReport[];
  reports?: ReliefWebReport[];
}

/**
 * Build the NGO dashboard from aggregate inputs (defaults to demo fixtures).
 * Defensive: any input record that fails PII redaction is skipped.
 */
export function buildNgoDashboard(input: BuildDashboardInput = {}): NgoDashboard {
  const country = input.country ?? "UA";
  const displacement = (input.displacement ?? DEMO_DTM_RECORDS).filter((r) => redactRecord(r).ok);
  const clusters = (input.clusters ?? DEMO_CLUSTER_REPORTS).filter((r) => redactRecord(r).ok);
  const reports = (input.reports ?? DEMO_RELIEFWEB_REPORTS).filter((r) => redactRecord(r).ok);

  const { byOblast, total } = aggregateDisplacement(displacement);
  const clusterCoverage = aggregateClusters(clusters);
  const underserved = clusterCoverage.filter((c) => c.coverageRatio < 0.6).map((c) => c.cluster);

  return {
    generatedAt: new Date().toISOString(),
    country,
    headline: {
      en: `${total.toLocaleString("en")} IDPs across ${byOblast.length} oblasts; ${underserved.length} clusters under 60% coverage.`,
      uk: `${total.toLocaleString("uk")} ВПО у ${byOblast.length} областях; ${underserved.length} кластерів із покриттям нижче 60%.`,
    },
    totalIdps: total,
    displacementByOblast: byOblast,
    clusterCoverage,
    recentReports: reports.map((r) => ({ id: r.id, title: r.title, url: r.url, publishedAt: r.publishedAt })),
    underservedClusters: underserved,
  };
}
