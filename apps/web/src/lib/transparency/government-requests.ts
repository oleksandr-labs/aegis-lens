// Government & Law-Enforcement Requests Transparency
// Defines the counsel-led intake-and-review process, per-request classification
// and outcome taxonomy, lawful user-notification policy, gag-order handling,
// internal quarterly aggregation, and the public report linkage. Per-country
// breakdown structure and civil-society liaison included. Bilingual for
// public-facing copy.

export type GovRequestType =
  | "data"
  | "takedown"
  | "surveillance"
  | "other";

export type GovRequestOutcome =
  | "complied"
  | "partially-complied"
  | "contested"
  | "rejected";

// Counsel-led intake-and-review process — ordered pipeline stages.
export interface IntakeReviewStage {
  order: number;
  key: string;
  owner: "intake-desk" | "legal-counsel" | "policy-team" | "executive";
  step_en: string;
  step_uk: string;
}

export const INTAKE_REVIEW_PROCESS: IntakeReviewStage[] = [
  {
    order: 1,
    key: "logged",
    owner: "intake-desk",
    step_en:
      "Every inbound government or law-enforcement request is logged on receipt with a unique reference, timestamp, requesting authority, country, and stated legal basis.",
    step_uk:
      "Кожен вхідний запит від уряду чи правоохоронних органів реєструється при отриманні з унікальним номером, відміткою часу, органом-запитувачем, країною та зазначеною правовою підставою.",
  },
  {
    order: 2,
    key: "legal-review",
    owner: "legal-counsel",
    step_en:
      "Legal counsel reviews validity, jurisdiction, scope, and proportionality. No data is disclosed and no content is actioned before counsel sign-off.",
    step_uk:
      "Юридичний радник перевіряє дійсність, юрисдикцію, обсяг і пропорційність. Жодні дані не розкриваються і жоден контент не зачіпається до затвердження радником.",
  },
  {
    order: 3,
    key: "narrow-or-challenge",
    owner: "legal-counsel",
    step_en:
      "Overbroad or improper requests are narrowed, formally pushed back on, or challenged. We default to the minimum disclosure legally required.",
    step_uk:
      "Надмірно широкі або неправомірні запити звужуються, формально оскаржуються або заперечуються. За замовчуванням ми розкриваємо мінімум, що вимагається законом.",
  },
  {
    order: 4,
    key: "notify",
    owner: "policy-team",
    step_en:
      "Where lawful and not subject to a valid gag order, the affected user is notified before any disclosure, with enough time to seek legal remedy.",
    step_uk:
      "Де це законно і не діє чинний наказ про нерозголошення, постраждалого користувача повідомляють до будь-якого розкриття, з достатнім часом для пошуку правового захисту.",
  },
  {
    order: 5,
    key: "decide-and-record",
    owner: "legal-counsel",
    step_en:
      "The outcome is decided, executed, and recorded against the request with its classification, legal basis, and response time.",
    step_uk:
      "Результат вирішується, виконується та фіксується щодо запиту разом з його класифікацією, правовою підставою та часом відповіді.",
  },
  {
    order: 6,
    key: "escalate",
    owner: "executive",
    step_en:
      "Novel, high-impact, or precedent-setting requests are escalated to executive and civil-society review before a final decision.",
    step_uk:
      "Нові, високовпливові або прецедентні запити ескалюються до керівництва та огляду громадянського суспільства перед остаточним рішенням.",
  },
];

// Per-request record structure (internal; aggregated for public report).
export interface GovRequestRecord {
  ref: string;
  receivedAt: string; // ISO date
  country: string; // ISO 3166-1 alpha-2
  authority: string;
  type: GovRequestType;
  legalBasis: string;
  outcome: GovRequestOutcome;
  responseTimeDays: number;
  userNotified: boolean;
  userNotificationDeferredByGagOrder: boolean;
}

// Lawful user-notification policy.
export interface UserNotificationPolicy {
  notifyByDefault: true;
  exceptions: string[];
  policy_en: string;
  policy_uk: string;
}

export const USER_NOTIFICATION_POLICY: UserNotificationPolicy = {
  notifyByDefault: true,
  exceptions: [
    "valid, legally binding gag order",
    "credible, imminent risk to life",
    "active investigation where notice is statutorily prohibited",
  ],
  policy_en:
    "Our default is to notify any user whose data is the subject of a government request before we disclose anything, and to give them a reasonable window to seek legal remedy. We withhold notice only where prohibited by a valid gag order, where there is a credible imminent risk to life, or where statute forbids it. When a gag order lapses, we notify retroactively.",
  policy_uk:
    "За замовчуванням ми повідомляємо будь-якого користувача, чиї дані є предметом урядового запиту, перед будь-яким розкриттям і даємо йому розумний строк для пошуку правового захисту. Ми утримуємося від повідомлення лише там, де це заборонено чинним наказом про нерозголошення, де є достовірний безпосередній ризик для життя або де це забороняє закон. Коли наказ про нерозголошення втрачає чинність, ми повідомляємо ретроспективно.",
};

// Gag-order handling.
export interface GagOrderPolicy {
  trackExpiryAndNotifyOnLapse: true;
  challengeImproperGags: true;
  reportAggregateGaggedCount: true;
  policy_en: string;
  policy_uk: string;
}

