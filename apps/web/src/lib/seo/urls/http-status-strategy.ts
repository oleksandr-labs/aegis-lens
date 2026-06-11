/**
 * HTTP status code strategy — 200 / 301 / 302 / 404 / 410.
 *
 * Covers all decisions from TODO/urls_slugs/TODO_404_410_strategy.md.
 * Use checkUrlStatus() to get the correct decision for any URL.
 *
 * Usage:
 *   import { checkUrlStatus, HTTP_STATUS_RULES } from "@/lib/seo/urls/http-status-strategy";
 *
 *   const decision = checkUrlStatus(true, false, null);
 *   // → { pageType: "active", correctCode: 200, noindex: false, ... }
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** The subset of HTTP status codes relevant to SEO routing decisions. */
export type HttpStatusCode = 200 | 301 | 302 | 404 | 410;

/**
 * Logical classification of a URL from the SEO perspective.
 *
 * - active            — content exists and is canonical here
 * - moved             — content has permanently moved (301); document the target
 * - intentionally-retired — entity deleted on purpose; use 410 Gone, not 404
 * - random-url        — never existed; 404
 * - soft-404-risk     — page returns 200 but content is empty or "not found"
 */
export type PageType =
  | "active"
  | "moved"
  | "intentionally-retired"
  | "random-url"
  | "soft-404-risk";

/** Decision record returned for a given page type. */
export interface StatusDecision {
  pageType: PageType;
  correctCode: HttpStatusCode;
  /** Whether the page should carry a `noindex` robots directive. */
  noindex: boolean;
  /** Rationale in English. */
  rationale_en: string;
  /** Rationale in Ukrainian. */
  rationale_uk: string;
}

// ── Rule table ─────────────────────────────────────────────────────────────────

/**
 * Canonical decision for each page type.
 *
 * Key: PageType
 * Value: the StatusDecision that should be applied.
 */
export const HTTP_STATUS_RULES: Record<PageType, StatusDecision> = {
  active: {
    pageType: "active",
    correctCode: 200,
    noindex: false,
    rationale_en:
      "Content exists and is canonical at this URL. Return 200 and allow indexing.",
    rationale_uk:
      "Контент існує і є канонічним за цим URL. Повертайте 200 і дозвольте індексування.",
  },

  moved: {
    pageType: "moved",
    correctCode: 301,
    noindex: true,
    rationale_en:
      "Content has permanently moved. Use 301 to pass link equity to the new URL. " +
      "Use 302 only for explicitly temporary redirects — document the reason and expected duration.",
    rationale_uk:
      "Контент перемістився назавжди. Використовуйте 301 для передачі link equity на новий URL. " +
      "302 — лише для явно тимчасових перенаправлень; задокументуйте причину та очікувану тривалість.",
  },

  "intentionally-retired": {
    pageType: "intentionally-retired",
    correctCode: 410,
    noindex: true,
    rationale_en:
      "Entity was intentionally retired. Return 410 Gone (not 404) so crawlers know the removal " +
      "is deliberate and stop recrawling faster. Document the retirement reason in the 410 reason field.",
    rationale_uk:
      "Сутність навмисно виведена з експлуатації. Повертайте 410 Gone (не 404), щоб сканери знали, " +
      "що видалення навмисне, і швидше зупинили повторний обхід. Задокументуйте причину в полі 410.",
  },

  "random-url": {
    pageType: "random-url",
    correctCode: 404,
    noindex: true,
    rationale_en:
      "URL never existed in the system. Return 404 Not Found and noindex. " +
      "Ensure the 404 page itself is useful: search bar, top links, locale switcher.",
    rationale_uk:
      "URL ніколи не існував у системі. Повертайте 404 Not Found та noindex. " +
      "Переконайтесь, що сторінка 404 корисна: рядок пошуку, топові посилання, перемикач локалі.",
  },

  "soft-404-risk": {
    pageType: "soft-404-risk",
    correctCode: 200,
    noindex: true,
    rationale_en:
      "Soft-404: page returns 200 but content is empty or a 'not found' message. " +
      "This is the worst outcome — Google guesses, sometimes wrong. " +
      "Fix by returning the correct explicit status code (404 or 410).",
    rationale_uk:
      "Soft-404: сторінка повертає 200, але контент порожній або містить повідомлення «не знайдено». " +
      "Це найгірший варіант — Google здогадується, іноді неправильно. " +
      "Виправте, повертаючи явний код статусу (404 або 410).",
  },
};

