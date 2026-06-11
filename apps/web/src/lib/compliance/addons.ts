/**
 * Compliance & Trust Add-ons — registry of compliance artifacts and legal add-ons.
 * Monetizes the platform's trust investment for regulated verticals (gov, healthcare, enterprise).
 *
 * Реєстр надбудов відповідності та довіри — монетизує інвестиції платформи в безпеку
 * для регульованих вертикалей (держсектор, охорона здоров'я, підприємства).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * All supported compliance add-on types.
 * Усі підтримувані типи надбудов відповідності.
 */
export type ComplianceAddonType =
  | "gdpr-dpa"
  | "soc2-report"
  | "pen-test-results"
  | "data-residency"
  | "audit-log-export"
  | "siem-integration"
  | "custom-dpa"
  | "hipaa-baa"
  | "iso27001-cert"
  | "right-to-erasure-api";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * Full configuration record for a compliance add-on.
 * Повна конфігурація надбудови відповідності.
 */
export interface ComplianceAddon {
  /** Unique slug identifier. / Унікальний ідентифікатор-slug. */
  id: string;
  /** Add-on type. / Тип надбудови. */
  type: ComplianceAddonType;
  /** Display name in English. / Відображувана назва англійською. */
  name_en: string;
  /** Display name in Ukrainian. / Відображувана назва українською. */
  name_uk: string;
  /**
   * Which subscription tiers include this add-on at no extra charge (English).
   * Які рівні підписки включають цю надбудову без доплати (англійська).
   */
  includedInTiers_en: string;
  /**
   * Which subscription tiers include this add-on at no extra charge (Ukrainian).
   * Які рівні підписки включають цю надбудову без доплати (українська).
   */
  includedInTiers_uk: string;
  /**
   * Additional cost in USD for tiers that do not include it; null if always included or sales-led.
   * Додаткова вартість у USD для рівнів, де не включено; null якщо завжди включено або за домовленістю.
   */
  addOnPriceUsd: number | null;
  /** How the artifact is delivered (English). / Спосіб доставки артефакту (англійська). */
  deliveryFormat_en: string;
  /** How the artifact is delivered (Ukrainian). / Спосіб доставки артефакту (українська). */
  deliveryFormat_uk: string;
  /** Additional notes in English. / Додаткові примітки англійською. */
  notes_en: string;
  /** Additional notes in Ukrainian. / Додаткові примітки українською. */
  notes_uk: string;
}

// ── Policy strings ────────────────────────────────────────────────────────────

/**
 * General note on compliance add-ons value proposition (English).
 * Загальна примітка щодо цінності надбудов відповідності (англійська).
 */
export const COMPLIANCE_ADDON_NOTE_EN =
  "Compliance add-ons reduce procurement friction for regulated verticals. Enterprises in finance, government, healthcare, and defense can unlock the artifacts they need without custom legal negotiation cycles. Each add-on is a productized SKU — not a cost-of-doing-business line item.";

/**
 * General note on compliance add-ons value proposition (Ukrainian).
 * Загальна примітка щодо цінності надбудов відповідності (українська).
 */
export const COMPLIANCE_ADDON_NOTE_UK =
  "Надбудови відповідності зменшують тертя при закупівлях для регульованих вертикалей. Підприємства у сфері фінансів, держсектору, охорони здоров'я та оборони можуть отримати необхідні артефакти без тривалих циклів юридичних переговорів. Кожна надбудова — це продуктизований SKU, а не стаття витрат на ведення бізнесу.";

/**
 * Note on GovSec compliance bundle (English).
 * Примітка щодо комплекту GovSec відповідності (англійська).
 */
export const COMPLIANCE_BUNDLING_NOTE_EN =
  "GovSec Bundle: combines DPA (standard or custom) + EU data residency + audit-log export + SIEM integration into a single discounted SKU for government and defense customers. Bundle pricing available on request; typically 20% below sum-of-parts. Auto-renews annually with usage charge if configuration changes mid-cycle.";

