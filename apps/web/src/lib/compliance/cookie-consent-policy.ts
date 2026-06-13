/**
 * Cookie Consent Policy & Config — additive policy/config data layer that sits
 * alongside the runtime CookieConsent.tsx / lib/consent.ts (which it does NOT
 * modify). Defines geo-aware consent defaults (EU strict; US CCPA states strict),
 * per-locale consent-banner UI configuration, the consent audit-log schema, and
 * the annual cookie inventory audit process.
 *
 * Політика та конфігурація згоди на cookie — додатковий шар політики/конфігурації
 * поруч із рантаймом CookieConsent.tsx / lib/consent.ts (який НЕ змінюється).
 * Визначає геозалежні типові налаштування згоди (ЄС — суворо; штати CCPA США —
 * суворо), конфігурацію банера за локалями, схему журналу аудиту згоди та
 * процес щорічного аудиту інвентаризації cookie.
 */

// ── Geo-aware defaults ──────────────────────────────────────────────────────────

/** Cookie categories used across the platform. / Категорії cookie на платформі. */
export type CookieCategory = "necessary" | "functional" | "analytics" | "marketing";

/** Default opt-in state for a category before the user chooses. / Типовий стан до вибору користувача. */
export type DefaultConsentMode = "granted" | "denied";

/**
 * Geo-aware consent default for a region. Necessary cookies are always granted;
 * all other categories follow the regime's default until the user decides.
 * Геозалежне типове налаштування згоди для регіону.
 */
export interface GeoConsentDefault {
  /** Region key. / Ключ регіону. */
  region: "eu-eea" | "uk" | "us-ccpa-states" | "us-other" | "ukraine" | "rest-of-world";
  /** Regime label. / Назва режиму. */
  regime_en: string;
  regime_uk: string;
  /** Whether the regime requires opt-in (strict) or allows opt-out. / Чи вимагає режим opt-in (суворо) чи дозволяє opt-out. */
  model: "opt-in" | "opt-out";
  /** Per-category default before the user acts. / Типовий стан кожної категорії до дій користувача. */
  defaults: Record<CookieCategory, DefaultConsentMode>;
  /** Whether non-essential trackers may fire before a choice. / Чи можуть несуттєві трекери спрацьовувати до вибору. */
  preConsentTracking: boolean;
  notes_en: string;
  notes_uk: string;
}

const STRICT_DEFAULTS: Record<CookieCategory, DefaultConsentMode> = {
  necessary: "granted",
  functional: "denied",
  analytics: "denied",
  marketing: "denied",
};