// ── 404 page requirements ──────────────────────────────────────────────────────

/**
 * Requirements that every 404 page must meet to preserve crawl budget
 * and give users a useful exit path.
 */
export const NOT_FOUND_PAGE_REQUIREMENTS = {
  /** Must include a search bar so users can find what they were looking for. */
  hasSearchBar: true,
  /** Must link to high-value / top-nav pages. */
  hasTopLinks: true,
  /** Must include a locale / language switcher. */
  hasLocaleSwitcher: true,
  /** Page itself must be noindex (never waste crawl budget on 404). */
  isNoindex: true,
  /** Each locale must have its own 404 page with localized text. */
  isPerLocale: true,
} as const;

// ── Retired-entity policy ─────────────────────────────────────────────────────

export const RETIRED_ENTITY_POLICY_EN =
  "When an entity is intentionally retired, document why in the 410 reason field. Don't silently drop URLs.";

export const RETIRED_ENTITY_POLICY_UK =
  "При навмисному виведенні сутності — задокументуйте причину в полі 410. Не видаляйте URL тихо.";

// ── Soft-404 warning ─────────────────────────────────────────────────────────

export const SOFT_404_WARNING_EN =
  "Soft-404s are the worst — Google guesses, sometimes wrong. Return explicit status codes always.";

export const SOFT_404_WARNING_UK =
  "Soft-404 — найгірший варіант: Google здогадується, іноді неправильно. Завжди повертайте явні коди статусу.";

// ── Search Console review schedule ───────────────────────────────────────────

/**
 * Recommended cadence for reviewing HTTP status coverage in Google Search Console.
 */
export const SEARCH_CONSOLE_REVIEW_SCHEDULE = {
  /** Review the Coverage report once a month. */
  cadence: "monthly" as const,
  /** Always check the Coverage report for newly flagged errors. */
  checkCoverage: true,
  /** Flag any newly detected soft-404s for same-sprint remediation. */
  flagNewSoft404s: true,
} as const;

// ── Decision function ─────────────────────────────────────────────────────────

/**
 * Determine the correct HTTP status decision for a URL at request time.
 *
 * @param existsInDb   - True if the entity/slug exists in the database.
 * @param isRetired    - True if the entity was intentionally deleted/retired.
 * @param movedTo      - Non-null slug/path if the content permanently moved.
 * @returns            - The StatusDecision that should be applied to this URL.
 *
 * @example
 *   // Moved event slug
 *   checkUrlStatus(false, false, "/events/kyiv-attack-2024-06-10")
 *   // → HTTP_STATUS_RULES["moved"]
 *
 *   // Intentionally retired region page
 *   checkUrlStatus(false, true, null)
 *   // → HTTP_STATUS_RULES["intentionally-retired"]
 *
 *   // Active entity
 *   checkUrlStatus(true, false, null)
 *   // → HTTP_STATUS_RULES["active"]
 *
 *   // Random / never-existed URL
 *   checkUrlStatus(false, false, null)
 *   // → HTTP_STATUS_RULES["random-url"]
 */
export function checkUrlStatus(
  existsInDb: boolean,
  isRetired: boolean,
  movedTo: string | null,
): StatusDecision {
  if (movedTo !== null) {
    return HTTP_STATUS_RULES["moved"];
  }
  if (isRetired) {
    return HTTP_STATUS_RULES["intentionally-retired"];
  }
  if (existsInDb) {
    return HTTP_STATUS_RULES["active"];
  }
  return HTTP_STATUS_RULES["random-url"];
}
