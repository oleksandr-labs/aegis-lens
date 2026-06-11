/**
 * Discount, grant, and free-access program catalog.
 * Structured programs for granting free or discounted access without ad-hoc decisions.
 * These programs are a mission asset, not a marketing channel.
 *
 * Каталог програм знижок, грантів та безкоштовного доступу.
 * Структуровані програми — місійний актив, а не маркетинговий інструмент.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type DiscountCategory =
  | "ngo-humanitarian"
  | "journalism"
  | "academic"
  | "ukrainian-entity"
  | "student"
  | "veteran-analyst"
  | "startup-grant"
  | "public-sector-grant";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DiscountConfig {
  id: string;
  category: DiscountCategory;
  name_en: string;
  name_uk: string;
  /** Discount as an integer percentage (0–100), or "free" */
  discountPercent: number | "free";
  eligibilityCriteria_en: string;
  eligibilityCriteria_uk: string;
  /** Duration in months; null = indefinite (e.g. for duration of conflict) */
  maxDurationMonths: number | null;
  notes_en: string;
  notes_uk: string;
}

// ── Programs ──────────────────────────────────────────────────────────────────

/**
 * All configured discount and grant programs.
 *
 * Усі налаштовані програми знижок та грантів.
 */
export const DISCOUNT_CONFIGS: DiscountConfig[] = [
  {
    id: "discount-ngo-humanitarian",
    category: "ngo-humanitarian",
    name_en: "NGO / Humanitarian Organization Program",
    name_uk: "Програма для НКО та гуманітарних організацій",
    discountPercent: 50,
    eligibilityCriteria_en:
      "Registered non-governmental or humanitarian organization actively operating in or responding to conflict zones. " +
      "Must provide: certificate of registration, mission statement, and evidence of active humanitarian operations.",
    eligibilityCriteria_uk:
      "Зареєстрована некомерційна або гуманітарна організація, що активно діє у зонах конфліктів або реагує на них. " +
      "Необхідно надати: свідоцтво про реєстрацію, місійну декларацію та докази активних гуманітарних операцій.",
    maxDurationMonths: 12,
    notes_en:
      "50% discount on any paid plan. Subject to manual review (up to 5 business days). " +
      "Re-verified annually. Eligible organizations sign an acceptable-use addendum.",
    notes_uk:
      "Знижка 50% на будь-який платний тарифний план. Потребує ручного розгляду (до 5 робочих днів). " +
      "Щорічна переперевірка. Організації, що відповідають критеріям, підписують додаток про прийнятне використання.",
  },
  {
    id: "discount-journalism",
    category: "journalism",
    name_en: "Journalism Program",
    name_uk: "Журналістська програма",
    discountPercent: 30,
    eligibilityCriteria_en:
      "Verified working journalist or accredited newsroom. " +
      "Must provide: valid press card or editorial letter on newsroom letterhead, " +
      "plus a byline portfolio demonstrating active reporting.",
    eligibilityCriteria_uk:
      "Верифікований діючий журналіст або акредитована редакція. " +
      "Необхідно надати: дійсне прес-посвідчення або редакційний лист на бланку редакції " +
      "та портфоліо публікацій, що підтверджує активну журналістську діяльність.",
    maxDurationMonths: 12,
    notes_en:
      "30% discount on any paid plan. Press card or institutional validation required. " +
      "Individual journalists and newsrooms both eligible. Renew annually with updated credentials.",
    notes_uk:
      "Знижка 30% на будь-який платний тарифний план. Необхідне прес-посвідчення або інституційна верифікація. " +
      "Можуть подавати як індивідуальні журналісти, так і редакції. Щорічне поновлення з оновленими документами.",
  },
  {
    id: "discount-academic",
    category: "academic",
    name_en: "Academic / Research Institution Program",
    name_uk: "Академічна / дослідницька програма",
    discountPercent: 40,
    eligibilityCriteria_en:
      "Faculty member, post-doctoral researcher, or accredited research laboratory at a recognized university or research institution. " +
      "Must provide: institutional email address (.edu or equivalent) and faculty/researcher ID or letter from department head.",
    eligibilityCriteria_uk:
      "Науково-педагогічний працівник, постдокторант або акредитована дослідницька лабораторія визнаного університету чи наукової установи. " +
      "Необхідно надати: інституційну електронну адресу (.edu або еквівалент) та посвідчення або лист від завідувача кафедри.",
    maxDurationMonths: 12,
    notes_en:
      "40% discount on Pro and Team plans for faculty and research labs. " +
      "Must be used for academic research; commercial applications require a standard license. " +
      "Cite Aegis Lens in published research.",
    notes_uk:
      "Знижка 40% на плани Pro та Team для викладачів і дослідницьких лабораторій. " +
      "Використання лише для академічних досліджень; комерційне застосування потребує стандартної ліцензії. " +
      "Зазначайте Aegis Lens у публікаціях.",
  },
  {
    id: "discount-ukrainian-entity",
    category: "ukrainian-entity",
    name_en: "Ukrainian Organization Program",
    name_uk: "Програма для українських організацій",
    discountPercent: 70,
    eligibilityCriteria_en:
      "Ukrainian legal entity (NGO, media, academic, or civil society organization) registered in Ukraine. " +
      "Must provide: Ukrainian state registration documents (Єдиний державний реєстр) " +
      "and confirmation of active operations.",
    eligibilityCriteria_uk:
      "Українська юридична особа (НКО, ЗМІ, академічна або громадянська організація), зареєстрована в Україні. " +
      "Необхідно надати: документи державної реєстрації України (Єдиний державний реєстр) " +
      "та підтвердження активної діяльності.",
    maxDurationMonths: null,
    notes_en:
      "70% discount for the duration of the conflict. Verified against Ukrainian state registry. " +
      "Re-verified annually. Reflects Aegis Lens mission alignment with Ukrainian civil society.",
    notes_uk:
      "Знижка 70% на весь час конфлікту. Верифікація через Єдиний державний реєстр. " +
      "Щорічна переперевірка. Відображає місійне партнерство Aegis Lens з українським громадянським суспільством.",
  },
  {
    id: "discount-student",
    category: "student",
    name_en: "Student Program",
    name_uk: "Студентська програма",
    discountPercent: 60,
    eligibilityCriteria_en:
      "Enrolled undergraduate or graduate student at an accredited educational institution. " +
      "Must provide: valid student ID and institutional email address (.edu or equivalent). " +
      "Not applicable to executive education or short certificate programs.",
    eligibilityCriteria_uk:
      "Студент бакалаврату або магістратури акредитованого навчального закладу. " +
      "Необхідно надати: дійсне студентське посвідчення та інституційну електронну адресу (.edu або еквівалент). " +
      "Не застосовується для програм виконавчої освіти або коротких сертифікатних курсів.",
    maxDurationMonths: 12,
    notes_en:
      "60% discount on Pro plan. Annual renewal with valid student status. " +
      "Graduates may transition to Academic program if applicable.",
    notes_uk:
      "Знижка 60% на план Pro. Щорічне поновлення за наявності дійсного студентського статусу. " +
      "Випускники можуть перейти на академічну програму за наявності підстав.",
  },
  {
    id: "discount-veteran-analyst",
    category: "veteran-analyst",
    name_en: "Veteran Analyst Program",
    name_uk: "Програма для ветеранів-аналітиків",
    discountPercent: 50,
    eligibilityCriteria_en:
      "Former military intelligence, civilian intelligence, or law enforcement analyst " +
      "who is now working in civil society, journalism, or open-source research. " +
      "Must provide: discharge papers or equivalent official documentation and current role verification.",
    eligibilityCriteria_uk:
      "Колишній аналітик військової розвідки, цивільних спецслужб або правоохоронних органів, " +
      "який наразі працює в громадянському суспільстві, журналістиці або відкритих дослідженнях. " +
      "Необхідно надати: документ про звільнення або еквівалентний офіційний документ та підтвердження поточної ролі.",
    maxDurationMonths: 24,
    notes_en:
      "50% discount on Pro or Team plans. Honors service and supports transition to open-source work. " +
      "Subject to manual review.",
    notes_uk:
      "Знижка 50% на плани Pro або Team. Відзначає службу та підтримує перехід до відкритих досліджень. " +
      "Потребує ручного розгляду.",
  },
  {
    id: "discount-startup-grant",
    category: "startup-grant",
    name_en: "OSINT Startup Grant",
    name_uk: "Грант для OSINT-стартапів",
    discountPercent: "free",
    eligibilityCriteria_en:
      "Early-stage startup building OSINT, open-source intelligence, or verification tooling. " +
      "Must be: pre-Series A, founded within the last 3 years, and have a relevant use case. " +
      "Application reviewed by Aegis Lens grant committee.",
    eligibilityCriteria_uk:
      "Стартап на ранній стадії, що розробляє OSINT, засоби розвідки з відкритих джерел або верифікації. " +
      "Повинен бути: до раунду Series A, заснований протягом останніх 3 років та мати релевантний кейс. " +
      "Заявку розглядає грантовий комітет Aegis Lens.",
    maxDurationMonths: 12,
    notes_en:
      "Free access for 12 months (Team plan equivalent). Application-based: submit at aegislens.uk/grants. " +
      "Cohort-based review; 2 cohorts per year. Accepted startups join Aegis Lens Partner Network.",
    notes_uk:
      "Безкоштовний доступ на 12 місяців (еквівалент плану Team). Відбір за заявкою: надсилайте на aegislens.uk/grants. " +
      "Когортний розгляд; 2 когорти на рік. Прийняті стартапи вступають до Партнерської мережі Aegis Lens.",
  },
  {
    id: "discount-public-sector-grant",
    category: "public-sector-grant",
    name_en: "Public Sector / Municipal Grant",
    name_uk: "Грант для державного сектору та муніципалітетів",
    discountPercent: "free",
    eligibilityCriteria_en:
      "Government bodies, municipalities, or state agencies operating in active conflict zones or directly supporting conflict-affected populations. " +
      "Must provide: official government mandate document and verification of conflict-zone operations.",
    eligibilityCriteria_uk:
      "Органи влади, муніципалітети або державні агентства, що діють в активних зонах конфліктів або безпосередньо підтримують постраждале населення. " +
      "Необхідно надати: офіційний мандатний документ та підтвердження операцій у зоні конфлікту.",
    maxDurationMonths: null,
    notes_en:
      "Free or grant-funded access for the duration of the declared emergency. " +
      "Coordinated through Aegis Lens civic partnerships program. Subject to parliamentary/cabinet mandate verification.",
    notes_uk:
      "Безкоштовний або грантовий доступ на час оголошеної надзвичайної ситуації. " +
      "Координується через програму громадянського партнерства Aegis Lens. " +
      "Потребує верифікації парламентського/кабінетного мандату.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * Grant review and onboarding process.
 *
 * Процес розгляду та онбордингу грантових заявок.
 */
export const GRANT_REVIEW_PROCESS_EN =
  "Grant and discount application process: " +
  "(1) Application submitted via aegislens.uk/grants with required documentation; " +
  "(2) Document verification against stated criteria (automated + spot-check audit); " +
  "(3) Manual approval by Aegis Lens grants team (5–10 business days); " +
  "(4) 30-day guided onboarding for approved organizations; " +
  "(5) Annual re-verification to maintain eligibility.";

export const GRANT_REVIEW_PROCESS_UK =
  "Процес подання та розгляду заявок на гранти та знижки: " +
  "(1) Заявка подається через aegislens.uk/grants з необхідними документами; " +
  "(2) Верифікація документів відповідно до заявлених критеріїв (автоматична + вибіркова перевірка); " +
  "(3) Ручне схвалення командою грантів Aegis Lens (5–10 робочих днів); " +
  "(4) 30-денний супроводжуваний онбординг для схвалених організацій; " +
  "(5) Щорічна переперевірка для збереження права на участь.";

/**
 * Discount stacking policy.
 *
 * Політика сумісності знижок.
 */
export const DISCOUNT_STACKING_NOTE_EN =
  "Discounts and grants cannot be stacked or combined. " +
  "Where a user or organization qualifies for multiple programs, the highest applicable discount is applied automatically. " +
  "Platform promotional discounts (e.g. launch offers) are also non-stackable with grant programs.";

export const DISCOUNT_STACKING_NOTE_UK =
  "Знижки та гранти не можна сумісно використовувати або комбінувати. " +
  "Якщо користувач або організація відповідає критеріям кількох програм, автоматично застосовується найвища знижка. " +
  "Промоційні знижки платформи (наприклад, пропозиції при запуску) також не поєднуються з грантовими програмами.";

/**
 * Anti-abuse policy for grant programs.
 *
 * Антизловживальна політика грантових програм.
 */
export const DISCOUNT_ABUSE_NOTE_EN =
  "Providing false eligibility information when applying for a discount or grant program " +
  "constitutes a breach of the Aegis Lens Terms of Service. Consequences include: " +
  "(1) Immediate account suspension; " +
  "(2) Pro-rata recovery billing for the discounted access period; " +
  "(3) Permanent ban from all grant and discount programs; " +
  "(4) Referral to legal counsel where fraud thresholds are met. " +
  "Suspicious application patterns (e.g. burst submissions from a single domain) are automatically flagged for audit.";

export const DISCOUNT_ABUSE_NOTE_UK =
  "Надання неправдивої інформації про право на участь при поданні заявки на знижку або грантову програму " +
  "є порушенням Умов надання послуг Aegis Lens. Наслідки включають: " +
  "(1) Негайне призупинення облікового запису; " +
  "(2) Пропорційне стягнення оплати за пільговий період доступу; " +
  "(3) Постійна заборона на участь у всіх грантових і дисконтних програмах; " +
  "(4) Передача до юридичного відділу при досягненні порогу шахрайства. " +
  "Підозрілі патерни заявок (наприклад, пакетні подачі з одного домену) автоматично позначаються для перевірки.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns eligibility check notes for a given discount category.
 *
 * Повертає нотатки щодо перевірки права на знижку для заданої категорії.
 */
export function isDiscountEligible(category: DiscountCategory): DiscountConfig | undefined {
  return DISCOUNT_CONFIGS.find((d) => d.category === category);
}

/**
 * Look up a discount config by id.
 *
 * Повертає конфігурацію знижки за ідентифікатором.
 */
export function getDiscountConfig(id: string): DiscountConfig | undefined {
  return DISCOUNT_CONFIGS.find((d) => d.id === id);
}
