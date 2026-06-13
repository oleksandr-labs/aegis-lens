// AI Usage Disclosure
// Public statement of which AI models the platform uses, where, on what data,
// with what guardrails. Supports the EU AI Act compliance posture and the
// customer-trust transparency moat. Bilingual EN + UK.
//
// Platform convention: this platform defaults to the latest Anthropic Claude
// models for its production AI features. Other providers (OpenAI, open-weights)
// are disclosed per feature where used.

export type AiProvider = "anthropic" | "openai" | "open-weights" | "in-house";

// EU AI Act risk tiers, declared per feature.
export type EuAiActRiskTier =
  | "unacceptable"
  | "high"
  | "limited"
  | "minimal";

export type AiFeatureId =
  | "event-classification"
  | "geolocation-assist"
  | "entity-resolution"
  | "danger-score"
  | "summarization"
  | "translation"
  | "source-credibility";

export interface AiModelDisclosure {
  provider: AiProvider;
  // Human-readable model family/name. For Anthropic we track the latest
  // production Claude model in use; exact version recorded in the model card.
  modelName: string;
  // Whether this is the system default per project convention.
  isDefault: boolean;
}

export interface AiEvalScore {
  metric: string;
  value: number; // 0..1 unless noted in `unit`
  unit?: string;
  // Public evaluation methodology reference (linked from the model card).
  methodologyRef: string;
}

export interface AiFeatureDisclosure {
  id: AiFeatureId;
  feature_en: string;
  feature_uk: string;
  models: AiModelDisclosure[];
  // EU AI Act risk classification declared for this specific feature.
  euAiActRisk: EuAiActRiskTier;
  euAiActRationale_en: string;
  euAiActRationale_uk: string;
  // Per-model evaluation scores, published openly.
  evalScores: AiEvalScore[];
  // Known limitations / systematic failure modes for this feature.
  knownLimitations_en: string[];
  knownLimitations_uk: string[];
  // Whether output produced by this feature is visibly labeled as AI-generated.
  outputLabeledAsAi: boolean;
  // Whether the user can opt out of this feature (where technically reasonable).
  userOptOut: boolean;
  // Locales in which this AI feature is available in production.
  availableLocales: string[];
}

// Training-data posture: we do not train on user or source data without
// explicit consent. This applies to all providers; for hosted providers we
// rely on zero-retention / no-training contractual terms.
export interface TrainingDataPosture {
  trainsOnUserData: false;
  trainsOnSourceData: false;
  consentRequiredBeforeAnyTraining: true;
  hostedProviderTermsNoTraining: true;
  statement_en: string;
  statement_uk: string;
}

export const TRAINING_DATA_POSTURE: TrainingDataPosture = {
  trainsOnUserData: false,
  trainsOnSourceData: false,
  consentRequiredBeforeAnyTraining: true,
  hostedProviderTermsNoTraining: true,
  statement_en:
    "We do not train, fine-tune, or otherwise improve any AI model on user data or ingested source data without explicit, opt-in consent. All hosted AI providers are bound by contractual zero-retention / no-training terms, meaning prompts and outputs are not used to train their models. Any future use of platform data for model improvement would require renewed, specific user consent and would be disclosed here in advance.",
  statement_uk:
    "Ми не тренуємо, не донавчаємо та не вдосконалюємо жодну AI-модель на даних користувачів чи зібраних даних джерел без явної згоди (opt-in). Усі сторонні постачальники AI зобов'язані контрактними умовами нульового зберігання / без тренування, тобто запити та відповіді не використовуються для тренування їхніх моделей. Будь-яке майбутнє використання даних платформи для вдосконалення моделей вимагатиме нової конкретної згоди користувача та буде заздалегідь розкрите тут.",
};

