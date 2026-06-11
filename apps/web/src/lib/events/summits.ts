/**
 * Events & Summits — canonical registry of Aegis Lens event products.
 * Covers paid and free in-person, virtual, and hybrid events: annual intelligence
 * summits, regional workshops, online conferences, masterclasses, and hackathons.
 *
 * Реєстр заходів та самітів Aegis Lens: платні й безкоштовні очні, віртуальні
 * та гібридні формати — щорічні саміти, регіональні воркшопи, онлайн-конференції,
 * майстеркласи та хакатони.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Category of event product.
 * Категорія продукту-заходу.
 */
export type EventType =
  | "annual-summit"
  | "regional-workshop"
  | "online-conference"
  | "masterclass"
  | "hackathon"
  | "partner-briefing";

/**
 * Delivery format for an event.
 * Формат проведення заходу.
 */
export type EventFormat = "in-person" | "virtual" | "hybrid";

/**
 * Access tier required to attend the event.
 * Рівень доступу для участі у заході.
 */
export type EventTierAccess =
  | "public"
  | "subscribers-only"
  | "enterprise-only"
  | "invite-only";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * An Aegis Lens event or summit product.
 * Продукт-захід або саміт Aegis Lens.
 */
export interface EventProduct {
  /** Unique event product identifier. / Унікальний ідентифікатор продукту-заходу. */
  id: string;
  /** Event category. / Категорія заходу. */
  type: EventType;
  /** Delivery format. / Формат проведення. */
  format: EventFormat;
  /** Event name in English. / Назва заходу англійською. */
  name_en: string;
  /** Event name in Ukrainian. / Назва заходу українською. */
  name_uk: string;
  /** Access tier required. / Необхідний рівень доступу. */
  access: EventTierAccess;
  /**
   * Standard ticket price in USD. 0 = free admission.
   * Стандартна ціна квитка в USD. 0 = безкоштовний вхід.
   */
  ticketPriceUsd: number;
  /** Whether sponsorship packages are available for this event. / Чи доступні спонсорські пакети для цього заходу. */
  sponsorshipAvailable: boolean;
  /** Key features of the event (English). / Ключові особливості заходу (англійською). */
  features_en: string;
  /** Key features of the event (Ukrainian). / Ключові особливості заходу (українською). */
  features_uk: string;
  /** Additional notes (English). / Додаткові примітки (англійською). */
  notes_en: string;
  /** Additional notes (Ukrainian). / Додаткові примітки (українською). */
  notes_uk: string;
}

// ── Canonical registry ─────────────────────────────────────────────────────────

