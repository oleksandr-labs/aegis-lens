/**
 * Personal Data Breach Notification — GDPR Art. 33/34 response framework.
 * Codifies the 72-hour clock, per-jurisdiction reporting matrix, customer
 * notification templates, internal escalation chain, the yearly tabletop drill
 * spec, and the breach register schema.
 *
 * Повідомлення про порушення захисту персональних даних — рамка реагування
 * згідно зі Ст. 33/34 GDPR. Кодифікує 72-годинний відлік, матрицю звітування
 * за юрисдикціями, шаблони повідомлення клієнтів, ланцюг внутрішньої ескалації,
 * специфікацію щорічних навчань та схему реєстру порушень.
 */

// ── 72-hour clock (GDPR Art. 33) ───────────────────────────────────────────────

/**
 * The Article 33 reporting clock and what each phase requires.
 * Відлік звітування за Ст. 33 та вимоги кожної фази.
 */
export interface BreachClock {
  /** Statutory deadline to notify the lead supervisory authority. / Граничний строк сповіщення наглядового органу. */
  authorityDeadlineHours: 72;
  /** When the clock starts. / Коли починається відлік. */
  clockStart_en: string;
  clockStart_uk: string;
  /** What "becoming aware" means in practice. / Що означає «стати обізнаним» на практиці. */
  awarenessTrigger_en: string;
  awarenessTrigger_uk: string;
  /** Handling of phased / late notification. / Поетапне / запізніле сповіщення. */
  phasedNotification_en: string;
  phasedNotification_uk: string;
  /** Threshold below which authority notification is not required. / Поріг, нижче якого сповіщення не потрібне. */
  riskThreshold_en: string;
  riskThreshold_uk: string;
}

export const BREACH_CLOCK: BreachClock = {
  authorityDeadlineHours: 72,
  clockStart_en:
    "The 72-hour clock starts the moment Aegis Lens becomes aware that a personal data breach has occurred — not when the investigation completes. Awareness is logged with a UTC timestamp by the on-call incident lead and is the single source of truth for the deadline.",
  clockStart_uk:
    "72-годинний відлік починається з моменту, коли Aegis Lens стає обізнаним про факт порушення захисту персональних даних, а не з моменту завершення розслідування. Момент обізнаності фіксується з міткою часу UTC черговим керівником інциденту та є єдиним джерелом істини для граничного строку.",
  awarenessTrigger_en:
    "Awareness means a reasonable degree of certainty that a security incident has led to personal data being compromised. A bare alert is not yet awareness; confirmation that personal data is affected starts the clock. If unsure, treat the earliest plausible confirmation time as the start.",
  awarenessTrigger_uk:
    "Обізнаність означає розумний ступінь упевненості, що інцидент безпеки призвів до компрометації персональних даних. Сам по собі сигнал тривоги ще не є обізнаністю; відлік починає підтвердження, що зачеплено персональні дані. У разі сумнівів за початок береться найраніший правдоподібний час підтвердження.",
  phasedNotification_en:
    "Where full details are not available within 72 hours, file an initial notification within the deadline stating what is known, then supply further information in phases without undue further delay. Never miss the 72-hour mark waiting for completeness.",
  phasedNotification_uk:
    "Якщо повні відомості недоступні протягом 72 годин, у межах строку подається початкове повідомлення з відомою інформацією, а додаткові відомості надаються поетапно без надмірної подальшої затримки. Ніколи не пропускайте 72-годинну позначку, очікуючи повноти.",
  riskThreshold_en:
    "Authority notification is required unless the breach is unlikely to result in a risk to the rights and freedoms of natural persons (Art. 33(1)). When the breach is likely to result in a HIGH risk, data subjects must also be notified without undue delay (Art. 34). The risk decision and its rationale are recorded in the breach register regardless of outcome.",
  riskThreshold_uk:
    "Сповіщення наглядового органу є обов'язковим, окрім випадків, коли порушення навряд чи призведе до ризику для прав і свобод фізичних осіб (Ст. 33(1)). Якщо порушення ймовірно призведе до ВИСОКОГО ризику, суб'єкти даних також мають бути повідомлені без невиправданої затримки (Ст. 34). Рішення щодо ризику та його обґрунтування фіксуються в реєстрі порушень незалежно від результату.",
};