export const AI_FEATURE_DISCLOSURES: AiFeatureDisclosure[] = [
  {
    id: "event-classification",
    feature_en: "Event classification & categorization",
    feature_uk: "Класифікація та категоризація подій",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
    ],
    euAiActRisk: "limited",
    euAiActRationale_en:
      "Assistive classification with mandatory human review before any published designation; does not autonomously determine legal status, so it falls under limited-risk transparency obligations rather than high-risk.",
    euAiActRationale_uk:
      "Допоміжна класифікація з обов'язковою людською перевіркою перед будь-яким опублікованим визначенням; не визначає правовий статус автономно, тому підпадає під зобов'язання прозорості обмеженого ризику, а не високого.",
    evalScores: [
      { metric: "precision", value: 0.91, methodologyRef: "model-card/event-classification#precision" },
      { metric: "recall", value: 0.87, methodologyRef: "model-card/event-classification#recall" },
      { metric: "macro-F1", value: 0.89, methodologyRef: "model-card/event-classification#f1" },
    ],
    knownLimitations_en: [
      "Lower recall on rare or novel event types not well represented in evaluation data.",
      "Sensitivity to ambiguous or machine-translated source text.",
    ],
    knownLimitations_uk: [
      "Нижча повнота для рідкісних або нових типів подій, недостатньо представлених в оціночних даних.",
      "Чутливість до неоднозначного або машинно-перекладеного тексту джерела.",
    ],
    outputLabeledAsAi: true,
    userOptOut: true,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "geolocation-assist",
    feature_en: "Geolocation assistance",
    feature_uk: "Допомога з геолокацією",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
      { provider: "in-house", modelName: "Visual-geomatch heuristics", isDefault: false },
    ],
    euAiActRisk: "limited",
    euAiActRationale_en:
      "Produces candidate locations with confidence scores for human verification; final geolocation is always confirmed by a trained analyst, keeping it within limited-risk transparency scope.",
    euAiActRationale_uk:
      "Формує кандидатські локації з оцінками достовірності для людської верифікації; остаточна геолокація завжди підтверджується навченим аналітиком, що утримує функцію в межах прозорості обмеженого ризику.",
    evalScores: [
      { metric: "top-1 within 1km", value: 0.74, methodologyRef: "model-card/geolocation#top1" },
      { metric: "top-5 within 1km", value: 0.88, methodologyRef: "model-card/geolocation#top5" },
      { metric: "mean confidence calibration error", value: 0.06, methodologyRef: "model-card/geolocation#calibration" },
    ],
    knownLimitations_en: [
      "Degraded accuracy in landscapes with few distinctive landmarks.",
      "Can be misled by stock or recycled imagery; cross-checks are required.",
    ],
    knownLimitations_uk: [
      "Знижена точність у ландшафтах з малою кількістю відмітних орієнтирів.",
      "Може бути введена в оману стоковими або повторно використаними зображеннями; потрібні перехресні перевірки.",
    ],
    outputLabeledAsAi: true,
    userOptOut: true,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "entity-resolution",
    feature_en: "Entity resolution & deduplication",
    feature_uk: "Розпізнавання та дедуплікація сутностей",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
    ],
    euAiActRisk: "limited",
    euAiActRationale_en:
      "Links references to a shared entity for analytic convenience; does not adjudicate identity for any legal purpose and is reviewed before publication.",
    euAiActRationale_uk:
      "Зв'язує посилання зі спільною сутністю для аналітичної зручності; не встановлює особу для жодних юридичних цілей і перевіряється перед публікацією.",
    evalScores: [
      { metric: "pairwise precision", value: 0.93, methodologyRef: "model-card/entity-resolution#precision" },
      { metric: "pairwise recall", value: 0.85, methodologyRef: "model-card/entity-resolution#recall" },
    ],
    knownLimitations_en: [
      "Transliteration variants across alphabets can cause missed merges.",
      "Common names produce false merges that require human disambiguation.",
    ],
    knownLimitations_uk: [
      "Варіанти транслітерації між абетками можуть спричиняти пропущені об'єднання.",
      "Поширені імена дають хибні об'єднання, що потребують людського розрізнення.",
    ],
    outputLabeledAsAi: true,
    userOptOut: false,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "danger-score",
    feature_en: "Danger / severity scoring",
    feature_uk: "Оцінка небезпеки / серйозності",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
      { provider: "in-house", modelName: "Calibrated severity model", isDefault: false },
    ],
    euAiActRisk: "high",
    euAiActRationale_en:
      "Scores can influence safety-relevant attention and resource prioritization, so we treat this feature as high-risk: mandatory human oversight, logged overrides, published calibration, and documented failure modes.",
    euAiActRationale_uk:
      "Оцінки можуть впливати на пов'язану з безпекою увагу та пріоритизацію ресурсів, тож ми вважаємо цю функцію високоризиковою: обов'язковий людський нагляд, журналювання перевизначень, опублікована калібрація та задокументовані режими збоїв.",
    evalScores: [
      { metric: "ordinal accuracy (±1 band)", value: 0.9, methodologyRef: "model-card/danger-score#ordinal" },
      { metric: "calibration error", value: 0.05, methodologyRef: "model-card/danger-score#calibration" },
    ],
    knownLimitations_en: [
      "Tends to under-score slow-developing or cumulative risks.",
      "Reflects historical patterns and can lag genuinely novel threat types.",
    ],
    knownLimitations_uk: [
      "Схильна недооцінювати повільні або кумулятивні ризики.",
      "Відображає історичні патерни і може відставати від справді нових типів загроз.",
    ],
    outputLabeledAsAi: true,
    userOptOut: false,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "summarization",
    feature_en: "Summarization of source material",
    feature_uk: "Узагальнення вихідних матеріалів",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
    ],
    euAiActRisk: "limited",
    euAiActRationale_en:
      "Generates AI summaries that are clearly labeled and always linked back to the underlying sources; transparency obligation applies.",
    euAiActRationale_uk:
      "Генерує AI-резюме, які чітко марковані та завжди пов'язані з первинними джерелами; застосовується зобов'язання прозорості.",
    evalScores: [
      { metric: "faithfulness (human-rated)", value: 0.92, methodologyRef: "model-card/summarization#faithfulness" },
      { metric: "hallucination rate", value: 0.03, unit: "share of summaries", methodologyRef: "model-card/summarization#hallucination" },
    ],
    knownLimitations_en: [
      "May omit minority viewpoints present only in a single source.",
      "Rare residual hallucination; all summaries carry a verify-against-source caveat.",
    ],
    knownLimitations_uk: [
      "Може опускати точки зору, наявні лише в одному джерелі.",
      "Рідкісні залишкові галюцинації; усі резюме містять застереження перевіряти за джерелом.",
    ],
    outputLabeledAsAi: true,
    userOptOut: true,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "translation",
    feature_en: "Machine translation",
    feature_uk: "Машинний переклад",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
    ],
    euAiActRisk: "minimal",
    euAiActRationale_en:
      "Convenience translation labeled as machine-generated; no autonomous decision-making, classified minimal-risk with a voluntary transparency label.",
    euAiActRationale_uk:
      "Зручнісний переклад, маркований як машинно-згенерований; без автономного прийняття рішень, класифікований як мінімальний ризик з добровільним маркуванням прозорості.",
    evalScores: [
      { metric: "chrF (en↔uk)", value: 0.71, methodologyRef: "model-card/translation#chrf" },
    ],
    knownLimitations_en: [
      "Domain-specific terminology may be rendered loosely; originals are always preserved.",
    ],
    knownLimitations_uk: [
      "Спеціалізована термінологія може передаватися неточно; оригінали завжди зберігаються.",
    ],
    outputLabeledAsAi: true,
    userOptOut: true,
    availableLocales: ["en", "uk", "de", "fr"],
  },
  {
    id: "source-credibility",
    feature_en: "Source credibility assistance",
    feature_uk: "Допомога в оцінці достовірності джерел",
    models: [
      { provider: "anthropic", modelName: "Claude (latest production)", isDefault: true },
    ],
    euAiActRisk: "limited",
    euAiActRationale_en:
      "Suggests credibility signals for analyst consideration; never assigns a final trust label autonomously, keeping it limited-risk.",
    euAiActRationale_uk:
      "Пропонує сигнали достовірності для розгляду аналітиком; ніколи не присвоює остаточну мітку довіри автономно, що утримує функцію в межах обмеженого ризику.",
    evalScores: [
      { metric: "ranking correlation w/ human", value: 0.78, methodologyRef: "model-card/source-credibility#correlation" },
    ],
    knownLimitations_en: [
      "Newer or low-footprint sources have weak signal and default to lower confidence.",
    ],
    knownLimitations_uk: [
      "Новіші джерела або джерела з малим слідом мають слабкий сигнал і за замовчуванням отримують нижчу впевненість.",
    ],
    outputLabeledAsAi: true,
    userOptOut: false,
    availableLocales: ["en", "uk", "de", "fr"],
  },
];

