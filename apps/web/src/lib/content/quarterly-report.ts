/**
 * Quarterly Report — "State of the Conflict" quarterly report configuration.
 *
 * Also contains the Year-in-Review config for the December annual edition.
 *
 * Квартальний звіт «Стан конфлікту» + річний підсумок (грудень).
 */

// ── Quarterly ─────────────────────────────────────────────────────────────────

/** Calendar months when quarterly reports are published (1-indexed). / Місяці публікації. */
export const QUARTERLY_REPORT_MONTHS = [1, 4, 7, 10] as const;

export interface QuarterlyReportConfig {
  /** Quarter label, e.g. "Q1 2024". / Мітка кварталу. */
  quarterLabel: string;
  /** ISO-8601 start of the covered period. / Початок звітного periodу. */
  periodStart: string;
  /** ISO-8601 end of the covered period. / Кінець звітного periodу. */
  periodEnd: string;
  /** ISO-8601 target publication date. / Цільова дата публікації. */
  publishTarget: string;
  /** Authors (by-line). / Автори. */
  authors: string[];
  /** Reviewers (minimum two). / Рецензенти (мінімум двоє). */
  reviewers: string[];
  /** Canonical URL when published. / Канонічний URL. */
  canonicalUrl?: string;
  /** Whether the report has been published. / Чи звіт опублікований. */
  published: boolean;
}

/**
 * Build the standard section outline for a quarterly report.
 *
 * Формує стандартний план розділів квартального звіту.
 */
export function buildQuarterlyReportOutline(): string[] {
  return [
    "Executive Summary",
    "Key Statistics: Verified Events by Category",
    "Geographic Overview: Frontline Changes",
    "Significant Incidents & Attribution Highlights",
    "Equipment & Technology Trends",
    "Open-Source Intelligence Methodology Notes",
    "Confidence-Level Distribution Analysis",
    "Humanitarian Impact Indicators",
    "Media Coverage & Citation Index",
    "Outlook: Scenarios for Next Quarter",
    "Appendix A: Data Sources",
    "Appendix B: Methodology Changelog",
  ];
}

// ── Year-in-Review ────────────────────────────────────────────────────────────

export interface YearInReviewConfig {
  /** Four-digit year being reviewed. / Рік, що переглядається. */
  year: number;
  /** ISO-8601 target publication date (typically Dec 15). / Дата публікації. */
  publishTarget: string;
  /** Authors. / Автори. */
  authors: string[];
  /** Reviewers. / Рецензенти. */
  reviewers: string[];
  /** Total verified events for the year. / Загальна кількість подій за рік. */
  totalEvents?: number;
  /** Canonical URL when published. / Канонічний URL. */
  canonicalUrl?: string;
  /** Whether published. / Чи опублікований. */
  published: boolean;
}

/**
 * Build the standard section outline for a year-in-review.
 *
 * Формує план розділів річного підсумку.
 */
export function buildYearInReviewOutline(year: number): string[] {
  return [
    `${year} in Numbers: Top-Level Statistics`,
    "The 10 Most Significant Verified Events",
    "Frontline Map: Start vs End of Year",
    "Technology & Weapon System Trends",
    "Open-Source Intelligence Breakthroughs",
    "Methodology Improvements and Platform Changes",
    "Media Citations & Research Impact",
    "Contributor Program Highlights",
    `Looking Ahead: ${year + 1} Outlook`,
    "Appendix: Data Sources and License",
  ];
}
