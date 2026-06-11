/**
 * Editorial digest configuration — weekly intelligence brief and monthly deep dive.
 * Separate from lifecycle; subscribers opt in voluntarily.
 * One-click unsubscribe required (RFC 8058 compliant).
 */

export interface EditorialDigestConfig {
  id: string;
  cadence: "weekly" | "monthly";
  /** UTC day of week for weekly (0=Sunday, 1=Monday, …, 2=Tuesday…) */
  dayOfWeekUtc?: number;
  /** UTC hour to send */
  sendHourUtc: number;
  /** Whether to use locale-aware send-time (per-user timezone) */
  localeAware: boolean;
  subject_en: string;
  subject_uk: string;
  preheader_en: string;
  preheader_uk: string;
  /** Unsubscribe is always required — this field is for documentation */
  unsubscribeRequired: true;
  /** List-Unsubscribe header method per RFC 8058 */
  unsubscribeMethod: "one-click" | "link";
}

// ── Weekly intelligence brief ─────────────────────────────────────────────────

/**
 * Weekly intelligence brief.
 * Sent on Tuesdays at 10:00 UTC.
 * Subscribers opt in at registration or from /settings/notifications.
 */
export const EDITORIAL_DIGEST_CONFIG: EditorialDigestConfig = {
  id: "weekly-intelligence-brief",
  cadence: "weekly",
  dayOfWeekUtc: 2, // Tuesday
  sendHourUtc: 10,
  localeAware: true,
  subject_en: "This week in conflict intelligence — Aegis Lens Brief",
  subject_uk: "Цього тижня в розвідці конфліктів — Aegis Lens Брифінг",
  preheader_en: "Verified events, trend analysis, and one data story you shouldn't miss.",
  preheader_uk: "Верифіковані події, аналіз тенденцій та один датасторі, який варто прочитати.",
  unsubscribeRequired: true,
  unsubscribeMethod: "one-click",
};

// ── Monthly deep dive ─────────────────────────────────────────────────────────

export const MONTHLY_DEEP_DIVE_CONFIG: EditorialDigestConfig = {
  id: "monthly-deep-dive",
  cadence: "monthly",
  sendHourUtc: 10,
  localeAware: true,
  subject_en: "Aegis Lens Monthly: deep analysis, open data release, and methodology update",
  subject_uk: "Aegis Lens щомісяця: глибокий аналіз, відкриті дані та оновлення методології",
  preheader_en: "One long read. Fully sourced. Worth it.",
  preheader_uk: "Одна довга стаття. Повністю з посиланнями. Варто прочитати.",
  unsubscribeRequired: true,
  unsubscribeMethod: "one-click",
};

// ── Region briefs ─────────────────────────────────────────────────────────────

export const REGION_BRIEF_REGIONS = [
  "ukraine",
  "russia",
  "middle-east",
  "black-sea",
  "baltics",
  "central-asia",
] as const;

export type RegionBriefRegion = (typeof REGION_BRIEF_REGIONS)[number];

export function buildRegionBriefConfig(region: RegionBriefRegion): EditorialDigestConfig {
  const regionLabels: Record<RegionBriefRegion, { en: string; uk: string }> = {
    ukraine: { en: "Ukraine", uk: "Україна" },
    russia: { en: "Russia", uk: "Росія" },
    "middle-east": { en: "Middle East", uk: "Близький Схід" },
    "black-sea": { en: "Black Sea", uk: "Чорне море" },
    baltics: { en: "Baltics", uk: "Балтія" },
    "central-asia": { en: "Central Asia", uk: "Центральна Азія" },
  };
  const label = regionLabels[region];
  return {
    id: `region-brief-${region}`,
    cadence: "weekly",
    dayOfWeekUtc: 3, // Wednesday
    sendHourUtc: 9,
    localeAware: true,
    subject_en: `${label.en} Intelligence Brief — Aegis Lens`,
    subject_uk: `Розвідувальний брифінг: ${label.uk} — Aegis Lens`,
    preheader_en: `Weekly verified events and analysis for ${label.en}.`,
    preheader_uk: `Щотижневі верифіковані події та аналіз: ${label.uk}.`,
    unsubscribeRequired: true,
    unsubscribeMethod: "one-click",
  };
}
