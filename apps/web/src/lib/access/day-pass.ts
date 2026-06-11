/**
 * Day / Event / Crisis Pass product catalog.
 * Short-window full-access passes for users who do not want a subscription.
 * Captures impulse buyers around discrete events: strikes, elections, crises, press deadlines.
 *
 * Каталог денних / подієвих / кризових пасів.
 * Короткострокові паси повного доступу для користувачів без підписки.
 * Орієнтовані на імпульсивні покупки навколо конкретних подій.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type PassType =
  | "day-pass"
  | "event-pass"
  | "crisis-pass"
  | "weekend-pass"
  | "trial-pass";

export type PassFeatureSet =
  | "analytics-read"
  | "full-pro"
  | "enterprise-preview"
  | "map-only";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DayPass {
  id: string;
  type: PassType;
  name_en: string;
  name_uk: string;
  /** Duration of access window in hours */
  durationHours: number;
  featureSet: PassFeatureSet;
  /** Price in USD; 0 = free */
  priceUsd: number;
  notes_en: string;
  notes_uk: string;
  prohibitedUses_en: string;
  prohibitedUses_uk: string;
}

// ── Pass catalog ──────────────────────────────────────────────────────────────

/**
 * All available pass products.
 *
 * Усі доступні продукти-паси.
 */