// ── Per-jurisdiction reporting matrix ──────────────────────────────────────────

/**
 * A single jurisdiction's breach-reporting obligation.
 * Зобов'язання щодо звітування про порушення в окремій юрисдикції.
 */
export interface JurisdictionReportingRule {
  /** Jurisdiction key. / Ключ юрисдикції. */
  jurisdiction:
    | "eu-lead-sa"
    | "uk-ico"
    | "us-state-ag"
    | "ukraine";
  /** Authority name. / Назва органу. */
  authority_en: string;
  authority_uk: string;
  /** Legal basis. / Правова підстава. */
  legalBasis: string;
  /** Deadline to notify the authority. / Строк сповіщення органу. */
  authorityDeadline_en: string;
  authorityDeadline_uk: string;
  /** Trigger threshold. / Поріг спрацювання. */
  threshold_en: string;
  threshold_uk: string;
  /** Whether affected individuals must be notified and when. / Чи треба повідомляти осіб. */
  subjectNotification_en: string;
  subjectNotification_uk: string;
}

export const REPORTING_MATRIX: JurisdictionReportingRule[] = [
  {
    jurisdiction: "eu-lead-sa",
    authority_en: "Lead EU supervisory authority (one-stop-shop) under GDPR",
    authority_uk: "Провідний наглядовий орган ЄС («єдине вікно») за GDPR",
    legalBasis: "GDPR Art. 33 (authority), Art. 34 (data subjects)",
    authorityDeadline_en:
      "Within 72 hours of awareness. Determine the lead SA via the main establishment; if Aegis Lens has no EU establishment, notify the SA of each affected member state via its EU representative.",
    authorityDeadline_uk:
      "Протягом 72 годин з моменту обізнаності. Провідний орган визначається за основним місцем діяльності; якщо у Aegis Lens немає установи в ЄС, сповіщається орган кожної зачепленої держави-члена через представника в ЄС.",
    threshold_en: "Any breach likely to result in a risk to rights and freedoms.",
    threshold_uk: "Будь-яке порушення, що ймовірно призведе до ризику для прав і свобод.",
    subjectNotification_en:
      "Required without undue delay where the breach is likely to result in a HIGH risk to the affected individuals (Art. 34).",
    subjectNotification_uk:
      "Обов'язкове без невиправданої затримки, якщо порушення ймовірно призведе до ВИСОКОГО ризику для зачеплених осіб (Ст. 34).",
  },
  {
    jurisdiction: "uk-ico",
    authority_en: "Information Commissioner's Office (ICO), United Kingdom",
    authority_uk: "Офіс Комісара з інформації (ICO), Сполучене Королівство",
    legalBasis: "UK GDPR Art. 33/34, Data Protection Act 2018",
    authorityDeadline_en:
      "Within 72 hours of awareness, via the ICO's online breach reporting tool or breach helpline. Late reports must explain the reason for delay.",
    authorityDeadline_uk:
      "Протягом 72 годин з моменту обізнаності через онлайн-інструмент звітування ICO або гарячу лінію. Запізнілі звіти мають пояснювати причину затримки.",
    threshold_en: "Same risk threshold as EU GDPR; UK ICO assessed separately for UK data subjects.",
    threshold_uk: "Той самий поріг ризику, що й у GDPR ЄС; ICO оцінює окремо щодо суб'єктів даних у Великій Британії.",
    subjectNotification_en:
      "Required without undue delay for high-risk breaches affecting UK individuals.",
    subjectNotification_uk:
      "Обов'язкове без невиправданої затримки для порушень високого ризику, що зачіпають осіб у Великій Британії.",
  },
  {
    jurisdiction: "us-state-ag",
    authority_en: "US state Attorneys General + affected consumers (50-state patchwork)",
    authority_uk: "Генеральні прокурори штатів США + зачеплені споживачі (мозаїка 50 штатів)",
    legalBasis:
      "State breach-notification statutes (e.g. California Civ. Code §1798.82; CCPA/CPRA; NY SHIELD Act; Texas, Florida and others)",
    authorityDeadline_en:
      "Deadlines vary by state: many require notice 'in the most expedient time possible and without unreasonable delay'; several set hard caps (e.g. 30 or 45 days) and require notifying the state AG when a threshold count of residents is affected. Track per-state resident counts.",
    authorityDeadline_uk:
      "Строки різняться за штатами: багато вимагають повідомлення «в найшвидший можливий час без необґрунтованої затримки»; кілька встановлюють жорсткі межі (наприклад, 30 або 45 днів) та вимагають сповіщення генпрокурора штату при перевищенні порогу кількості мешканців. Ведеться облік кількості мешканців за штатами.",
    threshold_en:
      "Triggered by unauthorized acquisition of computerized personal information (name + SSN, financial account, etc.). Definitions of 'personal information' vary by state.",
    threshold_uk:
      "Спрацьовує при несанкціонованому отриманні комп'ютеризованої персональної інформації (ім'я + SSN, фінансовий рахунок тощо). Визначення «персональної інформації» різняться за штатами.",
    subjectNotification_en:
      "Direct notice to affected consumers is mandatory in nearly all states; substitute notice (email + website + media) allowed above cost/volume thresholds.",
    subjectNotification_uk:
      "Пряме повідомлення зачеплених споживачів є обов'язковим майже в усіх штатах; замінне повідомлення (email + вебсайт + ЗМІ) дозволене вище порогів вартості/обсягу.",
  },
  {
    jurisdiction: "ukraine",
    authority_en: "Ukrainian Parliament Commissioner for Human Rights (Ombudsman) — data protection authority",
    authority_uk: "Уповноважений Верховної Ради України з прав людини (Омбудсмен) — орган із захисту даних",
    legalBasis: "Law of Ukraine 'On Personal Data Protection' (No. 2297-VI); pending Ukraine–EU GDPR alignment",
    authorityDeadline_en:
      "Notify the Ombudsman of incidents affecting personal data without undue delay. Ukraine's regime is converging toward GDPR under the EU accession process; treat the 72-hour standard as the operating baseline for Ukrainian data subjects.",
    authorityDeadline_uk:
      "Сповістити Омбудсмена про інциденти, що зачіпають персональні дані, без невиправданої затримки. Режим України конвергує до GDPR у межах процесу вступу до ЄС; як робочий базис для українських суб'єктів даних застосовується 72-годинний стандарт.",
    threshold_en: "Incidents affecting personal data of Ukrainian residents, especially special-category or large-scale.",
    threshold_uk: "Інциденти, що зачіпають персональні дані резидентів України, особливо особливі категорії або масштабні.",
    subjectNotification_en: "Notify affected individuals where the incident poses a real risk to their rights.",
    subjectNotification_uk: "Повідомити зачеплених осіб, якщо інцидент створює реальний ризик для їхніх прав.",
  },
];

