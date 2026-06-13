// Methodology Disclosure
// Publishes exactly how the platform's pipelines work — ingest, verify,
// geolocate, score — so users, auditors, and LLMs can reason about outputs.
// Includes per-pipeline architecture descriptors, reviewer-disagreement
// metrics, a public subset of model evaluation reports, known limitations and
// failure modes, a versioned changelog, per-locale availability, and the
// "linked from every event with caveats" configuration. Bilingual EN + UK.

export type PipelineId = "ingest" | "verify" | "geolocate" | "score";

// Per-pipeline architecture diagram descriptor. Each node/edge is described in
// text so the diagram can be rendered and read by screen readers and LLMs.
export interface PipelineStageNode {
  id: string;
  label_en: string;
  label_uk: string;
  inputs: string[]; // ids of upstream nodes ("source" for external)
  humanInLoop: boolean;
}

export interface PipelineArchitecture {
  id: PipelineId;
  name_en: string;
  name_uk: string;
  summary_en: string;
  summary_uk: string;
  nodes: PipelineStageNode[];
}

export const PIPELINE_ARCHITECTURES: PipelineArchitecture[] = [
  {
    id: "ingest",
    name_en: "Ingest pipeline",
    name_uk: "Конвеєр прийому",
    summary_en:
      "Collects open-source items from monitored feeds, normalizes them, deduplicates, and attaches provenance before anything downstream sees them.",
    summary_uk:
      "Збирає елементи відкритих джерел з моніторених каналів, нормалізує їх, дедуплікує та додає походження перед тим, як їх побачить будь-що далі по конвеєру.",
    nodes: [
      { id: "collect", label_en: "Collect from feeds", label_uk: "Збір з каналів", inputs: ["source"], humanInLoop: false },
      { id: "normalize", label_en: "Normalize & language-detect", label_uk: "Нормалізація та визначення мови", inputs: ["collect"], humanInLoop: false },
      { id: "dedupe", label_en: "Deduplicate", label_uk: "Дедуплікація", inputs: ["normalize"], humanInLoop: false },
      { id: "provenance", label_en: "Attach provenance & hash", label_uk: "Додавання походження та хешу", inputs: ["dedupe"], humanInLoop: false },
    ],
  },
  {
    id: "verify",
    name_en: "Verification pipeline",
    name_uk: "Конвеєр верифікації",
    summary_en:
      "Cross-checks each item against independent sources, assigns a credibility signal, and routes uncertain items to human reviewers before publication.",
    summary_uk:
      "Перехресно перевіряє кожен елемент за незалежними джерелами, присвоює сигнал достовірності та направляє невизначені елементи людським рецензентам перед публікацією.",
    nodes: [
      { id: "crosscheck", label_en: "Cross-source corroboration", label_uk: "Перехресне підтвердження джерел", inputs: ["provenance"], humanInLoop: false },
      { id: "credibility", label_en: "Credibility signal (AI-assisted)", label_uk: "Сигнал достовірності (з допомогою ШІ)", inputs: ["crosscheck"], humanInLoop: false },
      { id: "humanverify", label_en: "Human reviewer confirmation", label_uk: "Підтвердження людським рецензентом", inputs: ["credibility"], humanInLoop: true },
    ],
  },
  {
    id: "geolocate",
    name_en: "Geolocation pipeline",
    name_uk: "Конвеєр геолокації",
    summary_en:
      "Proposes candidate coordinates from visual and textual cues, scores confidence, and requires analyst confirmation before a location is published.",
    summary_uk:
      "Пропонує кандидатські координати з візуальних і текстових підказок, оцінює впевненість і вимагає підтвердження аналітика перед публікацією локації.",
    nodes: [
      { id: "candidates", label_en: "Generate candidate locations", label_uk: "Генерація кандидатських локацій", inputs: ["humanverify"], humanInLoop: false },
      { id: "geoconf", label_en: "Confidence scoring", label_uk: "Оцінка впевненості", inputs: ["candidates"], humanInLoop: false },
      { id: "geoconfirm", label_en: "Analyst confirmation", label_uk: "Підтвердження аналітиком", inputs: ["geoconf"], humanInLoop: true },
    ],
  },
  {
    id: "score",
    name_en: "Scoring pipeline",
    name_uk: "Конвеєр оцінювання",
    summary_en:
      "Combines verified attributes into calibrated danger/severity and confidence scores, with logged human overrides and published calibration.",
    summary_uk:
      "Поєднує верифіковані атрибути в калібровані оцінки небезпеки/серйозності та впевненості, з журналюванням людських перевизначень та опублікованою калібрацією.",
    nodes: [
      { id: "features", label_en: "Assemble scored features", label_uk: "Збір оцінюваних ознак", inputs: ["geoconfirm"], humanInLoop: false },
      { id: "calibrate", label_en: "Calibrated danger/confidence score", label_uk: "Калібрована оцінка небезпеки/впевненості", inputs: ["features"], humanInLoop: false },
      { id: "override", label_en: "Human override (logged)", label_uk: "Людське перевизначення (журналюється)", inputs: ["calibrate"], humanInLoop: true },
    ],
  },
];

