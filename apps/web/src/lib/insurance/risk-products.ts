/**
 * Insurance & Risk Products — Aegis Lens / Ukrainian MAP
 *
 * Defines the product catalogue for war-risk scoring, parametric triggers,
 * claims-evidence dossiers, and actuarial dashboards targeted at the
 * insurance, reinsurance, and parametric markets.
 *
 * Каталог страхових продуктів: оцінка воєнних ризиків, параметричні тригери,
 * досьє доказів для виплат і дашборди для актуаріїв.
 * Усі грошові значення у USD. Оцінки за шкалою 0–100 (100 = найвищий ризик).
 */

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Supported insurance product types.
 * Підтримувані типи страхових продуктів.
 */
export type InsuranceProductType =
  | "war-risk-score"
  | "asset-risk-api"
  | "parametric-trigger"
  | "claims-evidence-dossier"
  | "annual-risk-atlas"
  | "underwriting-console";

/**
 * Risk score range descriptor with confidence interval metadata.
 * Діапазон оцінок ризику з описом довірчого інтервалу.
 */
export interface RiskScoreRange {
  /** Minimum possible score (always 0). */
  min: 0;
  /** Maximum possible score (always 100). */
  max: 100;
  /** Human-readable description of the confidence interval (English). */
  confidenceInterval_en: string;
  /** Human-readable description of the confidence interval (Ukrainian). */
  confidenceInterval_uk: string;
}

/**
 * A single insurance or risk data product offered by Aegis Lens.
 * Окремий страховий або ризиковий продукт Aegis Lens.
 */
export interface InsuranceProduct {
  /** Unique product identifier. */
  id: string;
  /** Product type. */
  type: InsuranceProductType;
  /** Product name (English). */
  name_en: string;
  /** Product name (Ukrainian). */
  name_uk: string;
  /** Description of the pricing model (English). */
  pricingModel_en: string;
  /** Description of the pricing model (Ukrainian). */
  pricingModel_uk: string;
  /** Additional implementation or delivery notes (English). */
  notes_en: string;
  /** Additional implementation or delivery notes (Ukrainian). */
  notes_uk: string;
  /**
   * Indicative annual contract value range in USD.
   * [min, max] — null means custom / negotiated.
   */
  acvRangeUsd: [number, number] | null;
}

// ── Product registry ───────────────────────────────────────────────────────────

/**
 * Full catalogue of Aegis Lens insurance and risk data products.
 * Повний каталог страхових і ризикових продуктів Aegis Lens.
 */
