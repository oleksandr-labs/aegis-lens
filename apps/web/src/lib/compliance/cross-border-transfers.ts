/**
 * Cross-Border Transfer Assessment — GDPR Chapter V framework for transfers of
 * personal data to third countries. Defines per-recipient adequacy checks, SCC
 * handling, the Transfer Impact Assessment (TIA) template, the sub-processor
 * location register, the customer-facing transfer disclosure (EN+UK), and the
 * quarterly transfer-chain review cadence.
 *
 * Оцінка транскордонної передачі — рамка Глави V GDPR для передачі персональних
 * даних до третіх країн. Визначає перевірки адекватності за одержувачами,
 * обробку SCC, шаблон Оцінки впливу передачі (TIA), реєстр розташування
 * суб-обробників, розкриття передачі для клієнтів (EN+UK) та квартальну
 * періодичність перегляду ланцюгів передачі.
 */

// ── Per-recipient adequacy check ────────────────────────────────────────────────

/** The lawful transfer mechanism relied upon. / Правовий механізм передачі. */
export type TransferMechanism =
  | "adequacy-decision"
  | "scc"
  | "bcr"
  | "derogation-art49"
  | "uk-idta"
  | "no-transfer";

/**
 * Adequacy + mechanism assessment for one recipient country/destination.
 * Оцінка адекватності та механізму для однієї країни-одержувача.
 */
export interface RecipientAdequacyCheck {
  /** Destination country / region. / Країна / регіон призначення. */
  destination: string;
  /** Is there an EU adequacy decision? / Чи є рішення ЄС про адекватність? */
  euAdequacy: "adequate" | "partial" | "none";
  /** Notes on the adequacy status. / Примітки щодо статусу адекватності. */
  adequacyNote_en: string;
  adequacyNote_uk: string;
  /** Mechanism relied on when adequacy is absent/partial. / Механізм за відсутності адекватності. */
  mechanism: TransferMechanism;
  /** Whether a TIA is required for this destination. / Чи потрібна TIA для цього призначення. */
  tiaRequired: boolean;
}

export const RECIPIENT_ADEQUACY_CHECKS: RecipientAdequacyCheck[] = [
  {
    destination: "European Union / EEA",
    euAdequacy: "adequate",
    adequacyNote_en: "Intra-EU/EEA — no Chapter V transfer occurs.",
    adequacyNote_uk: "У межах ЄС/ЄЕП — передачі за Главою V не відбувається.",
    mechanism: "no-transfer",
    tiaRequired: false,
  },
  {
    destination: "United Kingdom",
    euAdequacy: "adequate",
    adequacyNote_en: "Covered by the EU adequacy decision for the UK; transfers permitted without additional safeguards while it remains in force.",
    adequacyNote_uk: "Охоплено рішенням ЄС про адекватність для Великої Британії; передача дозволена без додаткових гарантій, доки воно чинне.",
    mechanism: "adequacy-decision",
    tiaRequired: false,
  },
  {
    destination: "United States (recipient certified under the EU-US Data Privacy Framework)",
    euAdequacy: "partial",
    adequacyNote_en: "Adequate only where the recipient is self-certified under the EU-US Data Privacy Framework; otherwise no adequacy. Verify certification per recipient.",
    adequacyNote_uk: "Адекватно лише там, де одержувач самосертифікований за EU-US Data Privacy Framework; інакше адекватності немає. Перевіряти сертифікацію за кожним одержувачем.",
    mechanism: "scc",
    tiaRequired: true,
  },
  {
    destination: "United States (recipient NOT DPF-certified)",
    euAdequacy: "none",
    adequacyNote_en: "No adequacy. Rely on Standard Contractual Clauses plus a documented Transfer Impact Assessment and supplementary measures (encryption, key control).",
    adequacyNote_uk: "Адекватності немає. Покладаємось на Стандартні договірні положення плюс задокументовану Оцінку впливу передачі та додаткові заходи (шифрування, контроль ключів).",
    mechanism: "scc",
    tiaRequired: true,
  },
  {
    destination: "Ukraine",
    euAdequacy: "none",
    adequacyNote_en: "No EU adequacy decision yet (EU accession process ongoing). Transfers to Ukrainian infrastructure rely on SCCs + TIA; given the platform's mission and Ukrainian user base, supplementary measures are applied.",
    adequacyNote_uk: "Рішення ЄС про адекватність ще немає (триває процес вступу до ЄС). Передачі до української інфраструктури спираються на SCC + TIA; з огляду на місію платформи та українську базу користувачів застосовуються додаткові заходи.",
    mechanism: "scc",
    tiaRequired: true,
  },
];

