/**
 * Record of Processing Activities (ROPA) — GDPR Art. 30 framework. Defines the
 * per-processing-activity entry structure (purpose, lawful basis, data
 * categories, retention, transfers, recipients), the controller-vs-processor
 * distinction, the maintenance/review cadence (DPO-owned, quarterly), the 24-hour
 * regulator-availability commitment, and versioning/audit-log metadata. Includes
 * real example entries for the platform's actual processing.
 *
 * Реєстр операцій з обробки (ROPA) — рамка Ст. 30 GDPR. Визначає структуру запису
 * для кожної операції обробки (мета, правова підстава, категорії даних, зберігання,
 * передачі, одержувачі), розмежування контролер/обробник, періодичність ведення/
 * перегляду (відповідальний DPO, щокварталу), зобов'язання щодо доступності
 * регулятору протягом 24 годин та метадані версіонування/журналу аудиту. Містить
 * реальні приклади записів для фактичної обробки платформи.
 */

// ── ROPA entry interface (Art. 30) ──────────────────────────────────────────────

/** Whether Aegis Lens acts as controller or processor for the activity. / Роль: контролер чи обробник. */
export type ProcessingRole = "controller" | "processor";

/** Lawful basis under Art. 6 (and Art. 9 condition where special-category). / Правова підстава за Ст. 6. */
export type LawfulBasis =
  | "consent"
  | "contract"
  | "legal-obligation"
  | "vital-interests"
  | "public-task"
  | "legitimate-interests";

/**
 * A single Record of Processing Activities entry per GDPR Art. 30.
 * Один запис Реєстру операцій з обробки за Ст. 30 GDPR.
 */
export interface RopaEntry {
  /** Unique, stable activity id. / Унікальний стабільний ідентифікатор операції. */
  id: string;
  /** Activity name. / Назва операції. */
  name_en: string;
  name_uk: string;
  /** Controller or processor for THIS activity. / Контролер чи обробник для ЦІЄЇ операції. */
  role: ProcessingRole;
  /** Purpose(s) of the processing. / Мета(и) обробки. */
  purpose_en: string;
  purpose_uk: string;
  /** Lawful basis (and Art. 9 condition if special-category). / Правова підстава. */
  lawfulBasis: LawfulBasis;
  lawfulBasisNote_en: string;
  lawfulBasisNote_uk: string;
  /** Categories of data subjects. / Категорії суб'єктів даних. */
  dataSubjects_en: string;
  dataSubjects_uk: string;
  /** Categories of personal data. / Категорії персональних даних. */
  dataCategories: string[];
  /** Whether special categories (Art. 9) are involved. / Чи задіяні особливі категорії. */
  specialCategory: boolean;
  /** Retention period and trigger. / Строк зберігання та тригер. */
  retention_en: string;
  retention_uk: string;
  /** Recipients of the data. / Одержувачі даних. */
  recipients: string[];
  /** Cross-border transfers (or "none"). / Транскордонні передачі (або «немає»). */
  transfers_en: string;
  transfers_uk: string;
  /** Reference to security measures (general). / Посилання на заходи безпеки. */
  securityMeasures_en: string;
  securityMeasures_uk: string;
}

// ── Governance / metadata ───────────────────────────────────────────────────────

/**
 * Maintenance, review, availability, and audit metadata for the ROPA.
 * Метадані ведення, перегляду, доступності та аудиту ROPA.
 */
export interface RopaGovernance {
  /** Owner of the record. / Власник реєстру. */
  owner_en: string;
  owner_uk: string;
  /** Review cadence. / Періодичність перегляду. */
  reviewCadence_en: string;
  reviewCadence_uk: string;
  /** Regulator-availability commitment. / Зобов'язання щодо доступності регулятору. */
  regulatorAvailability_en: string;
  regulatorAvailability_uk: string;
  /** Versioning & audit-log approach. / Підхід до версіонування та журналу аудиту. */
  versioning_en: string;
  versioning_uk: string;
}

