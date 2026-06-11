/**
 * Embargo & Early-Access Tier — Aegis Lens / Ukrainian MAP
 *
 * Defines embargo window configurations and early-access programmes that give
 * paying subscribers a time-limited preview of verified intelligence events,
 * analytic deltas, and narrative-cluster detections before public release.
 *
 * Конфігурації вікон ембарго та програми раннього доступу для підписників,
 * які отримують часово обмежений попередній перегляд верифікованих подій до
 * публічного оприлюднення.
 *
 * SAFETY RULE: Safety-critical information (sirens, evacuations, casualty risks)
 * is NEVER embargoed — it must be free and instantaneous for all tiers.
 *
 * ПРАВИЛО БЕЗПЕКИ: Критично важлива для безпеки інформація (сирени, евакуації,
 * ризики жертв) НІКОЛИ не підлягає ембарго — вона завжди безкоштовна і миттєва.
 */

'use server';

// ── Types ──────────────────────────────────────────────────────────────────────

/**
 * Supported embargo window durations.
 * Підтримувані тривалості вікон ембарго.
 */
export type EmbargoWindow = "1h" | "3h" | "12h" | "24h" | "48h" | "72h";

/**
 * Early-access tier identifiers.
 * Ідентифікатори рівнів раннього доступу.
 */
export type EarlyAccessTier =
  | "beta-tester"
  | "founding-member"
  | "media-pro"
  | "government-priority"
  | "enterprise-preview";

/**
 * Configuration for a single embargo window package.
 * Конфігурація окремого пакету вікна ембарго.
 */
export interface EmbargoConfig {
  /** Unique embargo configuration identifier. */
  id: string;
  /** Package name (English). */
  name_en: string;
  /** Package name (Ukrainian). */
  name_uk: string;
  /** How far ahead of public release this window grants access. */
  windowDuration: EmbargoWindow;
  /** Target subscriber segments eligible for this embargo window (English). */
  targetSegments_en: string;
  /** Target subscriber segments eligible for this embargo window (Ukrainian). */
  targetSegments_uk: string;
  /** Pricing note for this embargo window (English). */
  pricingNote_en: string;
  /** Pricing note for this embargo window (Ukrainian). */
  pricingNote_uk: string;
  /** Additional notes on delivery, scope, or restrictions (English). */
  notes_en: string;
  /** Additional notes on delivery, scope, or restrictions (Ukrainian). */
  notes_uk: string;
}

/**
 * An early-access programme offered to beta or founding subscribers.
 * Програма раннього доступу для бета- або засновницьких підписників.
 */
export interface EarlyAccessProgram {
  /** Unique programme identifier. */
  id: string;
  /** Programme name (English). */
  name_en: string;
  /** Programme name (Ukrainian). */
  name_uk: string;
  /** Maximum number of slots available. -1 means unlimited. */
  maxSlots: number;
  /** Benefits description (English). */
  benefits_en: string;
  /** Benefits description (Ukrainian). */
  benefits_uk: string;
  /** Pricing description (English). */
  price_en: string;
  /** Pricing description (Ukrainian). */
  price_uk: string;
  /** Additional notes on obligations or conditions (English). */
  notes_en: string;
  /** Additional notes on obligations or conditions (Ukrainian). */
  notes_uk: string;
}

// ── Embargo window configurations ──────────────────────────────────────────────

/**
 * Registered embargo window packages.
 * Зареєстровані пакети вікон ембарго.
 */