// ── SCC handling ────────────────────────────────────────────────────────────────

/**
 * How Standard Contractual Clauses are selected and operated.
 * Як обираються та застосовуються Стандартні договірні положення.
 */
export interface SccHandling {
  /** Which SCC module applies to a relationship. / Який модуль SCC застосовується. */
  moduleSelection_en: string;
  moduleSelection_uk: string;
  /** Supplementary measures applied on top of SCCs. / Додаткові заходи поверх SCC. */
  supplementaryMeasures_en: string[];
  supplementaryMeasures_uk: string[];
  /** UK transfers. / Передачі до/з Великої Британії. */
  ukAddendum_en: string;
  ukAddendum_uk: string;
}

export const SCC_HANDLING: SccHandling = {
  moduleSelection_en:
    "The correct EU Commission SCC module is selected per relationship: Module One (controller-to-controller), Module Two (controller-to-processor), Module Three (processor-to-processor), or Module Four (processor-to-controller). The data exporter, importer roles, and processing annex are completed for every executed set.",
  moduleSelection_uk:
    "Правильний модуль SCC Єврокомісії обирається для кожних відносин: Модуль Один (контролер-контролер), Модуль Два (контролер-обробник), Модуль Три (обробник-обробник) або Модуль Чотири (обробник-контролер). Для кожного укладеного комплекту заповнюються ролі експортера/імпортера даних та додаток про обробку.",
  supplementaryMeasures_en: [
    "Strong encryption in transit and at rest with keys held outside the importing jurisdiction where feasible",
    "Data minimization and pseudonymization before transfer",
    "Contractual commitments to challenge unlawful government access requests and to notify the exporter",
    "Transparency reporting of government access requests",
  ],
  supplementaryMeasures_uk: [
    "Сильне шифрування під час передачі та зберігання з ключами поза юрисдикцією імпорту, де це можливо",
    "Мінімізація даних та псевдонімізація перед передачею",
    "Договірні зобов'язання оскаржувати незаконні запити уряду на доступ та повідомляти експортера",
    "Звітність про прозорість запитів уряду на доступ",
  ],
  ukAddendum_en: "For UK-origin data, the ICO International Data Transfer Agreement (IDTA) or the UK Addendum to the EU SCCs is used.",
  ukAddendum_uk: "Для даних із Великої Британії використовується Міжнародна угода про передачу даних ICO (IDTA) або Додаток Великої Британії до SCC ЄС.",
};

// ── TIA template ────────────────────────────────────────────────────────────────

/**
 * Transfer Impact Assessment template (post-Schrems II). One TIA per transfer
 * relationship lacking adequacy.
 * Шаблон Оцінки впливу передачі (після Schrems II). Одна TIA на кожні відносини
 * передачі без адекватності.
 */
export interface TiaTemplate {
  sections_en: { heading: string; guidance: string }[];
  sections_uk: { heading: string; guidance: string }[];
}

export const TIA_TEMPLATE: TiaTemplate = {
  sections_en: [
    { heading: "Transfer mapping", guidance: "Identify data exporter, importer, onward recipients, data categories, volume, and the transfer mechanism relied upon." },
    { heading: "Legal environment of the destination", guidance: "Assess the third country's laws on government access, surveillance powers, and the availability of effective remedies for data subjects." },
    { heading: "Effectiveness of the mechanism", guidance: "Evaluate whether the SCCs/IDTA are effective in practice given the legal environment, or whether they are undermined by local law." },
    { heading: "Supplementary measures", guidance: "Identify technical, contractual, and organizational measures that close any gap (encryption with exporter-held keys, pseudonymization, challenge-and-notify clauses)." },
    { heading: "Residual risk & decision", guidance: "Document residual risk, the decision to proceed/suspend, and the DPO's sign-off. Set a re-assessment date." },
  ],
  sections_uk: [
    { heading: "Картування передачі", guidance: "Визначити експортера даних, імпортера, подальших одержувачів, категорії даних, обсяг та використовуваний механізм передачі." },
    { heading: "Правове середовище призначення", guidance: "Оцінити закони третьої країни щодо доступу уряду, повноважень спостереження та наявності ефективних засобів правового захисту для суб'єктів даних." },
    { heading: "Ефективність механізму", guidance: "Оцінити, чи SCC/IDTA ефективні на практиці з огляду на правове середовище, чи підриваються місцевим законодавством." },
    { heading: "Додаткові заходи", guidance: "Визначити технічні, договірні та організаційні заходи, що усувають прогалину (шифрування з ключами в експортера, псевдонімізація, положення про оскарження-та-сповіщення)." },
    { heading: "Залишковий ризик та рішення", guidance: "Задокументувати залишковий ризик, рішення продовжити/призупинити та погодження DPO. Встановити дату повторної оцінки." },
  ],
};

