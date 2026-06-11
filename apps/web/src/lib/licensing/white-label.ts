/**
 * Licensing — white-label & OEM configuration.
 *
 * Defines what can and cannot be white-labeled, theming tokens,
 * pricing tiers, and partner-program policies for the Aegis Lens
 * platform when licensed under a partner's own brand.
 *
 * Конфігурація білого лейблу та OEM-ліцензування: що можна
 * брендувати, що не можна, цінові рівні та умови партнерської
 * програми.
 */

// ── What IS white-labelable ───────────────────────────────────────────────────

/**
 * Aspects of the platform that partners may rebrand under their own name.
 * Складники платформи, які партнери можуть перебрендувати.
 */
export type WhiteLabelScope =
  | "ui-shell"               // Top nav, sidebar, footer — partner logo/name
  | "color-scheme"           // Primary/accent/background tokens
  | "logo"                   // Logotype and favicon replacement
  | "custom-domain"          // e.g. intelligence.partner.com
  | "custom-email-from"      // "From: Partner Intelligence <alerts@partner.com>"
  | "custom-report-templates" // Branded PDF/DOCX export templates
  | "embedded-widgets";      // iFrame / JS embed on partner properties

// ── What is NOT white-labelable ──────────────────────────────────────────────

/**
 * Aspects that must always remain attributed to primary sources,
 * regardless of white-label arrangement.
 * Аспекти, які завжди залишаються прив'язаними до першоджерел.
 */
export type WhiteLabelRestriction =
  | "source-attribution"     // Individual events must cite primary sources
  | "retraction-notices"     // Published retractions cannot be suppressed
  | "ethical-use-disclosures"; // Ethics/acceptable-use notice always shown

// ── Theming config ────────────────────────────────────────────────────────────

/**
 * Token-based design-system overrides for a white-label tenant.
 * References the platform's design-token system; partner supplies values.
 *
 * Токенна система дизайну для білого лейблу; партнер надає значення.
 */
export interface WhiteLabelThemingConfig {
  /** Tenant / org identifier. */
  tenantId: string;

  /** Partner-facing display name — English. */
  partnerName_en: string;

  /** Partner-facing display name — Ukrainian. */
  partnerName_uk: string;

  /** Primary brand color (hex). Maps to --color-primary design token. */
  primaryColor: string;

  /** Accent brand color (hex). Maps to --color-accent design token. */
  accentColor: string;

  /** Background base color (hex). Maps to --color-bg design token. */
  backgroundColor: string;

  /** Logotype URL (SVG preferred, ≥ 200 px wide). */
  logoUrl: string;

  /** Favicon URL (ICO or PNG 32×32). */
  faviconUrl: string;

  /** Custom domain (CNAME pointing to platform edge). */
  customDomain: string | null;

  /** Custom "from" email address for alerts/reports. */
  customEmailFrom: string | null;

  /** Enabled white-label scopes for this tenant. */
  enabledScopes: WhiteLabelScope[];

  /** Notes — English. */
  notes_en: string;

  /** Notes — Ukrainian. */
  notes_uk: string;
}

// ── Partner program tiers ─────────────────────────────────────────────────────

/**
 * Partner program tier tied to monthly recurring revenue commitment.
 * Рівень партнерської програми, прив'язаний до мінімального MRR.
 */
export type WhiteLabelPricingTier = "silver" | "gold" | "platinum";

// ── Pricing config ────────────────────────────────────────────────────────────

/**
 * Pricing configuration for a white-label program tier.
 * Цінова конфігурація рівня білого лейблу.
 */
export interface WhiteLabelPricingConfig {
  /** Tier identifier. */
  tier: WhiteLabelPricingTier;

  /** Tier display name — English. */
  name_en: string;

  /** Tier display name — Ukrainian. */
  name_uk: string;

  /** Minimum monthly base price (USD). */
  baseMonthlyMinUsd: number;

  /** Maximum monthly base price (USD). */
  baseMonthlyMaxUsd: number;

  /** Per-seat price (USD/seat/month). */
  perSeatUsd: number;

  /** Per-end-user metering price (USD/active end-user/month). */
  perEndUserUsd: number;

  /** Revenue-share option available for this tier (true = partner can opt in). */
  revshareAvailable: boolean;

  /** Revenue-share percentage taken by the platform when opted in (0–100). */
  revsharePercent: number | null;

  /** Minimum MRR commitment required from the partner (USD). */
  minMrrCommitUsd: number;

  /** Feature list included in this tier — English. */
  features_en: string[];

  /** Feature list included in this tier — Ukrainian. */
  features_uk: string[];

  /** Notes — English. */
  notes_en: string;

  /** Notes — Ukrainian. */
  notes_uk: string;
}

// ── White-label pricing data ──────────────────────────────────────────────────

/**
 * Canonical white-label pricing tiers (Silver / Gold / Platinum).
 * Канонічні цінові рівні програми білого лейблу.
 */