// Reviewer-disagreement metrics published per pipeline stage.
export interface ReviewerDisagreementMetric {
  pipeline: PipelineId;
  stageId: string;
  disagreementRate: number; // 0..1
  cohenKappa: number;
  note_en: string;
  note_uk: string;
}

export const REVIEWER_DISAGREEMENT_METRICS: ReviewerDisagreementMetric[] = [
  {
    pipeline: "verify",
    stageId: "humanverify",
    disagreementRate: 0.12,
    cohenKappa: 0.79,
    note_en: "Disagreements above threshold trigger a third reviewer and a guidance update.",
    note_uk: "Розбіжності понад поріг ініціюють третього рецензента та оновлення настанов.",
  },
  {
    pipeline: "geolocate",
    stageId: "geoconfirm",
    disagreementRate: 0.09,
    cohenKappa: 0.83,
    note_en: "Most disagreement is on precision band, not on the broad location.",
    note_uk: "Більшість розбіжностей стосуються діапазону точності, а не загальної локації.",
  },
  {
    pipeline: "score",
    stageId: "override",
    disagreementRate: 0.15,
    cohenKappa: 0.71,
    note_en: "Severity bands show the most disagreement; we publish the override rate openly.",
    note_uk: "Діапазони серйозності показують найбільше розбіжностей; ми публікуємо рівень перевизначень відкрито.",
  },
];

// Public subset of per-model evaluation reports.
export interface PublicModelEvalReport {
  pipeline: PipelineId;
  modelLabel: string;
  publicMetrics: { metric: string; value: number; unit?: string }[];
  reportRef: string;
  caveat_en: string;
  caveat_uk: string;
}

export const PUBLIC_MODEL_EVAL_REPORTS: PublicModelEvalReport[] = [
  {
    pipeline: "verify",
    modelLabel: "Credibility-signal model",
    publicMetrics: [
      { metric: "ranking correlation w/ analysts", value: 0.78 },
      { metric: "false-high-credibility rate", value: 0.04, unit: "share" },
    ],
    reportRef: "model-card/source-credibility",
    caveat_en: "Reported on a held-out evaluation set; live distribution differs and is monitored.",
    caveat_uk: "Подано на відкладеному оціночному наборі; жива дистрибуція відрізняється та моніториться.",
  },
  {
    pipeline: "geolocate",
    modelLabel: "Geolocation-assist model",
    publicMetrics: [
      { metric: "top-1 within 1km", value: 0.74 },
      { metric: "confidence calibration error", value: 0.06 },
    ],
    reportRef: "model-card/geolocation",
    caveat_en: "Accuracy degrades in low-landmark terrain; this subset excludes adversarial cases under review.",
    caveat_uk: "Точність знижується на місцевості з малою кількістю орієнтирів; цей підмножина виключає змагальні випадки на розгляді.",
  },
  {
    pipeline: "score",
    modelLabel: "Calibrated severity model",
    publicMetrics: [
      { metric: "ordinal accuracy (±1 band)", value: 0.9 },
      { metric: "calibration error", value: 0.05 },
    ],
    reportRef: "model-card/danger-score",
    caveat_en: "A subset of full evaluation; the complete report is shared with auditors under NDA.",
    caveat_uk: "Підмножина повної оцінки; повний звіт надається аудиторам за угодою про нерозголошення.",
  },
];

// Known limitations + failure modes, per pipeline.
export interface PipelineLimitation {
  pipeline: PipelineId;
  failureMode_en: string;
  failureMode_uk: string;
  mitigation_en: string;
  mitigation_uk: string;
}