export const DAY_PASSES: DayPass[] = [
  {
    id: "pass-day",
    type: "day-pass",
    name_en: "Day Pass",
    name_uk: "Денний пас",
    durationHours: 24,
    featureSet: "full-pro",
    priceUsd: 9.99,
    notes_en:
      "24-hour full Pro feature access. One-off purchase; does not auto-renew. " +
      "Ideal for one-time access needs: a single investigation, a breaking story, or a rapid assessment task. " +
      "Priced at approximately 30% of monthly Pro (anchors on commitment-aversion).",
    notes_uk:
      "24-годинний повний доступ до функцій Pro. Одноразова покупка; не поновлюється автоматично. " +
      "Ідеально для одноразових потреб: одне розслідування, терміновий матеріал або швидка оцінка. " +
      "Ціна приблизно 30% від місячного Pro (орієнтована на небажання зобов'язань).",
    prohibitedUses_en:
      "Must not be used as a subscription substitute by purchasing multiple consecutive day-passes. " +
      "Fraud detection monitors repeat same-day purchases.",
    prohibitedUses_uk:
      "Заборонено використовувати як замінник підписки шляхом придбання кількох послідовних денних пасів. " +
      "Система виявлення шахрайства відстежує повторні покупки в той самий день.",
  },
  {
    id: "pass-event",
    type: "event-pass",
    name_en: "Event Pass",
    name_uk: "Подієвий пас",
    durationHours: 72,
    featureSet: "enterprise-preview",
    priceUsd: 24.99,
    notes_en:
      "72-hour full Pro + Enterprise preview access. Designed for conferences, breaking events, or major operational coverage windows. " +
      "Cheaper per-day than a monthly subscription (encourages discrete-event buyers; lowers CAC vs SaaS funnel). " +
      "Can be linked to a named event or AOI identifier for analytics tracking.",
    notes_uk:
      "72-годинний доступ до повного Pro + попереднього перегляду Enterprise. " +
      "Призначений для конференцій, резонансних подій або великих операційних вікон покриття. " +
      "Дешевший за день, ніж місячна підписка (орієнтований на покупців конкретних подій). " +
      "Може бути прив'язаний до назви події або ідентифікатора AOI для аналітики.",
    prohibitedUses_en:
      "Not for sustained day-to-day use. Event Pass is tied to a specific event or coverage period. " +
      "Abuse (purchasing back-to-back event passes to avoid subscription) triggers fraud review.",
    prohibitedUses_uk:
      "Не для постійного щоденного використання. Подієвий пас прив'язаний до конкретної події або періоду покриття. " +
      "Зловживання (послідовні покупки подієвих пасів для уникнення підписки) ініціює перевірку на шахрайство.",
  },
  {
    id: "pass-crisis",
    type: "crisis-pass",
    name_en: "Crisis Pass",
    name_uk: "Кризовий пас",
    durationHours: 168,
    featureSet: "enterprise-preview",
    priceUsd: 49,
    notes_en:
      "7-day Enterprise-preview access. Auto-triggered and potentially offered at $0 when Aegis Lens declares a major humanitarian crisis " +
      "(e.g. large-scale offensive, mass civilian emergency). " +
      "Standard price $49; may be reduced or waived for verified humanitarian workers during declared crises. " +
      "Geo-IP + light identity verification required.",
    notes_uk:
      "7-денний доступ до попереднього перегляду Enterprise. Автоматично запускається і може пропонуватися безкоштовно, " +
      "коли Aegis Lens оголошує масштабну гуманітарну кризу (наприклад, великий наступ, масова цивільна надзвичайна ситуація). " +
      "Стандартна ціна $49; може бути знижена або скасована для верифікованих гуманітарних працівників під час оголошених криз. " +
      "Потрібна геолокація IP + легка верифікація особи.",
    prohibitedUses_en:
      "Crisis Pass is intended for genuine crisis-response use only. " +
      "Using a crisis pass for commercial intelligence gathering or non-humanitarian purposes is prohibited and may result in account suspension.",
    prohibitedUses_uk:
      "Кризовий пас призначений виключно для реагування на реальні кризи. " +
      "Використання кризового пасу для комерційного збору розвідки або в негуманітарних цілях заборонено і може призвести до блокування облікового запису.",
  },
  {
    id: "pass-weekend",
    type: "weekend-pass",
    name_en: "Weekend Pass",
    name_uk: "Вихідний пас",
    durationHours: 48,
    featureSet: "analytics-read",
    priceUsd: 6.99,
    notes_en:
      "48-hour analytics read access (Saturday–Sunday window). " +
      "Targeted at weekend researchers, hobbyist investigators, and students. " +
      "Analytics-read tier: includes map, reports, and dashboards but excludes API access and bulk export.",
    notes_uk:
      "48-годинний доступ до аналітики (вікно суботи–неділі). " +
      "Орієнтований на дослідників вихідних, незалежних слідчих та студентів. " +
      "Рівень аналітики-читання: включає карту, звіти та панелі, але виключає API-доступ і масовий експорт.",
    prohibitedUses_en:
      "Not for commercial use or API access. Weekend Pass does not include write operations or export features.",
    prohibitedUses_uk:
      "Не для комерційного використання або доступу до API. Вихідний пас не включає операції запису або функції експорту.",
  },
  {
    id: "pass-trial",
    type: "trial-pass",
    name_en: "Trial Pass",
    name_uk: "Пробний пас",
    durationHours: 336,
    featureSet: "full-pro",
    priceUsd: 0,
    notes_en:
      "14-day free full Pro access. One trial pass per email address; non-transferable. " +
      "Converts to a paid Pro subscription at end of trial (with explicit user consent). " +
      "Tracks conversion Pass → Pro within 30 days as a key funnel KPI.",
    notes_uk:
      "14 днів безкоштовного повного доступу Pro. Один пробний пас на адресу електронної пошти; не передається. " +
      "Конвертується до платної підписки Pro після закінчення пробного терміну (за явної згоди користувача). " +
      "Відстежує конверсію «Пас → Pro» протягом 30 днів як ключовий KPI воронки.",
    prohibitedUses_en:
      "One trial per email address. Creating multiple accounts to obtain additional trials is a violation of the Terms of Service " +
      "and will result in permanent account suspension.",
    prohibitedUses_uk:
      "Один пробний пас на адресу електронної пошти. Створення кількох облікових записів для отримання додаткових пробних пасів " +
      "є порушенням Умов надання послуг і призведе до постійного блокування облікового запису.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * Anti-abuse policy: no subscription substitute via passes.
 *
 * Антизловживальна політика: паси не є замінником підписки.
 */
export const PASS_ABUSE_NOTE_EN =
  "Passes are intended for occasional, event-driven, or one-time access needs. " +
  "Purchasing multiple day-passes or event-passes consecutively as a subscription substitute is prohibited. " +
  "Fraud detection monitors purchase patterns; accounts exhibiting abuse are flagged for manual review, " +
  "warned, and may be restricted from purchasing further passes or required to subscribe.";

export const PASS_ABUSE_NOTE_UK =
  "Паси призначені для випадкових, подієвих або одноразових потреб доступу. " +
  "Придбання кількох денних або подієвих пасів послідовно як замінника підписки заборонено. " +
  "Система виявлення шахрайства відстежує схеми покупок; облікові записи, що демонструють зловживання, " +
  "позначаються для ручного розгляду, отримують попередження і можуть бути обмежені у покупці пасів або зобов'язані оформити підписку.";

/**
 * No auto-renewal policy for passes.
 *
 * Паси не поновлюються автоматично.
 */
export const PASS_AUTO_RENEW_NOTE_EN =
  "Passes do NOT auto-renew. When a pass expires, the account reverts to the Free tier. " +
  "Users receive an in-app notification 2 hours before expiry and are shown a 'buy again' link. " +
  "A 50%-off Pro subscription offer is shown for 30 days after pass expiry to encourage conversion.";

export const PASS_AUTO_RENEW_NOTE_UK =
  "Паси НЕ поновлюються автоматично. Після закінчення терміну паса обліковий запис повертається до рівня Free. " +
  "Користувачі отримують сповіщення в додатку за 2 години до закінчення і бачать посилання «придбати знову». " +
  "Протягом 30 днів після закінчення паса відображається пропозиція підписки Pro зі знижкою 50% для стимулювання конверсії.";

/**
 * Crisis Pass free-access trigger policy.
 *
 * Політика безкоштовного кризового пасу.
 */
export const CRISIS_PASS_TRIGGER_NOTE_EN =
  "During officially declared humanitarian crises (as determined by the Aegis Lens crisis committee), " +
  "Crisis Passes may be offered at $0 for verified humanitarian workers, journalists, and affected-region users. " +
  "Eligibility is assessed via: geo-IP verification, institutional affiliation check, and light identity verification. " +
  "Free crisis pass availability is announced on the Aegis Lens status page and via partner organizations. " +
  "Abuse of the free crisis pass program is monitored; misuse results in pass revocation and account review.";

export const CRISIS_PASS_TRIGGER_NOTE_UK =
  "Під час офіційно оголошених гуманітарних криз (за рішенням кризового комітету Aegis Lens) " +
  "кризові паси можуть пропонуватися безкоштовно для верифікованих гуманітарних працівників, журналістів та мешканців постраждалих регіонів. " +
  "Право на участь оцінюється за допомогою: верифікації геолокації IP, перевірки інституційної приналежності та легкої верифікації особи. " +
  "Наявність безкоштовних кризових пасів повідомляється на сторінці статусу Aegis Lens та через партнерські організації. " +
  "Зловживання програмою безкоштовних кризових пасів відстежується; неналежне використання призводить до відкликання паса та перевірки облікового запису.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable value description for a given pass type.
 *
 * Повертає опис цінності для заданого типу пасу.
 */
export function computePassValue(type: PassType): string {
  const pass = DAY_PASSES.find((p) => p.type === type);
  if (!pass) return "Unknown pass type";
  const priceLabel = pass.priceUsd === 0 ? "Free" : `$${pass.priceUsd}`;
  const days = pass.durationHours / 24;
  const dayLabel = days === 1 ? "1 day" : `${days} days`;
  return `${pass.name_en}: ${dayLabel} of ${pass.featureSet} access at ${priceLabel}`;
}

/**
 * Look up a pass by type.
 *
 * Повертає пас за типом.
 */
export function getDayPass(type: PassType): DayPass | undefined {
  return DAY_PASSES.find((p) => p.type === type);
}