export const GAG_ORDER_POLICY: GagOrderPolicy = {
  trackExpiryAndNotifyOnLapse: true,
  challengeImproperGags: true,
  reportAggregateGaggedCount: true,
  policy_en:
    "We track the expiry date of every gag order and notify the affected user as soon as it lawfully lapses. We challenge gag orders we consider unjustified or indefinite. Even when we cannot describe an individual gagged request, we publish the aggregate number of requests under active gag orders in each transparency report.",
  policy_uk:
    "Ми відстежуємо дату закінчення кожного наказу про нерозголошення та повідомляємо постраждалого користувача, щойно він законно втрачає чинність. Ми оскаржуємо накази, які вважаємо невиправданими або безстроковими. Навіть коли ми не можемо описати окремий запит під забороною, ми публікуємо сукупну кількість запитів під чинними наказами про нерозголошення в кожному звіті про прозорість.",
};

// Quarterly internal aggregation config.
export interface QuarterlyAggregationConfig {
  cadence: "quarterly";
  groupBy: ("country" | "type" | "outcome")[];
  includesGaggedCount: true;
  internalOnly: true;
  description_en: string;
  description_uk: string;
}

export const QUARTERLY_AGGREGATION_CONFIG: QuarterlyAggregationConfig = {
  cadence: "quarterly",
  groupBy: ["country", "type", "outcome"],
  includesGaggedCount: true,
  internalOnly: true,
  description_en:
    "Each quarter, legal and policy teams aggregate all logged requests by country, type, and outcome, including counts under active gag orders. This internal rollup feeds the annual public report and triggers process review where outcome patterns shift.",
  description_uk:
    "Щокварталу юридична та політична команди агрегують усі зафіксовані запити за країною, типом і результатом, включно з кількістю під чинними наказами про нерозголошення. Цей внутрішній звід живить щорічний публічний звіт і ініціює перегляд процесу, коли змінюються патерни результатів.",
}

// Annual public report linkage — connects this module to the annual report.
export interface AnnualReportLinkage {
  reportSection: "gov-requests";
  publishQuarter: "Q1";
  sourcedFrom: "quarterly internal aggregation";
  linkage_en: string;
  linkage_uk: string;
}

export const ANNUAL_REPORT_LINKAGE: AnnualReportLinkage = {
  reportSection: "gov-requests",
  publishQuarter: "Q1",
  sourcedFrom: "quarterly internal aggregation",
  linkage_en:
    "The four quarterly aggregations roll up into the 'Government & Law Enforcement Requests' section of the annual public transparency report, published in Q1. Figures published there are the canonical public record of government interactions.",
  linkage_uk:
    "Чотири квартальні агрегації зводяться в розділ «Запити від уряду та правоохоронних органів» щорічного публічного звіту про прозорість, що публікується в Q1. Опубліковані там цифри є канонічним публічним записом взаємодій з урядом.",
};

// Per-country breakdown structure for the public report.
export interface GovRequestCountryBreakdown {
  country: string; // ISO 3166-1 alpha-2
  byType: Record<GovRequestType, number>;
  byOutcome: Record<GovRequestOutcome, number>;
  underActiveGagOrder: number;
  medianResponseTimeDays: number;
}

// Empty canonical template — the structure the public report fills per country.
export const GOV_REQUEST_COUNTRY_BREAKDOWN_TEMPLATE: GovRequestCountryBreakdown = {
  country: "",
  byType: { data: 0, takedown: 0, surveillance: 0, other: 0 },
  byOutcome: { complied: 0, "partially-complied": 0, contested: 0, rejected: 0 },
  underActiveGagOrder: 0,
  medianResponseTimeDays: 0,
};

// EFF / civil-society liaison.
export interface CivilSocietyLiaison {
  partners: string[];
  consultOnPrecedentSettingRequests: true;
  amicusSupportWhereAppropriate: true;
  description_en: string;
  description_uk: string;
}

export const CIVIL_SOCIETY_LIAISON: CivilSocietyLiaison = {
  partners: [
    "Electronic Frontier Foundation (EFF)",
    "Access Now",
    "Committee to Protect Journalists (CPJ)",
  ],
  consultOnPrecedentSettingRequests: true,
  amicusSupportWhereAppropriate: true,
  description_en:
    "We maintain a standing liaison with digital-rights and press-freedom organizations including the EFF, Access Now, and CPJ. We consult them on precedent-setting or rights-sensitive requests, seek amicus support where appropriate, and share our redacted process so external advocates can hold us accountable.",
  description_uk:
    "Ми підтримуємо постійний зв'язок з організаціями цифрових прав і свободи преси, зокрема EFF, Access Now та CPJ. Ми консультуємося з ними щодо прецедентних або чутливих до прав запитів, шукаємо підтримку amicus, де це доречно, і ділимося нашим відредагованим процесом, щоб зовнішні захисники могли тримати нас підзвітними.",
};

export const GOV_REQUESTS_SUMMARY_EN =
  "Every government and law-enforcement request runs through a counsel-led intake-and-review process: logged, legally reviewed, narrowed or challenged, the user notified where lawful, and the outcome recorded. We classify each request (data / takedown / surveillance / other), record its outcome (complied / partially complied / contested / rejected), handle gag orders transparently, aggregate quarterly, publish annually with a per-country breakdown, and liaise with civil-society partners.";

export const GOV_REQUESTS_SUMMARY_UK =
  "Кожен запит від уряду та правоохоронних органів проходить очолюваний радником процес прийому та перевірки: реєстрація, юридичний огляд, звуження чи оскарження, повідомлення користувача де це законно, та фіксація результату. Ми класифікуємо кожен запит (дані / видалення / стеження / інше), фіксуємо його результат (виконано / частково виконано / оскаржено / відхилено), прозоро обробляємо накази про нерозголошення, агрегуємо щокварталу, публікуємо щорічно з розбивкою за країнами та підтримуємо зв'язок з партнерами громадянського суспільства.";
