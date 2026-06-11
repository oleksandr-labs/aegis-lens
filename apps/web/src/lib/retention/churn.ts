/**
 * Churn & expansion model — upgrade triggers, downgrade paths, win-back,
 * and metric definitions.
 *
 * Модель відтоку та розширення — тригери оновлення, шляхи downgrade,
 * повернення клієнтів та визначення метрик.
 *
 * Source: TODO/monetization/TODO_churn_expansion.md
 */

// ── Expansion Triggers ────────────────────────────────────────────────────────

export interface ExpansionTrigger {
  /** The tier the user is currently on */
  fromTier: string;
  /** The tier being upsold */
  toTier: string;
  /** The event that triggers showing the upsell modal */
  triggerEvent: string;
  modalTitle_en: string;
  modalTitle_uk: string;
  ctaText_en: string;
  ctaText_uk: string;
  /** Optional discount percentage shown in the upsell offer */
  discountOfferPct?: number;
}

/**
 * All seven planned expansion paths plus the independent add-on vector.
 *
 * Усі сім запланованих шляхів розширення плюс незалежний вектор надбудов.
 */
export const EXPANSION_TRIGGERS: ExpansionTrigger[] = [
  {
    fromTier: "free",
    toTier: "observer",
    triggerEvent: "aoi-limit-hit",
    modalTitle_en: "You've hit your free AOI limit",
    modalTitle_uk: "Ви вичерпали ліміт безкоштовних AOI",
    ctaText_en: "Upgrade to Observer — from $12/mo",
    ctaText_uk: "Перейти на Observer — від $12/міс",
    discountOfferPct: undefined,
  },
  {
    fromTier: "observer",
    toTier: "pro",
    triggerEvent: "lookback-attempt",
    modalTitle_en: "Historical data requires Pro",
    modalTitle_uk: "Доступ до архівних даних потребує Pro",
    ctaText_en: "Upgrade to Pro — full history + real-time",
    ctaText_uk: "Перейти на Pro — повний архів + реальний час",
    discountOfferPct: undefined,
  },
  {
    fromTier: "observer",
    toTier: "pro",
    triggerEvent: "api-page-view",
    modalTitle_en: "API access is available on Pro",
    modalTitle_uk: "API-доступ доступний на Pro",
    ctaText_en: "Unlock the API — upgrade to Pro",
    ctaText_uk: "Розблокувати API — перейти на Pro",
    discountOfferPct: undefined,
  },
  {
    fromTier: "pro",
    toTier: "pro-plus",
    triggerEvent: "copilot-quota-hit",
    modalTitle_en: "You've reached your AI Copilot message limit",
    modalTitle_uk: "Ви вичерпали ліміт повідомлень AI Copilot",
    ctaText_en: "Upgrade to Pro+ for 4× more Copilot capacity",
    ctaText_uk: "Перейти на Pro+ для 4× більшої ємності Copilot",
    discountOfferPct: 10,
  },
  {
    fromTier: "pro",
    toTier: "pro-plus",
    triggerEvent: "seat-invite",
    modalTitle_en: "Invite a second analyst — Pro+ supports shared workspaces",
    modalTitle_uk: "Запросити другого аналітика — Pro+ підтримує спільні робочі простори",
    ctaText_en: "Upgrade to Pro+ to collaborate",
    ctaText_uk: "Перейти на Pro+ для співпраці",
    discountOfferPct: undefined,
  },
  {
    fromTier: "pro-plus",
    toTier: "team",
    triggerEvent: "seat-invite",
    modalTitle_en: "Adding a third team member requires the Team plan",
    modalTitle_uk: "Додавання третього члена команди потребує плану Team",
    ctaText_en: "Upgrade to Team — 5 seats included",
    ctaText_uk: "Перейти на Team — 5 місць включено",
    discountOfferPct: undefined,
  },
  {
    fromTier: "team",
    toTier: "business",
    triggerEvent: "sso-request",
    modalTitle_en: "SSO is available on the Business plan",
    modalTitle_uk: "SSO доступний на плані Business",
    ctaText_en: "Upgrade to Business for SSO + SCIM + compliance features",
    ctaText_uk: "Перейти на Business для SSO + SCIM + відповідності",
    discountOfferPct: undefined,
  },
  {
    fromTier: "business",
    toTier: "enterprise",
    triggerEvent: "sso-request",
    modalTitle_en: "Your requirements call for Enterprise",
    modalTitle_uk: "Ваші вимоги підходять для рівня Enterprise",
    ctaText_en: "Talk to sales about Enterprise — on-prem, SLA, DPA available",
    ctaText_uk: "Поговоріть з відділом продажів щодо Enterprise",
    discountOfferPct: undefined,
  },
  {
    // Independent add-on vector — any tier can trigger
    fromTier: "any",
    toTier: "addon",
    triggerEvent: "api-page-view",
    modalTitle_en: "Supercharge your workflow with add-ons",
    modalTitle_uk: "Розширте можливості з надбудовами",
    ctaText_en: "Browse available add-ons",
    ctaText_uk: "Переглянути доступні надбудови",
    discountOfferPct: undefined,
  },
];