export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: "war-risk-score",
    type: "war-risk-score",
    name_en: "War-Risk Score per AOI",
    name_uk: "Оцінка воєнного ризику на AOI",
    pricingModel_en:
      "API call-based metering with minimum monthly commit; tiered volume discounts above 10k calls/day.",
    pricingModel_uk:
      "Метерування за викликами API з мінімальним місячним комітом; ступінчасті знижки від 10k викликів/день.",
    notes_en:
      "Continuous 0–100 war-risk score with confidence interval for any defined Area of Interest (AOI). " +
      "Score is updated as new verified events, satellite imagery, and open-source signals are ingested. " +
      "Backed by a version-pinned, back-tested scoring model auditable by enterprise clients.",
    notes_uk:
      "Безперервна оцінка воєнного ризику 0–100 з довірчим інтервалом для будь-якого визначеного AOI. " +
      "Оцінка оновлюється в міру надходження нових верифікованих подій, супутникових знімків і OSINT-сигналів. " +
      "Підтримується моделлю з фіксованою версією та пройденим back-тестом, доступною для аудиту корпоративними клієнтами.",
    acvRangeUsd: [25_000, 250_000],
  },
  {
    id: "asset-risk-api",
    type: "asset-risk-api",
    name_en: "Asset Risk Scoring API",
    name_uk: "API оцінки ризику активів",
    pricingModel_en:
      "Per-query pricing with 30/90/365-day forecast add-ons; annual contract with min commit.",
    pricingModel_uk:
      "Ціноутворення за запит із надбудовами прогнозу на 30/90/365 днів; річний контракт з мінімальним комітом.",
    notes_en:
      "Given WGS-84 coordinates and an asset type (warehouse, pipeline, vessel, power-plant, etc.), " +
      "returns a composite risk score plus a 30/90/365-day forward-looking forecast. " +
      "Asset types map to specialised sub-models. Designed for property and casualty underwriters.",
    notes_uk:
      "За координатами WGS-84 та типом активу (склад, трубопровід, судно, електростанція тощо) " +
      "повертає зведену оцінку ризику та прогноз на 30/90/365 днів. " +
      "Типи активів відображаються на спеціалізовані підмоделі. Розроблено для андеррайтерів P&C.",
    acvRangeUsd: [50_000, 500_000],
  },
  {
    id: "parametric-trigger",
    type: "parametric-trigger",
    name_en: "Parametric Trigger Feed",
    name_uk: "Стрічка параметричних тригерів",
    pricingModel_en:
      "Annual contract per AOI; webhook delivery; min commit $10k/yr per trigger endpoint.",
    pricingModel_uk:
      "Річний контракт на AOI; доставка через вебхук; мінімальний коміт $10k/рік на кінцеву точку тригера.",
    notes_en:
      "A webhook fires when a user-defined AOI condition is met (e.g. risk score crosses threshold, " +
      "verified strike event within radius, air-alert duration threshold). " +
      "Designed for parametric insurance contracts that require objective, machine-readable triggers. " +
      "Each trigger is timestamped, versioned, and audit-logged.",
    notes_uk:
      "Вебхук спрацьовує при виконанні умови для AOI (напр., оцінка ризику перетинає поріг, " +
      "верифікований удар в радіусі, перевищення тривалості повітряної тривоги). " +
      "Розроблено для параметричних страхових контрактів, що потребують об'єктивних машино-читних тригерів. " +
      "Кожен тригер має мітку часу, версію та запис в журналі аудиту.",
    acvRangeUsd: [10_000, 150_000],
  },
  {
    id: "claims-evidence-dossier",
    type: "claims-evidence-dossier",
    name_en: "Claims-Evidence Dossier",
    name_uk: "Досьє доказів для страхових виплат",
    pricingModel_en:
      "Per-dossier fee ($500–$5,000 depending on AOI size and event complexity) plus annual subscription for claims teams.",
    pricingModel_uk:
      "Плата за досьє ($500–$5,000 залежно від AOI та складності події) плюс річна підписка для команд виплат.",
    notes_en:
      "Post-event verified evidence package assembled for insurance claims processing. " +
      "Includes timestamped satellite imagery, corroborated open-source incident reports, " +
      "damage assessment overlays, and chain-of-custody metadata for legal admissibility. " +
      "Delivered as a structured PDF + JSON bundle within agreed SLA.",
    notes_uk:
      "Верифікований пакет доказів після події для обробки страхових виплат. " +
      "Включає супутникові знімки з мітками часу, підкріплені OSINT-звіти, " +
      "оверлеї оцінки збитків і метадані ланцюга зберігання для юридичної допустимості. " +
      "Доставляється як структурований PDF + JSON-пакет у межах погодженого SLA.",
    acvRangeUsd: [6_000, 60_000],
  },
  {
    id: "annual-risk-atlas",
    type: "annual-risk-atlas",
    name_en: "Annual Risk Atlas",
    name_uk: "Щорічний атлас ризиків",
    pricingModel_en:
      "Annual report subscription; $25,000–$100,000 per licence depending on coverage scope and number of seats.",
    pricingModel_uk:
      "Річна підписка на звіт; $25,000–$100,000 за ліцензію залежно від охоплення та кількості місць.",
    notes_en:
      "Comprehensive annual risk atlas covering conflict zones, infrastructure damage inventories, " +
      "loss-ratio benchmarks by region, and 12-month forward risk outlook. " +
      "Designed as a reference document for Lloyd's syndicates, reinsurance actuarial teams, " +
      "and sovereign wealth fund risk committees. Updated quarterly with a full annual edition.",
    notes_uk:
      "Комплексний щорічний атлас ризиків: зони конфліктів, інвентаризація пошкодженої інфраструктури, " +
      "бенчмарки коефіцієнтів збитків за регіонами та прогноз на 12 місяців. " +
      "Призначено для синдикатів Lloyd's, актуарних команд перестрахування та ризик-комітетів суверенних фондів. " +
      "Квартальні оновлення та повне річне видання.",
    acvRangeUsd: [25_000, 100_000],
  },
  {
    id: "underwriting-console",
    type: "underwriting-console",
    name_en: "Underwriting Console",
    name_uk: "Консоль андеррайтингу",
    pricingModel_en:
      "Annual seat licence; custom pricing for enterprise actuarial teams; minimum 5 seats.",
    pricingModel_uk:
      "Річна ліцензія на місце; індивідуальне ціноутворення для корпоративних актуарних команд; мінімум 5 місць.",
    notes_en:
      "Interactive dashboard for actuaries and underwriters. Features include AOI portfolio exposure mapping, " +
      "accumulation management, PML estimation, risk-score time-series analytics, " +
      "and scenario-modelling tools for war-risk portfolios. " +
      "Integrates with the Risk Score API and Parametric Trigger feeds.",
    notes_uk:
      "Інтерактивний дашборд для актуаріїв і андеррайтерів. Функції: картування ризику портфеля AOI, " +
      "управління акумуляцією, оцінка PML, аналітика часових рядів оцінок ризику " +
      "та інструменти моделювання сценаріїв для портфелів воєнних ризиків. " +
      "Інтегрується з API оцінки ризику та стрічками параметричних тригерів.",
    acvRangeUsd: [30_000, 1_000_000],
  },
];