export const EVENT_PRODUCTS: EventProduct[] = [
  {
    id: "aegis-intelligence-summit",
    type: "annual-summit",
    format: "hybrid",
    name_en: "Aegis Intelligence Summit",
    name_uk: "Саміт Aegis Intelligence",
    access: "public",
    ticketPriceUsd: 299,
    sponsorshipAvailable: true,
    features_en:
      "Annual flagship in-person + livestream event. General admission from $299; VIP track (invite-only, limited seats) from $1,999. Keynotes, analyst panels, live demonstrations, vendor expo, and networking. VIP track includes private briefings, roundtables with senior analysts, and priority access to new product announcements. 20% of net proceeds donated to verified Ukrainian humanitarian funds.",
    features_uk:
      "Щорічний флагманський захід: очний + трансляція. Загальний доступ від $299; VIP-трек (тільки за запрошенням, обмежена кількість місць) від $1 999. Основні виступи, аналітичні панелі, живі демонстрації, виставка постачальників і нетворкінг. VIP-трек включає приватні брифінги, круглі столи зі старшими аналітиками та пріоритетний доступ до анонсів нових продуктів. 20% чистого прибутку саміту передається верифікованим українським гуманітарним фондам.",
    notes_en:
      "Held annually; dates announced six months in advance. CFP (Call for Papers) open to the intelligence and OSINT community. Editorial board selects speakers independently of sponsors.",
    notes_uk:
      "Проводиться щорічно; дати оголошуються за шість місяців. Запит пропозицій (CFP) відкритий для спільноти розвідки та OSINT. Редакційна рада обирає спікерів незалежно від спонсорів.",
  },
  {
    id: "regional-osint-workshop",
    type: "regional-workshop",
    format: "in-person",
    name_en: "Regional OSINT & Verification Workshop",
    name_uk: "Регіональний воркшоп з OSINT та верифікації",
    access: "subscribers-only",
    ticketPriceUsd: 99,
    sponsorshipAvailable: false,
    features_en:
      "Half-day city-level workshop focused on open-source intelligence and media verification techniques. Ticket price $99–299 depending on city and venue. Led by Aegis Lens analysts. Practical exercises on conflict reporting, imagery verification, and source authentication. Available to Pro, Pro+, Team, Business, and Enterprise subscribers.",
    features_uk:
      "Піввденний міський воркшоп з відкритої розвідки та верифікації медіа. Ціна квитка $99–299 залежно від міста та майданчика. Ведуть аналітики Aegis Lens. Практичні вправи з репортажу в зонах конфлікту, верифікації зображень та автентифікації джерел. Доступно для підписників Pro, Pro+, Team, Business та Enterprise.",
    notes_en:
      "No external sponsorship for regional workshops to preserve editorial independence. Workshop materials provided digitally; recordings shared with attending subscribers within 7 days.",
    notes_uk:
      "Відсутнє зовнішнє спонсорство регіональних воркшопів для збереження редакційної незалежності. Матеріали воркшопу надаються в цифровому форматі; записи надсилаються підписникам-учасникам протягом 7 днів.",
  },
  {
    id: "quarterly-intelligence-briefing",
    type: "online-conference",
    format: "virtual",
    name_en: "Quarterly Intelligence Briefing",
    name_uk: "Щоквартальний розвідувальний брифінг",
    access: "public",
    ticketPriceUsd: 29,
    sponsorshipAvailable: true,
    features_en:
      "Quarterly virtual conference covering the latest intelligence trends, conflict updates, and platform feature announcements. Free for Pro+ subscribers (included in plan). Paid ticket ($29) for free-tier users and the public. Includes live Q&A with analysts, sponsored deep-dive sessions clearly labelled, and post-event digest. Sponsorship available for named session tracks (subject to editorial firewall).",
    features_uk:
      "Щоквартальна віртуальна конференція з останніх тенденцій розвідки, оновлень щодо конфліктів та анонсів функцій платформи. Безкоштовно для підписників Pro+ (включено до плану). Платний квиток ($29) для користувачів безкоштовного рівня та громадськості. Включає живе Q&A з аналітиками, чітко позначені спонсорські сесії поглибленого розбору та дайджест після заходу. Доступне спонсорство іменованих треків сесій (за умови дотримання редакційного бар'єру).",
    notes_en:
      "Recordings available to Pro+ subscribers within 48 hours. Public release after 90 days. Sponsored sessions are clearly labelled and sponsors cannot influence the editorial agenda.",
    notes_uk:
      "Записи доступні підписникам Pro+ протягом 48 годин. Публічна публікація — через 90 днів. Спонсорські сесії чітко позначені; спонсори не можуть впливати на редакційний порядок денний.",
  },
  {
    id: "osint-masterclass",
    type: "masterclass",
    format: "virtual",
    name_en: "OSINT Deep-Dive Masterclass",
    name_uk: "Поглиблений майстерклас з OSINT",
    access: "subscribers-only",
    ticketPriceUsd: 199,
    sponsorshipAvailable: false,
    features_en:
      "8-hour intensive virtual masterclass on a specific OSINT or intelligence topic. Topics rotate quarterly: satellite imagery analysis, network investigation, financial flow tracking, narrative analysis. Led by senior Aegis Lens analysts or vetted external experts. Hands-on labs using the Aegis Lens platform. Certificate of completion issued. Available to active subscribers only.",
    features_uk:
      "8-годинний інтенсивний віртуальний майстерклас з конкретної теми OSINT або розвідки. Теми змінюються щоквартально: аналіз супутникових знімків, мережеві розслідування, відстеження фінансових потоків, аналіз наративів. Ведуть старші аналітики Aegis Lens або перевірені зовнішні експерти. Практичні лабораторні роботи на платформі Aegis Lens. Видається сертифікат про завершення. Доступно лише для активних підписників.",
    notes_en:
      "No external sponsorship to preserve content integrity. Recordings shared with registered participants within 48 hours. Masterclass content may be repurposed as Academy modules after a 180-day embargo.",
    notes_uk:
      "Відсутнє зовнішнє спонсорство для збереження цілісності контенту. Записи надсилаються зареєстрованим учасникам протягом 48 годин. Контент майстеркласу може бути використаний як модулі Академії після 180-денного ембарго.",
  },
  {
    id: "osint-hackathon",
    type: "hackathon",
    format: "hybrid",
    name_en: "OSINT Hackathon",
    name_uk: "OSINT-хакатон",
    access: "public",
    ticketPriceUsd: 0,
    sponsorshipAvailable: true,
    features_en:
      "Free entry open-intelligence hackathon: 48-hour challenge to build tools, datasets, or investigations using open-source data and the Aegis Lens API. Virtual + optional in-person hub cities. Prizes: certification, platform credits, and recognition on the Aegis Lens contributors board. Sponsorship available for prize categories and infrastructure. Winning tools may be open-sourced or integrated into the platform.",
    features_uk:
      "Безкоштовний хакатон відкритої розвідки: 48-годинний челендж зі створення інструментів, наборів даних або розслідувань з використанням відкритих даних та API Aegis Lens. Віртуальний + опціональні очні міста-хаби. Призи: сертифікація, кредити платформи та визнання на дошці учасників Aegis Lens. Доступне спонсорство призових категорій та інфраструктури. Переможні інструменти можуть бути опубліковані як open-source або інтегровані в платформу.",
    notes_en:
      "Registration open to all. Teams of 1–5 participants. Judging panel independent of sponsors. Sponsored prize categories clearly labelled. Past hackathons have produced verified open-source tools adopted by the OSINT community.",
    notes_uk:
      "Реєстрація відкрита для всіх. Команди від 1 до 5 учасників. Журі незалежне від спонсорів. Спонсорські призові категорії чітко позначені. Попередні хакатони дали верифіковані open-source інструменти, прийняті OSINT-спільнотою.",
  },
  {
    id: "partner-briefing",
    type: "partner-briefing",
    format: "virtual",
    name_en: "Partner & Enterprise Quarterly Briefing",
    name_uk: "Щоквартальний брифінг для партнерів та Enterprise",
    access: "enterprise-only",
    ticketPriceUsd: 0,
    sponsorshipAvailable: false,
    features_en:
      "Closed quarterly briefing for Enterprise and Gov-Defense customers and strategic partners. Covers product roadmap previews, classified threat intelligence summaries, and direct Q&A with Aegis Lens leadership. Invite-only registration via account manager. No recordings distributed externally.",
    features_uk:
      "Закритий щоквартальний брифінг для клієнтів Enterprise та Gov-Defense і стратегічних партнерів. Охоплює попередній перегляд дорожньої карти продукту, резюме секретного аналізу загроз та пряме Q&A з керівництвом Aegis Lens. Реєстрація тільки за запрошенням через менеджера акаунту. Записи зовнішньо не поширюються.",
    notes_en:
      "Held under modified Chatham House Rule. Content may be shared within the attendee organisation but not publicly attributed. Attendance confirms acceptance of the NDA terms agreed at contract signing.",
    notes_uk:
      "Проводиться за модифікованим правилом Чатем-Хаус. Контент може бути поширений всередині організації-учасника, але без публічного посилання на джерело. Участь підтверджує прийняття умов NDA, узгодженого під час підписання контракту.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * Editorial firewall: sponsors cannot influence event content or speaker selection.
 * Редакційний бар'єр: спонсори не можуть впливати на контент заходу або вибір спікерів.
 */
export const EVENT_SPONSORSHIP_NOTE_EN =
  "Aegis Lens maintains a strict editorial firewall between sponsorship and content. Sponsors may not influence the editorial agenda, speaker selection, session content, or any editorial decisions for any Aegis Lens event. Sponsored sessions are clearly labelled. Violation of this policy results in immediate disqualification and refund of sponsorship fees.";

export const EVENT_SPONSORSHIP_NOTE_UK =
  "Aegis Lens дотримується суворого редакційного бар'єру між спонсорством і контентом. Спонсори не мають права впливати на редакційний порядок денний, вибір спікерів, зміст сесій або будь-які редакційні рішення щодо будь-якого заходу Aegis Lens. Спонсорські сесії чітко позначені. Порушення цієї політики призводить до негайної дискваліфікації та повернення спонсорських коштів.";

/**
 * Event recordings are available to Pro+ subscribers within 48h and publicly
 * released after 90 days.
 *
 * Записи заходів доступні підписникам Pro+ протягом 48 годин та публікуються
 * для широкого загалу через 90 днів.
 */
export const EVENT_RECORDING_NOTE_EN =
  "Recordings of public and subscriber-only Aegis Lens events are made available to Pro+ plan subscribers within 48 hours of the event's conclusion. Full public release occurs 90 days after the event date. Invite-only and enterprise briefings are not recorded for external distribution.";

export const EVENT_RECORDING_NOTE_UK =
  "Записи публічних заходів і заходів лише для підписників Aegis Lens стають доступні підписникам плану Pro+ протягом 48 годин після завершення заходу. Повне публічне розміщення відбувається через 90 днів після дати заходу. Закриті та корпоративні брифінги не записуються для зовнішнього поширення.";

/**
 * 20% of summit net proceeds go to verified Ukrainian humanitarian funds.
 * 20% чистого прибутку саміту передається верифікованим українським гуманітарним фондам.
 */
export const EVENT_PROCEEDS_NOTE_EN =
  "20% of the net proceeds from the Aegis Intelligence Summit are donated annually to verified Ukrainian humanitarian funds. Recipient organisations are publicly disclosed in the post-summit transparency report. Aegis Lens does not take a management fee on these donations.";

export const EVENT_PROCEEDS_NOTE_UK =
  "20% чистого прибутку Aegis Intelligence Summit щорічно передається верифікованим українським гуманітарним фондам. Організації-отримувачі публічно розкриваються у звіті про прозорість після саміту. Aegis Lens не утримує комісію за управління з цих пожертв.";

/**
 * Forbidden sponsor categories: surveillance vendors, sanctioned entities, and
 * state propaganda outlets.
 *
 * Заборонені категорії спонсорів: постачальники стеження, підсанкційні суб'єкти
 * та державні пропагандистські ЗМІ.
 */
export const EVENT_FORBIDDEN_SPONSORS_EN =
  "The following categories of entities are prohibited from sponsoring any Aegis Lens event: (a) surveillance technology vendors whose products are primarily used for civilian monitoring, censorship, or authoritarian control; (b) entities subject to US, EU, or UN sanctions; (c) state-controlled media or propaganda outlets; (d) entities with documented ties to information warfare operations targeting Ukraine or allied democracies.";

export const EVENT_FORBIDDEN_SPONSORS_UK =
  "Наступні категорії суб'єктів позбавлені права спонсорувати будь-який захід Aegis Lens: (а) постачальники технологій стеження, продукція яких переважно використовується для моніторингу цивільного населення, цензури або авторитарного контролю; (б) суб'єкти, що підпадають під санкції США, ЄС або ООН; (в) державні ЗМІ або пропагандистські видання; (г) суб'єкти з задокументованими зв'язками з операціями інформаційної війни, спрямованими проти України або союзних демократій.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Filter event products by required access tier.
 * Фільтрація продуктів-заходів за необхідним рівнем доступу.
 */
export function getEventsByAccess(access: EventTierAccess): EventProduct[] {
  return EVENT_PRODUCTS.filter((e) => e.access === access);
}

/**
 * Filter event products by type.
 * Фільтрація продуктів-заходів за типом.
 */
export function getEventsByType(type: EventType): EventProduct[] {
  return EVENT_PRODUCTS.filter((e) => e.type === type);
}

/**
 * Filter event products by format.
 * Фільтрація продуктів-заходів за форматом.
 */
export function getEventsByFormat(format: EventFormat): EventProduct[] {
  return EVENT_PRODUCTS.filter((e) => e.format === format);
}

/**
 * Look up an event product by its ID.
 * Пошук продукту-заходу за ідентифікатором.
 */
export function getEventById(id: string): EventProduct | undefined {
  return EVENT_PRODUCTS.find((e) => e.id === id);
}