export const EMBARGO_CONFIGS: EmbargoConfig[] = [
  {
    id: "embargo-1h",
    name_en: "1-Hour Priority Embargo",
    name_uk: "Пріоритетне ембарго на 1 годину",
    windowDuration: "1h",
    targetSegments_en: "media-pro, government-priority",
    targetSegments_uk: "медіа-про, урядовий пріоритет",
    pricingNote_en:
      "Available exclusively for Media Pro and Government Priority tier subscribers. " +
      "Included in Media Pro ($499/mo) and Government Priority annual contracts.",
    pricingNote_uk:
      "Доступно виключно для підписників рівня Media Pro та Government Priority. " +
      "Включено в Media Pro ($499/міс) і річні контракти Government Priority.",
    notes_en:
      "Verified events, analytic deltas, and narrative-cluster detections are delivered " +
      "1 hour before public release via API push and dashboard. " +
      "Applies to all non-safety-critical event types. Safety-critical events (sirens, " +
      "evacuations, casualty risks) are never embargoed and remain free for all tiers. " +
      "Leakage monitoring is active; misuse results in immediate tier suspension.",
    notes_uk:
      "Верифіковані події, аналітичні дельти та детекції кластерів наративів доставляються " +
      "за 1 годину до публічного оприлюднення через API push і дашборд. " +
      "Поширюється на всі типи подій, не критичні для безпеки. Критично важлива для безпеки " +
      "інформація (сирени, евакуації, ризики жертв) ніколи не підлягає ембарго і залишається " +
      "безкоштовною для всіх рівнів. Активний моніторинг витоків; зловживання призводить до " +
      "негайного призупинення рівня.",
  },
  {
    id: "embargo-3h",
    name_en: "3-Hour Enterprise Embargo",
    name_uk: "Корпоративне ембарго на 3 години",
    windowDuration: "3h",
    targetSegments_en: "enterprise-preview",
    targetSegments_uk: "корпоративний попередній перегляд",
    pricingNote_en:
      "Included in Enterprise Preview tier and annual Enterprise contracts. " +
      "Available as an add-on for Business tier at $299/mo.",
    pricingNote_uk:
      "Включено в рівень Enterprise Preview та річні корпоративні контракти. " +
      "Доступно як надбудова для рівня Business за $299/міс.",
    notes_en:
      "Delivers verified intelligence events 3 hours ahead of public release. " +
      "Designed for enterprise teams that need a reliable planning window for analyst briefings " +
      "or client communications. Includes analyst-edited event summaries where available. " +
      "Audit log of all embargo deliveries is maintained and available to compliance teams.",
    notes_uk:
      "Доставляє верифіковані розвідувальні події за 3 години до публічного оприлюднення. " +
      "Призначено для корпоративних команд, яким потрібне надійне вікно планування для " +
      "аналітичних брифінгів або комунікацій з клієнтами. Включає редаговані аналітиком " +
      "підсумки подій там, де це доступно. Журнал аудиту всіх доставок ембарго зберігається " +
      "та доступний командам з комплаєнсу.",
  },
  {
    id: "embargo-12h",
    name_en: "12-Hour Founding Member Embargo",
    name_uk: "Ембарго засновницьких членів на 12 годин",
    windowDuration: "12h",
    targetSegments_en: "founding-member, enterprise",
    targetSegments_uk: "засновницький член, корпоративний",
    pricingNote_en:
      "Exclusively available to Founding Member programme participants and Enterprise contract holders. " +
      "Grants access to flagship reports and daily analytical briefs 12 hours before public release.",
    pricingNote_uk:
      "Виключно для учасників програми Founding Member та власників корпоративних контрактів. " +
      "Надає доступ до флагманських звітів і щоденних аналітичних брифів за 12 годин до публікації.",
    notes_en:
      "Applies to: analyst-edited daily brief, weekly intelligence digest, and flagship thematic reports. " +
      "Does not apply to real-time event feeds (use 1h or 3h embargo for that). " +
      "Content citing embargoed data must disclose the embargo window in any published derivative work.",
    notes_uk:
      "Поширюється на: редаговані аналітиком щоденні брифи, щотижневі розвідувальні дайджести " +
      "та флагманські тематичні звіти. Не застосовується до стрічок подій у реальному часі " +
      "(для цього використовуйте ембарго на 1 або 3 години). " +
      "Контент, що посилається на дані під ембарго, повинен розкривати вікно ембарго " +
      "у будь-якій опублікованій похідній роботі.",
  },
  {
    id: "embargo-24h",
    name_en: "24-Hour Pro Add-On Embargo",
    name_uk: "Ембарго-надбудова Pro на 24 години",
    windowDuration: "24h",
    targetSegments_en: "Pro tier subscribers with embargo add-on",
    targetSegments_uk: "підписники рівня Pro з надбудовою ембарго",
    pricingNote_en:
      "Available as a paid add-on for Pro tier subscribers at $99/mo. " +
      "Applies to the weekly intelligence digest and flagship reports only.",
    pricingNote_uk:
      "Доступно як платна надбудова для підписників рівня Pro за $99/міс. " +
      "Застосовується лише до щотижневого розвідувального дайджесту та флагманських звітів.",
    notes_en:
      "Pro subscribers with this add-on receive the weekly intelligence digest and " +
      "flagship thematic reports 24 hours before public release. " +
      "This is a report-only embargo — real-time event feeds are not included. " +
      "The embargo window acts as a freshness modifier on top of the subscriber's base tier access; " +
      "it is not a separate tier and does not override min_tier content gates.",
    notes_uk:
      "Підписники Pro з цією надбудовою отримують щотижневий розвідувальний дайджест і " +
      "флагманські тематичні звіти за 24 години до публічного оприлюднення. " +
      "Це ембарго лише для звітів — стрічки подій у реальному часі не включені. " +
      "Вікно ембарго діє як модифікатор свіжості поверх базового доступу підписника; " +
      "це не окремий рівень і не скасовує контентні gates min_tier.",
  },
];

