/**
 * Group / Consortium Licensing — canonical registry and helpers.
 * Covers university site licenses, newsroom alliances, NGO consortia,
 * professional associations, and K-12 civic education programmes.
 *
 * Реєстр групових / консорціумних ліцензій.
 * Охоплює університетські ліцензії, альянси редакцій, консорціуми НУО,
 * профасоціації та програми цивільної освіти K-12.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type GroupLicenseType =
  | "university-site-license"
  | "newsroom-alliance"
  | "ngo-consortium"
  | "professional-association"
  | "k12-civic-education";

export type SsoProtocol = "saml" | "oidc" | "shibboleth";

export type SeatAllocationModel = "named" | "floating";

// ── Interface ─────────────────────────────────────────────────────────────────

export interface GroupLicenseTier {
  id: GroupLicenseType;
  type: GroupLicenseType;
  name_en: string;
  name_uk: string;
  priceRange: {
    minUsd: number | null;
    maxUsd: number | null;
    period: "annual" | "monthly" | "custom" | "free";
  };
  ssoRequired: boolean;
  ssoProtocols: SsoProtocol[];
  seatAllocation: SeatAllocationModel;
  features_en: string[];
  features_uk: string[];
  notes_en: string;
  notes_uk: string;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const GROUP_LICENSE_TIERS: GroupLicenseTier[] = [
  {
    id: "university-site-license",
    type: "university-site-license",
    name_en: "University Site License",
    name_uk: "Університетська ліцензія (campus-wide)",
    priceRange: { minUsd: 5000, maxUsd: 25000, period: "annual" },
    ssoRequired: true,
    ssoProtocols: ["shibboleth", "saml"],
    seatAllocation: "floating",
    features_en: [
      "Unlimited access for all enrolled students and faculty",
      "Floating seat pool — no per-user provisioning required",
      "SSO via Shibboleth / SAML integrated with campus IdP",
      "Admin portal: enrolment sync, usage dashboards, seat reporting",
      "Bibliographic citation support: DOI / persistent URL for every event used in research",
      "Annual usage report delivered to institutional IT and library contact",
      "Curriculum integration templates and guest lecture programme",
      "Dedicated account manager + academic success team",
    ],
    features_uk: [
      "Необмежений доступ для всіх студентів і викладачів",
      "Плаваючий пул місць — індивідуальне провізіонування не потрібне",
      "SSO через Shibboleth / SAML з інтеграцією до кампусного IdP",
      "Адмін-портал: синхронізація зарахування, дашборди використання, звітність",
      "Підтримка бібліографічного цитування: DOI / постійне URL для кожної події у дослідженнях",
      "Щорічний звіт використання — до IT-відділу та бібліотеки установи",
      "Шаблони для інтеграції в навчальні програми та програма гостьових лекцій",
      "Виділений менеджер облікового запису + академічна команда підтримки",
    ],
    notes_en:
      "University licenses are low-margin but high-reputation. The primary ROI is the graduation funnel: students who use Aegis Lens during studies convert to Pro / Business after entering the workforce.",
    notes_uk:
      "Університетські ліцензії мають низьку маржу, але високу репутаційну цінність. Основний ROI — воронка випускників: студенти, що використовували Aegis Lens під час навчання, конвертуються в Pro / Business після входу на ринок праці.",
  },

  {
    id: "newsroom-alliance",
    type: "newsroom-alliance",
    name_en: "Newsroom Alliance License",
    name_uk: "Ліцензія альянсу редакцій",
    priceRange: { minUsd: 2000, maxUsd: 15000, period: "annual" },
    ssoRequired: true,
    ssoProtocols: ["saml", "oidc"],
    seatAllocation: "named",
    features_en: [
      "Per-newsroom seat blocks (minimum 3 seats per member newsroom)",
      "Shared verification queue with priority routing for alliance members",
      "Cross-newsroom collaboration workspace (read-only between members)",
      "SSO via SAML or OIDC — each newsroom uses its own IdP",
      "Admin portal: per-newsroom usage breakdown, shared billing",
      "Bibliographic citation support: DOI / persistent URL for published investigations",
      "Annual usage + verification-throughput report",
      "Alliance coordinator dashboard for managing member organisations",
    ],
    features_uk: [
      "Блоки місць на редакцію (мінімум 3 місця на редакцію-учасника)",
      "Спільна черга верифікації з пріоритетним маршрутизуванням для членів альянсу",
      "Міжредакційний робочий простір для співпраці (між членами — тільки читання)",
      "SSO через SAML або OIDC — кожна редакція використовує власний IdP",
      "Адмін-портал: розбивка використання по редакціях, спільний білінг",
      "Підтримка бібліографічного цитування: DOI / постійне URL для опублікованих розслідувань",
      "Щорічний звіт використання та пропускної здатності верифікації",
      "Дашборд координатора альянсу для управління організаціями-членами",
    ],
    notes_en:
      "Newsroom alliances pool purchasing power across smaller outlets. Shared verification queue is the primary differentiator — investigative desks benefit from collective throughput.",
    notes_uk:
      "Альянси редакцій об'єднують купівельну спроможність менших видань. Спільна черга верифікації — головний диференціатор: редакційні розслідувальні відділи отримують переваги від колективної пропускної здатності.",
  },

  {
    id: "ngo-consortium",
    type: "ngo-consortium",
    name_en: "NGO Consortium License",
    name_uk: "Ліцензія консорціуму НУО",
    priceRange: { minUsd: 1000, maxUsd: 8000, period: "annual" },
    ssoRequired: false,
    ssoProtocols: ["saml", "oidc"],
    seatAllocation: "floating",
    features_en: [
      "Multi-organisation shared workspace with configurable access boundaries",
      "Grant pricing: significant discount for verified humanitarian / civil-society organisations",
      "Floating seat pool shared across consortium member organisations",
      "SSO optional but supported via SAML / OIDC",
      "Admin portal: per-org seat usage, cross-org data sharing controls",
      "Bibliographic citation support: DOI / persistent URL for advocacy publications",
      "Annual usage report + grant compliance documentation package",
      "Consortium coordinator dashboard for managing member NGOs",
    ],
    features_uk: [
      "Спільний робочий простір для кількох організацій з настроюваними межами доступу",
      "Грантові ціни: значна знижка для верифікованих гуманітарних / громадянських організацій",
      "Плаваючий пул місць, спільний для організацій-членів консорціуму",
      "SSO необов'язково, але підтримується через SAML / OIDC",
      "Адмін-портал: використання місць по організаціях, контроль обміну даними",
      "Підтримка бібліографічного цитування: DOI / постійне URL для адвокаційних публікацій",
      "Щорічний звіт використання + пакет документації для грантової звітності",
      "Дашборд координатора консорціуму для управління НУО-членами",
    ],
    notes_en:
      "NGO consortium pricing is deliberately below commercial rates. The mission alignment and credibility gains from humanitarian deployments outweigh the margin sacrifice.",
    notes_uk:
      "Ціни для консорціумів НУО свідомо нижчі від комерційних. Відповідність місії та репутаційний прибуток від гуманітарних розгортань переважають жертву маржею.",
  },

  {
    id: "professional-association",
    type: "professional-association",
    name_en: "Professional Association License",
    name_uk: "Ліцензія для профасоціації",
    priceRange: { minUsd: 3000, maxUsd: 20000, period: "annual" },
    ssoRequired: false,
    ssoProtocols: ["saml", "oidc"],
    seatAllocation: "named",
    features_en: [
      "Member benefit programme: per-member seat at discounted rate",
      "Association-managed named seat allocation via admin portal",
      "SSO optional — integrate with association's member management system",
      "Bibliographic citation support: DOI / persistent URL for member research",
      "Annual usage report + member engagement analytics",
      "Co-branded training webinars and CPD (continuing professional development) credits",
      "Association branding on member-facing login and welcome flow",
    ],
    features_uk: [
      "Програма членських переваг: місце на члена за зниженою ціною",
      "Розподіл іменних місць асоціацією через адмін-портал",
      "SSO необов'язково — інтеграція з системою управління членством асоціації",
      "Підтримка бібліографічного цитування: DOI / постійне URL для дослідницьких публікацій членів",
      "Щорічний звіт використання + аналітика залучення членів",
      "Co-branded навчальні вебінари та кредити CPD (безперервний професійний розвиток)",
      "Брендинг асоціації на сторінці входу та у вітальному потоці для членів",
    ],
    notes_en:
      "Professional associations act as distribution channels: the association absorbs procurement complexity and delivers Aegis Lens as a member benefit, reducing our direct sales overhead.",
    notes_uk:
      "Профасоціації виступають дистрибуційними каналами: асоціація бере на себе складність закупівлі та надає Aegis Lens як членську перевагу, зменшуючи наші прямі витрати на продажі.",
  },

  {
    id: "k12-civic-education",
    type: "k12-civic-education",
    name_en: "K-12 / Civic Education License",
    name_uk: "Ліцензія K-12 / Громадянська освіта",
    priceRange: { minUsd: null, maxUsd: null, period: "free" },
    ssoRequired: false,
    ssoProtocols: ["saml", "oidc"],
    seatAllocation: "floating",
    features_en: [
      "Free access for accredited K-12 schools and civic education programmes",
      "Curated curriculum support package: lesson plans, exercises, teacher guides",
      "Age-appropriate data display restrictions enabled by default",
      "Floating seat pool for classroom use",
      "SSO optional — supports SAML / OIDC with school district IdP",
      "Admin portal: teacher dashboards, class assignment tools",
      "Annual usage report for school administrators",
      "Participation in Aegis Lens civic education advisory panel",
    ],
    features_uk: [
      "Безкоштовний доступ для акредитованих шкіл K-12 та програм громадянської освіти",
      "Кураторський пакет підтримки навчальних програм: плани уроків, вправи, посібники для вчителів",
      "Вікові обмеження відображення даних включені за замовчуванням",
      "Плаваючий пул місць для аудиторного використання",
      "SSO необов'язково — підтримує SAML / OIDC з IdP шкільного округу",
      "Адмін-портал: дашборди вчителів, інструменти для класних завдань",
      "Щорічний звіт використання для адміністраторів школи",
      "Участь у консультативній раді Aegis Lens з громадянської освіти",
    ],
    notes_en:
      "K-12 licences are fully subsidised. Long-term value: brand awareness among the next generation of analysts, journalists, and policy-makers.",
    notes_uk:
      "Ліцензії K-12 повністю субсидовані. Довгострокова цінність: впізнаваність бренду серед наступного покоління аналітиків, журналістів і представників влади.",
  },
];

// ── Policy strings ─────────────────────────────────────────────────────────────

export const GROUP_LICENSE_MECHANICS_EN =
  "Group licences operate on bulk seat allocation (named or floating pool). " +
  "SSO is mandatory for university and newsroom tiers; optional for others. " +
  "Every licensee receives an admin portal for seat assignment, revocation, and reporting. " +
  "All event data used in publications receives a DOI or persistent URL for bibliographic citation. " +
  "An annual usage report (seats consumed, event queries, verification throughput) is delivered to the designated institutional contact. " +
  "Renewal triggers are evaluated at 90 days before expiry: per-seat utilisation rate and number of external papers citing Aegis Lens data.";

export const GROUP_LICENSE_MECHANICS_UK =
  "Групові ліцензії працюють на основі масового розподілу місць (іменний або плаваючий пул). " +
  "SSO є обов'язковим для університетських та редакційних рівнів; необов'язковим для інших. " +
  "Кожен ліцензіат отримує адмін-портал для призначення місць, відкликання та звітності. " +
  "Усі дані про події, використані в публікаціях, отримують DOI або постійний URL для бібліографічного цитування. " +
  "Щорічний звіт використання (використані місця, запити подій, пропускна здатність верифікації) надсилається до визначеного контакту установи. " +
  "Тригери поновлення оцінюються за 90 днів до закінчення терміну: рівень використання місць і кількість зовнішніх публікацій, що цитують дані Aegis Lens.";

export const UNIVERSITY_GRADUATION_FUNNEL_NOTE_EN =
  "University site licences are deliberately priced below market to maximise campus penetration. " +
  "The core revenue thesis is the graduation funnel: students who rely on Aegis Lens during their studies " +
  "convert to individual Pro or Business subscriptions after entering the workforce. " +
  "This makes the academic segment a customer acquisition channel, not a profit centre.";

export const UNIVERSITY_GRADUATION_FUNNEL_NOTE_UK =
  "Університетські ліцензії свідомо оцінені нижче ринку для максимального проникнення на кампус. " +
  "Основна теза щодо доходів — воронка випускників: студенти, які покладаються на Aegis Lens під час навчання, " +
  "конвертуються в індивідуальні підписки Pro або Business після виходу на ринок праці. " +
  "Це робить академічний сегмент каналом залучення клієнтів, а не центром прибутку.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the DOI / persistent URL bibliographic citation note.
 * All event records used in academic or journalistic publications should
 * be cited via a stable DOI or platform-assigned persistent URL.
 *
 * Повертає примітку щодо бібліографічного цитування через DOI / постійний URL.
 */
export function getBibliographicCitationNote(): {
  en: string;
  uk: string;
} {
  return {
    en:
      "Every event record accessed through a group licence is assigned a persistent URL. " +
      "Academic and investigative publications should cite data using the format: " +
      "Aegis Lens (year). [Event title]. Retrieved from https://aegislens.uk/events/<id>. " +
      "DOI minting is available on request for institutional repositories.",
    uk:
      "Кожному запису події, доступному через групову ліцензію, присвоюється постійний URL. " +
      "Академічні та розслідувальні публікації мають цитувати дані у форматі: " +
      "Aegis Lens (рік). [Назва події]. Отримано з https://aegislens.uk/events/<id>. " +
      "Присвоєння DOI доступне за запитом для інституційних репозиторіїв.",
  };
}

/**
 * Look up a group licence tier by its type/id.
 *
 * Пошук групової ліцензії за типом / ідентифікатором.
 */
export function getGroupLicenseTier(
  type: GroupLicenseType
): GroupLicenseTier | undefined {
  return GROUP_LICENSE_TIERS.find((t) => t.type === type);
}
