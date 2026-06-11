/**
 * Internal Handbook configuration — single source for "how we work".
 * Конфігурація внутрішнього довідника — єдине джерело «як ми працюємо».
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** All sections of the internal handbook. */
export type HandbookSection =
  | "company-values"
  | "engineering"
  | "sales"
  | "support"
  | "hiring"
  | "compensation"
  | "remote-policy"
  | "decision-making"
  | "communication-norms"
  | "security-training";

/** Full configuration for a single handbook section. */
export interface HandbookSectionConfig {
  id: HandbookSection;
  name_en: string;
  name_uk: string;
  owner_en: string;
  owner_uk: string;
  linkedModules_en: string[];
  reviewFrequency_en: string;
  reviewFrequency_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ── Section Configs ───────────────────────────────────────────────────────────

export const HANDBOOK_SECTIONS: HandbookSectionConfig[] = [
  {
    id: "company-values",
    name_en: "Company Values, Mission & Vision",
    name_uk: "Цінності компанії, місія та бачення",
    owner_en: "CEO / Founders",
    owner_uk: "Генеральний директор / Засновники",
    linkedModules_en: ["/handbook/company-values", "/handbook/decision-making"],
    reviewFrequency_en: "Annually or on major strategic pivot",
    reviewFrequency_uk: "Щорічно або при суттєвій зміні стратегії",
    notes_en:
      "Core values: honesty, speed, mission-focus, security-mindset. Mission: provide verified open-source intelligence to protect civilians and democratic institutions. Vision: the most trusted AI-OSINT platform in Europe.",
    notes_uk:
      "Основні цінності: чесність, швидкість, орієнтація на місію, безпековий менталітет. Місія: надавати перевірену розвідку з відкритих джерел для захисту цивільних та демократичних інституцій. Бачення: найбільш довірена AI-OSINT платформа в Європі.",
  },
  {
    id: "engineering",
    name_en: "Engineering Handbook",
    name_uk: "Інженерний довідник",
    owner_en: "CTO",
    owner_uk: "Технічний директор",
    linkedModules_en: [
      "/handbook/engineering",
      "../internal_docs/TODO_engineering_handbook.md",
    ],
    reviewFrequency_en: "Quarterly",
    reviewFrequency_uk: "Щоквартально",
    notes_en:
      "Covers architecture decisions, coding standards, PR review process, on-call rotations, incident response, and post-mortem culture. See engineering handbook reference for full detail.",
    notes_uk:
      "Охоплює архітектурні рішення, стандарти коду, процес перегляду PR, чергування, реагування на інциденти та культуру пост-мортемів. Детальніше — в посиланні на інженерний довідник.",
  },
  {
    id: "sales",
    name_en: "Sales Playbook",
    name_uk: "Посібник з продажів",
    owner_en: "VP Sales",
    owner_uk: "Віцепрезидент з продажів",
    linkedModules_en: ["/handbook/sales", "/handbook/compensation"],
    reviewFrequency_en: "Quarterly",
    reviewFrequency_uk: "Щоквартально",
    notes_en:
      "Covers ICP definition, qualification criteria (MEDDIC), demo flow, objection handling, contract process, and expansion playbook. See sales playbook reference for full scripts.",
    notes_uk:
      "Охоплює визначення ICP, критерії кваліфікації (MEDDIC), потік демонстрацій, обробку заперечень, процес укладання договорів та стратегію розширення. Детальніше — в посиланні на посібник з продажів.",
  },
  {
    id: "support",
    name_en: "Support Playbook",
    name_uk: "Посібник з підтримки",
    owner_en: "Head of Support",
    owner_uk: "Керівник підтримки",
    linkedModules_en: [
      "/handbook/support",
      "../support/TODO_support_strategy.md",
    ],
    reviewFrequency_en: "Quarterly",
    reviewFrequency_uk: "Щоквартально",
    notes_en:
      "Covers ticket triage, SLA tiers (P1–P4), escalation paths, customer communication templates, and knowledge-base contribution process. See support strategy reference for full detail.",
    notes_uk:
      "Охоплює сортування тікетів, рівні SLA (P1–P4), шляхи ескалації, шаблони комунікації з клієнтами та процес поповнення бази знань. Детальніше — в посиланні на стратегію підтримки.",
  },
  {
    id: "hiring",
    name_en: "Hiring Rubrics",
    name_uk: "Рубрики найму",
    owner_en: "Recruiting Lead",
    owner_uk: "Керівник рекрутингу",
    linkedModules_en: ["/handbook/hiring", "/handbook/compensation"],
    reviewFrequency_en: "Per role on opening; audited annually",
    reviewFrequency_uk: "При кожному відкритті вакансії; щорічний аудит",
    notes_en:
      "Per-role interview rubrics with structured scorecards. Covers technical, behavioural, and values-fit dimensions. Blind CV review encouraged to reduce bias.",
    notes_uk:
      "Рубрики співбесіди з структурованими картками оцінювання для кожної ролі. Охоплює технічний, поведінковий та ціннісний аспекти. Рекомендується сліпий перегляд CV для зниження упередженості.",
  },
  {
    id: "compensation",
    name_en: "Compensation Philosophy",
    name_uk: "Філософія компенсацій",
    owner_en: "HR",
    owner_uk: "Відділ кадрів",
    linkedModules_en: ["/handbook/compensation", "/handbook/hiring"],
    reviewFrequency_en: "Annually (or when market data refreshed)",
    reviewFrequency_uk: "Щорічно (або при оновленні ринкових даних)",
    notes_en:
      "Philosophy: market-rate cash (50th–75th percentile of peer group) + equity; no negotiation-based pay gaps — offers are formula-driven to ensure fairness. Transparent bands shared with employees.",
    notes_uk:
      "Філософія: грошова винагорода на рівні ринку (50-й–75-й перцентиль групи аналогів) + опціони; відсутність різниці в оплаті через переговори — пропозиції базуються на формулі для забезпечення справедливості. Прозорі діапазони виплат доступні співробітникам.",
  },
  {
    id: "remote-policy",
    name_en: "Remote & Travel Policy",
    name_uk: "Політика дистанційної роботи та відряджень",
    owner_en: "Operations",
    owner_uk: "Операційний відділ",
    linkedModules_en: ["/handbook/remote-policy", "/handbook/communication-norms"],
    reviewFrequency_en: "Annually",
    reviewFrequency_uk: "Щорічно",
    notes_en:
      "Remote-first, async-first company. Required overlap hours: 10:00–14:00 UTC (team core hours). Co-location sprints twice per year. Travel expense policy: economy class for flights under 4 hours; business class for longer; approved in advance via Ops.",
    notes_uk:
      "Компанія з пріоритетом дистанційної та асинхронної роботи. Обов'язковий час перекриття: 10:00–14:00 UTC (основні командні години). Спринти зі спільним перебуванням двічі на рік. Політика витрат на відрядження: економ-клас для рейсів до 4 годин; бізнес-клас для тривалих; попереднє схвалення через операційний відділ.",
  },
  {
    id: "decision-making",
    name_en: "Decision-Making Framework",
    name_uk: "Фреймворк прийняття рішень",
    owner_en: "CEO",
    owner_uk: "Генеральний директор",
    linkedModules_en: ["/handbook/decision-making", "/handbook/company-values"],
    reviewFrequency_en: "Annually",
    reviewFrequency_uk: "Щорічно",
    notes_en:
      "Primary framework: RAPID (Recommend / Agree / Perform / Input / Decide). DACI used for cross-functional projects (Driver / Approver / Contributor / Informed). Document decisions in the decision log with context and trade-offs.",
    notes_uk:
      "Основний фреймворк: RAPID (Рекомендує / Погоджує / Виконує / Надає інформацію / Вирішує). DACI використовується для міжфункціональних проєктів (Ведучий / Затверджуючий / Учасник / Інформований). Рішення документуються в журналі рішень з контекстом та компромісами.",
  },
  {
    id: "communication-norms",
    name_en: "Communication Norms",
    name_uk: "Норми комунікації",
    owner_en: "Operations",
    owner_uk: "Операційний відділ",
    linkedModules_en: [
      "/handbook/communication-norms",
      "/handbook/remote-policy",
    ],
    reviewFrequency_en: "Annually",
    reviewFrequency_uk: "Щорічно",
    notes_en:
      "Async-first: default to written async for non-urgent communication. Sync meetings require an agenda and produce notes. " +
      "Slack response SLAs: urgent/blocker within 1 hour; standard within 24 hours; non-urgent within 72 hours. " +
      "Meeting-free blocks: Tuesday & Thursday mornings reserved for deep work.",
    notes_uk:
      "Асинхронний пріоритет: за замовчуванням письмова асинхронна комунікація для неTerminal запитів. Синхронні зустрічі потребують порядку денного та супроводжуються нотатками. " +
      "SLA Slack-відповідей: терміново/блокер — протягом 1 години; стандарт — протягом 24 годин; несрочне — протягом 72 годин. " +
      "Блоки без зустрічей: ранки вівторка та четверга зарезервовані для глибокої роботи.",
  },
  {
    id: "security-training",
    name_en: "Security Training Basics",
    name_uk: "Основи навчання безпеці",
    owner_en: "SecOps",
    owner_uk: "Відділ безпеки операцій",
    linkedModules_en: ["/handbook/security-training", "/handbook/remote-policy"],
    reviewFrequency_en: "Bi-annually (plus on major threat advisories)",
    reviewFrequency_uk:
      "Двічі на рік (а також при важливих попередженнях про загрози)",
    notes_en:
      "Mandatory for all employees within 30 days of joining. Topics: password hygiene (passphrase + password manager), phishing awareness (simulated attacks quarterly), device encryption (full-disk required), OpSec basics (need-to-know, data classification, secure comms). Annual refresher required.",
    notes_uk:
      "Обов'язково для всіх співробітників протягом 30 днів після приєднання. Теми: гігієна паролів (парольна фраза + менеджер паролів), обізнаність щодо фішингу (симульовані атаки щоквартально), шифрування пристрою (повний диск обов'язково), основи OpSec (принцип мінімальних привілеїв, класифікація даних, захищені комунікації). Щорічне оновлення знань обов'язкове.",
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const HANDBOOK_COMPOUND_NOTE_EN =
  "Handbooks compound. Write once, reference forever. " +
  "The handbook is a living document — keep it current, not archival. " +
  "When a policy changes, update the handbook on the same day. " +
  "Cross-link sections liberally; avoid duplication by referencing the authoritative section.";

export const HANDBOOK_COMPOUND_NOTE_UK =
  "Довідники накопичуються. Написати один раз, посилатись вічно. " +
  "Довідник — живий документ, підтримуйте його актуальним, а не архівним. " +
  "При зміні політики оновлюйте довідник того ж дня. " +
  "Вільно перехресно посилайтесь між розділами; уникайте дублювання, посилаючись на авторитетний розділ.";

export const HANDBOOK_DECISION_FRAMEWORK_EN =
  "RAPID: Recommend (proposes the decision with supporting analysis), Agree (must sign off before decision is final), Perform (executes the decision), Input (consulted for information but does not block), Decide (has final authority and is accountable for the outcome). " +
  "DACI: Driver (moves the project forward), Approver (has final say), Contributor (provides expertise), Informed (kept in the loop, no vote). " +
  "Use RAPID for operational decisions; DACI for cross-functional project ownership.";

export const HANDBOOK_DECISION_FRAMEWORK_UK =
  "RAPID: Recommend (пропонує рішення з обґрунтуванням), Agree (повинен підписати перед ухваленням рішення), Perform (виконує рішення), Input (консультується для надання інформації, але не блокує), Decide (має остаточні повноваження та несе відповідальність за результат). " +
  "DACI: Driver (рухає проєкт вперед), Approver (має остаточне слово), Contributor (надає експертизу), Informed (отримує інформацію, без голосу). " +
  "Використовуйте RAPID для операційних рішень; DACI для міжфункціонального управління проєктами.";

export const HANDBOOK_COMMS_SLO_EN =
  "Communication SLAs by urgency level: " +
  "URGENT / BLOCKER: respond within 1 hour (use @here in Slack or direct call if Slack is unavailable). " +
  "STANDARD: respond within 24 hours. " +
  "NON-URGENT: respond within 72 hours. " +
  "Out-of-office: set Slack status and auto-reply with return date and backup contact. " +
  "Do not expect immediate replies outside these SLAs; respect async-first culture.";

export const HANDBOOK_COMMS_SLO_UK =
  "SLA комунікацій за рівнем терміновості: " +
  "ТЕРМІНОВЕ / БЛОКУЮЧЕ: відповідь протягом 1 години (використовуйте @here у Slack або прямий дзвінок, якщо Slack недоступний). " +
  "СТАНДАРТНЕ: відповідь протягом 24 годин. " +
  "НЕТЕРМІНОВЕ: відповідь протягом 72 годин. " +
  "Відсутність в офісі: встановіть статус Slack та авто-відповідь з датою повернення та контактом замісника. " +
  "Не очікуйте негайних відповідей поза цими SLA; поважайте культуру асинхронного пріоритету.";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the HandbookSectionConfig for the given section id, or undefined if not found.
 * Повертає HandbookSectionConfig для вказаного id розділу, або undefined якщо не знайдено.
 */
export function getHandbookSection(
  id: HandbookSection,
): HandbookSectionConfig | undefined {
  return HANDBOOK_SECTIONS.find((s) => s.id === id);
}