// ── Downgrade Paths ───────────────────────────────────────────────────────────

export interface DowngradePath {
  fromTier: string;
  /** Number of clicks to complete self-serve downgrade */
  steps: number;
  retainDataNote_en: string;
  retainDataNote_uk: string;
  saveOffer: {
    discountPct: number;
    months: number;
    /** Maximum times this save offer can be presented per customer per 18 months */
    maxPerCustomer18mo: number;
  };
  surveyRequired: boolean;
  /** Max clicks to reactivate from this downgraded state */
  reactivationClickCount: number;
}

/**
 * Self-serve downgrade paths for all paid tiers.
 * All tiers preserve user-created data (read-only on Free after downgrade).
 *
 * Самообслуговування downgrade для всіх платних рівнів.
 */
export const DOWNGRADE_PATHS: DowngradePath[] = [
  {
    fromTier: "observer",
    steps: 2,
    retainDataNote_en:
      "Your watchlists and AOIs will be preserved in read-only mode on the Free tier. " +
      "Export your data before downgrading to avoid hitting free-tier limits.",
    retainDataNote_uk:
      "Ваші watchlists та AOI будуть збережені в режимі читання на рівні Free. " +
      "Експортуйте дані перед downgrade.",
    saveOffer: { discountPct: 50, months: 3, maxPerCustomer18mo: 1 },
    surveyRequired: true,
    reactivationClickCount: 1,
  },
  {
    fromTier: "pro",
    steps: 2,
    retainDataNote_en:
      "All case files, notebooks, and exports are preserved. Historical data access " +
      "reverts to 30 days on Observer or 7 days on Free. Your add-ons are suspended " +
      "but not deleted — they resume on reactivation.",
    retainDataNote_uk:
      "Всі кейси, нотатки та експорти збережено. Доступ до архіву зменшується. " +
      "Надбудови призупинено, але не видалено.",
    saveOffer: { discountPct: 50, months: 3, maxPerCustomer18mo: 1 },
    surveyRequired: true,
    reactivationClickCount: 1,
  },
  {
    fromTier: "pro-plus",
    steps: 2,
    retainDataNote_en:
      "All Pro+ data preserved. Shared workspaces become read-only for collaborators. " +
      "AI Copilot history retained; quota resets to Pro or Free limits.",
    retainDataNote_uk:
      "Всі дані Pro+ збережено. Спільні простори стають лише для читання. " +
      "Квота AI Copilot скидається.",
    saveOffer: { discountPct: 50, months: 3, maxPerCustomer18mo: 1 },
    surveyRequired: true,
    reactivationClickCount: 1,
  },
  {
    fromTier: "team",
    steps: 2,
    retainDataNote_en:
      "Team data, case approvals, and shared AOIs are preserved in read-only archive. " +
      "Seat licenses are released. Admin retains solo access to Pro features. " +
      "Team members lose access unless individually subscribed.",
    retainDataNote_uk:
      "Командні дані та спільні AOI зберігаються як архів лише для читання. " +
      "Ліцензії місць звільняються.",
    saveOffer: { discountPct: 50, months: 3, maxPerCustomer18mo: 1 },
    surveyRequired: true,
    reactivationClickCount: 1,
  },
  {
    fromTier: "business",
    steps: 2,
    retainDataNote_en:
      "Business-tier data, RBAC configs, and audit logs are preserved for 90 days " +
      "post-downgrade. SSO configuration is suspended. DPA obligations persist " +
      "until formal contract termination.",
    retainDataNote_uk:
      "Дані Business, конфігурації RBAC та аудит-логи зберігаються 90 днів. " +
      "Конфігурацію SSO призупинено.",
    saveOffer: { discountPct: 50, months: 3, maxPerCustomer18mo: 1 },
    surveyRequired: true,
    reactivationClickCount: 1,
  },
];

// ── Win-Back Sequences ────────────────────────────────────────────────────────

export interface WinBackSequence {
  /** Days since subscription churn / cancellation */
  daysSinceChurn: 30 | 90 | 180 | 365;
  messageType:
    | "educational-drip"
    | "annual-discount-offer"
    | "case-study-outreach"
    | "new-customer-promo";
  discountPct?: number;
  channel: "email" | "sales";
}

