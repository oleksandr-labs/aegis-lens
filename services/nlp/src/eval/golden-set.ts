/**
 * Golden evaluation set for NLP pipeline regression testing.
 *
 * Each case has:
 *   - input: raw text to process
 *   - expected: what the pipeline should output
 *   - language: source language
 *   - weight: importance of this case (higher = more visible in reports)
 */

export interface NLPEvalCase {
  id: string;
  input: string;
  language: "en" | "uk" | "ru";
  expectedClass?: string;
  expectedSubclass?: string;
  expectedEntities?: Array<{ text: string; type: string }>;
  expectedSentimentPolarity?: "negative" | "positive" | "neutral";
  expectedStance?: "pro_ukraine" | "pro_russia" | "neutral" | "unclear";
  weight: 1 | 2 | 3;
}

export const GOLDEN_SET: NLPEvalCase[] = [
  // ── Classification — EN ──────────────────────────────────────────────────
  {
    id: "cls-en-001",
    input: "Ukrainian air defence intercepted 12 Shahed-136 drones over Kyiv Oblast tonight.",
    language: "en",
    expectedClass: "drone",
    expectedSubclass: "intercept",
    expectedEntities: [
      { text: "Kyiv Oblast", type: "LOCATION" },
      { text: "Shahed-136", type: "EQUIPMENT" },
    ],
    expectedSentimentPolarity: "negative",
    expectedStance: "pro_ukraine",
    weight: 3,
  },
  {
    id: "cls-en-002",
    input: "A Kinzhal hypersonic missile struck a military installation in eastern Ukraine.",
    language: "en",
    expectedClass: "missile",
    expectedEntities: [{ text: "Kinzhal", type: "EQUIPMENT" }],
    expectedSentimentPolarity: "negative",
    weight: 3,
  },
  {
    id: "cls-en-003",
    input: "Power outages reported across Dnipropetrovsk Oblast following infrastructure damage.",
    language: "en",
    expectedClass: "power_outage",
    expectedEntities: [{ text: "Dnipropetrovsk Oblast", type: "LOCATION" }],
    expectedSentimentPolarity: "negative",
    weight: 2,
  },
  {
    id: "cls-en-004",
    input: "Volunteer humanitarian convoy delivered 15 tonnes of food and medicine to Kherson.",
    language: "en",
    expectedClass: "humanitarian",
    expectedEntities: [{ text: "Kherson", type: "LOCATION" }],
    expectedSentimentPolarity: "positive",
    weight: 2,
  },
  {
    id: "cls-en-005",
    input: "Russian artillery shelling reported near Avdiivka with multiple impacts on residential areas.",
    language: "en",
    expectedClass: "artillery",
    expectedEntities: [{ text: "Avdiivka", type: "LOCATION" }],
    expectedSentimentPolarity: "negative",
    weight: 3,
  },

  // ── Classification — UK (Ukrainian) ──────────────────────────────────────
  {
    id: "cls-uk-001",
    input: "Ракетний удар по Харкову: постраждали житлові квартали, є жертви.",
    language: "uk",
    expectedClass: "missile",
    expectedEntities: [{ text: "Харкову", type: "LOCATION" }],
    expectedSentimentPolarity: "negative",
    weight: 3,
  },
  {
    id: "cls-uk-002",
    input: "ЗСУ збили 14 із 16 ударних БПЛА Shahed, що летіли у напрямку Одеси.",
    language: "uk",
    expectedClass: "drone",
    expectedSubclass: "intercept",
    expectedEntities: [
      { text: "Одеси", type: "LOCATION" },
      { text: "Shahed", type: "EQUIPMENT" },
      { text: "ЗСУ", type: "ORGANIZATION" },
    ],
    expectedSentimentPolarity: "negative",
    expectedStance: "pro_ukraine",
    weight: 3,
  },
  {
    id: "cls-uk-003",
    input: "Відключення електроенергії тривають у Львівській та Тернопільській областях через пошкодження підстанцій.",
    language: "uk",
    expectedClass: "power_outage",
    expectedEntities: [
      { text: "Львівській", type: "LOCATION" },
      { text: "Тернопільській", type: "LOCATION" },
    ],
    expectedSentimentPolarity: "negative",
    weight: 2,
  },

  // ── Russian-language neutral reporting ────────────────────────────────────
  {
    id: "cls-ru-001",
    input: "По данным Минобороны России, в ходе специальной военной операции были нейтрализованы объекты инфраструктуры.",
    language: "ru",
    expectedClass: "infrastructure_damage",
    expectedStance: "pro_russia",
    weight: 2,
  },

  // ── Entity extraction edge cases ──────────────────────────────────────────
  {
    id: "ner-001",
    input: "The 3rd Separate Assault Brigade of the Ukrainian Armed Forces reported successful interception of an Orlan-10 UAV near coordinates 50.12, 36.45.",
    language: "en",
    expectedEntities: [
      { text: "3rd Separate Assault Brigade", type: "MILITARY_UNIT" },
      { text: "Orlan-10", type: "EQUIPMENT" },
    ],
    weight: 2,
  },
  {
    id: "ner-002",
    input: "Coordinated drone attack involved Shahed-136, Shahed-131, and Lancet-3 munitions.",
    language: "en",
    expectedEntities: [
      { text: "Shahed-136", type: "EQUIPMENT" },
      { text: "Shahed-131", type: "EQUIPMENT" },
      { text: "Lancet-3", type: "EQUIPMENT" },
    ],
    weight: 3,
  },

  // ── Sentiment edge cases ──────────────────────────────────────────────────
  {
    id: "sent-001",
    input: "A bridge was reconstructed and reopened for civilian traffic in Irpin.",
    language: "en",
    expectedSentimentPolarity: "positive",
    expectedStance: "neutral",
    weight: 1,
  },
  {
    id: "sent-002",
    input: "14 civilians were killed and 27 injured in a missile strike on a residential building in Kryvyi Rih.",
    language: "en",
    expectedSentimentPolarity: "negative",
    weight: 3,
  },
];

export type EvalMetric = "classification_accuracy" | "ner_f1" | "sentiment_accuracy" | "stance_accuracy";

export function splitByLanguage(cases: NLPEvalCase[]): Record<string, NLPEvalCase[]> {
  const result: Record<string, NLPEvalCase[]> = {};
  for (const c of cases) {
    if (!result[c.language]) result[c.language] = [];
    result[c.language].push(c);
  }
  return result;
}