// ── Customer notification template (Art. 34) ────────────────────────────────────

/**
 * Template fields for the customer / data-subject notification.
 * Поля шаблону повідомлення клієнта / суб'єкта даних.
 */
export interface CustomerNotificationTemplate {
  subject_en: string;
  subject_uk: string;
  /** Plain-language body. / Текст зрозумілою мовою. */
  body_en: string;
  body_uk: string;
  /** Required content elements per Art. 34(2). / Обов'язкові елементи за Ст. 34(2). */
  requiredElements_en: string[];
  requiredElements_uk: string[];
}

export const CUSTOMER_NOTIFICATION_TEMPLATE: CustomerNotificationTemplate = {
  subject_en: "Important security notice regarding your Aegis Lens account",
  subject_uk: "Важливе повідомлення про безпеку щодо вашого облікового запису Aegis Lens",
  body_en:
    "We are writing to inform you of a security incident that may have affected your personal data. On [DATE], we became aware that [SHORT DESCRIPTION OF WHAT HAPPENED]. The data that may have been affected includes [DATA CATEGORIES]. We have no evidence that [CLARIFY WHAT IS NOT AFFECTED]. We have already [CONTAINMENT ACTIONS TAKEN] and are working with [SECURITY/LEGAL PARTNERS]. The likely consequences for you are [CONSEQUENCES]. To protect yourself, we recommend you [CONCRETE STEPS: reset password, enable 2FA, watch for phishing]. You can contact our Data Protection Officer at dpo@aegislens.example with any questions, and you have the right to lodge a complaint with your supervisory authority. We are sorry this happened and are committed to keeping you informed.",
  body_uk:
    "Повідомляємо вас про інцидент безпеки, який міг зачепити ваші персональні дані. [ДАТА] нам стало відомо, що [КОРОТКИЙ ОПИС ТОГО, ЩО СТАЛОСЯ]. Дані, які могли бути зачеплені, включають [КАТЕГОРІЇ ДАНИХ]. Ми не маємо доказів того, що [УТОЧНІТЬ, ЩО НЕ ЗАЧЕПЛЕНО]. Ми вже [ВЖИТІ ЗАХОДИ ЛОКАЛІЗАЦІЇ] та співпрацюємо з [ПАРТНЕРИ З БЕЗПЕКИ/ЮРИСТИ]. Ймовірні наслідки для вас: [НАСЛІДКИ]. Для свого захисту радимо вам [КОНКРЕТНІ КРОКИ: змінити пароль, увімкнути 2FA, остерігатися фішингу]. Ви можете звернутися до нашого Уповноваженого із захисту даних за адресою dpo@aegislens.example з будь-якими запитаннями та маєте право подати скаргу до свого наглядового органу. Нам прикро, що це сталося, і ми зобов'язуємося інформувати вас.",
  requiredElements_en: [
    "Nature of the breach in clear and plain language",
    "Name and contact details of the Data Protection Officer",
    "Likely consequences of the breach",
    "Measures taken or proposed to address the breach and mitigate its effects",
  ],
  requiredElements_uk: [
    "Характер порушення зрозумілою та простою мовою",
    "Ім'я та контактні дані Уповноваженого із захисту даних",
    "Ймовірні наслідки порушення",
    "Заходи, вжиті або запропоновані для усунення порушення та пом'якшення наслідків",
  ],
};