// AI-generated content labeling rule, applied platform-wide.
export interface AiContentLabelingRule {
  badgeKey: string;
  appliesToFeatures: AiFeatureId[];
  rule_en: string;
  rule_uk: string;
}

export const AI_CONTENT_LABELING_RULE: AiContentLabelingRule = {
  badgeKey: "ai-generated",
  appliesToFeatures: AI_FEATURE_DISCLOSURES.filter((f) => f.outputLabeledAsAi).map((f) => f.id),
  rule_en:
    "Any text, summary, classification, or location produced or materially shaped by an AI model is visibly labeled with an 'AI-generated' badge at the point of display, with a tooltip linking to this disclosure and to the relevant model card.",
  rule_uk:
    "Будь-який текст, резюме, класифікація чи локація, створені або суттєво сформовані AI-моделлю, видимо маркуються значком «Згенеровано ШІ» у місці відображення, з підказкою, що веде на це розкриття та на відповідну картку моделі.",
};

// User opt-out policy for AI features.
export interface AiOptOutPolicy {
  optOutAvailableFeatures: AiFeatureId[];
  optOutUnavailableFeatures: AiFeatureId[];
  policy_en: string;
  policy_uk: string;
}

export const AI_OPT_OUT_POLICY: AiOptOutPolicy = {
  optOutAvailableFeatures: AI_FEATURE_DISCLOSURES.filter((f) => f.userOptOut).map((f) => f.id),
  optOutUnavailableFeatures: AI_FEATURE_DISCLOSURES.filter((f) => !f.userOptOut).map((f) => f.id),
  policy_en:
    "Users can disable AI-assisted features in account settings wherever it is technically reasonable. Some core integrity features (danger scoring, entity resolution, source-credibility signals) cannot be individually disabled because they underpin platform safety, but their AI involvement remains labeled and disclosed.",
  policy_uk:
    "Користувачі можуть вимкнути функції з підтримкою ШІ в налаштуваннях акаунту скрізь, де це технічно доцільно. Деякі основні функції цілісності (оцінка небезпеки, розпізнавання сутностей, сигнали достовірності джерел) не можна вимкнути окремо, оскільки вони лежать в основі безпеки платформи, але їхня участь ШІ залишається маркованою та розкритою.",
};

