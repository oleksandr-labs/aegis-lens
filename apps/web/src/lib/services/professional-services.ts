/**
 * Professional services catalog — types, pricing, and SOW helpers.
 *
 * Defines the eight expert-led services sold alongside the platform:
 * bespoke investigations, custom dashboards, integrations, training,
 * managed accounts, crisis retainers, onboarding sprints, and
 * competitor migrations.
 *
 * Каталог професійних послуг: типи, ціноутворення та помічники SOW.
 * Вісім послуг, що продаються разом з платформою.
 */

// ── Service types ─────────────────────────────────────────────────────────────

/**
 * All professional service types offered by the platform.
 * Усі типи професійних послуг, що пропонуються платформою.
 */
export type ServiceType =
  | "bespoke-investigation"  // Analyst-led custom OSINT project
  | "custom-dashboard"       // Productized custom dashboard build
  | "custom-integration"     // Engineer-led SDK / API integration
  | "onboarding-sprint"      // 2-week getting-customer-live sprint
  | "training"               // OSINT 101 / 201 / Power-user cohorts
  | "annual-managed-account" // Dedicated analyst hours, annual program
  | "crisis-cell-retainer"   // Surge support during defined crises
  | "competitor-migration";  // Competitive switch migration assistance

// ── Pricing range ─────────────────────────────────────────────────────────────

/**
 * Price range for a professional service.
 * Діапазон цін для професійної послуги.
 */
export interface ServicePricingRange {
  /** Minimum price (USD). 0 = included / free for qualifying customers. */
  minUsd: number;

  /** Maximum price (USD). */
  maxUsd: number;

  /** Billing unit for this service. */
  unit: "project" | "cohort" | "month" | "year";

  /** Note about flat-rate, inclusion, or free eligibility — English. */
  note_en: string | null;

  /** Note about flat-rate, inclusion, or free eligibility — Ukrainian. */
  note_uk: string | null;
}

// ── Professional service ──────────────────────────────────────────────────────

/**
 * Full definition of a professional service offering.
 * Повний опис пропозиції професійної послуги.
 */
export interface ProfessionalService {
  /** Unique service identifier. */
  id: ServiceType;

  /** Service name — English. */
  name_en: string;

  /** Service name — Ukrainian. */
  name_uk: string;

  /** Service type (mirrors id). */
  type: ServiceType;

  /** Pricing range. */
  pricing: ServicePricingRange;

  /** Key deliverables list — English. */
  deliverables_en: string[];

  /** Key deliverables list — Ukrainian. */
  deliverables_uk: string[];

  /** Additional notes — English. */
  notes_en: string;

  /** Additional notes — Ukrainian. */
  notes_uk: string;
}

// ── Service catalog ───────────────────────────────────────────────────────────

/**
 * Complete professional services catalog.
 * Повний каталог професійних послуг.
 */