// ── Internal escalation chain ───────────────────────────────────────────────────

/**
 * One step in the detect → DPO → counsel → notify escalation chain.
 * Один крок у ланцюзі ескалації: виявлення → DPO → юрист → сповіщення.
 */
export interface EscalationStep {
  order: number;
  role_en: string;
  role_uk: string;
  /** Maximum time-box for this step inside the 72h window. / Максимальний таймбокс кроку в межах 72 год. */
  targetWindow_en: string;
  targetWindow_uk: string;
  action_en: string;
  action_uk: string;
}

export const ESCALATION_CHAIN: EscalationStep[] = [
  {
    order: 1,
    role_en: "Detection — on-call engineer / SIEM alert / external report",
    role_uk: "Виявлення — черговий інженер / сигнал SIEM / зовнішнє повідомлення",
    targetWindow_en: "Immediately (T+0)",
    targetWindow_uk: "Негайно (T+0)",
    action_en:
      "Open a sev-1 incident, log the UTC detection timestamp, preserve evidence (do not wipe logs), and page the incident lead. Begin containment.",
    action_uk:
      "Відкрити інцидент рівня sev-1, зафіксувати мітку часу виявлення UTC, зберегти докази (не видаляти журнали) та викликати керівника інциденту. Розпочати локалізацію.",
  },
  {
    order: 2,
    role_en: "Incident Lead → Data Protection Officer (DPO)",
    role_uk: "Керівник інциденту → Уповноважений із захисту даних (DPO)",
    targetWindow_en: "Within 4 hours of detection",
    targetWindow_uk: "Протягом 4 годин з моменту виявлення",
    action_en:
      "DPO assesses whether personal data is affected, makes the formal 'awareness' determination (starting the Art. 33 clock), and classifies likely risk to data subjects (none / low / high).",
    action_uk:
      "DPO оцінює, чи зачеплено персональні дані, ухвалює офіційне рішення щодо «обізнаності» (запускаючи відлік за Ст. 33) та класифікує ймовірний ризик для суб'єктів даних (відсутній / низький / високий).",
  },
  {
    order: 3,
    role_en: "DPO → Legal Counsel (in-house + external privacy counsel)",
    role_uk: "DPO → Юридичний радник (внутрішній + зовнішній радник з приватності)",
    targetWindow_en: "Within 12 hours of detection",
    targetWindow_uk: "Протягом 12 годин з моменту виявлення",
    action_en:
      "Counsel maps the jurisdictional matrix (which SAs, state AGs, ICO, Ukraine), drafts/approves notifications, and advises on phased filing. Executive leadership is briefed in parallel.",
    action_uk:
      "Юрист зіставляє юрисдикційну матрицю (які наглядові органи, генпрокурори штатів, ICO, Україна), готує/затверджує повідомлення та консультує щодо поетапного подання. Паралельно інформується керівництво.",
  },
  {
    order: 4,
    role_en: "Notify — authorities and (if high risk) data subjects",
    role_uk: "Сповіщення — органи та (за високого ризику) суб'єкти даних",
    targetWindow_en: "Authority within 72h; data subjects without undue delay",
    targetWindow_uk: "Орган протягом 72 год; суб'єкти даних без невиправданої затримки",
    action_en:
      "Submit authority notifications (initial or full), dispatch customer notifications using the approved template, publish a status page if appropriate, and record everything in the breach register.",
    action_uk:
      "Подати повідомлення органам (початкове або повне), надіслати повідомлення клієнтам за затвердженим шаблоном, опублікувати сторінку статусу за потреби та зафіксувати все в реєстрі порушень.",
  },
];

