/**
 * Humanitarian cluster taxonomy (IASC cluster system) + per-cluster report model.
 *
 * The IASC cluster approach groups humanitarian response by sector, each led by
 * a designated agency. We model the canonical clusters plus helpers to classify
 * free-form ReliefWeb themes / HDX tags into a cluster.
 *
 * EN canonical; uk provided for display.
 */

import type {
  HumanitarianCluster,
  ClusterMeta,
  ClusterReport,
  LocalizedSummary,
} from "./types";

export const CLUSTER_META: Record<HumanitarianCluster, ClusterMeta> = {
  health:        { cluster: "health",        nameEn: "Health",            nameUk: "Здоров'я",                  leadAgency: "WHO",              color: "#ef4444" },
  shelter:       { cluster: "shelter",       nameEn: "Shelter & NFI",     nameUk: "Житло та непродовольчі товари", leadAgency: "UNHCR/IFRC",   color: "#8b5cf6" },
  food_security: { cluster: "food_security", nameEn: "Food Security",     nameUk: "Продовольча безпека",       leadAgency: "WFP/FAO",          color: "#f59e0b" },
  wash:          { cluster: "wash",          nameEn: "WASH",              nameUk: "Вода, санітарія, гігієна",  leadAgency: "UNICEF",           color: "#0ea5e9" },
  protection:    { cluster: "protection",    nameEn: "Protection",        nameUk: "Захист",                    leadAgency: "UNHCR",            color: "#22c55e" },
  education:     { cluster: "education",      nameEn: "Education",         nameUk: "Освіта",                    leadAgency: "UNICEF/Save",      color: "#14b8a6" },
  nutrition:     { cluster: "nutrition",      nameEn: "Nutrition",         nameUk: "Харчування",                leadAgency: "UNICEF",           color: "#eab308" },
  logistics:     { cluster: "logistics",      nameEn: "Logistics",         nameUk: "Логістика",                 leadAgency: "WFP",              color: "#64748b" },
  early_recovery:{ cluster: "early_recovery", nameEn: "Early Recovery",    nameUk: "Раннє відновлення",         leadAgency: "UNDP",             color: "#a3a3a3" },
  ccm:           { cluster: "ccm",            nameEn: "Camp Coordination", nameUk: "Координація таборів",       leadAgency: "IOM/UNHCR",        color: "#f472b6" },
  multi:         { cluster: "multi",          nameEn: "Multi-sector",      nameUk: "Багатосекторний",           leadAgency: "OCHA",             color: "#94a3b8" },
};

/** Ordered list (display order). */
export const CLUSTERS: HumanitarianCluster[] = [
  "health", "shelter", "food_security", "wash", "protection",
  "education", "nutrition", "logistics", "early_recovery", "ccm", "multi",
];

/** The four clusters the TODO explicitly enumerates. */
export const CORE_CLUSTERS: HumanitarianCluster[] = ["health", "shelter", "food_security", "wash"];

// Keyword → cluster classification (lowercase substring match).
const CLUSTER_KEYWORDS: Array<{ cluster: HumanitarianCluster; keys: string[] }> = [
  { cluster: "health",        keys: ["health", "medical", "hospital", "disease", "mhpss", "здоров"] },
  { cluster: "wash",          keys: ["wash", "water", "sanitation", "hygiene", "вода", "санітар"] },
  { cluster: "food_security", keys: ["food", "ipc", "famine", "agriculture", "продовольч", "харч"] },
  { cluster: "shelter",       keys: ["shelter", "nfi", "housing", "accommodation", "житло"] },
  { cluster: "protection",    keys: ["protection", "gbv", "child protection", "mine action", "захист"] },
  { cluster: "nutrition",     keys: ["nutrition", "malnutrition", "stunting"] },
  { cluster: "education",     keys: ["education", "school", "learning", "освіт"] },
  { cluster: "logistics",     keys: ["logistics", "supply chain", "transport corridor"] },
  { cluster: "ccm",           keys: ["camp", "collective site", "ccm", "cccm"] },
  { cluster: "early_recovery",keys: ["early recovery", "livelihood", "rehabilitation"] },
];

/**
 * Classify free-form themes/tags into a single best-fit cluster.
 * Returns "multi" when zero or multiple distinct clusters tie.
 */
export function classifyCluster(themes: string[]): HumanitarianCluster {
  const haystack = themes.join(" ").toLowerCase();
  const hits = new Set<HumanitarianCluster>();
  for (const { cluster, keys } of CLUSTER_KEYWORDS) {
    if (keys.some((k) => haystack.includes(k))) hits.add(cluster);
  }
  if (hits.size === 1) return [...hits][0];
  return "multi";
}

