/**
 * Services directory — types, configs, and schema helpers for the intel/security services catalog.
 *
 * Defines the eight service categories, the full ServiceProfile shape, programmatic-SEO
 * note strings, and schema.org Service builder used across /services/<slug>,
 * /services/<category>, /services/<industry>, and /services/<region> pages.
 *
 * Каталог послуг — типи, конфіги та помічники схем для каталогу розвідувальних/безпекових послуг.
 * Визначає вісім категорій, форму ServiceProfile, рядки приміток для програматичного SEO
 * та побудовник schema.org Service для сторінок /services/<slug>, /services/<category>,
 * /services/<industry> та /services/<region>.
 */

// ── Category types ────────────────────────────────────────────────────────────

/**
 * All supported service categories in the directory.
 * Усі підтримувані категорії послуг у каталозі.
 */
export type ServiceCategory =
  | "training"
  | "audit"
  | "consulting"
  | "monitoring-as-a-service"
  | "custom-development"
  | "incident-response"
  | "osint-investigation"
  | "data-collection";

// ── Pricing type ──────────────────────────────────────────────────────────────

/**
 * Pricing structure types for service listings.
 * Типи структур ціноутворення для лістингів послуг.
 */
export type ServicePricingType =
  | "hourly"
  | "project-based"
  | "retainer"
  | "per-seat"
  | "custom";

// ── Service profile ───────────────────────────────────────────────────────────

/**
 * Full profile for a single service in the directory.
 * Повний профіль окремої послуги в каталозі.
 */
export interface ServiceProfile {
  /** Unique service identifier (kebab-case). */
  id: string;

  /** URL slug for the service's profile page. */
  slug: string;

  /** Service name — English. */
  name_en: string;

  /** Service name — Ukrainian. */
  name_uk: string;

  /** Provider / firm name — English. */
  provider_en: string;

  /** Provider / firm name — Ukrainian. */
  provider_uk: string;

  /** Primary category for this service. */
  category: ServiceCategory;

  /** Pricing structure type. */
  pricingType: ServicePricingType;

  /** Human-readable price range — English (e.g. "$150–$300 / hour"). */
  priceRange_en: string;

  /** Human-readable price range — Ukrainian. */
  priceRange_uk: string;

  /** Key deliverables list — English. */
  deliverables_en: string[];

  /** Key deliverables list — Ukrainian. */
  deliverables_uk: string[];

  /** Typical engagement duration — English (e.g. "2–4 weeks"). */
  duration_en: string;

  /** Typical engagement duration — Ukrainian. */
  duration_uk: string;

  /** ISO 3166-1 alpha-2 country codes or region labels served. */
  regionsServed: string[];

  /** Whether the listing has been editorially verified by Aegis Lens. */
  verified: boolean;

  /** Average user rating (1–5), or null if no reviews yet. */
  ratingAvg: number | null;

  /** Total number of published user reviews. */
  reviewCount: number;

  /** Whether the lead-gen widget is enabled for this service profile. */
  leadGenEnabled: boolean;

  /** Additional editorial notes — English. */
  notes_en: string;

  /** Additional editorial notes — Ukrainian. */
  notes_uk: string;
}

// ── Category config ───────────────────────────────────────────────────────────

/**
 * Configuration entry for a single service category.
 * Конфігураційний запис для однієї категорії послуг.
 */
export interface ServiceCategoryConfig {
  id: ServiceCategory;
  name_en: string;
  name_uk: string;
  description_en: string;
  description_uk: string;
}

/**
 * Configuration for all eight service categories.
 * Конфігурація для всіх восьми категорій послуг.
 */
