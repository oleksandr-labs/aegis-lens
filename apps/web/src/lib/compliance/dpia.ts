/**
 * Data Protection Impact Assessment (DPIA) — GDPR Art. 35 framework. Defines the
 * trigger criteria that make a DPIA mandatory for this platform (AI-driven
 * decisions, large-scale special-category processing, systematic public
 * monitoring, the anti-doxxing classifier and face/plate detection) and the full
 * DPIA template sections (processing description, necessity & proportionality,
 * risk to data subjects, mitigations, consultation, approval).
 *
 * Оцінка впливу на захист даних (DPIA) — рамка Ст. 35 GDPR. Визначає критерії, що
 * роблять DPIA обов'язковою для цієї платформи (рішення на основі ШІ, масштабна
 * обробка особливих категорій, систематичний моніторинг публічних просторів,
 * класифікатор проти доксингу та розпізнавання облич/номерів) та повні розділи
 * шаблону DPIA (опис обробки, необхідність і пропорційність, ризик для суб'єктів
 * даних, пом'якшення, консультації, затвердження).
 */

// ── DPIA trigger criteria ───────────────────────────────────────────────────────

/** Identifier for each DPIA trigger relevant to the platform. / Ідентифікатор тригера. */
export type DpiaTrigger =
  | "ai-driven-decisions"
  | "special-category-large-scale"
  | "systematic-public-monitoring"
  | "anti-doxxing-face-plate";

/**
 * A criterion that makes a DPIA mandatory under Art. 35(3) and WP248 guidance.
 * Критерій, що робить DPIA обов'язковою за Ст. 35(3) та настановами WP248.
 */
export interface DpiaTriggerCriterion {
  id: DpiaTrigger;
  title_en: string;
  title_uk: string;
  /** Why it triggers a DPIA. / Чому ініціює DPIA. */
  rationale_en: string;
  rationale_uk: string;
  /** Concrete platform features this applies to. / Конкретні функції платформи. */
  examples_en: string[];
  examples_uk: string[];
}

export const DPIA_TRIGGERS: DpiaTriggerCriterion[] = [
  {
    id: "ai-driven-decisions",
    title_en: "AI-driven decisions affecting individuals",
    title_uk: "Рішення на основі ШІ, що впливають на осіб",
    rationale_en:
      "Automated or AI-assisted evaluation, scoring, or classification that produces effects on natural persons triggers a DPIA under Art. 35(3)(a). Even where a human reviews the output, the systematic AI evaluation itself is high-risk.",
    rationale_uk:
      "Автоматизована або підтримана ШІ оцінка, скоринг чи класифікація, що спричиняє наслідки для фізичних осіб, ініціює DPIA за Ст. 35(3)(a). Навіть якщо людина переглядає результат, сама систематична оцінка ШІ є високоризиковою.",
    examples_en: [
      "AI classification of whether content constitutes doxxing or a credible threat",
      "Confidence scoring of geolocation and entity-resolution outputs that inform analyst action",
    ],
    examples_uk: [
      "Класифікація ШІ, чи є контент доксингом або достовірною загрозою",
      "Скоринг достовірності результатів геолокації та розпізнавання сутностей, що визначає дії аналітика",
    ],
  },
  {
    id: "special-category-large-scale",
    title_en: "Large-scale processing of special-category data",
    title_uk: "Масштабна обробка даних особливих категорій",
    rationale_en:
      "Large-scale processing of special categories (Art. 9) — e.g. data revealing political opinions, ethnicity, or biometric data for identification — triggers a mandatory DPIA under Art. 35(3)(b).",
    rationale_uk:
      "Масштабна обробка особливих категорій (Ст. 9) — напр. дані, що розкривають політичні погляди, етнічність або біометричні дані для ідентифікації — ініціює обов'язкову DPIA за Ст. 35(3)(b).",
    examples_en: [
      "Aggregation of open-source content that may incidentally reveal political affiliation or ethnicity",
      "Biometric processing implied by face detection in imagery at scale",
    ],
    examples_uk: [
      "Агрегація контенту з відкритих джерел, що може випадково розкрити політичну приналежність чи етнічність",
      "Біометрична обробка, що випливає з розпізнавання облич на зображеннях у масштабі",
    ],
  },
  {
    id: "systematic-public-monitoring",
    title_en: "Systematic monitoring of publicly accessible areas",
    title_uk: "Систематичний моніторинг публічно доступних територій",
    rationale_en:
      "Systematic monitoring of a publicly accessible area on a large scale triggers a DPIA under Art. 35(3)(c). Continuous ingestion and analysis of public imagery and social signals over geographies falls squarely within this.",
    rationale_uk:
      "Систематичний моніторинг публічно доступної території у великому масштабі ініціює DPIA за Ст. 35(3)(c). Безперервне поглинання та аналіз публічних зображень і соціальних сигналів за географіями повністю підпадає під це.",
    examples_en: [
      "Continuous monitoring of public social-media feeds and imagery across regions",
      "Satellite/aerial imagery analysis pipelines covering populated areas",
    ],
    examples_uk: [
      "Безперервний моніторинг публічних стрічок соцмереж та зображень за регіонами",
      "Конвеєри аналізу супутникових/аерознімків населених територій",
    ],
  },
  {
    id: "anti-doxxing-face-plate",
    title_en: "Anti-doxxing classifier, face & license-plate detection",
    title_uk: "Класифікатор проти доксингу, розпізнавання облич та номерних знаків",
    rationale_en:
      "These features combine several high-risk indicators (innovative technology, evaluation/scoring, biometric-adjacent processing, vulnerable subjects). A standalone DPIA is mandatory and must be revisited whenever the model or its use changes.",
    rationale_uk:
      "Ці функції поєднують кілька високоризикових індикаторів (інноваційна технологія, оцінка/скоринг, обробка, суміжна з біометрією, вразливі суб'єкти). Окрема DPIA є обов'язковою та має переглядатися щоразу при зміні моделі чи її використання.",
    examples_en: [
      "The anti-doxxing classifier that flags content exposing private individuals' identities or locations",
      "Face blurring/detection and license-plate detection applied to protect bystanders before publication",
    ],
    examples_uk: [
      "Класифікатор проти доксингу, що позначає контент, який розкриває особу чи місцезнаходження приватних осіб",
      "Розмиття/розпізнавання облич та розпізнавання номерних знаків для захисту випадкових людей перед публікацією",
    ],
  },
];

