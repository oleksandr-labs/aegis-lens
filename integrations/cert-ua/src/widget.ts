/**
 * CERT advisories feed widget (task 10).
 *
 * Headless data provider for a "Latest cyber advisories" sidebar/panel widget.
 * Returns a compact, display-ready, bilingual (UK + EN) list of recent advisories
 * with severity badge, sector chips, IOC/CVE counts and a source link.
 *
 * The widget explicitly surfaces the RETROSPECTIVE nature of the feed via a
 * disclaimer string — UI must render it so users do not mistake it for live data.
 */

import type { CertAdvisory, AdvisorySeverity, Sector } from "./types";
import { SECTOR_LABELS, SEVERITY_RANK } from "./types";
import { enrichAdvisory } from "./adapter";

export interface WidgetItem {
  advisoryId: string;
  source: "cert_ua" | "ssscip" | "misp";
  title: { en: string; uk: string };
  severity: AdvisorySeverity;
  severityRank: 1 | 2 | 3 | 4 | 5;
  severityColor: string;
  sectors: Array<{ key: Sector; label: { en: string; uk: string } }>;
  actor?: string;
  iocCount: number;
  cveCount: number;
  publishedAt: string;
  /** Human age, bilingual (e.g. "3 days ago"). */
  age: { en: string; uk: string };
  url: string;
}

export interface WidgetData {
  title: { en: string; uk: string };
  disclaimer: { en: string; uk: string };
  items: WidgetItem[];
  generatedAt: string;
}

const SEVERITY_COLOR: Record<AdvisorySeverity, string> = {
  info: "#94a3b8",
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#dc2626",
};

function ageLabel(publishedAt: string, now: number): { en: string; uk: string } {
  const days = Math.floor((now - Date.parse(publishedAt)) / 86_400_000);
  if (days <= 0) return { en: "today", uk: "сьогодні" };
  if (days === 1) return { en: "1 day ago", uk: "1 день тому" };
  return { en: `${days} days ago`, uk: `${days} дн. тому` };
}

export function buildWidget(advisories: CertAdvisory[], limit = 10, now = Date.now()): WidgetData {
  const items = advisories
    .map(enrichAdvisory)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
    .map((adv): WidgetItem => ({
      advisoryId: adv.advisoryId,
      source: adv.source,
      title: { uk: adv.titleUk, en: adv.titleEn ?? adv.titleUk },
      severity: adv.severity,
      severityRank: SEVERITY_RANK[adv.severity],
      severityColor: SEVERITY_COLOR[adv.severity],
      sectors: adv.sectors.map((s) => ({ key: s, label: SECTOR_LABELS[s] })),
      actor: adv.actor,
      iocCount: adv.iocs?.length ?? 0,
      cveCount: adv.cveIds?.length ?? 0,
      publishedAt: adv.publishedAt,
      age: ageLabel(adv.publishedAt, now),
      url: adv.url,
    }));

  return {
    title: { en: "Latest cyber advisories", uk: "Останні кіберсповіщення" },
    disclaimer: {
      en: "Retrospective feed: advisories from CERT-UA / SSSCIP typically lag the underlying activity by days. Not real-time.",
      uk: "Ретроспективна стрічка: оповіщення CERT-UA / Держспецзв'язку зазвичай відстають від подій на дні. Не в реальному часі.",
    },
    items,
    generatedAt: new Date(now).toISOString(),
  };
}