export const SERVICE_CATEGORIES_CONFIG: ServiceCategoryConfig[] = [
  {
    id: "training",
    name_en: "Training",
    name_uk: "Навчання",
    description_en: "Instructor-led and self-paced OSINT, threat-intelligence, and security awareness training programmes.",
    description_uk: "Навчальні програми з OSINT, розвідки загроз та безпеки, що проводяться інструктором або у власному темпі.",
  },
  {
    id: "audit",
    name_en: "Audit",
    name_uk: "Аудит",
    description_en: "Independent security, OSINT exposure, and intelligence-process audits with actionable remediation plans.",
    description_uk: "Незалежні аудити безпеки, OSINT-експозиції та процесів розвідки з практичними планами усунення недоліків.",
  },
  {
    id: "consulting",
    name_en: "Consulting",
    name_uk: "Консалтинг",
    description_en: "Strategic advisory engagements covering intelligence architecture, threat-modelling, and programme design.",
    description_uk: "Стратегічні консультаційні проєкти з архітектури розвідки, моделювання загроз і розробки програм.",
  },
  {
    id: "monitoring-as-a-service",
    name_en: "Monitoring as a Service",
    name_uk: "Моніторинг як послуга",
    description_en: "Fully managed, ongoing monitoring of assets, brands, or regions with analyst-curated alerting and reporting.",
    description_uk: "Повністю кероване безперервне спостереження за активами, брендами або регіонами з аналітичними сповіщеннями та звітністю.",
  },
  {
    id: "custom-development",
    name_en: "Custom Development",
    name_uk: "Кастомна розробка",
    description_en: "Bespoke software engineering for intelligence workflows, data pipelines, dashboards, and integrations.",
    description_uk: "Індивідуальна розробка програмного забезпечення для розвідувальних робочих процесів, конвеєрів даних, дашбордів та інтеграцій.",
  },
  {
    id: "incident-response",
    name_en: "Incident Response",
    name_uk: "Реагування на інциденти",
    description_en: "Rapid-response OSINT and threat-intelligence support during active security incidents or crisis events.",
    description_uk: "Оперативна OSINT-підтримка та розвідка загроз під час активних безпекових інцидентів або кризових подій.",
  },
  {
    id: "osint-investigation",
    name_en: "OSINT Investigation",
    name_uk: "OSINT-розслідування",
    description_en: "Analyst-led open-source intelligence investigations: due diligence, entity profiling, and event reconstruction.",
    description_uk: "Розслідування відкритих джерел під керівництвом аналітика: due diligence, профілювання суб'єктів та реконструкція подій.",
  },
  {
    id: "data-collection",
    name_en: "Data Collection",
    name_uk: "Збір даних",
    description_en: "Structured collection, enrichment, and delivery of open-source datasets tailored to client requirements.",
    description_uk: "Структурований збір, збагачення та доставка датасетів з відкритих джерел, адаптованих до вимог клієнта.",
  },
];

// ── Programmatic-SEO note strings ─────────────────────────────────────────────

/**
 * Lead-gen widget note — English.
 */
export const SERVICE_LEAD_GEN_NOTE_EN =
  "Each service profile features a lead-gen widget that allows prospects to " +
  "request a quote or introductory call directly through the platform. " +
  "Lead-generation revenue is expected to exceed listing fee revenue as the " +
  "catalog scales, due to higher conversion value per qualified lead. " +
  "Lead capture is optimised per category (e.g. scope questionnaire for audits, " +
  "cohort availability picker for training).";

/**
 * Lead-gen widget note — Ukrainian.
 */
export const SERVICE_LEAD_GEN_NOTE_UK =
  "Кожен профіль послуги містить віджет генерації лідів, що дозволяє " +
  "потенційним клієнтам запитати котирування або вступний дзвінок безпосередньо " +
  "через платформу. Очікується, що дохід від генерації лідів перевищить дохід " +
  "від плати за лістинг у міру масштабування каталогу завдяки вищій цінності " +
  "конверсії на кваліфікованого ліда. Захоплення лідів оптимізовано по категоріях " +
  "(наприклад, анкета обсягу для аудитів, вибір доступності когорти для навчання).";

/**
 * Vetted-provider tier note — English.
 */
export const SERVICE_VETTED_NOTE_EN =
  "The vetted-provider tier requires providers to complete a KYC process " +
  "and submit a portfolio of verifiable project references. Vetted providers " +
  "receive a badge on their listing, priority placement in category searches, " +
  "and access to high-value enterprise lead routing. The tier is reviewed " +
  "annually and can be revoked following upheld complaints.";

/**
 * Vetted-provider tier note — Ukrainian.
 */
export const SERVICE_VETTED_NOTE_UK =
  "Рівень перевірених постачальників вимагає від постачальників пройти " +
  "процедуру KYC та надати портфоліо верифікованих проєктних посилань. " +
  "Перевірені постачальники отримують значок у своєму лістингу, пріоритетне " +
  "розміщення в пошуку по категоріях та доступ до маршрутизації корпоративних " +
  "лідів. Рівень переглядається щорічно і може бути відкликаний після " +
  "підтверджених скарг.";

/**
 * Schema.org Service markup note — English.
 */
export const SERVICE_SCHEMA_NOTE_EN =
  "Every service profile page includes schema.org Service structured data " +
  "with provider Organization linkage, serviceType, areaServed, and offers. " +
  "Where reviews exist, AggregateRating is included. This markup improves " +
  "search-engine visibility and eligibility for rich results.";