// ── Yearly tabletop drill spec ──────────────────────────────────────────────────

/**
 * Specification for the annual breach-response tabletop exercise.
 * Специфікація щорічних настільних навчань з реагування на порушення.
 */
export interface TabletopDrillSpec {
  cadence_en: string;
  cadence_uk: string;
  participants_en: string[];
  participants_uk: string[];
  scenarios_en: string[];
  scenarios_uk: string[];
  successCriteria_en: string[];
  successCriteria_uk: string[];
}

export const TABLETOP_DRILL: TabletopDrillSpec = {
  cadence_en: "Conducted at least once per calendar year, plus an unscheduled drill after any major architecture change.",
  cadence_uk: "Проводяться щонайменше раз на календарний рік, плюс позапланові навчання після будь-якої значної зміни архітектури.",
  participants_en: ["DPO", "Incident Lead / Security", "In-house + external counsel", "Engineering on-call", "Communications/PR", "Executive sponsor"],
  participants_uk: ["DPO", "Керівник інциденту / Безпека", "Внутрішній + зовнішній юрист", "Черговий інженер", "Комунікації/PR", "Виконавчий спонсор"],
  scenarios_en: [
    "Credential-stuffing leads to exfiltration of account data for EU + UK + California users (multi-jurisdiction).",
    "Misconfigured object storage exposes the anti-doxxing classifier's training cache (special-category implications).",
    "Sub-processor (analytics vendor) reports a breach to us — testing the processor-to-controller notification flow.",
  ],
  scenarios_uk: [
    "Підбір облікових даних призводить до витоку даних облікових записів користувачів ЄС + Великої Британії + Каліфорнії (багатоюрисдикційність).",
    "Неправильно налаштоване об'єктне сховище відкриває кеш навчання класифікатора проти доксингу (наслідки для особливих категорій).",
    "Суб-обробник (вендор аналітики) повідомляє нам про порушення — перевірка потоку сповіщення від обробника до контролера.",
  ],
  successCriteria_en: [
    "Awareness timestamp logged and Art. 33 clock started within target window",
    "Correct jurisdictions identified from the reporting matrix",
    "Draft authority + customer notifications produced within 72h simulated time",
    "Breach register entry created with risk rationale",
    "Action items and gaps documented and assigned owners",
  ],
  successCriteria_uk: [
    "Мітку часу обізнаності зафіксовано, відлік за Ст. 33 запущено в межах цільового вікна",
    "З матриці звітування правильно визначено юрисдикції",
    "Чернетки повідомлень органам + клієнтам підготовлено в межах змодельованих 72 год",
    "Створено запис у реєстрі порушень з обґрунтуванням ризику",
    "Завдання та прогалини задокументовано і призначено відповідальних",
  ],
};

// ── Breach register schema ──────────────────────────────────────────────────────

/**
 * A single breach register entry. Every breach is recorded here — including those
 * the DPO decides do NOT meet the notification threshold (Art. 33(5)).
 *
 * Один запис реєстру порушень. Сюди заносяться всі порушення — включно з тими,
 * які DPO вирішує НЕ повідомляти (Ст. 33(5)).
 */