/**
 * Note on GovSec compliance bundle (Ukrainian).
 * Примітка щодо комплекту GovSec відповідності (українська).
 */
export const COMPLIANCE_BUNDLING_NOTE_UK =
  "Комплект GovSec: поєднує DPA (стандартний або кастомний) + резидентність даних у ЄС + експорт журналу аудиту + SIEM-інтеграцію в єдиний SKU зі знижкою для державних та оборонних замовників. Ціна пакету надається на запит; як правило, 20% нижче суми компонентів. Автоматично поновлюється щорічно з тарифікацією використання при зміні конфігурації протягом циклу.";

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * Canonical registry of compliance and trust add-ons.
 * Канонічний реєстр надбудов відповідності та довіри.
 */
export const COMPLIANCE_ADDONS: ComplianceAddon[] = [
  {
    id: "gdpr-dpa",
    type: "gdpr-dpa",
    name_en: "Standard GDPR Data Processing Agreement (DPA)",
    name_uk: "Стандартна угода про обробку даних GDPR (DPA)",
    includedInTiers_en: "Enterprise (included at no charge).",
    includedInTiers_uk: "Enterprise (включено без доплати).",
    addOnPriceUsd: 500,
    deliveryFormat_en:
      "Electronically signed PDF via DocuSign or equivalent; stored in your compliance dashboard.",
    deliveryFormat_uk:
      "PDF з електронним підписом через DocuSign або аналог; зберігається в дашборді відповідності.",
    notes_en:
      "Standard GDPR-compliant DPA covering Aegis Lens's role as a data processor. Covers Article 28 requirements, sub-processor list, security measures annex, and international transfer safeguards (SCCs). Included free in Enterprise; $500 one-time for Business and below.",
    notes_uk:
      "Стандартна DPA відповідно до GDPR щодо ролі Aegis Lens як обробника даних. Охоплює вимоги Статті 28, список суб-обробників, додаток із заходами безпеки та гарантії міжнародної передачі (SCC). Безкоштовно для Enterprise; $500 одноразово для Business і нижче.",
  },
  {
    id: "custom-dpa",
    type: "custom-dpa",
    name_en: "Custom / Bespoke DPA",
    name_uk: "Кастомна / Індивідуальна DPA",
    includedInTiers_en: "Enterprise (included at no charge).",
    includedInTiers_uk: "Enterprise (включено без доплати).",
    addOnPriceUsd: 2499,
    deliveryFormat_en:
      "Negotiated document; review cycle via legal team; final delivery as signed PDF.",
    deliveryFormat_uk:
      "Узгоджений документ; цикл перевірки з юридичною командою; фінальна доставка у вигляді підписаного PDF.",
    notes_en:
      "Bespoke DPA terms negotiated beyond the standard template. Covers custom retention schedules, jurisdiction-specific clauses, and additional controller obligations. Available as add-on for Business+ at $2,499/yr; included in Enterprise. Subject to legal team availability — 10 business day SLA.",
    notes_uk:
      "Індивідуальні умови DPA, узгоджені поза стандартним шаблоном. Охоплює кастомні графіки зберігання, юрисдикційні положення та додаткові зобов'язання контролера. Доступна як надбудова для Business+ за $2 499/рік; включено в Enterprise. Залежить від доступності юридичної команди — SLA 10 робочих днів.",
  },
  {
    id: "soc2-report",
    type: "soc2-report",
    name_en: "SOC 2 Type II Report",
    name_uk: "Звіт SOC 2 Type II",
    includedInTiers_en: "Enterprise+ (available on NDA request at no charge).",
    includedInTiers_uk: "Enterprise+ (доступно на запит під NDA без доплати).",
    addOnPriceUsd: 2499,
    deliveryFormat_en:
      "PDF report shared under mutual NDA; accessible via secure portal link with 30-day expiry.",
    deliveryFormat_uk:
      "PDF-звіт надається під взаємним NDA; доступний через посилання на захищений портал з терміном дії 30 днів.",
    notes_en:
      "Annual SOC 2 Type II audit report covering Security, Availability, and Confidentiality trust service criteria. Available free on NDA request for Enterprise+; $2,499/yr for Business tier. Report covers the previous 12-month audit window. Latest report date visible on Trust Center.",
    notes_uk:
      "Щорічний звіт аудиту SOC 2 Type II, що охоплює критерії довірчих послуг: Безпека, Доступність та Конфіденційність. Безкоштовно на запит під NDA для Enterprise+; $2 499/рік для рівня Business. Звіт охоплює попередній 12-місячний аудиторський період. Дата останнього звіту видима в Trust Center.",
  },
  {
    id: "pen-test-results",
    type: "pen-test-results",
    name_en: "Penetration Test Report (Annual Summary)",
    name_uk: "Звіт тесту на проникнення (Щорічне резюме)",
    includedInTiers_en: "Enterprise+ (included on request).",
    includedInTiers_uk: "Enterprise+ (включено на запит).",
    addOnPriceUsd: null,
    deliveryFormat_en:
      "Redacted executive summary PDF shared under NDA; full technical report available for Enterprise Gov/Defense only.",
    deliveryFormat_uk:
      "Відредаговане виконавче резюме у форматі PDF надається під NDA; повний технічний звіт доступний лише для Enterprise Gov/Defense.",
    notes_en:
      "Annual third-party penetration test summary covering external attack surface, API endpoints, and authentication flows. Findings summary and remediation status shared on request under mutual NDA. Enterprise+ included; sales-led for others. Full technical detail restricted to Gov/Defense tier.",
    notes_uk:
      "Щорічне резюме тесту на проникнення від третьої сторони, що охоплює зовнішню поверхню атак, API-ендпоінти та потоки автентифікації. Резюме знахідок та статус усунення надаються на запит під взаємним NDA. Включено для Enterprise+; за домовленістю для інших. Повні технічні деталі обмежені рівнем Gov/Defense.",
  },
  {
    id: "data-residency",
    type: "data-residency",
    name_en: "EU Data Residency (Frankfurt Region)",
    name_uk: "Резидентність даних ЄС (Регіон Франкфурт)",
    includedInTiers_en: "Not included in any base tier; available as add-on for Enterprise.",
    includedInTiers_uk: "Не включено в жодний базовий рівень; доступно як надбудова для Enterprise.",
    addOnPriceUsd: 500,
    deliveryFormat_en:
      "Configuration change applied within 5 business days; data migration included. Certificate of data residency issued on completion.",
    deliveryFormat_uk:
      "Зміна конфігурації застосовується протягом 5 робочих днів; міграція даних включена. Після завершення видається сертифікат резидентності даних.",
    notes_en:
      "Ensures all customer data (at rest and in transit) is stored and processed exclusively within the EU (Frankfurt AWS/GCP region). Required for GDPR Art. 44+ cross-border transfer compliance for some member-state DPAs. Add-on: $500/mo for Enterprise; UA residency also available separately.",
    notes_uk:
      "Гарантує зберігання та обробку всіх даних замовника (у стані спокою та під час передачі) виключно в ЄС (регіон AWS/GCP Франкфурт). Потрібно для відповідності GDPR Ст. 44+ щодо транскордонної передачі для деяких DPA держав-членів. Надбудова: $500/міс для Enterprise; резидентність UA також доступна окремо.",
  },
  {
    id: "audit-log-export",
    type: "audit-log-export",
    name_en: "Audit Log Export (Long-Retention, Immutable)",
    name_uk: "Експорт журналу аудиту (Тривале зберігання, Незмінність)",
    includedInTiers_en: "Enterprise (included). Business+ as add-on.",
    includedInTiers_uk: "Enterprise (включено). Business+ як надбудова.",
    addOnPriceUsd: 200,
    deliveryFormat_en:
      "SIEM-compatible JSON/CEF log stream via S3 push, HTTPS webhook, or syslog. Long-retention: 7 years immutable storage.",
    deliveryFormat_uk:
      "SIEM-сумісний потік журналів JSON/CEF через S3 push, HTTPS webhook або syslog. Тривале зберігання: 7 років незмінного сховища.",
    notes_en:
      "Full immutable audit trail of all user actions, API calls, data exports, and access events. Tamper-evident logs with cryptographic chaining. Long-retention (7-year) storage compliant with NIS2, ISO 27001, and common SIEM requirements. $200/mo for Business+; included in Enterprise.",
    notes_uk:
      "Повний незмінний журнал аудиту всіх дій користувачів, API-викликів, експортів даних і подій доступу. Журнали із захистом від підробки та криптографічним ланцюгуванням. Тривале зберігання (7 років) відповідно до NIS2, ISO 27001 та типових вимог SIEM. $200/міс для Business+; включено в Enterprise.",
  },
  {
    id: "siem-integration",
    type: "siem-integration",
    name_en: "SIEM Connector (Splunk / Datadog / Elastic)",
    name_uk: "SIEM-конектор (Splunk / Datadog / Elastic)",
    includedInTiers_en: "Enterprise (included). Business+ as add-on.",
    includedInTiers_uk: "Enterprise (включено). Business+ як надбудова.",
    addOnPriceUsd: 1000,
    deliveryFormat_en:
      "Certified Splunk TA, Datadog integration, or Elastic ingest pipeline. Setup guide + dedicated onboarding call included.",
    deliveryFormat_uk:
      "Сертифікований Splunk TA, інтеграція Datadog або пайплайн інгесту Elastic. Включає посібник з налаштування та виділений дзвінок онбордингу.",
    notes_en:
      "Native SIEM connectors for Splunk (Technology Add-On), Datadog (log forwarding + dashboards), and Elastic (Filebeat/Logstash pipeline). Structured log schema with entity tags, severity levels, and GeoIP enrichment. $1,000/mo for Business+; included in Enterprise. Custom connectors for other SIEMs available sales-led.",
    notes_uk:
      "Нативні SIEM-конектори для Splunk (Technology Add-On), Datadog (пересилання журналів + дашборди) та Elastic (пайплайн Filebeat/Logstash). Структурована схема журналів з тегами сутностей, рівнями серйозності та геоIP-збагаченням. $1 000/міс для Business+; включено в Enterprise. Кастомні конектори для інших SIEM — за домовленістю.",
  },
  {
    id: "hipaa-baa",
    type: "hipaa-baa",
    name_en: "HIPAA Business Associate Agreement (BAA)",
    name_uk: "Угода з діловим партнером HIPAA (BAA)",
    includedInTiers_en: "Enterprise (included for qualifying US healthcare customers).",
    includedInTiers_uk: "Enterprise (включено для кваліфікованих замовників у сфері охорони здоров'я США).",
    addOnPriceUsd: 500,
    deliveryFormat_en:
      "Electronically signed BAA document; stored in compliance dashboard. Executed within 5 business days of eligibility confirmation.",
    deliveryFormat_uk:
      "Електронно підписаний документ BAA; зберігається в дашборді відповідності. Виконується протягом 5 робочих днів після підтвердження відповідності вимогам.",
    notes_en:
      "HIPAA Business Associate Agreement for US healthcare and humanitarian health organizations using Aegis Lens to process any PHI-adjacent data. Covers HIPAA Security Rule obligations, breach notification, and sub-contractor BAA flow-down. $500/yr add-on; included in Enterprise for qualifying customers.",
    notes_uk:
      "Угода з діловим партнером HIPAA для американських організацій охорони здоров'я та гуманітарних медичних організацій, що використовують Aegis Lens для обробки даних, суміжних з PHI. Охоплює зобов'язання Правила безпеки HIPAA, повідомлення про порушення та передачу BAA субпідрядникам. Надбудова $500/рік; включено в Enterprise для кваліфікованих замовників.",
  },
  {
    id: "iso27001-cert",
    type: "iso27001-cert",
    name_en: "ISO 27001 / ISMS Evidence Pack",
    name_uk: "Пакет доказів ISO 27001 / ISMS",
    includedInTiers_en: "Enterprise Gov/Defense (included on request).",
    includedInTiers_uk: "Enterprise Gov/Defense (включено на запит).",
    addOnPriceUsd: null,
    deliveryFormat_en:
      "Curated evidence pack (policies, control mapping, audit trail excerpts) delivered as secure ZIP via compliance portal. Sales-led engagement.",
    deliveryFormat_uk:
      "Підібраний пакет доказів (політики, зіставлення контролів, витяги з журналу аудиту) доставляється у вигляді захищеного ZIP через портал відповідності. Продається через менеджера.",
    notes_en:
      "Custom ISO 27001 / ISMS evidence pack curated for customer procurement processes. Includes certificate of compliance, Annex A control mapping, risk register excerpt, and relevant policy documents. Available sales-led for all tiers; included in Enterprise Gov/Defense at no extra charge.",
    notes_uk:
      "Кастомний пакет доказів ISO 27001 / ISMS, підібраний для процесів закупівель замовника. Включає сертифікат відповідності, зіставлення контролів Додатку A, витяг з реєстру ризиків та відповідні документи політики. Доступно через менеджера для всіх рівнів; включено в Enterprise Gov/Defense без доплати.",
  },
  {
    id: "right-to-erasure-api",
    type: "right-to-erasure-api",
    name_en: "Right-to-Erasure / DSAR Automation API",
    name_uk: "API автоматизації права на видалення / DSAR",
    includedInTiers_en: "Enterprise (included at no charge).",
    includedInTiers_uk: "Enterprise (включено без доплати).",
    addOnPriceUsd: 299,
    deliveryFormat_en:
      "REST API endpoint for programmatic erasure requests; admin UI for manual DSAR queue management. Erasure confirmation receipt issued per request.",
    deliveryFormat_uk:
      "REST API ендпоінт для програмних запитів на видалення; адміністративний UI для управління чергою DSAR вручну. Квитанція про підтвердження видалення видається на кожен запит.",
    notes_en:
      "Automated GDPR/CCPA right-to-erasure and Data Subject Access Request (DSAR) API. Programmatically submit erasure or portability requests; system cascades deletion across all data stores within 30 days per GDPR Art. 17. Audit trail of all requests maintained. Included in Enterprise; $299/mo for Business.",
    notes_uk:
      "Автоматизований API права на видалення GDPR/CCPA та запиту доступу суб'єкта даних (DSAR). Програмне подання запитів на видалення або портованість; система каскадує видалення по всіх сховищах даних протягом 30 днів відповідно до GDPR Ст. 17. Журнал аудиту всіх запитів зберігається. Включено в Enterprise; $299/міс для Business.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_ORDER: string[] = [
  "free",
  "observer",
  "pro",
  "pro-plus",
  "team",
  "business",
  "enterprise",
  "gov-defense",
];

/**
 * Returns compliance add-ons that are available (included or purchasable) for the given tier.
 * Enterprise add-ons with addOnPriceUsd === null and no inclusion note are sales-led only.
 *
 * Повертає надбудови відповідності, доступні (включені або придбані) для вказаного рівня.
 */
export function getComplianceAddonsForTier(tierId: string): ComplianceAddon[] {
  const tierIndex = TIER_ORDER.indexOf(tierId);
  if (tierIndex === -1) return [];

  const businessIndex = TIER_ORDER.indexOf("business");
  const enterpriseIndex = TIER_ORDER.indexOf("enterprise");

  return COMPLIANCE_ADDONS.filter((addon) => {
    // Sales-led (null price, Enterprise-only) — only show for Enterprise+
    if (addon.addOnPriceUsd === null) {
      return tierIndex >= enterpriseIndex;
    }
    // Included-in-Enterprise items are visible to all tiers (purchasable for lower tiers)
    if (addon.includedInTiers_en.toLowerCase().includes("enterprise")) {
      return tierIndex >= businessIndex;
    }
    // Default: available for Business+
    return tierIndex >= businessIndex;
  });
}