/**
 * Win-back touch sequence for churned paying customers.
 *
 * Послідовність повернення для відтоку платних клієнтів.
 */
export const WIN_BACK_SEQUENCES: WinBackSequence[] = [
  {
    daysSinceChurn: 30,
    messageType: "educational-drip",
    discountPct: undefined,
    channel: "email",
  },
  {
    daysSinceChurn: 90,
    messageType: "annual-discount-offer",
    discountPct: 30,
    channel: "email",
  },
  {
    daysSinceChurn: 180,
    messageType: "case-study-outreach",
    discountPct: undefined,
    channel: "sales",
  },
  {
    daysSinceChurn: 365,
    messageType: "new-customer-promo",
    discountPct: undefined,
    channel: "email",
  },
];

// ── Churn Metrics ─────────────────────────────────────────────────────────────

export interface ChurnMetric {
  id: string;
  name_en: string;
  formula_en: string;
  target?: string;
  trackingFrequency: "daily" | "weekly" | "monthly";
}

/**
 * Key churn and expansion metrics with targets and tracking cadence.
 *
 * Ключові метрики відтоку та розширення з цілями та розкладом відстеження.
 */
export const CHURN_METRICS: ChurnMetric[] = [
  {
    id: "gross-churn-rate",
    name_en: "Gross Churn Rate",
    formula_en: "MRR lost from cancellations / Beginning MRR × 100",
    target: "< 3% monthly",
    trackingFrequency: "monthly",
  },
  {
    id: "net-revenue-retention",
    name_en: "Net Revenue Retention (NRR)",
    formula_en:
      "(Beginning MRR + Expansion MRR - Contraction MRR - Churn MRR) / Beginning MRR × 100",
    target: "110%+ on Team+; 100%+ on Pro",
    trackingFrequency: "monthly",
  },
  {
    id: "expansion-arr",
    name_en: "Expansion ARR per Cohort",
    formula_en:
      "Sum of upgrade MRR × 12 for a given sign-up cohort, tracked month by month",
    target: "Positive expansion ARR by month 6 for Pro+ cohorts",
    trackingFrequency: "monthly",
  },
  {
    id: "time-to-expand",
    name_en: "Time-to-Expand by Tier",
    formula_en:
      "Median days from activation to first upgrade event, segmented by starting tier",
    target: "< 60 days Free→Observer; < 90 days Observer→Pro",
    trackingFrequency: "weekly",
  },
  {
    id: "logo-churn",
    name_en: "Logo Churn vs Revenue Churn",
    formula_en:
      "Logo churn = cancelled accounts / beginning accounts × 100; " +
      "Revenue churn = MRR lost / beginning MRR × 100. " +
      "Track separately to detect up/down-segment movement.",
    target: "Revenue churn < logo churn (expansion offsetting small-account losses)",
    trackingFrequency: "monthly",
  },
  {
    id: "churn-reason-taxonomy",
    name_en: "Churn Reason Taxonomy (survey-derived)",
    formula_en:
      "% distribution of cancellation survey responses across 6 reason codes. " +
      "Requires ≥10 responses per month for statistical significance.",
    target: "< 20% 'too-expensive' reasons (signals pricing issue); " +
      "< 30% 'missing-feature' (signals product gap)",
    trackingFrequency: "monthly",
  },
];

// ── Churn Reason Taxonomy ─────────────────────────────────────────────────────

/**
 * Standardised churn reason codes for cancellation surveys.
 *
 * Стандартизовані коди причин відтоку для опитувань при скасуванні.
 */
export const CHURN_REASON_TAXONOMY: {
  code: string;
  label_en: string;
  label_uk: string;
}[] = [
  {
    code: "too-expensive",
    label_en: "Too expensive for my budget",
    label_uk: "Занадто дорого для мого бюджету",
  },
  {
    code: "missing-feature",
    label_en: "Missing a feature I need",
    label_uk: "Відсутня потрібна мені функція",
  },
  {
    code: "vendor-consolidation",
    label_en: "Consolidating to another tool",
    label_uk: "Перехід на інший інструмент",
  },
  {
    code: "use-case-ended",
    label_en: "My use case no longer applies",
    label_uk: "Мій сценарій використання більше не актуальний",
  },
  {
    code: "budget-cut",
    label_en: "Budget was cut / reduced",
    label_uk: "Бюджет скорочено",
  },
  {
    code: "competitor",
    label_en: "Switching to a competitor",
    label_uk: "Перехід до конкурента",
  },
];