/** Cluster severity 1–5 → localized label. */
const SEVERITY_LABELS: Record<1 | 2 | 3 | 4 | 5, LocalizedSummary> = {
  1: { en: "Minimal", uk: "Мінімальний" },
  2: { en: "Stressed", uk: "Напружений" },
  3: { en: "Crisis", uk: "Кризовий" },
  4: { en: "Emergency", uk: "Надзвичайний" },
  5: { en: "Catastrophic", uk: "Катастрофічний" },
};

export function clusterSeverityLabel(severity: 1 | 2 | 3 | 4 | 5): LocalizedSummary {
  return SEVERITY_LABELS[severity];
}

/**
 * Build a normalized ClusterReport from partial input, classifying the cluster
 * from themes when not explicitly provided and computing a default summary.
 */
export function buildClusterReport(input: {
  id: string;
  cluster?: HumanitarianCluster;
  themes?: string[];
  country: string;
  admin1Name?: string;
  admin1Pcode?: string;
  centroid?: { lat: number; lon: number };
  peopleInNeed?: number;
  peopleTargeted?: number;
  peopleReached?: number;
  severity: 1 | 2 | 3 | 4 | 5;
  reportingPeriod: string;
  source: string;
  url?: string;
  summary?: LocalizedSummary;
}): ClusterReport {
  const cluster = input.cluster ?? classifyCluster(input.themes ?? []);
  const meta = CLUSTER_META[cluster];
  const sevLabel = clusterSeverityLabel(input.severity);
  const area = input.admin1Name ? ` (${input.admin1Name})` : "";

  const summary: LocalizedSummary = input.summary ?? {
    en: `${meta.nameEn} cluster — ${sevLabel.en} severity${area}.`,
    uk: `Кластер «${meta.nameUk}» — рівень «${sevLabel.uk ?? sevLabel.en}»${area}.`,
  };

  return {
    id: input.id,
    cluster,
    country: input.country,
    admin1Name: input.admin1Name,
    admin1Pcode: input.admin1Pcode,
    centroid: input.centroid,
    peopleInNeed: input.peopleInNeed,
    peopleTargeted: input.peopleTargeted,
    peopleReached: input.peopleReached,
    severity: input.severity,
    reportingPeriod: input.reportingPeriod,
    summary,
    source: input.source,
    url: input.url,
  };
}

/** Demo per-cluster reports (Ukraine, aggregate — no PII). */
export const DEMO_CLUSTER_REPORTS: ClusterReport[] = [
  buildClusterReport({
    id: "cluster-health-ua-kharkiv-2026q1",
    cluster: "health",
    country: "UA",
    admin1Name: "Kharkivska",
    admin1Pcode: "UA63",
    centroid: { lat: 49.99, lon: 36.23 },
    peopleInNeed: 410000,
    peopleTargeted: 260000,
    peopleReached: 188000,
    severity: 4,
    reportingPeriod: "2026-Q1",
    source: "Health Cluster Ukraine",
    url: "https://www.humanitarianresponse.info/en/operations/ukraine/health",
  }),
  buildClusterReport({
    id: "cluster-shelter-ua-donetsk-2026q1",
    cluster: "shelter",
    country: "UA",
    admin1Name: "Donetska",
    admin1Pcode: "UA14",
    centroid: { lat: 48.02, lon: 37.8 },
    peopleInNeed: 530000,
    peopleTargeted: 300000,
    peopleReached: 142000,
    severity: 5,
    reportingPeriod: "2026-Q1",
    source: "Shelter/NFI Cluster Ukraine",
  }),
  buildClusterReport({
    id: "cluster-food-ua-kherson-2026q1",
    cluster: "food_security",
    country: "UA",
    admin1Name: "Khersonska",
    admin1Pcode: "UA65",
    centroid: { lat: 46.64, lon: 32.61 },
    peopleInNeed: 290000,
    peopleTargeted: 210000,
    peopleReached: 175000,
    severity: 4,
    reportingPeriod: "2026-Q1",
    source: "Food Security & Livelihoods Cluster",
  }),
  buildClusterReport({
    id: "cluster-wash-ua-zaporizhzhia-2026q1",
    cluster: "wash",
    country: "UA",
    admin1Name: "Zaporizka",
    admin1Pcode: "UA23",
    centroid: { lat: 47.84, lon: 35.14 },
    peopleInNeed: 360000,
    peopleTargeted: 240000,
    peopleReached: 201000,
    severity: 3,
    reportingPeriod: "2026-Q1",
    source: "WASH Cluster Ukraine",
  }),
];