/**
 * Returns true if any processing description matches a known high-risk trigger.
 * Helper for routing new features into the DPIA workflow.
 * Повертає true, якщо опис обробки відповідає відомому високоризиковому тригеру.
 */
export function dpiaRequired(triggers: DpiaTrigger[]): boolean {
  return triggers.length > 0;
}

// ── DPIA template ───────────────────────────────────────────────────────────────

/** A DPIA template section. / Розділ шаблону DPIA. */
export interface DpiaSection {
  id:
    | "processing-description"
    | "necessity-proportionality"
    | "risk-to-subjects"
    | "mitigations"
    | "consultation"
    | "approval";
  heading_en: string;
  heading_uk: string;
  /** What to fill in. / Що заповнити. */
  guidance_en: string;
  guidance_uk: string;
  /** Prompts the author must answer. / Запитання, на які має відповісти автор. */
  prompts_en: string[];
  prompts_uk: string[];
}

export const DPIA_TEMPLATE: DpiaSection[] = [
  {
    id: "processing-description",
    heading_en: "1. Description of the processing",
    heading_uk: "1. Опис обробки",
    guidance_en:
      "Describe the nature, scope, context, and purposes of the processing, the data flows, data categories and subjects, recipients, retention periods, and the technologies involved.",
    guidance_uk:
      "Описати характер, обсяг, контекст і цілі обробки, потоки даних, категорії даних і суб'єктів, одержувачів, строки зберігання та задіяні технології.",
    prompts_en: [
      "What personal data is collected, from where, and at what volume?",
      "Who are the data subjects and are any of them vulnerable?",
      "Which systems, models, and third parties are involved end to end?",
    ],
    prompts_uk: [
      "Які персональні дані збираються, звідки та в якому обсязі?",
      "Хто є суб'єктами даних і чи є серед них вразливі?",
      "Які системи, моделі та треті сторони задіяні від початку до кінця?",
    ],
  },
  {
    id: "necessity-proportionality",
    heading_en: "2. Necessity and proportionality",
    heading_uk: "2. Необхідність і пропорційність",
    guidance_en:
      "Justify the lawful basis, show that the processing is necessary for the stated purpose and that less intrusive alternatives were considered, and confirm data minimization and accuracy measures.",
    guidance_uk:
      "Обґрунтувати правову підставу, показати, що обробка необхідна для заявленої мети та що розглядалися менш інтрузивні альтернативи, і підтвердити заходи мінімізації даних та точності.",
    prompts_en: [
      "What is the lawful basis and, for special categories, the Art. 9 condition?",
      "Could the purpose be achieved with less data or less identifiability?",
      "How is accuracy and data minimization enforced?",
    ],
    prompts_uk: [
      "Яка правова підстава і, для особливих категорій, умова за Ст. 9?",
      "Чи можна досягти мети з меншою кількістю даних або меншою ідентифікованістю?",
      "Як забезпечуються точність та мінімізація даних?",
    ],
  },
  {
    id: "risk-to-subjects",
    heading_en: "3. Risks to the rights and freedoms of data subjects",
    heading_uk: "3. Ризики для прав і свобод суб'єктів даних",
    guidance_en:
      "Identify and rate risks (likelihood × severity): re-identification, doxxing/physical harm, discrimination, AI error or bias, function creep, and unlawful access. Consider risks specific to vulnerable individuals.",
    guidance_uk:
      "Виявити та оцінити ризики (ймовірність × серйозність): повторну ідентифікацію, доксинг/фізичну шкоду, дискримінацію, помилку чи упередженість ШІ, розширення функцій та незаконний доступ. Врахувати ризики, специфічні для вразливих осіб.",
    prompts_en: [
      "What is the worst-case harm to an individual if the system errs or is misused?",
      "How likely is re-identification or exposure of a private individual?",
      "What is the risk of biased or inaccurate AI output and its consequences?",
    ],
    prompts_uk: [
      "Яка найгірша шкода для особи, якщо система помиляється або зловживається?",
      "Наскільки ймовірна повторна ідентифікація чи розкриття приватної особи?",
      "Який ризик упередженого чи неточного виводу ШІ та його наслідки?",
    ],
  },
  {
    id: "mitigations",
    heading_en: "4. Measures to address the risks (mitigations)",
    heading_uk: "4. Заходи для усунення ризиків (пом'якшення)",
    guidance_en:
      "List the technical and organizational measures that reduce each identified risk to an acceptable level, with the residual risk recorded after mitigation.",
    guidance_uk:
      "Перелічити технічні та організаційні заходи, що знижують кожен виявлений ризик до прийнятного рівня, із зафіксованим залишковим ризиком після пом'якшення.",
    prompts_en: [
      "What measures protect individuals (face/plate blurring, human review, thresholds, access controls)?",
      "How is AI accuracy monitored and how are errors corrected and retracted?",
      "What is the residual risk and is it acceptable?",
    ],
    prompts_uk: [
      "Які заходи захищають осіб (розмиття облич/номерів, людський огляд, пороги, контроль доступу)?",
      "Як моніториться точність ШІ та як виправляються й відкликаються помилки?",
      "Який залишковий ризик і чи є він прийнятним?",
    ],
  },
  {
    id: "consultation",
    heading_en: "5. Consultation",
    heading_uk: "5. Консультації",
    guidance_en:
      "Record consultation with the DPO (mandatory), with affected data subjects or their representatives where appropriate, and — where high residual risk remains — prior consultation with the supervisory authority under Art. 36.",
    guidance_uk:
      "Зафіксувати консультацію з DPO (обов'язково), із зачепленими суб'єктами даних або їхніми представниками за потреби та — якщо лишається високий залишковий ризик — попередню консультацію з наглядовим органом за Ст. 36.",
    prompts_en: [
      "What is the DPO's documented opinion?",
      "Were data subjects' views sought, and if not, why?",
      "Does residual high risk require prior consultation with the supervisory authority?",
    ],
    prompts_uk: [
      "Яка задокументована думка DPO?",
      "Чи запитувалися погляди суб'єктів даних, і якщо ні, то чому?",
      "Чи вимагає залишковий високий ризик попередньої консультації з наглядовим органом?",
    ],
  },
  {
    id: "approval",
    heading_en: "6. Outcome and approval",
    heading_uk: "6. Результат і затвердження",
    guidance_en:
      "Record the decision (proceed / proceed with conditions / do not proceed), the approver and date, the agreed mitigations and owners, and the scheduled review date. The DPIA is a living document revisited on material change.",
    guidance_uk:
      "Зафіксувати рішення (продовжити / продовжити з умовами / не продовжувати), хто затвердив і дату, узгоджені пом'якшення та відповідальних і заплановану дату перегляду. DPIA — живий документ, що переглядається при суттєвій зміні.",
    prompts_en: [
      "Who approved the processing and on what date?",
      "What conditions or mitigations are mandatory before launch?",
      "When will the DPIA be reviewed again?",
    ],
    prompts_uk: [
      "Хто затвердив обробку та якого числа?",
      "Які умови чи пом'якшення є обов'язковими перед запуском?",
      "Коли DPIA буде переглянуто знову?",
    ],
  },
];