export const GEO_CONSENT_DEFAULTS: GeoConsentDefault[] = [
  {
    region: "eu-eea",
    regime_en: "EU / EEA — GDPR + ePrivacy Directive (opt-in)",
    regime_uk: "ЄС / ЄЕП — GDPR + Директива про е-приватність (opt-in)",
    model: "opt-in",
    defaults: STRICT_DEFAULTS,
    preConsentTracking: false,
    notes_en:
      "Strict opt-in. No analytics or marketing cookies until the user affirmatively grants consent. No pre-checked boxes. Reject-all is presented with equal prominence to accept-all.",
    notes_uk:
      "Суворий opt-in. Жодних cookie аналітики чи маркетингу, доки користувач явно не надасть згоду. Без попередньо позначених прапорців. «Відхилити все» подається настільки ж помітно, як і «Прийняти все».",
  },
  {
    region: "uk",
    regime_en: "United Kingdom — UK GDPR + PECR (opt-in)",
    regime_uk: "Велика Британія — UK GDPR + PECR (opt-in)",
    model: "opt-in",
    defaults: STRICT_DEFAULTS,
    preConsentTracking: false,
    notes_en: "Same strict opt-in model as the EU under PECR. Treated identically to EU/EEA.",
    notes_uk: "Той самий суворий opt-in, що й у ЄС, за PECR. Розглядається ідентично до ЄС/ЄЕП.",
  },
  {
    region: "us-ccpa-states",
    regime_en: "US CCPA/CPRA states (CA, plus CO, VA, CT, UT and other comprehensive-law states)",
    regime_uk: "Штати США з CCPA/CPRA (CA, а також CO, VA, CT, UT та інші штати з всеохопним законом)",
    model: "opt-out",
    defaults: STRICT_DEFAULTS,
    preConsentTracking: false,
    notes_en:
      "Although these states are technically opt-out, Aegis Lens applies a STRICT default here too: non-essential trackers stay off until the user chooses, and we honor the Global Privacy Control (GPC) signal as a valid opt-out of sale/share. This avoids per-state divergence and over-collection.",
    notes_uk:
      "Хоча ці штати технічно opt-out, Aegis Lens застосовує тут СУВОРИЙ типовий стан: несуттєві трекери вимкнені, доки користувач не зробить вибір, і ми поважаємо сигнал Global Privacy Control (GPC) як дійсну відмову від продажу/поширення. Це уникає розбіжностей між штатами та надмірного збору.",
  },
  {
    region: "us-other",
    regime_en: "US states without comprehensive privacy law",
    regime_uk: "Штати США без всеохопного закону про приватність",
    model: "opt-out",
    defaults: {
      necessary: "granted",
      functional: "granted",
      analytics: "granted",
      marketing: "denied",
    },
    preConsentTracking: true,
    notes_en:
      "Opt-out model with a visible banner and easy opt-out. Marketing remains denied by default as a conservative posture. GPC honored.",
    notes_uk:
      "Модель opt-out з видимим банером та легкою відмовою. Маркетинг лишається вимкненим за замовчуванням як обережна позиція. GPC поважається.",
  },
  {
    region: "ukraine",
    regime_en: "Ukraine — Law on Personal Data Protection (converging to GDPR)",
    regime_uk: "Україна — Закон про захист персональних даних (конвергує до GDPR)",
    model: "opt-in",
    defaults: STRICT_DEFAULTS,
    preConsentTracking: false,
    notes_en: "Treated as strict opt-in in line with the EU accession trajectory and the platform's Ukrainian user base.",
    notes_uk: "Розглядається як суворий opt-in відповідно до траєкторії вступу до ЄС та української бази користувачів платформи.",
  },
  {
    region: "rest-of-world",
    regime_en: "Rest of world (default-strict baseline)",
    regime_uk: "Решта світу (типовий суворий базис)",
    model: "opt-in",
    defaults: STRICT_DEFAULTS,
    preConsentTracking: false,
    notes_en: "When geolocation is unknown or unmapped, the strict opt-in default applies — fail safe toward privacy.",
    notes_uk: "Коли геолокація невідома або не зіставлена, застосовується суворий типовий opt-in — безпечний відмов у бік приватності.",
  },
];

/**
 * Resolve the geo default for a region key, falling back to the strict baseline.
 * Визначає типове налаштування для ключа регіону, повертаючись до суворого базису.
 */
export function resolveGeoConsentDefault(
  region: GeoConsentDefault["region"],
): GeoConsentDefault {
  return (
    GEO_CONSENT_DEFAULTS.find((g) => g.region === region) ??
    GEO_CONSENT_DEFAULTS.find((g) => g.region === "rest-of-world")!
  );
}

// ── Per-locale UI config ────────────────────────────────────────────────────────

/**
 * Localized strings for the consent banner. Additive to the runtime component —
 * the component may import these without changing its own logic.
 * Локалізовані рядки банера згоди. Доповнюють рантайм-компонент.
 */
export interface ConsentLocaleUi {
  /** Locale code. / Код локалі. */
  locale: string;
  title: string;
  body: string;
  acceptAll: string;
  essentialOnly: string;
  manage: string;
  /** Per-category labels. / Підписи категорій. */
  categories: Record<CookieCategory, string>;
  /** Link text to the cookie policy. / Текст посилання на політику cookie. */
  policyLink: string;
}

