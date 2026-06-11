/**
 * Alert Service — NLP Rule-Builder Parse Accuracy Evaluation Harness
 *
 * Measures precision / recall / F1 of the NL → AlertRuleCondition parser
 * against a fixed test suite of 10 cases (5 EN + 5 UK).
 */

import type { AlertRuleCondition } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Use AlertRuleCondition as the canonical AlertCondition */
export type AlertCondition = AlertRuleCondition;

export interface NlParseTestCase {
  input: string;
  expectedConditions: Partial<AlertCondition>[];
  lang: "en" | "uk";
}

export interface ConditionEvalResult {
  precision: number;
  recall: number;
  f1: number;
}

export interface EvalReport {
  totalCases: number;
  passedCases: number;
  /** Average F1 across all test cases */
  avgF1: number;
  /** Average precision */
  avgPrecision: number;
  /** Average recall */
  avgRecall: number;
  byLang: Record<"en" | "uk", { cases: number; avgF1: number }>;
  details: Array<{
    input: string;
    lang: "en" | "uk";
    result: ConditionEvalResult;
    /** True when F1 >= 0.8 */
    passed: boolean;
  }>;
}

// ── Test suite — 5 EN + 5 UK ─────────────────────────────────────────────────

export const NL_TEST_SUITE: NlParseTestCase[] = [
  // ── English cases ──────────────────────────────────────────────────────────
  {
    lang: "en",
    input: "Alert me when a missile strike happens in Kyiv with confidence above 0.8",
    expectedConditions: [
      { event_class: "missile_strike", min_confidence: 0.8 },
    ],
  },
  {
    lang: "en",
    input: "Notify me about any explosion with danger score higher than 70 within 50 km of Kharkiv",
    expectedConditions: [
      {
        event_class: "explosion",
        min_danger_score: 70,
        geo_filter: { type: "circle", radius_km: 50 },
      },
    ],
  },
  {
    lang: "en",
    input: "Send an alert for drone sightings near Zaporizhzhia",
    expectedConditions: [
      { event_class: "drone_sighting" },
    ],
  },
  {
    lang: "en",
    input: "High confidence shelling reports only — confidence at least 0.9, danger above 80",
    expectedConditions: [
      { event_class: "shelling", min_confidence: 0.9, min_danger_score: 80 },
    ],
  },
  {
    lang: "en",
    input: "Alert on any critical air-raid warning in Lviv or Ivano-Frankivsk",
    expectedConditions: [
      { event_class: "air_raid_warning", min_severity: 4 },
    ],
  },

  // ── Ukrainian cases ────────────────────────────────────────────────────────
  {
    lang: "uk",
    input: "Повідом мене про ракетні удари в Харківській області з впевненістю понад 0.75",
    expectedConditions: [
      { event_class: "missile_strike", min_confidence: 0.75 },
    ],
  },
  {
    lang: "uk",
    input: "Сповіщення про вибухи з небезпекою вище 60 у радіусі 30 км від Миколаєва",
    expectedConditions: [
      {
        event_class: "explosion",
        min_danger_score: 60,
        geo_filter: { type: "circle", radius_km: 30 },
      },
    ],
  },
  {
    lang: "uk",
    input: "Нагадай про будь-які дрони над Одесою або Херсоном",
    expectedConditions: [
      { event_class: "drone_sighting" },
    ],
  },
  {
    lang: "uk",
    input: "Тільки перевірені повідомлення про обстріли — рівень впевненості 0.85 і більше",
    expectedConditions: [
      { event_class: "shelling", min_confidence: 0.85 },
    ],
  },
  {
    lang: "uk",
    input: "Критичні тривоги про повітряний напад у Київській та Чернігівській областях",
    expectedConditions: [
      { event_class: "air_raid_warning", min_severity: 4 },
    ],
  },
];

// ── Evaluation logic ──────────────────────────────────────────────────────────

/**
 * Compare parsed conditions against expected conditions.
 * A parsed condition "matches" an expected condition if all non-undefined
 * fields of the expected condition equal the corresponding parsed field.
 *
 * Precision = matched_parsed / total_parsed
 * Recall    = matched_expected / total_expected
 */