// ── Sub-processor location register ─────────────────────────────────────────────

/**
 * A sub-processor and where it processes data.
 * Суб-обробник та місце обробки ним даних.
 */
export interface SubProcessorRecord {
  name: string;
  /** What service it provides. / Яку послугу надає. */
  service_en: string;
  service_uk: string;
  /** Country/region of processing. / Країна/регіон обробки. */
  processingLocation: string;
  /** Transfer mechanism for this sub-processor. / Механізм передачі. */
  mechanism: TransferMechanism;
}

export const SUB_PROCESSOR_REGISTER: SubProcessorRecord[] = [
  {
    name: "Hetzner Online GmbH",
    service_en: "Primary hosting and compute infrastructure.",
    service_uk: "Основна інфраструктура хостингу та обчислень.",
    processingLocation: "Germany (EU)",
    mechanism: "no-transfer",
  },
  {
    name: "Self-hosted analytics",
    service_en: "Privacy-respecting product analytics, hosted within EU infrastructure.",
    service_uk: "Продуктова аналітика з повагою до приватності, розміщена в інфраструктурі ЄС.",
    processingLocation: "Germany (EU)",
    mechanism: "no-transfer",
  },
  {
    name: "Transactional email provider",
    service_en: "Delivery of account and notification emails.",
    service_uk: "Доставка облікових та сповіщувальних електронних листів.",
    processingLocation: "EU region (with SCCs if any US fallback is used)",
    mechanism: "scc",
  },
];

// ── Customer-facing transfer disclosure ─────────────────────────────────────────

export const TRANSFER_DISCLOSURE_EN =
  "Aegis Lens primarily stores and processes your personal data within the European Union. Where we use a service provider located outside the EU/EEA, we only transfer your data when there is an adequacy decision, or under European Commission Standard Contractual Clauses (or the UK IDTA) backed by supplementary safeguards such as strong encryption. We keep a current list of our sub-processors and the country in which each processes data, and we complete a Transfer Impact Assessment before relying on Standard Contractual Clauses. You can request details, or object, by contacting our Data Protection Officer at dpo@aegislens.example.";

export const TRANSFER_DISCLOSURE_UK =
  "Aegis Lens переважно зберігає та обробляє ваші персональні дані в межах Європейського Союзу. Якщо ми користуємося постачальником послуг за межами ЄС/ЄЕП, ми передаємо ваші дані лише за наявності рішення про адекватність або на підставі Стандартних договірних положень Європейської Комісії (чи IDTA Великої Британії) з додатковими гарантіями, такими як сильне шифрування. Ми ведемо актуальний перелік наших суб-обробників та країну, де кожен обробляє дані, і виконуємо Оцінку впливу передачі перед застосуванням Стандартних договірних положень. Ви можете запитати деталі або заперечити, звернувшись до нашого Уповноваженого із захисту даних за адресою dpo@aegislens.example.";

// ── Quarterly review cadence ────────────────────────────────────────────────────

/**
 * Cadence and checklist for the quarterly review of transfer chains.
 * Періодичність та чек-лист квартального перегляду ланцюгів передачі.
 */
export interface TransferReviewCadence {
  cadence_en: string;
  cadence_uk: string;
  checklist_en: string[];
  checklist_uk: string[];
}

export const TRANSFER_REVIEW_CADENCE: TransferReviewCadence = {
  cadence_en: "Reviewed quarterly by the DPO, and immediately upon any change to a sub-processor, destination, or relevant adequacy decision.",
  cadence_uk: "Переглядається щокварталу DPO, а також негайно при будь-якій зміні суб-обробника, призначення чи відповідного рішення про адекватність.",
  checklist_en: [
    "Confirm each sub-processor's processing location is unchanged and accurate.",
    "Verify adequacy decisions and DPF certifications are still in force.",
    "Re-validate that SCCs and TIAs are current and that supplementary measures remain effective.",
    "Update the public sub-processor list and transfer disclosure if anything changed.",
    "Record the review date, reviewer, and any actions in the compliance log.",
  ],
  checklist_uk: [
    "Підтвердити, що місце обробки кожного суб-обробника незмінне та точне.",
    "Перевірити, що рішення про адекватність та сертифікації DPF досі чинні.",
    "Повторно підтвердити, що SCC і TIA актуальні, а додаткові заходи лишаються ефективними.",
    "Оновити публічний перелік суб-обробників та розкриття передачі, якщо щось змінилося.",
    "Зафіксувати дату перегляду, рецензента та всі дії в журналі відповідності.",
  ],
};