/**
 * Schema.org Service markup note — Ukrainian.
 */
export const SERVICE_SCHEMA_NOTE_UK =
  "Кожна сторінка профілю послуги включає структуровані дані schema.org Service " +
  "з посиланням на постачальника Organization, serviceType, areaServed та offers. " +
  "За наявності відгуків включається AggregateRating. Ця розмітка покращує " +
  "видимість у пошукових системах та кваліфікацію для розширених результатів.";

/**
 * Programmatic routing note — English.
 */
export const SERVICE_PROGRAMMATIC_NOTE_EN =
  "Programmatic routes are auto-generated for /services/<category>, " +
  "/services/<industry>, and /services/<region> path segments. Each route " +
  "renders a filtered, ranked listing of services relevant to that segment, " +
  "with editorial context, lead-gen CTAs, and regional availability filters.";

/**
 * Programmatic routing note — Ukrainian.
 */
export const SERVICE_PROGRAMMATIC_NOTE_UK =
  "Програматичні маршрути автоматично генеруються для сегментів шляху " +
  "/services/<category>, /services/<industry> та /services/<region>. Кожен " +
  "маршрут відображає відфільтрований, ранжований список послуг, релевантних " +
  "для цього сегменту, з редакційним контекстом, CTA для генерації лідів та " +
  "фільтрами регіональної доступності.";

/**
 * Reviews and outcomes note — English.
 */
export const SERVICE_REVIEWS_NOTE_EN =
  "Service reviews include verified project outcomes where providers consent " +
  "to share anonymised engagement references. Outcome data (e.g. \"reduced " +
  "incident response time by 40%\") increases trust signals and conversion " +
  "rates on service profile pages. Reviews are moderated and linked to " +
  "verifiable project references where possible.";

/**
 * Reviews and outcomes note — Ukrainian.
 */
export const SERVICE_REVIEWS_NOTE_UK =
  "Відгуки про послуги включають верифіковані результати проєктів, де " +
  "постачальники погоджуються ділитися анонімізованими проєктними посиланнями. " +
  "Дані про результати (наприклад, «скоротили час реагування на інциденти на 40%») " +
  "підвищують сигнали довіри та коефіцієнти конверсії на сторінках профілів послуг. " +
  "Відгуки модеруються і пов'язані з верифікованими проєктними посиланнями там, " +
  "де це можливо.";

/**
 * Seed target note — English.
 */
export const SERVICE_SEED_NOTE_EN =
  "The catalog seed target is 100–300 curated services across all eight categories. " +
  "Priority seeding focuses on training, OSINT investigation, and " +
  "monitoring-as-a-service categories, which have the highest demand volume " +
  "from the platform's target audience of journalists, NGOs, and security teams.";

/**
 * Seed target note — Ukrainian.
 */
export const SERVICE_SEED_NOTE_UK =
  "Цільовий показник заповнення каталогу — 100–300 відібраних послуг по всіх " +
  "восьми категоріях. Пріоритетне заповнення зосереджено на категоріях навчання, " +
  "OSINT-розслідувань та моніторингу як послуги, які мають найвищий рівень попиту " +
  "від цільової аудиторії платформи: журналістів, НУО та команд безпеки.";

// ── Schema.org builder ────────────────────────────────────────────────────────

/**
 * Builds a schema.org Service object from a ServiceProfile.
 * Use in JSON-LD <script> blocks on /services/<slug> pages.
 *
 * Будує об'єкт schema.org Service з ServiceProfile.
 * Використовується в блоках JSON-LD <script> на сторінках /services/<slug>.
 */
export function buildServiceSchemaOrg(service: ServiceProfile): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name_en,
    description: service.deliverables_en.join(". "),
    serviceType: service.category,
    provider: {
      "@type": "Organization",
      name: service.provider_en,
    },
    offers: {
      "@type": "Offer",
      description: service.priceRange_en,
      priceCurrency: "USD",
    },
  };

  if (service.regionsServed.length > 0) {
    schema.areaServed = service.regionsServed.map((region) => ({
      "@type": "Place",
      name: region,
    }));
  }

  if (service.ratingAvg !== null && service.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: service.ratingAvg,
      reviewCount: service.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the ServiceCategoryConfig for a given ServiceCategory id, or undefined.
 * Повертає ServiceCategoryConfig для заданого id ServiceCategory, або undefined.
 */
export function getServiceCategory(id: ServiceCategory): ServiceCategoryConfig | undefined {
  return SERVICE_CATEGORIES_CONFIG.find((c) => c.id === id);
}
