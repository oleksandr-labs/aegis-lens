export type ReportType =
  | "regional_brief"
  | "incident_dossier"
  | "weekly_digest"
  | "custom_query";

export type ReportStatus = "published" | "draft" | "pending_review";

export type Report = {
  slug: string;
  title: string;
  subtitle: string;
  type: ReportType;
  status: ReportStatus;
  publishedAt: string;
  region: string;
  authors: string[];
  tags: string[];
  summary: string;
  pageCount: number;
  downloadable: boolean;
};

export const REPORTS: Report[] = [
  {
    slug: "ukraine-weekly-2026-w22",
    title: "Ukraine Intelligence Brief — Week 22, 2026",
    subtitle:
      "Comprehensive verified intelligence summary covering military, infrastructure, and civilian events",
    type: "weekly_digest",
    status: "published",
    publishedAt: "2026-06-01",
    region: "Ukraine",
    authors: ["Aegis Editorial"],
    tags: ["military_action", "infrastructure", "civilian_alert"],
    summary:
      "This week saw a 23% increase in verified drone activity in Kharkiv Oblast, with corroborated strikes on two power-distribution substations. Air-raid alert volume remained elevated across the northeast. Maritime corridor metrics near Odesa remained stable, with no new surface incidents logged.",
    pageCount: 12,
    downloadable: true,
  },
  {
    slug: "kharkiv-incident-dossier-may-2026",
    title: "Kharkiv Oblast Incident Dossier — May 2026",
    subtitle:
      "Detailed analysis of verified incidents in Kharkiv Oblast with source provenance chains",
    type: "incident_dossier",
    status: "published",
    publishedAt: "2026-05-31",
    region: "Kharkiv Oblast",
    authors: ["Aegis OSINT Team"],
    tags: ["military_action", "infrastructure"],
    summary:
      "A systematic record of 47 verified incidents in Kharkiv Oblast during May 2026, cross-referenced against open-source imagery, municipal alert feeds, and independent field reporting. Severity distribution skews toward levels 3–4; confidence averaging 0.76.",
    pageCount: 28,
    downloadable: true,
  },
  {
    slug: "black-sea-maritime-brief-q2-2026",
    title: "Black Sea Maritime Intelligence Brief — Q2 2026",
    subtitle: "AIS correlation, vessel tracking, and surface incident analysis",
    type: "regional_brief",
    status: "published",
    publishedAt: "2026-05-20",
    region: "Black Sea",
    authors: ["Maritime Desk"],
    tags: ["maritime"],
    summary:
      "Black Sea maritime activity analysis covering Q2 2026 with AIS data correlation. Grain-corridor traffic held at seasonal norms; three anomalous vessel transponder gaps logged in the western basin. No confirmed surface incidents during the reporting window.",
    pageCount: 8,
    downloadable: true,
  },
  {
    slug: "cyber-operations-q1-2026",
    title: "Cyber Operations Landscape — Q1 2026",
    subtitle: "DDoS campaigns, intrusion attempts, and disinformation operations",
    type: "regional_brief",
    status: "published",
    publishedAt: "2026-04-15",
    region: "Ukraine + EU",
    authors: ["Cyber Desk"],
    tags: ["cyber"],
    summary:
      "Quarterly cyber threat landscape report covering documented operations against Ukrainian government infrastructure and allied EU networks in Q1 2026. Twelve distinct DDoS campaigns attributed to two threat clusters. Disinformation operations intensified in March across four European languages.",
    pageCount: 15,
    downloadable: false,
  },
];

export function listReports(): Report[] {
  return [...REPORTS].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getReportBySlug(slug: string): Report | null {
  return REPORTS.find((r) => r.slug === slug) ?? null;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  regional_brief: "Regional Brief",
  incident_dossier: "Incident Dossier",
  weekly_digest: "Weekly Digest",
  custom_query: "Custom Query",
};

export const REPORT_TYPE_COLOR: Record<ReportType, string> = {
  regional_brief: "#4ea1ff",
  incident_dossier: "#ef4444",
  weekly_digest: "#22c55e",
  custom_query: "#a855f7",
};