export const PIPELINE_LIMITATIONS: PipelineLimitation[] = [
  {
    pipeline: "ingest",
    failureMode_en: "Recycled or staged media can enter the pipeline as if it were new.",
    failureMode_uk: "Повторно використані або постановочні медіа можуть потрапити в конвеєр як нові.",
    mitigation_en: "Perceptual hashing and reverse-image checks flag likely reuse for review.",
    mitigation_uk: "Перцептивне хешування та зворотний пошук зображень позначають ймовірне повторне використання для перевірки.",
  },
  {
    pipeline: "verify",
    failureMode_en: "Coordinated sources can create false corroboration.",
    failureMode_uk: "Скоординовані джерела можуть створити хибне підтвердження.",
    mitigation_en: "Independence checks weight corroboration by source-network distance, and human reviewers adjudicate.",
    mitigation_uk: "Перевірки незалежності зважують підтвердження за відстанню в мережі джерел, а люди-рецензенти ухвалюють рішення.",
  },
  {
    pipeline: "geolocate",
    failureMode_en: "Featureless terrain yields low-confidence or wrong candidates.",
    failureMode_uk: "Безознакова місцевість дає кандидатів з низькою впевненістю або хибних.",
    mitigation_en: "Confidence is surfaced honestly and low-confidence locations are withheld from publication.",
    mitigation_uk: "Впевненість чесно відображається, а локації з низькою впевненістю не публікуються.",
  },
  {
    pipeline: "score",
    failureMode_en: "Scores can lag genuinely novel threat types and under-score cumulative risk.",
    failureMode_uk: "Оцінки можуть відставати від справді нових типів загроз і недооцінювати кумулятивний ризик.",
    mitigation_en: "Human override is always available and logged; calibration is re-checked quarterly.",
    mitigation_uk: "Людське перевизначення завжди доступне і журналюється; калібрація перевіряється щокварталу.",
  },
];

// Versioned methodology with changelog.
export interface MethodologyVersionEntry {
  version: string; // semver
  date: string; // ISO date
  change_en: string;
  change_uk: string;
}

export interface VersionedMethodology {
  currentVersion: string;
  changelog: MethodologyVersionEntry[];
}

export const VERSIONED_METHODOLOGY: VersionedMethodology = {
  currentVersion: "1.2.0",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-02-01",
      change_en: "Initial public methodology covering ingest, verify, geolocate, and score pipelines.",
      change_uk: "Початкова публічна методологія, що охоплює конвеєри прийому, верифікації, геолокації та оцінювання.",
    },
    {
      version: "1.1.0",
      date: "2026-04-15",
      change_en: "Added published reviewer-disagreement metrics and Cohen's kappa per stage.",
      change_uk: "Додано опубліковані метрики розбіжностей рецензентів і каппу Коена за кожним етапом.",
    },
    {
      version: "1.2.0",
      date: "2026-06-01",
      change_en: "Published a subset of per-model evaluation reports and documented per-pipeline failure modes.",
      change_uk: "Опубліковано підмножину звітів оцінки моделей та задокументовано режими збоїв за кожним конвеєром.",
    },
  ],
};

// Per-locale availability of the methodology disclosure.
export interface MethodologyLocaleAvailability {
  locale: string;
  fullyTranslated: boolean;
}

export const METHODOLOGY_LOCALE_AVAILABILITY: MethodologyLocaleAvailability[] = [
  { locale: "en", fullyTranslated: true },
  { locale: "uk", fullyTranslated: true },
  { locale: "de", fullyTranslated: true },
  { locale: "fr", fullyTranslated: true },
];

// "Linked from every event with caveats" configuration.
export interface EventMethodologyLinkConfig {
  linkFromEveryEvent: true;
  anchorByPipeline: Record<PipelineId, string>;
  caveatBadgeKey: string;
  caveat_en: string;
  caveat_uk: string;
}

export const EVENT_METHODOLOGY_LINK_CONFIG: EventMethodologyLinkConfig = {
  linkFromEveryEvent: true,
  anchorByPipeline: {
    ingest: "/methodology#ingest",
    verify: "/methodology#verify",
    geolocate: "/methodology#geolocate",
    score: "/methodology#score",
  },
  caveatBadgeKey: "methodology-caveat",
  caveat_en:
    "Every published event links to the methodology section relevant to its pipeline stages and carries a caveat noting confidence level, human-review status, and known limitations, so readers can calibrate how much weight to place on it.",
  caveat_uk:
    "Кожна опублікована подія посилається на розділ методології, що стосується її етапів конвеєра, і містить застереження із зазначенням рівня впевненості, статусу людської перевірки та відомих обмежень, щоб читачі могли калібрувати, скільки ваги їй надавати.",
};

export const METHODOLOGY_DISCLOSURE_SUMMARY_EN =
  "We publish how each pipeline works (ingest, verify, geolocate, score) with text-described architecture, published reviewer-disagreement metrics, a public subset of model evaluation reports, documented limitations and failure modes, a versioned changelog, full per-locale translation, and a caveat link from every event.";

export const METHODOLOGY_DISCLOSURE_SUMMARY_UK =
  "Ми публікуємо, як працює кожен конвеєр (прийом, верифікація, геолокація, оцінювання) з текстово описаною архітектурою, опублікованими метриками розбіжностей рецензентів, публічною підмножиною звітів оцінки моделей, задокументованими обмеженнями та режимами збоїв, версіонованим журналом змін, повним перекладом за локалями та посиланням із застереженням від кожної події.";