export const WHITE_LABEL_PRICING: WhiteLabelPricingConfig[] = [
  {
    tier: "silver",
    name_en: "Silver",
    name_uk: "Срібний",
    baseMonthlyMinUsd: 5_000,
    baseMonthlyMaxUsd: 15_000,
    perSeatUsd: 80,
    perEndUserUsd: 4,
    revshareAvailable: false,
    revsharePercent: null,
    minMrrCommitUsd: 5_000,
    features_en: [
      "UI shell rebranding (logo, colors, nav)",
      "Custom domain (CNAME)",
      "Custom email-from for alerts",
      "Standard report templates with partner logo",
      "Up to 20 named seats",
      "Email support (48 h SLA)",
    ],
    features_uk: [
      "Ребрендинг UI-оболонки (логотип, кольори, навігація)",
      "Власний домен (CNAME)",
      "Власна адреса відправника для сповіщень",
      "Стандартні шаблони звітів з логотипом партнера",
      "До 20 іменних місць",
      "Підтримка електронною поштою (SLA 48 год)",
    ],
    notes_en: "Entry-level white-label; source attribution and ethics disclosures remain unchanged.",
    notes_uk: "Початковий рівень білого лейблу; атрибуція джерел та розкриття етики залишаються незмінними.",
  },
  {
    tier: "gold",
    name_en: "Gold",
    name_uk: "Золотий",
    baseMonthlyMinUsd: 15_000,
    baseMonthlyMaxUsd: 30_000,
    perSeatUsd: 70,
    perEndUserUsd: 3,
    revshareAvailable: true,
    revsharePercent: 20,
    minMrrCommitUsd: 15_000,
    features_en: [
      "All Silver features",
      "Custom report templates (PDF + DOCX)",
      "Embedded widgets (iFrame / JS embed)",
      "Up to 100 named seats",
      "Dedicated onboarding engineer",
      "Priority email + Slack support (24 h SLA)",
      "Revenue-share option (20% of partner's end-customer revenue)",
    ],
    features_uk: [
      "Усі функції Срібного рівня",
      "Власні шаблони звітів (PDF + DOCX)",
      "Вбудовані віджети (iFrame / JS embed)",
      "До 100 іменних місць",
      "Виділений інженер онбордингу",
      "Пріоритетна підтримка Email + Slack (SLA 24 год)",
      "Опція розподілу доходів (20% від виручки партнера з кінцевих клієнтів)",
    ],
    notes_en: "Mid-tier for consultancies and security firms reselling to multiple end-clients.",
    notes_uk: "Середній рівень для консалтингових і безпекових компаній, які перепродають кінцевим клієнтам.",
  },
  {
    tier: "platinum",
    name_en: "Platinum",
    name_uk: "Платиновий",
    baseMonthlyMinUsd: 30_000,
    baseMonthlyMaxUsd: 50_000,
    perSeatUsd: 60,
    perEndUserUsd: 2,
    revshareAvailable: true,
    revsharePercent: 15,
    minMrrCommitUsd: 30_000,
    features_en: [
      "All Gold features",
      "Full design-token theming (all visual tokens overridable)",
      "Custom email domain (SPF/DKIM configured by platform)",
      "Unlimited named seats",
      "Dedicated customer success manager",
      "Multi-tenant end-user org management",
      "Co-branded launch package",
      "Phone + Slack + email support (4 h SLA)",
      "Revenue-share option (15% of partner's end-customer revenue)",
      "Annual business review",
    ],
    features_uk: [
      "Усі функції Золотого рівня",
      "Повне налаштування дизайн-токенів (усі візуальні токени замінні)",
      "Власний поштовий домен (SPF/DKIM налаштовує платформа)",
      "Необмежена кількість іменних місць",
      "Виділений менеджер з роботи з клієнтами",
      "Мультитенантне управління організаціями кінцевих користувачів",
      "Пакет спільного брендованого запуску",
      "Підтримка Phone + Slack + Email (SLA 4 год)",
      "Опція розподілу доходів (15% від виручки партнера з кінцевих клієнтів)",
      "Щорічний огляд бізнесу",
    ],
    notes_en: "Enterprise / government / defense-prime tier. Requires Platinum MSA addendum.",
    notes_uk: "Корпоративний / урядовий / оборонний рівень. Потребує додатку до MSA рівня Platinum.",
  },
];

// ── Policy strings ────────────────────────────────────────────────────────────

/**
 * Restrictions on what cannot be white-labeled — English.
 */
export const WHITE_LABEL_RESTRICTIONS_EN =
  "Regardless of white-label arrangement, the following must always remain " +
  "visible to end users: (1) source attribution on individual events — every " +
  "data point must cite its primary source; (2) retraction notices — published " +
  "corrections or retractions may not be suppressed or hidden; " +
  "(3) ethical-use disclosures — the platform's acceptable-use and ethical-use " +
  "notice must be accessible at all times. These restrictions are contractually " +
  "enforced and are not negotiable.";

/**
 * Restrictions on what cannot be white-labeled — Ukrainian.
 * Обмеження білого лейблу — українською.
 */