// Annual model-card publication commitment.
export interface ModelCardPublicationPolicy {
  cadence: "annual";
  publishQuarter: "Q1";
  oneCardPerMajorModel: true;
  includes: string[];
  policy_en: string;
  policy_uk: string;
}

export const MODEL_CARD_PUBLICATION_POLICY: ModelCardPublicationPolicy = {
  cadence: "annual",
  publishQuarter: "Q1",
  oneCardPerMajorModel: true,
  includes: [
    "model identity and version",
    "intended use and out-of-scope use",
    "evaluation scores and methodology",
    "known limitations and failure modes",
    "training-data posture",
    "EU AI Act risk classification",
  ],
  policy_en:
    "We publish a model card for every major model in production at least annually (in Q1), and additionally whenever a model is materially upgraded. Each card covers identity, intended use, public evaluation scores, known limitations, training-data posture, and the EU AI Act risk classification.",
  policy_uk:
    "Ми публікуємо картку моделі для кожної основної моделі у виробництві щонайменше щороку (у Q1), а також щоразу, коли модель суттєво оновлюється. Кожна картка охоплює ідентичність, цільове використання, публічні оцінки, відомі обмеження, позицію щодо тренувальних даних та класифікацію ризику за Законом ЄС про ШІ.",
};

// Per-locale availability summary, derived from per-feature availability.
export interface AiLocaleAvailability {
  locale: string;
  availableFeatures: AiFeatureId[];
}

export const AI_LOCALE_AVAILABILITY: AiLocaleAvailability[] = ["en", "uk", "de", "fr"].map(
  (locale) => ({
    locale,
    availableFeatures: AI_FEATURE_DISCLOSURES.filter((f) =>
      f.availableLocales.includes(locale)
    ).map((f) => f.id),
  })
);

export const AI_DISCLOSURE_SUMMARY_EN =
  "We disclose, per feature, which AI models we use (defaulting to the latest Anthropic Claude models), how they score on public evaluations, their known limitations, and their EU AI Act risk classification. AI output is always labeled, users can opt out where reasonable, and we never train on user or source data without consent.";

export const AI_DISCLOSURE_SUMMARY_UK =
  "Ми розкриваємо для кожної функції, які AI-моделі використовуємо (за замовчуванням — найновіші моделі Anthropic Claude), як вони оцінюються в публічних перевірках, їхні відомі обмеження та класифікацію ризику за Законом ЄС про ШІ. Вивід ШІ завжди маркується, користувачі можуть відмовитися там, де це доцільно, і ми ніколи не тренуємо моделі на даних користувачів чи джерел без згоди.";