export const CONSENT_LOCALE_UI: ConsentLocaleUi[] = [
  {
    locale: "en",
    title: "Your privacy choices",
    body: "We use cookies to keep the platform secure and, with your permission, to understand how it is used. You can accept all, keep only what is essential, or manage each category. You can change your choice at any time.",
    acceptAll: "Accept all",
    essentialOnly: "Essential only",
    manage: "Manage choices",
    categories: {
      necessary: "Strictly necessary",
      functional: "Functional",
      analytics: "Analytics",
      marketing: "Marketing",
    },
    policyLink: "Read our Cookie Policy",
  },
  {
    locale: "uk",
    title: "Ваші налаштування приватності",
    body: "Ми використовуємо cookie, щоб підтримувати безпеку платформи та, з вашого дозволу, розуміти, як її використовують. Ви можете прийняти все, залишити лише необхідне або керувати кожною категорією. Ви можете змінити вибір будь-коли.",
    acceptAll: "Прийняти все",
    essentialOnly: "Лише необхідні",
    manage: "Керувати вибором",
    categories: {
      necessary: "Суворо необхідні",
      functional: "Функціональні",
      analytics: "Аналітика",
      marketing: "Маркетинг",
    },
    policyLink: "Читати нашу Політику cookie",
  },
  {
    locale: "de",
    title: "Ihre Datenschutzeinstellungen",
    body: "Wir verwenden Cookies, um die Plattform sicher zu halten und – mit Ihrer Erlaubnis – zu verstehen, wie sie genutzt wird. Sie können alle akzeptieren, nur das Notwendige behalten oder jede Kategorie verwalten. Sie können Ihre Wahl jederzeit ändern.",
    acceptAll: "Alle akzeptieren",
    essentialOnly: "Nur notwendige",
    manage: "Auswahl verwalten",
    categories: {
      necessary: "Unbedingt erforderlich",
      functional: "Funktional",
      analytics: "Analyse",
      marketing: "Marketing",
    },
    policyLink: "Cookie-Richtlinie lesen",
  },
  {
    locale: "fr",
    title: "Vos choix de confidentialité",
    body: "Nous utilisons des cookies pour assurer la sécurité de la plateforme et, avec votre permission, pour comprendre comment elle est utilisée. Vous pouvez tout accepter, ne conserver que l'essentiel ou gérer chaque catégorie. Vous pouvez modifier votre choix à tout moment.",
    acceptAll: "Tout accepter",
    essentialOnly: "Essentiels uniquement",
    manage: "Gérer les choix",
    categories: {
      necessary: "Strictement nécessaires",
      functional: "Fonctionnels",
      analytics: "Analytique",
      marketing: "Marketing",
    },
    policyLink: "Lire notre politique relative aux cookies",
  },
];

// ── Consent audit-log schema ────────────────────────────────────────────────────

/**
 * One immutable consent audit-log record. Written on every consent action so the
 * platform can prove what a user consented to, when, and under which banner version.
 * Один незмінний запис журналу аудиту згоди. Записується при кожній дії згоди.
 */
export interface ConsentAuditRecord {
  /** Unique record id. / Унікальний ідентифікатор запису. */
  id: string;
  /** Pseudonymous subject id (NOT raw IP). / Псевдонімний ідентифікатор суб'єкта (НЕ сира IP). */
  subjectRef: string;
  /** UTC timestamp of the action. / Мітка часу дії UTC. */
  timestamp: string;
  /** What the user did. / Що зробив користувач. */
  action: "accept-all" | "essential-only" | "custom" | "withdraw" | "renew";
  /** Resolved consent per category. / Підсумкова згода за категоріями. */
  granted: Record<CookieCategory, boolean>;
  /** Region resolved at the time of the choice. / Регіон, визначений на момент вибору. */
  region: GeoConsentDefault["region"];
  /** Locale shown to the user. / Локаль, показана користувачу. */
  locale: string;
  /** Version of the consent banner + policy text shown. / Версія банера та тексту політики. */
  bannerVersion: string;
  policyVersion: string;
  /** Whether a Global Privacy Control signal was present. / Чи був присутній сигнал GPC. */
  gpcSignal: boolean;
  /** Coarse method/source. / Грубий метод/джерело. */
  source: "banner" | "preferences-center" | "gpc-auto" | "api";
}

export const CONSENT_AUDIT_LOG_RETENTION_EN =
  "Consent audit records are retained for the duration of the relationship plus the limitation period required to demonstrate compliance, and are stored append-only (immutable). They never contain raw IP addresses or directly identifying data — only a pseudonymous subject reference.";