export const ROPA_GOVERNANCE: RopaGovernance = {
  owner_en: "Maintained by the Data Protection Officer (DPO), who is accountable for accuracy and completeness.",
  owner_uk: "Ведеться Уповноваженим із захисту даних (DPO), який відповідає за точність і повноту.",
  reviewCadence_en: "Reviewed at least quarterly by the DPO, and immediately whenever a new processing activity, recipient, sub-processor, retention change, or transfer is introduced.",
  reviewCadence_uk: "Переглядається щонайменше щокварталу DPO, а також негайно при появі нової операції обробки, одержувача, суб-обробника, зміни зберігання чи передачі.",
  regulatorAvailability_en: "The complete, current ROPA can be exported and made available to a supervisory authority on request within 24 hours, in a machine-readable format with the controller/processor contact details.",
  regulatorAvailability_uk: "Повний, актуальний ROPA може бути експортований та наданий наглядовому органу на запит протягом 24 годин у машинозчитуваному форматі з контактними даними контролера/обробника.",
  versioning_en: "Every change is versioned and append-only audit-logged: who changed what, when, and why. Prior versions are retained so the state of the ROPA at any past date can be reconstructed for a regulator.",
  versioning_uk: "Кожна зміна версіонується та фіксується в журналі аудиту лише з додаванням: хто, що, коли і чому змінив. Попередні версії зберігаються, щоб стан ROPA на будь-яку минулу дату можна було відтворити для регулятора.",
}

/**
 * One audit-log record for a ROPA change.
 * Один запис журналу аудиту зміни ROPA.
 */
export interface RopaAuditRecord {
  version: string;
  timestamp: string;
  actor: string;
  entryId: string;
  change_en: string;
  change_uk: string;
}

// ── Example ROPA entries (real platform processing) ─────────────────────────────

