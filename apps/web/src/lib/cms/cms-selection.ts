/**
 * CMS Selection — decision record for editorial CMS choice.
 * Keystatic selected: git-native, MDX-first, free for self-hosted.
 *
 * Вибір CMS — рішення щодо вибору редакторської CMS.
 * Обрано Keystatic: git-native, MDX, безкоштовний для self-hosted.
 */

// ── Decision ──────────────────────────────────────────────────────────────────

export const CHOSEN_CMS = "keystatic" as const;

/**
 * English rationale note for the CMS decision.
 *
 * Англійська нотатка-обґрунтування вибору CMS.
 */
export const CMS_DECISION_NOTE_EN =
  "Keystatic is git-native (content as MDX in repo), has zero external service dependency, " +
  "first-class Next.js App Router support, free for self-hosted, and MDX embeds map/chart " +
  "components directly. No database or API key needed for editorial workflows.";

/**
 * Ukrainian rationale note for the CMS decision.
 *
 * Українська нотатка-обґрунтування вибору CMS.
 */
export const CMS_DECISION_NOTE_UK =
  "Keystatic є git-native (контент як MDX у репозиторії), не залежить від зовнішніх сервісів, " +
  "має першокласну підтримку Next.js App Router, безкоштовний для self-hosted, а MDX дозволяє " +
  "вбудовувати компоненти карти/графіків безпосередньо. Жодних БД або API-ключів не потрібно.";

// ── Alternatives considered ───────────────────────────────────────────────────

/**
 * CMS alternatives evaluated before settling on Keystatic.
 *
 * Альтернативи CMS, розглянуті перед вибором Keystatic.
 */
export const CMS_ALTERNATIVES = ["sanity", "payload", "tinacms"] as const;
export type CmsAlternative = (typeof CMS_ALTERNATIVES)[number];

// ── Selection criteria with scores ───────────────────────────────────────────

export interface CmsSelectionCriterion {
  /** Short label for the criterion. / Коротка назва критерію. */
  criterion: string;
  /** Weight 1–5 (5 = most important). / Вага 1–5 (5 = найважливіший). */
  weight: number;
  /** Score for Keystatic 1–10. / Оцінка Keystatic 1–10. */
  keystatic: number;
  /** Score for Sanity 1–10. */
  sanity: number;
  /** Score for Payload 1–10. */
  payload: number;
  /** Score for TinaCMS 1–10. */
  tinacms: number;
}

/**
 * Ten selection criteria with weighted scores for each CMS candidate.
 *
 * 10 критеріїв вибору з зваженими оцінками для кожного кандидата.
 */
export const CMS_SELECTION_CRITERIA: CmsSelectionCriterion[] = [
  {
    criterion: "git-native / no external service",
    weight: 5,
    keystatic: 10,
    sanity: 2,
    payload: 7,
    tinacms: 9,
  },
  {
    criterion: "MDX support",
    weight: 5,
    keystatic: 10,
    sanity: 5,
    payload: 6,
    tinacms: 10,
  },
  {
    criterion: "Next.js App Router integration",
    weight: 5,
    keystatic: 10,
    sanity: 8,
    payload: 9,
    tinacms: 7,
  },
  {
    criterion: "zero cost for self-hosted",
    weight: 4,
    keystatic: 10,
    sanity: 3,
    payload: 10,
    tinacms: 8,
  },
  {
    criterion: "editorial UI quality",
    weight: 4,
    keystatic: 8,
    sanity: 10,
    payload: 7,
    tinacms: 8,
  },
  {
    criterion: "multi-locale / i18n support",
    weight: 4,
    keystatic: 7,
    sanity: 9,
    payload: 8,
    tinacms: 6,
  },
  {
    criterion: "visual preview",
    weight: 3,
    keystatic: 8,
    sanity: 9,
    payload: 7,
    tinacms: 9,
  },
  {
    criterion: "offline / air-gapped operation",
    weight: 3,
    keystatic: 10,
    sanity: 1,
    payload: 8,
    tinacms: 9,
  },
  {
    criterion: "community & documentation",
    weight: 2,
    keystatic: 7,
    sanity: 10,
    payload: 8,
    tinacms: 7,
  },
  {
    criterion: "TypeScript-first API",
    weight: 2,
    keystatic: 10,
    sanity: 9,
    payload: 10,
    tinacms: 7,
  },
];

// ── Weighted total helper ─────────────────────────────────────────────────────

/**
 * Compute the weighted score total for a given CMS across all criteria.
 *
 * Обчислює зважену суму оцінок для заданої CMS за всіма критеріями.
 */
export function computeWeightedScore(
  cms: "keystatic" | "sanity" | "payload" | "tinacms",
): number {
  return CMS_SELECTION_CRITERIA.reduce(
    (sum, c) => sum + c.weight * c[cms],
    0,
  );
}