export const CONSENT_AUDIT_LOG_RETENTION_UK =
  "Записи аудиту згоди зберігаються протягом усього періоду відносин плюс строк давності, необхідний для доведення відповідності, та зберігаються лише з додаванням (незмінно). Вони ніколи не містять сирих IP-адрес чи прямо ідентифікуючих даних — лише псевдонімне посилання на суб'єкта.";

// ── Annual cookie inventory audit ───────────────────────────────────────────────

/**
 * A single cookie/SDK inventory item discovered during the annual audit.
 * Один елемент інвентаризації cookie/SDK, виявлений під час щорічного аудиту.
 */
export interface CookieInventoryItem {
  name: string;
  /** Who sets it. / Хто встановлює. */
  provider: string;
  category: CookieCategory;
  /** Purpose. / Призначення. */
  purpose_en: string;
  purpose_uk: string;
  /** Lifespan. / Термін дії. */
  duration: string;
  /** First-party or third-party. / Першої чи третьої сторони. */
  party: "first" | "third";
}

/**
 * Specification for the annual cookie inventory audit process.
 * Специфікація процесу щорічного аудиту інвентаризації cookie.
 */
export interface CookieInventoryAuditProcess {
  cadence_en: string;
  cadence_uk: string;
  steps_en: string[];
  steps_uk: string[];
}

export const COOKIE_INVENTORY_AUDIT: CookieInventoryAuditProcess = {
  cadence_en: "Performed at least annually, and additionally whenever a new third-party SDK, tag, or analytics provider is introduced.",
  cadence_uk: "Виконується щонайменше щороку, а також щоразу при впровадженні нового SDK третьої сторони, тегу або постачальника аналітики.",
  steps_en: [
    "Run an automated cookie/tracker scan against all locales and key user journeys.",
    "Reconcile discovered cookies against the declared inventory; flag undeclared or 'rogue' trackers.",
    "Confirm each non-essential cookie only fires after consent in strict regions.",
    "Update the public Cookie Policy and per-locale banner text to match reality.",
    "Re-categorize any reclassified cookies and update consent defaults if needed.",
    "Record the audit result, date, auditor, and remediation actions.",
  ],
  steps_uk: [
    "Запустити автоматичне сканування cookie/трекерів по всіх локалях та ключових сценаріях користувача.",
    "Звірити виявлені cookie з декларованим інвентарем; позначити недекларовані або «несанкціоновані» трекери.",
    "Підтвердити, що кожна несуттєва cookie спрацьовує лише після згоди в суворих регіонах.",
    "Оновити публічну Політику cookie та текст банера за локалями відповідно до реальності.",
    "Перекласифікувати будь-які перекласифіковані cookie та оновити типові налаштування згоди за потреби.",
    "Зафіксувати результат аудиту, дату, аудитора та заходи з усунення.",
  ],
};

/**
 * Example baseline inventory matching the platform's actual minimal cookie use.
 * Приклад базового інвентарю, що відповідає реальному мінімальному використанню cookie.
 */
export const COOKIE_INVENTORY_EXAMPLE: CookieInventoryItem[] = [
  {
    name: "al_session",
    provider: "Aegis Lens (first-party)",
    category: "necessary",
    purpose_en: "Maintains the authenticated session and CSRF protection.",
    purpose_uk: "Підтримує автентифіковану сесію та захист від CSRF.",
    duration: "Session",
    party: "first",
  },
  {
    name: "al_consent",
    provider: "Aegis Lens (first-party)",
    category: "necessary",
    purpose_en: "Stores the user's cookie consent choice so the banner is not shown repeatedly.",
    purpose_uk: "Зберігає вибір згоди користувача, щоб банер не показувався повторно.",
    duration: "12 months",
    party: "first",
  },
  {
    name: "al_analytics_id",
    provider: "Self-hosted analytics (first-party)",
    category: "analytics",
    purpose_en: "Privacy-respecting usage analytics; set only after analytics consent is granted.",
    purpose_uk: "Аналітика використання з повагою до приватності; встановлюється лише після надання згоди на аналітику.",
    duration: "90 days",
    party: "first",
  },
];