export const PROFESSIONAL_SERVICES: ProfessionalService[] = [
  {
    id: "bespoke-investigation",
    name_en: "Bespoke Investigation",
    name_uk: "Індивідуальне розслідування",
    type: "bespoke-investigation",
    pricing: {
      minUsd: 2_000,
      maxUsd: 25_000,
      unit: "project",
      note_en: "Price varies by scope, analyst tier, and timeline. Fixed-price SOW required.",
      note_uk: "Ціна залежить від обсягу, рівня аналітика та часових рамок. Потребує SOW з фіксованою ціною.",
    },
    deliverables_en: [
      "Analyst-led custom OSINT research report",
      "Source map (primary + secondary sources cited)",
      "Event timeline with confidence scoring",
      "Executive summary (1–2 pages)",
      "Raw evidence archive (encrypted ZIP)",
    ],
    deliverables_uk: [
      "Індивідуальний звіт OSINT-дослідження аналітика",
      "Карта джерел (посилання на первинні та вторинні джерела)",
      "Хронологія подій з оцінкою достовірності",
      "Резюме для керівників (1–2 сторінки)",
      "Архів сирих доказів (зашифрований ZIP)",
    ],
    notes_en: "Analyst rates: $200/h (analyst), $350/h (senior analyst). Most projects fall in the $5k–15k range. Rush surcharge applies for <5 business day turnaround.",
    notes_uk: "Ставки аналітиків: $200/год (аналітик), $350/год (старший аналітик). Більшість проєктів у діапазоні $5k–15k. Надбавка за терміновість при виконанні менше ніж за 5 робочих днів.",
  },
  {
    id: "custom-dashboard",
    name_en: "Custom Dashboard Build",
    name_uk: "Розробка кастомної панелі",
    type: "custom-dashboard",
    pricing: {
      minUsd: 5_000,
      maxUsd: 25_000,
      unit: "project",
      note_en: "Productized scope with fixed milestones. Ongoing hosting included in platform subscription.",
      note_uk: "Продуктизований обсяг з фіксованими етапами. Розміщення входить до підписки на платформу.",
    },
    deliverables_en: [
      "Requirements workshop (remote, up to 4 h)",
      "Wireframes + design review",
      "Configured dashboard with custom widgets and filters",
      "Data-source mapping and integration",
      "User acceptance testing (UAT) sign-off",
      "Handoff documentation",
    ],
    deliverables_uk: [
      "Воркшоп з вимог (дистанційно, до 4 год)",
      "Вайрфрейми + дизайн-огляд",
      "Налаштована панель із кастомними віджетами та фільтрами",
      "Маппінг і інтеграція джерел даних",
      "Приймальне тестування (UAT)",
      "Документація для передачі",
    ],
    notes_en: "Engineer rate: $250/h. Most builds: 20–60 engineer-hours. Complex multi-source dashboards toward the $25k ceiling.",
    notes_uk: "Ставка інженера: $250/год. Більшість збірок: 20–60 інженеро-годин. Складні мультиджерельні панелі — ближче до $25k.",
  },
  {
    id: "custom-integration",
    name_en: "Custom Integration / SDK Adaptation",
    name_uk: "Кастомна інтеграція / адаптація SDK",
    type: "custom-integration",
    pricing: {
      minUsd: 5_000,
      maxUsd: 50_000,
      unit: "project",
      note_en: "Engineer-led. Range driven by third-party API complexity and security/compliance requirements.",
      note_uk: "Керується інженером. Діапазон залежить від складності стороннього API та вимог безпеки/відповідності.",
    },
    deliverables_en: [
      "Integration architecture design document",
      "Developed connector / SDK adaptation",
      "Automated tests (unit + integration)",
      "Security review sign-off",
      "Deployment runbook",
      "30-day post-launch hypercare",
    ],
    deliverables_uk: [
      "Документ архітектури інтеграції",
      "Розроблений конектор / адаптація SDK",
      "Автоматизовані тести (юніт + інтеграційні)",
      "Погодження після перевірки безпеки",
      "Runbook розгортання",
      "30-денний пост-запускний гіперкер",
    ],
    notes_en: "Examples: SIEM connector, custom alert webhook to partner SOAR, government data-exchange protocol. Compliance-heavy integrations (FedRAMP, ISO 27001 scope) toward upper bound.",
    notes_uk: "Приклади: SIEM-конектор, кастомний webhook до SOAR партнера, урядовий протокол обміну даними. Інтеграції з вимогами відповідності (FedRAMP, ISO 27001) — ближче до верхньої межі.",
  },
  {
    id: "onboarding-sprint",
    name_en: "Onboarding Sprint",
    name_uk: "Онбординг-спринт",
    type: "onboarding-sprint",
    pricing: {
      minUsd: 5_000,
      maxUsd: 5_000,
      unit: "project",
      note_en: "Flat $5k. Included at no charge in Enterprise plan subscriptions.",
      note_uk: "Фіксована ціна $5k. Включено безкоштовно в підписки тарифного плану Enterprise.",
    },
    deliverables_en: [
      "2-week structured onboarding program",
      "Kickoff workshop: use-case definition and success metrics",
      "Platform configuration review",
      "SSO / user-import setup",
      "Custom alert and saved-search configuration",
      "Live go/no-go readiness review at end of sprint",
    ],
    deliverables_uk: [
      "2-тижнева структурована програма онбордингу",
      "Kickoff-воркшоп: визначення use-case та метрик успіху",
      "Огляд конфігурації платформи",
      "Налаштування SSO / імпорту користувачів",
      "Конфігурація кастомних сповіщень і збережених пошуків",
      "Live-перевірка готовності до запуску наприкінці спринту",
    ],
    notes_en: "Conducted remotely. Requires 2 h/week commitment from the customer's project lead. Enterprise customers receive this service at no additional charge.",
    notes_uk: "Проводиться дистанційно. Потребує 2 год/тиж від керівника проєкту з боку клієнта. Клієнти Enterprise отримують цю послугу без додаткових витрат.",
  },
  {
    id: "training",
    name_en: "Training: OSINT 101 / 201 / Power-User",
    name_uk: "Навчання: OSINT 101 / 201 / Просунутий",
    type: "training",
    pricing: {
      minUsd: 500,
      maxUsd: 5_000,
      unit: "cohort",
      note_en: "Per cohort (up to 20 participants). Public cohorts at lower end; private/custom cohorts at upper end.",
      note_uk: "На групу (до 20 учасників). Публічні групи — нижня межа; приватні/кастомні — верхня межа.",
    },
    deliverables_en: [
      "Instructor-led live session (half-day or full-day)",
      "Training workbook (PDF)",
      "Hands-on exercises in a sandboxed environment",
      "Certificate of completion per participant",
      "30-day access to session recording (private cohorts)",
    ],
    deliverables_uk: [
      "Жива сесія під керівництвом інструктора (пів дня або повний день)",
      "Навчальний посібник (PDF)",
      "Практичні вправи в ізольованому середовищі",
      "Сертифікат про завершення для кожного учасника",
      "30-денний доступ до запису сесії (приватні групи)",
    ],
    notes_en: "Three tracks: OSINT 101 (introduction, $500–1k), OSINT 201 (intermediate, $1k–2.5k), Power-User (advanced platform + methodology, $2.5k–5k). Enterprise licence holders receive one free public cohort per quarter.",
    notes_uk: "Три треки: OSINT 101 (вступний, $500–1k), OSINT 201 (середній, $1k–2.5k), Просунутий (платформа + методологія, $2.5k–5k). Власники корпоративної ліцензії отримують одну безкоштовну публічну групу щокварталу.",
  },
  {
    id: "annual-managed-account",
    name_en: "Annual Managed-Account Program",
    name_uk: "Річна програма керованого акаунту",
    type: "annual-managed-account",
    pricing: {
      minUsd: 25_000,
      maxUsd: 100_000,
      unit: "year",
      note_en: "Dedicated analyst hours billed annually. Scope defined in SOW at contract start.",
      note_uk: "Виділені години аналітика, що тарифікуються щорічно. Обсяг визначається в SOW на початку контракту.",
    },
    deliverables_en: [
      "Named dedicated analyst (part-time or full-time, per SOW)",
      "Monthly written intelligence summary",
      "Monthly burn report (hours used vs. allocated)",
      "Quarterly strategy review",
      "Priority access to bespoke investigation capacity",
      "Annual programme review and renewal proposal",
    ],
    deliverables_uk: [
      "Іменний виділений аналітик (неповний або повний робочий день, за SOW)",
      "Щомісячний письмовий огляд розвідданих",
      "Щомісячний звіт про витрати (використані години vs. виділені)",
      "Щоквартальний стратегічний огляд",
      "Пріоритетний доступ до потужностей для індивідуальних розслідувань",
      "Щорічний огляд програми та пропозиція щодо поновлення",
    ],
    notes_en: "Minimum 100 analyst-hours/year at $25k; maximum circa 280 senior-analyst-hours/year at $100k. Unused hours do not roll over. Most clients in the $40k–70k range.",
    notes_uk: "Мінімум 100 годин аналітика/рік за $25k; максимум близько 280 годин старшого аналітика/рік за $100k. Невикористані години не переносяться. Більшість клієнтів у діапазоні $40k–70k.",
  },
  {
    id: "crisis-cell-retainer",
    name_en: "Crisis Cell on Retainer",
    name_uk: "Кризова клітинка на ретейнері",
    type: "crisis-cell-retainer",
    pricing: {
      minUsd: 10_000,
      maxUsd: 10_000,
      unit: "month",
      note_en: "Flat $10k/month retainer. Activates dedicated analyst surge capacity during defined crisis events.",
      note_uk: "Фіксований ретейнер $10k/міс. Активує виділені потужності аналітиків при визначених кризових подіях.",
    },
    deliverables_en: [
      "Defined activation trigger (agreed in SOW: event type, geography, severity)",
      "≤ 2 h response SLA from activation",
      "Dedicated crisis analyst team (2–4 analysts during active crisis)",
      "24/7 availability during active crisis window",
      "Daily situation report during active crisis",
      "Post-crisis debrief report",
      "Monthly retainer invoice; unused months credited against future activations",
    ],
    deliverables_uk: [
      "Визначений тригер активації (погоджено в SOW: тип події, географія, серйозність)",
      "SLA відповіді ≤ 2 год від активації",
      "Виділена команда кризових аналітиків (2–4 аналітики під час активної кризи)",
      "Доступність 24/7 під час активного кризового вікна",
      "Щоденний звіт про ситуацію під час активної кризи",
      "Звіт з розбору польотів після кризи",
      "Щомісячний рахунок-фактура ретейнера; невикористані місяці зараховуються в рахунок майбутніх активацій",
    ],
    notes_en: "Designed for newsrooms, NGOs, and government agencies needing guaranteed surge capacity. Crisis scope and activation criteria defined in the SOW; out-of-scope activations billed at $350/h (senior analyst).",
    notes_uk: "Розроблено для ньюзрумів, НУО та державних органів, яким потрібні гарантовані резервні потужності. Обсяг кризи та критерії активації визначаються в SOW; активації поза обсягом тарифікуються за $350/год (старший аналітик).",
  },
  {
    id: "competitor-migration",
    name_en: "Migration from Competitor",
    name_uk: "Міграція від конкурента",
    type: "competitor-migration",
    pricing: {
      minUsd: 0,
      maxUsd: 0,
      unit: "project",
      note_en: "Free for customers upgrading to an Enterprise plan. Not available as a standalone service.",
      note_uk: "Безкоштовно для клієнтів, які переходять на план Enterprise. Недоступно як окрема послуга.",
    },
    deliverables_en: [
      "Migration readiness assessment",
      "Data export assistance from competitor platform",
      "Mapping of competitor features to Aegis Lens equivalents",
      "Bulk saved-search and alert import",
      "Team onboarding sprint (included)",
      "30-day hypercare post-migration",
    ],
    deliverables_uk: [
      "Оцінка готовності до міграції",
      "Допомога з експортом даних з платформи конкурента",
      "Маппінг функцій конкурента на еквіваленти Aegis Lens",
      "Масовий імпорт збережених пошуків і сповіщень",
      "Онбординг-спринт для команди (включено)",
      "30-денний гіперкер після міграції",
    ],
    notes_en: "Competitive moat offering. Available to customers migrating from Recorded Future, Skopenow, Babel Street, or similar platforms when signing an Enterprise annual contract. Bespoke migration work beyond standard scope billed at standard rates.",
    notes_uk: "Пропозиція конкурентного моту. Доступно для клієнтів, які мігрують з Recorded Future, Skopenow, Babel Street або аналогічних платформ при підписанні річного корпоративного контракту. Нестандартна міграційна робота понад стандартний обсяг тарифікується за стандартними ставками.",
  },
];

