/**
 * Brief Template — standard template spec for intelligence briefs.
 *
 * Defines the required fields, distribution channels, word count,
 * and the two-reviewer rule for editorial compliance.
 *
 * Шаблон брифінгу: поля, канали розповсюдження, кількість слів, правило двох рецензентів.
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface BriefTemplate {
  /** Target audience description. / Опис цільової аудиторії. */
  audience: string;
  /** Primary SEO keyword cluster for this brief type. / Ключові слова для SEO. */
  keywordCluster: string[];
  /** Channels through which the brief is distributed. / Канали розповсюдження. */
  distributionChannels: string[];
  /** Target word count range [min, max]. / Діапазон кількості слів [мін, макс]. */
  wordCount: [number, number];
  /** Whether two reviewers are required before publishing. / Вимога двох рецензентів. */
  twoReviewerRequired: boolean;
  /** Mandatory sections in order. / Обов'язкові розділи по порядку. */
  sections: string[];
  /** Maximum hours between writing and publishing. / Макс. годин від написання до публікації. */
  maxProductionHours: number;
}

// ── Default template ──────────────────────────────────────────────────────────

/**
 * Default brief template used for weekly intelligence briefs.
 *
 * Стандартний шаблон для тижневих брифінгів.
 */
export const DEFAULT_BRIEF_TEMPLATE: BriefTemplate = {
  audience:
    "Security analysts, journalists, policy researchers, and informed general public " +
    "seeking verified situational-awareness on the conflict.",
  keywordCluster: [
    "Ukraine conflict update",
    "OSINT conflict map",
    "verified incidents Ukraine",
    "weekly intelligence brief",
    "Aegis Lens",
  ],
  distributionChannels: [
    "email-newsletter",
    "web-blog",
    "x",
    "linkedin",
    "mastodon",
    "rss",
  ],
  wordCount: [600, 1000],
  twoReviewerRequired: true,
  sections: [
    "Headline Summary (1 sentence)",
    "Key Statistics This Week",
    "Top 3 Verified Incidents",
    "Geographic / Frontline Changes",
    "Equipment & Technology Notes",
    "Confidence & Methodology Note",
    "Further Reading / Related Reports",
  ],
  maxProductionHours: 48,
};