export interface BreachRegisterEntry {
  /** Unique incident id. / Унікальний ідентифікатор інциденту. */
  id: string;
  /** UTC detection timestamp. / Мітка часу виявлення UTC. */
  detectedAt: string;
  /** UTC awareness determination (starts the clock). / Момент визначення обізнаності (запускає відлік). */
  awareAt: string;
  /** Short factual summary. / Короткий фактичний опис. */
  summary_en: string;
  summary_uk: string;
  /** Categories of personal data involved. / Категорії зачеплених персональних даних. */
  dataCategories: string[];
  /** Approximate number of data subjects and records. / Приблизна кількість суб'єктів даних і записів. */
  approxSubjects: number | null;
  approxRecords: number | null;
  /** Risk classification. / Класифікація ризику. */
  riskLevel: "none" | "low" | "high";
  /** Rationale for the risk decision (always recorded). / Обґрунтування рішення про ризик (фіксується завжди). */
  riskRationale_en: string;
  riskRationale_uk: string;
  /** Whether each obligation was triggered. / Чи спрацювало кожне зобов'язання. */
  notifiedAuthority: boolean;
  notifiedSubjects: boolean;
  /** If not notified, why. / Якщо не сповіщено — чому. */
  nonNotificationReason_en: string | null;
  nonNotificationReason_uk: string | null;
  /** Jurisdictions engaged. / Залучені юрисдикції. */
  jurisdictions: JurisdictionReportingRule["jurisdiction"][];
  /** Containment + remediation actions. / Заходи локалізації та усунення. */
  remediation_en: string;
  remediation_uk: string;
  /** Status. / Статус. */
  status: "open" | "contained" | "closed";
}

/**
 * Example register entry illustrating a contained, non-notifiable incident
 * that is still recorded per Art. 33(5).
 * Приклад запису реєстру: локалізований інцидент без обов'язку сповіщення,
 * який усе одно фіксується за Ст. 33(5).
 */
export const BREACH_REGISTER_EXAMPLE: BreachRegisterEntry = {
  id: "BR-2026-0007",
  detectedAt: "2026-03-14T08:21:00Z",
  awareAt: "2026-03-14T09:05:00Z",
  summary_en:
    "An internal analyst's laptop was lost; the disk was full-disk encrypted and the device was remotely wiped before any access. A small encrypted local cache of analyst notes (no special-category data) was present.",
  summary_uk:
    "Загублено ноутбук внутрішнього аналітика; диск був повністю зашифрований, пристрій віддалено очищено до будь-якого доступу. Був присутній невеликий зашифрований локальний кеш нотаток аналітика (без даних особливих категорій).",
  dataCategories: ["internal analyst notes", "no special-category data"],
  approxSubjects: 0,
  approxRecords: 0,
  riskLevel: "none",
  riskRationale_en:
    "Device was full-disk encrypted with a strong key not present on the device and was remotely wiped; no evidence of access. Breach unlikely to result in a risk to rights and freedoms — authority notification not required. Recorded per Art. 33(5).",
  riskRationale_uk:
    "Пристрій був повністю зашифрований сильним ключем, який не зберігався на пристрої, та віддалено очищений; докази доступу відсутні. Порушення навряд чи призведе до ризику для прав і свобод — сповіщення органу не потрібне. Зафіксовано за Ст. 33(5).",
  notifiedAuthority: false,
  notifiedSubjects: false,
  nonNotificationReason_en:
    "Strong encryption rendered data inaccessible; risk to data subjects assessed as none.",
  nonNotificationReason_uk:
    "Сильне шифрування зробило дані недоступними; ризик для суб'єктів даних оцінено як відсутній.",
  jurisdictions: ["eu-lead-sa"],
  remediation_en:
    "Confirmed remote wipe, rotated the analyst's credentials and tokens, reviewed device-encryption enforcement across the fleet, and reminded staff of the lost-device reporting procedure.",
  remediation_uk:
    "Підтверджено віддалене очищення, ротовано облікові дані й токени аналітика, переглянуто примусове шифрування пристроїв по всьому парку та нагадано персоналу процедуру повідомлення про втрату пристрою.",
  status: "closed",
};