export const ROPA_ENTRIES: RopaEntry[] = [
  {
    id: "ROPA-001-account-data",
    name_en: "User account and authentication data",
    name_uk: "Дані облікового запису та автентифікації користувача",
    role: "controller",
    purpose_en: "Create and operate user accounts, authenticate users, secure access, and provide and bill for the service.",
    purpose_uk: "Створення та обслуговування облікових записів, автентифікація користувачів, захист доступу, надання та тарифікація послуги.",
    lawfulBasis: "contract",
    lawfulBasisNote_en: "Necessary for performance of the service contract; security processing also supported by legitimate interests.",
    lawfulBasisNote_uk: "Необхідно для виконання договору про надання послуги; обробка для безпеки також спирається на законні інтереси.",
    dataSubjects_en: "Registered users (analysts, organizational customers).",
    dataSubjects_uk: "Зареєстровані користувачі (аналітики, організаційні замовники).",
    dataCategories: ["name", "email", "hashed credentials", "session/auth tokens", "role/permissions", "billing identifiers"],
    specialCategory: false,
    retention_en: "Retained for the life of the account and deleted within 30 days of account closure, except where a legal-retention obligation applies.",
    retention_uk: "Зберігається протягом усього строку дії облікового запису та видаляється протягом 30 днів після закриття, окрім випадків юридичного зобов'язання щодо зберігання.",
    recipients: ["internal engineering/support (need-to-know)", "transactional email provider", "payment processor"],
    transfers_en: "Stored within the EU. Any provider fallback outside the EU is covered by Standard Contractual Clauses with supplementary measures.",
    transfers_uk: "Зберігається в межах ЄС. Будь-який резервний постачальник за межами ЄС покривається Стандартними договірними положеннями з додатковими заходами.",
    securityMeasures_en: "Encryption in transit and at rest, role-based access control, MFA for staff, audit logging.",
    securityMeasures_uk: "Шифрування під час передачі та зберігання, рольовий контроль доступу, MFA для персоналу, журналювання аудиту.",
  },
  {
    id: "ROPA-002-anti-doxxing-classifier",
    name_en: "Anti-doxxing classifier processing",
    name_uk: "Обробка класифікатором проти доксингу",
    role: "controller",
    purpose_en: "Detect and flag content that exposes private individuals' identities or locations so it can be redacted or withheld before publication, protecting bystanders from harm.",
    purpose_uk: "Виявлення та позначення контенту, що розкриває особу чи місцезнаходження приватних осіб, для редагування або приховування перед публікацією, захищаючи людей від шкоди.",
    lawfulBasis: "legitimate-interests",
    lawfulBasisNote_en: "Legitimate interests in protecting individuals from doxxing and physical harm, balanced via a documented LIA and a dedicated DPIA. Where special categories are incidentally processed, the substantial-public-interest / protection-of-individuals condition is relied upon and minimization is enforced.",
    lawfulBasisNote_uk: "Законні інтереси захисту осіб від доксингу та фізичної шкоди, збалансовані задокументованим LIA та окремою DPIA. Якщо випадково обробляються особливі категорії, застосовується умова суттєвого суспільного інтересу / захисту осіб та забезпечується мінімізація.",
    dataSubjects_en: "Individuals appearing in ingested open-source content (often bystanders, not platform users).",
    dataSubjects_uk: "Особи, присутні в поглинутому контенті з відкритих джерел (часто випадкові люди, не користувачі платформи).",
    dataCategories: ["names/identifiers in content", "location references", "faces/imagery (for blurring)", "license plates (for blurring)"],
    specialCategory: true,
    retention_en: "Flagged inputs are processed transiently; classifier outputs and minimal evidence are retained only as long as needed for review and retraction handling, then deleted.",
    retention_uk: "Позначені вхідні дані обробляються транзитно; результати класифікатора та мінімальні докази зберігаються лише стільки, скільки потрібно для огляду та обробки відкликань, після чого видаляються.",
    recipients: ["internal human reviewers", "DPO (for risk oversight)"],
    transfers_en: "Model inference runs within EU infrastructure; no transfer to non-adequate third countries without SCCs + TIA.",
    transfers_uk: "Інференс моделі виконується в інфраструктурі ЄС; жодних передач до неадекватних третіх країн без SCC + TIA.",
    securityMeasures_en: "Strict access controls, pseudonymization where possible, human-in-the-loop review, accuracy monitoring and bias testing per the DPIA.",
    securityMeasures_uk: "Суворий контроль доступу, псевдонімізація де можливо, огляд з участю людини, моніторинг точності та тестування упередженості згідно з DPIA.",
  },
  {
    id: "ROPA-003-product-analytics",
    name_en: "Privacy-respecting product analytics",
    name_uk: "Продуктова аналітика з повагою до приватності",
    role: "controller",
    purpose_en: "Understand aggregate platform usage to improve reliability and UX. Only collected from users who grant analytics consent.",
    purpose_uk: "Розуміння агрегованого використання платформи для покращення надійності та UX. Збирається лише від користувачів, які надали згоду на аналітику.",
    lawfulBasis: "consent",
    lawfulBasisNote_en: "Consent obtained via the cookie banner (opt-in in strict regions). Analytics never fire before consent; withdrawal is honored immediately.",
    lawfulBasisNote_uk: "Згода отримується через банер cookie (opt-in у суворих регіонах). Аналітика ніколи не спрацьовує до згоди; відкликання поважається негайно.",
    dataSubjects_en: "Consenting platform visitors and users.",
    dataSubjects_uk: "Відвідувачі та користувачі платформи, які надали згоду.",
    dataCategories: ["pseudonymous usage events", "coarse page/feature interactions", "approximate region (no raw IP retained)"],
    specialCategory: false,
    retention_en: "Aggregated and event-level data retained for up to 90 days, then aggregated further or deleted.",
    retention_uk: "Агреговані та подієві дані зберігаються до 90 днів, після чого додатково агрегуються або видаляються.",
    recipients: ["internal product/engineering"],
    transfers_en: "Self-hosted within EU infrastructure; no third-country transfer.",
    transfers_uk: "Самостійно розміщена в інфраструктурі ЄС; передач до третіх країн немає.",
    securityMeasures_en: "Pseudonymization, IP truncation/no raw IP retention, access restricted to product/engineering, consent-gated collection.",
    securityMeasures_uk: "Псевдонімізація, усічення IP / без зберігання сирих IP, доступ обмежено продуктом/інженерією, збір лише за згодою.",
  },
];