// ── Early-access programmes ────────────────────────────────────────────────────

/**
 * Registered early-access programmes.
 * Зареєстровані програми раннього доступу.
 */
export const EARLY_ACCESS_PROGRAMS: EarlyAccessProgram[] = [
  {
    id: "beta-tester",
    name_en: "Beta Tester Programme",
    name_uk: "Програма бета-тестерів",
    maxSlots: 200,
    benefits_en:
      "Free access to all Pro features during the beta period; early preview of new platform features " +
      "before general availability; direct access to the product team via a dedicated Slack channel; " +
      "beta badge displayed on profile.",
    benefits_uk:
      "Безкоштовний доступ до всіх функцій Pro протягом бета-періоду; ранній попередній перегляд нових " +
      "функцій платформи до загальної доступності; прямий доступ до продуктової команди через виділений " +
      "канал Slack; відображення значка бета на профілі.",
    price_en: "Free. No payment required during the beta period.",
    price_uk: "Безкоштовно. Оплата не потрібна протягом бета-періоду.",
    notes_en:
      "Beta testers agree to provide structured feedback via monthly feedback sessions and bug reports. " +
      "Minimum commitment: one feedback submission per month. Beta access may be revoked for inactivity. " +
      "Beta testers do not receive embargo access unless separately enrolled in an embargo package.",
    notes_uk:
      "Бета-тестери погоджуються надавати структурований зворотний зв'язок через щомісячні сесії " +
      "та звіти про помилки. Мінімальне зобов'язання: одне подання зворотного зв'язку на місяць. " +
      "Бета-доступ може бути відкликано за неактивність. Бета-тестери не отримують доступ до ембарго, " +
      "якщо вони окремо не зараховані до пакету ембарго.",
  },
  {
    id: "founding-member",
    name_en: "Founding Member Programme",
    name_uk: "Програма засновницьких членів",
    maxSlots: 50,
    benefits_en:
      "40% lifetime discount on any Aegis Lens paid plan (applies for as long as the subscription remains active); " +
      "12-hour embargo access on reports and daily briefs; " +
      "founding member badge and permanent attribution in the platform; " +
      "priority feature requests; quarterly call with the CEO; " +
      "one free seat upgrade per year.",
    benefits_uk:
      "40% довічна знижка на будь-який платний план Aegis Lens (діє до скасування підписки); " +
      "12-годинний доступ ембарго до звітів і щоденних брифів; " +
      "значок засновницького члена та постійна атрибуція на платформі; " +
      "пріоритетні запити на функції; квартальний дзвінок з CEO; " +
      "одне безкоштовне підвищення рівня місця на рік.",
    price_en:
      "One-time founding fee of $299 USD. Afterwards the 40% lifetime discount applies to the subscriber's " +
      "chosen monthly or annual plan. Non-refundable.",
    price_uk:
      "Одноразовий вступний внесок $299 USD. Далі 40% довічна знижка застосовується до обраного " +
      "місячного або річного плану підписника. Без повернення коштів.",
    notes_en:
      "Limited to 50 founding members. Slots are allocated on a first-come, first-served basis. " +
      "The founding member status and discount are tied to the original account and are non-transferable. " +
      "Aegis Lens reserves the right to close the programme once all 50 slots are filled.",
    notes_uk:
      "Обмежено 50 засновницькими членами. Місця розподіляються за принципом 'першим прийшов — першим " +
      "обслугований'. Статус засновницького члена та знижка прив'язані до оригінального облікового запису " +
      "і не підлягають передачі. Aegis Lens залишає за собою право закрити програму після заповнення " +
      "всіх 50 місць.",
  },
  {
    id: "enterprise-preview",
    name_en: "Enterprise Preview Programme",
    name_uk: "Програма корпоративного попереднього перегляду",
    maxSlots: 10,
    benefits_en:
      "90-day free trial of the full Enterprise tier (all features, all add-ons, dedicated support); " +
      "3-hour embargo access on all event feeds and reports during the trial; " +
      "dedicated customer success manager; " +
      "co-designed onboarding and integration support; " +
      "preferred pricing on conversion to a paid annual contract.",
    benefits_uk:
      "90-денна безкоштовна пробна версія повного корпоративного рівня (всі функції, всі надбудови, " +
      "виділена підтримка); 3-годинний доступ ембарго до всіх стрічок подій і звітів під час пробного " +
      "періоду; виділений менеджер успіху клієнтів; спільно розроблений онбординг та підтримка " +
      "інтеграції; пільгові ціни при конвертації в платний річний контракт.",
    price_en:
      "Free for 90 days. Requires a signed reference customer agreement: the organisation agrees to " +
      "provide a case study or public reference upon conversion to a paid plan.",
    price_uk:
      "Безкоштовно протягом 90 днів. Вимагає підписаної угоди з еталонним клієнтом: організація " +
      "погоджується надати тематичне дослідження або публічний відгук при конвертації в платний план.",
    notes_en:
      "Limited to 10 enterprise organisations. Target segments: Lloyd's syndicates, defence primes, " +
      "sovereign wealth funds, major newsrooms, and government intelligence agencies. " +
      "Applications are reviewed by the partnerships team; acceptance is at Aegis Lens's discretion. " +
      "The 90-day trial does not auto-convert to a paid plan — a separate contract must be signed.",
    notes_uk:
      "Обмежено 10 корпоративними організаціями. Цільові сегменти: синдикати Lloyd's, оборонні прайми, " +
      "суверенні фонди добробуту, великі редакції та урядові розвідувальні агенції. " +
      "Заявки розглядаються командою з партнерства; прийняття — на розсуд Aegis Lens. " +
      "90-денна пробна версія не конвертується автоматично в платний план — " +
      "необхідно підписати окремий контракт.",
  },
];