// ── Policy notes ───────────────────────────────────────────────────────────────

/**
 * Licensing note for B2B redistribution rights in policy documents (English).
 * Примітка щодо ліцензування для перерозподілу B2B у страхових документах (англійська).
 */
export const INSURANCE_LICENSING_NOTE_EN =
  "Aegis Lens insurance products carry B2B redistribution rights that allow licensed " +
  "insurers and reinsurers to include risk scores and evidence packages directly in policy " +
  "documents, claims dossiers, and syndicate submissions. Redistribution to third parties " +
  "outside the licensed entity requires a separate redistribution agreement. Raw API output " +
  "must not be resold as a competing data product.";

/**
 * Licensing note for B2B redistribution rights in policy documents (Ukrainian).
 * Примітка щодо ліцензування для перерозподілу B2B у страхових документах (українська).
 */
export const INSURANCE_LICENSING_NOTE_UK =
  "Страхові продукти Aegis Lens мають права перерозподілу B2B, що дозволяють ліцензованим " +
  "страховикам і перестраховикам включати оцінки ризику та пакети доказів безпосередньо у страхові " +
  "документи, досьє виплат і поданнях синдикатів. Перерозподіл третім сторонам поза межами " +
  "ліцензованого суб'єкта вимагає окремої угоди про перерозподіл. Необроблений вивід API " +
  "не може бути перепроданий як конкуруючий продукт даних.";

/**
 * Scoring methodology note — auditable, version-pinned, back-tested (English).
 * Примітка щодо методології скорингу — аудитована, версіонована, пройшла back-тест (англійська).
 */
export const INSURANCE_SCORING_METHOD_NOTE_EN =
  "All Aegis Lens risk scores are produced by a methodology that is version-pinned, " +
  "fully documented, and back-tested against historical conflict and loss data. " +
  "Enterprise clients may request a full methodology audit package including model cards, " +
  "feature-importance reports, and back-test result sets. Model versions are immutably logged " +
  "alongside every score output to ensure reproducibility for claims and legal proceedings.";

/**
 * Scoring methodology note — auditable, version-pinned, back-tested (Ukrainian).
 * Примітка щодо методології скорингу — аудитована, версіонована, пройшла back-тест (українська).
 */
export const INSURANCE_SCORING_METHOD_NOTE_UK =
  "Усі оцінки ризику Aegis Lens виробляються методологією з фіксованою версією, " +
  "повністю задокументованою та пройденою back-тестуванням на історичних даних конфліктів і збитків. " +
  "Корпоративні клієнти можуть запросити повний пакет аудиту методології, включаючи model cards, " +
  "звіти про важливість ознак та набори результатів back-тесту. Версії моделей незмінно реєструються " +
  "разом із кожним виводом оцінки для забезпечення відтворюваності у виплатах і судових справах.";

/**
 * Annual contract terms note (English).
 * Примітка щодо умов річних контрактів (англійська).
 */
export const INSURANCE_ANNUAL_CONTRACT_NOTE_EN =
  "Insurance and risk products are sold under annual contracts with ACV ranging from $25,000 " +
  "to $1,000,000 depending on product, coverage scope, and seat count. " +
  "All contracts include per-API-call metering above the included volume tier, " +
  "a minimum annual commit, and quarterly usage reviews. " +
  "Custom SLAs, uptime guarantees, and dedicated data channels are available at enterprise tier.";

/**
 * Annual contract terms note (Ukrainian).
 * Примітка щодо умов річних контрактів (українська).
 */
export const INSURANCE_ANNUAL_CONTRACT_NOTE_UK =
  "Страхові та ризикові продукти продаються за річними контрактами з ACV від $25,000 " +
  "до $1,000,000 залежно від продукту, обсягу охоплення та кількості місць. " +
  "Усі контракти включають метерування за викликами API понад включений обсяг, " +
  "мінімальний річний коміт і щоквартальні огляди використання. " +
  "Індивідуальні SLA, гарантії uptime та виділені канали даних доступні на корпоративному рівні.";

/**
 * Anchor partner co-development note (English).
 * Примітка щодо спільної розробки з партнерами-якорями (англійська).
 */