export const WHITE_LABEL_RESTRICTIONS_UK =
  "Незалежно від угоди про білий лейбл, кінцевим користувачам завжди мають " +
  "бути видимі: (1) атрибуція джерел для окремих подій — кожна точка даних " +
  "повинна посилатися на першоджерело; (2) повідомлення про спростування — " +
  "опубліковані виправлення чи спростування не можуть замовчуватися або " +
  "приховуватися; (3) розкриття етики використання — повідомлення про допустиме " +
  "та етичне використання платформи має бути доступним у будь-який час. " +
  "Ці обмеження закріплені договірно і не підлягають переговорам.";

/**
 * Revenue-share option note — English.
 */
export const WHITE_LABEL_REVSHARE_NOTE_EN =
  "Partners on Gold and Platinum tiers may opt into a revenue-share model " +
  "instead of (or in addition to) per-seat/per-end-user metering: the partner " +
  "sells platform access to their own customers under the partner's brand and " +
  "pricing, and the platform receives a percentage of that end-customer revenue " +
  "(20% at Gold, 15% at Platinum). Rev-share is settled monthly based on " +
  "partner-reported billings, subject to audit rights.";

/**
 * Revenue-share option note — Ukrainian.
 * Примітка щодо розподілу доходів — українською.
 */
export const WHITE_LABEL_REVSHARE_NOTE_UK =
  "Партнери рівнів Gold і Platinum можуть обрати модель розподілу доходів " +
  "замість (або на додаток до) тарифікації за місцем/кінцевим користувачем: " +
  "партнер продає доступ до платформи власним клієнтам під своїм брендом і " +
  "за власними цінами, а платформа отримує відсоток від цієї виручки " +
  "(20% на Gold, 15% на Platinum). Розподіл доходів розраховується щомісяця " +
  "на основі звітності партнера з правом аудиту.";

/**
 * Legal / MSA addendum note — English.
 */
export const WHITE_LABEL_LEGAL_NOTE_EN =
  "White-label deployments require a Master Services Agreement (MSA) addendum " +
  "covering: IP ownership (platform retains all rights to the core technology; " +
  "partner owns their brand assets and custom templates); brand-usage clauses " +
  "(partner's brand may not imply endorsement of the underlying platform beyond " +
  "what is contractually agreed); data-processing obligations; and audit rights " +
  "for revenue-share partners. Standard MSA addendum review takes 5–10 business days.";

/**
 * Legal / MSA addendum note — Ukrainian.
 * Юридична примітка щодо MSA — українською.
 */
export const WHITE_LABEL_LEGAL_NOTE_UK =
  "Розгортання білого лейблу потребує додатку до Генеральної угоди про " +
  "послуги (MSA), що охоплює: права на інтелектуальну власність (платформа " +
  "зберігає всі права на основну технологію; партнер є власником своїх " +
  "брендових активів і власних шаблонів); положення про використання бренду " +
  "(бренд партнера не може передбачати схвалення базової платформи понад " +
  "договірно погоджене); зобов'язання щодо обробки даних; права аудиту для " +
  "партнерів з розподілом доходів. Стандартний розгляд додатку до MSA займає " +
  "5–10 робочих днів.";

/**
 * Partner onboarding note — English.
 */
export const WHITE_LABEL_ONBOARDING_NOTE_EN =
  "Branded launch SLA is ≤ 2 weeks from signed MSA addendum for Silver and " +
  "Gold tiers. Platinum launches include a dedicated onboarding engineer and " +
  "co-branded launch package; SLA is ≤ 2 weeks for standard deployments and " +
  "up to 4 weeks for multi-tenant or heavily customised setups. The onboarding " +
  "playbook covers: DNS/CNAME setup, design-token handoff, report-template " +
  "customisation, user-import or SSO configuration, and go-live readiness review.";

/**
 * Partner onboarding note — Ukrainian.
 * Примітка щодо онбордингу партнера — українською.
 */
export const WHITE_LABEL_ONBOARDING_NOTE_UK =
  "SLA брендованого запуску — до 2 тижнів після підписання додатку до MSA " +
  "для рівнів Silver і Gold. Запуски Platinum включають виділеного інженера " +
  "онбордингу та пакет спільного брендованого запуску; SLA — до 2 тижнів для " +
  "стандартних розгортань і до 4 тижнів для мультитенантних або глибоко " +
  "кастомізованих конфігурацій. Посібник з онбордингу охоплює: налаштування " +
  "DNS/CNAME, передачу дизайн-токенів, кастомізацію шаблонів звітів, імпорт " +
  "користувачів або конфігурацію SSO, а також перевірку готовності до запуску.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the pricing config for a given white-label tier, or null if not found.
 * Повертає конфігурацію ціноутворення для заданого рівня або null.
 */
export function getWhiteLabelTier(
  tier: WhiteLabelPricingTier,
): WhiteLabelPricingConfig | null {
  return WHITE_LABEL_PRICING.find((t) => t.tier === tier) ?? null;
}