// ── Policy notes ───────────────────────────────────────────────────────────────

/**
 * Ethical use note for embargo windows (English).
 * Примітка щодо етичного використання вікон ембарго (англійська).
 */
export const EMBARGO_ETHICAL_NOTE_EN =
  "Embargo windows on Aegis Lens are a freshness pricing tool — they must never be used " +
  "for market manipulation, front-running of financial instruments, or any form of insider trading. " +
  "Prohibited uses include: using embargoed conflict intelligence to trade commodities, equities, or " +
  "derivatives ahead of public information; sharing embargoed content with unsubscribed parties; " +
  "using embargo access to coordinate disinformation campaigns; " +
  "and any use that could harm civilian safety by withholding critical information. " +
  "Safety-critical information — including air raid sirens, evacuation orders, and casualty risks — " +
  "is NEVER embargoed and is always distributed free and instantly to all tiers.";

/**
 * Ethical use note for embargo windows (Ukrainian).
 * Примітка щодо етичного використання вікон ембарго (українська).
 */
export const EMBARGO_ETHICAL_NOTE_UK =
  "Вікна ембарго в Aegis Lens є інструментом ціноутворення свіжості — вони ніколи не повинні " +
  "використовуватися для маніпулювання ринком, випередження фінансових інструментів або " +
  "будь-якої форми інсайдерської торгівлі. " +
  "Заборонені використання: застосування розвідувальних даних конфлікту під ембарго для торгівлі " +
  "сировиною, акціями або деривативами до публічної інформації; розповсюдження контенту під ембарго " +
  "непідписаним сторонам; використання доступу до ембарго для координації дезінформаційних кампаній; " +
  "будь-яке використання, що може завдати шкоди цивільній безпеці шляхом приховування критичної " +
  "інформації. Критично важлива для безпеки інформація — включаючи сигнали повітряної тривоги, " +
  "накази про евакуацію та ризики жертв — НІКОЛИ не підлягає ембарго і завжди розповсюджується " +
  "безкоштовно та миттєво для всіх рівнів.";