export const INSURANCE_ANCHOR_PARTNER_NOTE_EN =
  "Insurance product development is co-designed with 1–2 anchor insurance or reinsurance partners " +
  "prior to general availability. Anchor partners receive early access, co-branding rights, " +
  "and preferred pricing in exchange for a Letter of Intent (LOI) before the build commences. " +
  "Interested insurers and Lloyd's syndicates should contact the partnerships team.";

/**
 * Anchor partner co-development note (Ukrainian).
 * Примітка щодо спільної розробки з партнерами-якорями (українська).
 */
export const INSURANCE_ANCHOR_PARTNER_NOTE_UK =
  "Розробка страхових продуктів здійснюється спільно з 1–2 партнерами-якорями зі страхування " +
  "або перестрахування до загальної доступності. Партнери-якорі отримують ранній доступ, " +
  "права на спільний брендинг і пільгові ціни в обмін на Лист про наміри (LOI) до початку розробки. " +
  "Зацікавлені страховики та синдикати Lloyd's мають звертатися до команди з партнерства.";

/**
 * Technical dependencies note (English).
 * Примітка щодо технічних залежностей (англійська).
 */
export const INSURANCE_DEPENDENCIES_NOTE_EN =
  "Insurance products depend on the following platform capabilities reaching production readiness: " +
  "(1) Danger Score v1 with back-test validation — provides the base conflict intensity signal; " +
  "(2) Confidence Score — quantifies uncertainty for actuarial use; " +
  "(3) Anomaly Detection — identifies unusual activity spikes for parametric triggers. " +
  "None of these insurance products should be sold as production-ready until all three dependencies " +
  "have passed internal QA and external audit.";

/**
 * Technical dependencies note (Ukrainian).
 * Примітка щодо технічних залежностей (українська).
 */
export const INSURANCE_DEPENDENCIES_NOTE_UK =
  "Страхові продукти залежать від таких платформних можливостей, що досягли виробничої готовності: " +
  "(1) Danger Score v1 з валідацією back-тесту — надає базовий сигнал інтенсивності конфлікту; " +
  "(2) Confidence Score — кількісно визначає невизначеність для актуарного використання; " +
  "(3) Anomaly Detection — виявляє незвичні сплески активності для параметричних тригерів. " +
  "Жоден із цих страхових продуктів не слід продавати як виробничо готовий, поки всі три залежності " +
  "не пройдуть внутрішній контроль якості та зовнішній аудит.";

/**
 * Segment priority note (English).
 * Примітка щодо пріоритету сегменту (англійська).
 */
export const INSURANCE_SEGMENT_NOTE_EN =
  "Insurance and reinsurance represents the largest potential ACV segment for Aegis Lens, " +
  "with individual contracts ranging from $25k to $1M annually. " +
  "However, this segment requires a back-tested scoring model and regulatory-clean licensing " +
  "before any commercial deployment. Do not market insurance products as production-ready " +
  "until the scoring methodology has passed an independent actuarial review.";

/**
 * Segment priority note (Ukrainian).
 * Примітка щодо пріоритету сегменту (українська).
 */
export const INSURANCE_SEGMENT_NOTE_UK =
  "Страхування та перестрахування є найбільшим потенційним ACV-сегментом для Aegis Lens — " +
  "окремі контракти коливаються від $25k до $1M на рік. " +
  "Проте цей сегмент вимагає back-tested-моделі скорингу та регуляторно чистого ліцензування " +
  "перед будь-яким комерційним розгортанням. Не слід просувати страхові продукти як виробничо готові, " +
  "поки методологія скорингу не пройде незалежний актуарний огляд.";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Compute a parametric trigger webhook configuration for a given AOI and threshold.
 *
 * Returns a trigger config object that can be persisted and used to register
 * a webhook endpoint in the Aegis Lens parametric trigger feed.
 *
 * Обчислює конфігурацію вебхука параметричного тригера для AOI та порогу.
 */
export function computeParametricTriggerWebhook(
  aoiId: string,
  threshold: number,
): {
  aoiId: string;
  threshold: number;
  triggerType: "risk-score-threshold";
  direction: "above" | "below";
  webhookUrl: string | null;
  createdAt: string;
  version: string;
} {
  if (threshold < 0 || threshold > 100) {
    throw new RangeError(
      `Threshold must be between 0 and 100, received ${threshold}.`,
    );
  }

  return {
    aoiId,
    threshold,
    triggerType: "risk-score-threshold",
    // Fires when the score crosses above the threshold (most common for insurance use-cases)
    direction: "above",
    // webhookUrl is null until the client registers a delivery endpoint via the API
    webhookUrl: null,
    createdAt: new Date().toISOString(),
    // Version string pinned to the scoring model version; replace with real semver in production
    version: "0.1.0-stub",
  };
}