// ── Standard hourly rates ─────────────────────────────────────────────────────

/**
 * Standard hourly billing rates for professional services engagements.
 * Стандартні погодинні ставки для проєктів професійних послуг.
 */
export const STANDARD_RATES: { analyst: number; "senior-analyst": number; engineer: number } = {
  /** Analyst hourly rate (USD). */
  analyst: 200,
  /** Senior analyst hourly rate (USD). */
  "senior-analyst": 350,
  /** Engineer hourly rate (USD). */
  engineer: 250,
};

// ── Policy strings ────────────────────────────────────────────────────────────

/**
 * Revenue cap note — services must not exceed 25% of total revenue — English.
 */
export const SERVICES_REVENUE_CAP_NOTE_EN =
  "Professional services revenue must not exceed 25% of total platform " +
  "revenue in any rolling 12-month period. This cap prevents the business " +
  "from drifting into an agency model, which would harm gross margin, " +
  "scalability, and valuation multiples. If services revenue approaches the " +
  "cap, the response is to raise services pricing or redirect demand to " +
  "self-serve and product features — not to hire more analysts.";

/**
 * Revenue cap note — Ukrainian.
 * Примітка щодо обмеження частки послуг у доходах — українською.
 */
export const SERVICES_REVENUE_CAP_NOTE_UK =
  "Доходи від професійних послуг не повинні перевищувати 25% загального " +
  "доходу платформи за будь-який ковзний 12-місячний період. Це обмеження " +
  "запобігає перетворенню бізнесу на агентство, що шкодить валовій маржі, " +
  "масштабованості та мультиплікаторам оцінки. Якщо дохід від послуг " +
  "наближається до межі, відповідь — підвищити ціни на послуги або " +
  "перенаправити попит на самообслуговування і функції продукту, а не " +
  "наймати більше аналітиків.";