export function evaluateNlParse(
  parseResult: AlertCondition[],
  expected: Partial<AlertCondition>[],
): ConditionEvalResult {
  if (parseResult.length === 0 && expected.length === 0) {
    return { precision: 1, recall: 1, f1: 1 };
  }
  if (parseResult.length === 0) {
    return { precision: 0, recall: 0, f1: 0 };
  }
  if (expected.length === 0) {
    return { precision: 0, recall: 1, f1: 0 };
  }

  // Count parsed conditions that match at least one expected
  const matchedParsed = parseResult.filter((parsed) =>
    expected.some((exp) => conditionSubsetMatch(parsed, exp)),
  ).length;

  // Count expected conditions that are satisfied by at least one parsed
  const matchedExpected = expected.filter((exp) =>
    parseResult.some((parsed) => conditionSubsetMatch(parsed, exp)),
  ).length;

  const precision = matchedParsed / parseResult.length;
  const recall = matchedExpected / expected.length;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return { precision, recall, f1 };
}

/**
 * Returns true if all defined fields in `subset` are present and equal in `candidate`.
 * For nested geo_filter: only checks the `type` field.
 */
function conditionSubsetMatch(
  candidate: AlertCondition,
  subset: Partial<AlertCondition>,
): boolean {
  for (const key of Object.keys(subset) as (keyof AlertCondition)[]) {
    const expVal = subset[key];
    if (expVal === undefined) continue;
    const candVal = candidate[key];
    if (key === "geo_filter") {
      // Compare type only for geo_filter partial match
      const expGeo = expVal as NonNullable<AlertCondition["geo_filter"]>;
      const candGeo = candVal as AlertCondition["geo_filter"] | undefined;
      if (!candGeo || candGeo.type !== expGeo.type) return false;
      if (expGeo.radius_km !== undefined && candGeo.radius_km !== undefined) {
        // Allow ±10% tolerance on radius
        if (Math.abs(candGeo.radius_km - expGeo.radius_km) / expGeo.radius_km > 0.1) return false;
      }
    } else if (typeof expVal === "number" && typeof candVal === "number") {
      // Allow ±5% tolerance on numeric thresholds
      if (Math.abs(candVal - expVal) / Math.max(expVal, 1) > 0.05) return false;
    } else {
      if (candVal !== expVal) return false;
    }
  }
  return true;
}

// ── Suite runner ──────────────────────────────────────────────────────────────

export function runEvalSuite(
  parser: (input: string) => AlertCondition[],
): EvalReport {
  const PASS_THRESHOLD = 0.8;

  const details: EvalReport["details"] = [];
  const langBuckets: Record<"en" | "uk", { f1Total: number; count: number }> = {
    en: { f1Total: 0, count: 0 },
    uk: { f1Total: 0, count: 0 },
  };

  for (const tc of NL_TEST_SUITE) {
    let parseResult: AlertCondition[];
    try {
      parseResult = parser(tc.input);
    } catch {
      parseResult = [];
    }

    const result = evaluateNlParse(parseResult, tc.expectedConditions);
    const passed = result.f1 >= PASS_THRESHOLD;

    details.push({ input: tc.input, lang: tc.lang, result, passed });
    langBuckets[tc.lang].f1Total += result.f1;
    langBuckets[tc.lang].count++;
  }

  const totalCases = details.length;
  const passedCases = details.filter((d) => d.passed).length;
  const avgF1 = totalCases > 0 ? details.reduce((s, d) => s + d.result.f1, 0) / totalCases : 0;
  const avgPrecision =
    totalCases > 0 ? details.reduce((s, d) => s + d.result.precision, 0) / totalCases : 0;
  const avgRecall =
    totalCases > 0 ? details.reduce((s, d) => s + d.result.recall, 0) / totalCases : 0;

  const byLang: EvalReport["byLang"] = {
    en: {
      cases: langBuckets.en.count,
      avgF1: langBuckets.en.count > 0 ? langBuckets.en.f1Total / langBuckets.en.count : 0,
    },
    uk: {
      cases: langBuckets.uk.count,
      avgF1: langBuckets.uk.count > 0 ? langBuckets.uk.f1Total / langBuckets.uk.count : 0,
    },
  };

  return { totalCases, passedCases, avgF1, avgPrecision, avgRecall, byLang, details };
}