/**
 * Disclosure policy for content citing embargoed data (English).
 * Правило розкриття для контенту, що посилається на дані під ембарго (англійська).
 */
export const EMBARGO_DISCLOSURE_NOTE_EN =
  "Any published content — articles, reports, broadcasts, social media posts, or research papers — " +
  "that cites or is derived from data received under an Aegis Lens embargo window must clearly disclose " +
  "the embargo window in the published work. " +
  "Required disclosure format: 'Based on intelligence received under Aegis Lens [N]-hour embargo. " +
  "Data was publicly released at [timestamp].' " +
  "Failure to disclose constitutes a material breach of the embargo terms and may result in " +
  "suspension of embargo access and legal action. " +
  "The embargo disclosure policy is published on the Aegis Lens Trust Center.";

/**
 * Disclosure policy for content citing embargoed data (Ukrainian).
 * Правило розкриття для контенту, що посилається на дані під ембарго (українська).
 */
export const EMBARGO_DISCLOSURE_NOTE_UK =
  "Будь-який опублікований контент — статті, звіти, трансляції, публікації в соціальних мережах або " +
  "наукові роботи — що цитує або походить від даних, отриманих у межах вікна ембарго Aegis Lens, " +
  "повинен чітко розкривати вікно ембарго в опублікованій роботі. " +
  "Необхідний формат розкриття: 'На основі розвідувальних даних, отриманих у межах [N]-годинного " +
  "ембарго Aegis Lens. Дані були публічно оприлюднені о [мітка часу].' " +
  "Ненадання розкриття є суттєвим порушенням умов ембарго і може призвести до " +
  "призупинення доступу до ембарго та правових дій. " +
  "Правило розкриття ембарго опубліковано в Центрі довіри Aegis Lens.";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Determine whether an embargo period is still active for a given event.
 *
 * Returns true if the current time is within the embargo window
 * (i.e. the event was published less than windowMs ago).
 *
 * Визначає, чи ще активний період ембарго для певної події.
 * Повертає true, якщо поточний час знаходиться у вікні ембарго.
 *
 * @param publishedAt - Unix timestamp (ms) of the embargoed publication moment.
 * @param windowMs    - Duration of the embargo window in milliseconds.
 */
export function isEmbargoPeriodActive(
  publishedAt: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  return now < publishedAt + windowMs;
}

/**
 * Retrieve an early-access programme by its ID.
 *
 * Returns undefined if the programme ID is not found.
 *
 * Отримує програму раннього доступу за ідентифікатором.
 * Повертає undefined, якщо ID програми не знайдено.
 */
export function getEarlyAccessProgram(
  id: string,
): EarlyAccessProgram | undefined {
  return EARLY_ACCESS_PROGRAMS.find((p) => p.id === id);
}