/**
 * SOW template note — English.
 */
export const SOW_TEMPLATE_NOTE_EN =
  "Each professional service has a corresponding Statement of Work (SOW) " +
  "template that defines scope, deliverables, milestones, acceptance criteria, " +
  "and payment schedule. SOW templates are maintained in the legal repository " +
  "and versioned. Services are bookable via the sales team for deal sizes " +
  "≥ $10k, or via the self-serve quote builder for standardised services " +
  "(onboarding sprint, training cohorts) below that threshold.";

/**
 * SOW template note — Ukrainian.
 * Примітка щодо шаблону SOW — українською.
 */
export const SOW_TEMPLATE_NOTE_UK =
  "Кожна професійна послуга має відповідний шаблон Технічного завдання (SOW), " +
  "що визначає обсяг, результати, етапи, критерії приймання та графік оплати. " +
  "Шаблони SOW ведуться в юридичному репозиторії та версіонуються. Послуги " +
  "замовляються через команду продажів для угод від $10k або через " +
  "конструктор котирувань самообслуговування для стандартизованих послуг " +
  "(онбординг-спринт, навчальні групи) нижче цього порогу.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Builds a human-readable SOW reference string for a given service and client.
 * Формує зрозумілий рядок-посилання SOW для заданої послуги та клієнта.
 *
 * @param serviceId  - The service type identifier.
 * @param clientRef  - A short client or deal reference (e.g. "ACME-2026-03").
 * @returns A SOW reference string, e.g. "SOW-BESPOKE-INVESTIGATION-ACME-2026-03".
 */
export function buildSowReference(serviceId: ServiceType, clientRef: string): string {
  const slug = serviceId.toUpperCase().replace(/-/g, "-");
  const ref = clientRef.toUpperCase().replace(/\s+/g, "-");
  return `SOW-${slug}-${ref}`;
}
