/**
 * NLP eval runner — compares pipeline output against the golden set.
 * Run: npx ts-node services/nlp/src/eval/runner.ts
 */

import { GOLDEN_SET, NLPEvalCase } from "./golden-set";

export interface EvalResult {
  caseId: string;
  language: string;
  weight: number;
  classMatch?: boolean;
  entityPrecision?: number;
  entityRecall?: number;
  sentimentMatch?: boolean;
  stanceMatch?: boolean;
  passed: boolean;
  failures: string[];
}

export interface EvalSummary {
  total: number;
  passed: number;
  failed: number;
  weightedScore: number; // 0–100
  byLanguage: Record<string, { total: number; passed: number }>;
  byMetric: {
    classificationAccuracy: number;
    nerF1: number;
    sentimentAccuracy: number;
    stanceAccuracy: number;
  };
  failures: string[];
}

export interface PipelineOutput {
  eventClass?: string;
  eventSubclass?: string;
  entities?: Array<{ text: string; type: string }>;
  sentimentPolarity?: "negative" | "positive" | "neutral";
  stance?: "pro_ukraine" | "pro_russia" | "neutral" | "unclear";
}

export type PipelineFn = (input: string, language: string) => Promise<PipelineOutput>;

function calcEntityF1(
  expected: Array<{ text: string; type: string }>,
  actual: Array<{ text: string; type: string }>,
): { precision: number; recall: number; f1: number } {
  if (expected.length === 0 && actual.length === 0) return { precision: 1, recall: 1, f1: 1 };
  if (expected.length === 0 || actual.length === 0) return { precision: 0, recall: 0, f1: 0 };

  const tp = expected.filter((exp) =>
    actual.some((act) => act.text.toLowerCase().includes(exp.text.toLowerCase()) && act.type === exp.type),
  ).length;

  const precision = actual.length > 0 ? tp / actual.length : 0;
  const recall = expected.length > 0 ? tp / expected.length : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return { precision, recall, f1 };
}

export async function runEval(pipeline: PipelineFn, cases = GOLDEN_SET): Promise<EvalSummary> {
  const results: EvalResult[] = [];

  for (const c of cases) {
    const output = await pipeline(c.input, c.language);
    const failures: string[] = [];
    let classMatch: boolean | undefined;
    let entityPrecision: number | undefined;
    let entityRecall: number | undefined;
    let sentimentMatch: boolean | undefined;
    let stanceMatch: boolean | undefined;

    if (c.expectedClass) {
      classMatch = output.eventClass === c.expectedClass;
      if (!classMatch) failures.push(`class: expected "${c.expectedClass}", got "${output.eventClass}"`);
    }

    if (c.expectedEntities) {
      const { precision, recall } = calcEntityF1(c.expectedEntities, output.entities ?? []);
      entityPrecision = precision;
      entityRecall = recall;
      if (recall < 0.5) failures.push(`NER recall too low: ${recall.toFixed(2)}`);
    }

    if (c.expectedSentimentPolarity) {
      sentimentMatch = output.sentimentPolarity === c.expectedSentimentPolarity;
      if (!sentimentMatch) failures.push(`sentiment: expected "${c.expectedSentimentPolarity}", got "${output.sentimentPolarity}"`);
    }

    if (c.expectedStance) {
      stanceMatch = output.stance === c.expectedStance;
      if (!stanceMatch) failures.push(`stance: expected "${c.expectedStance}", got "${output.stance}"`);
    }

    const passed = failures.length === 0;
    results.push({ caseId: c.id, language: c.language, weight: c.weight, classMatch, entityPrecision, entityRecall, sentimentMatch, stanceMatch, passed, failures });
  }

  // Aggregate
  const byLanguage: Record<string, { total: number; passed: number }> = {};
  let totalWeight = 0;
  let passedWeight = 0;
  const allFailures: string[] = [];

  const clsCases = results.filter((r) => r.classMatch !== undefined);
  const nerCases = results.filter((r) => r.entityRecall !== undefined);
  const sentCases = results.filter((r) => r.sentimentMatch !== undefined);
  const stanceCases = results.filter((r) => r.stanceMatch !== undefined);

  for (const r of results) {
    if (!byLanguage[r.language]) byLanguage[r.language] = { total: 0, passed: 0 };
    byLanguage[r.language].total++;
    if (r.passed) byLanguage[r.language].passed++;
    totalWeight += r.weight;
    if (r.passed) passedWeight += r.weight;
    if (!r.passed) allFailures.push(`[${r.caseId}] ${r.failures.join("; ")}`);
  }

  return {
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    weightedScore: totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0,
    byLanguage,
    byMetric: {
      classificationAccuracy: clsCases.length > 0
        ? clsCases.filter((r) => r.classMatch).length / clsCases.length
        : 1,
      nerF1: nerCases.length > 0
        ? nerCases.reduce((sum, r) => {
            const p = r.entityPrecision ?? 0;
            const rec = r.entityRecall ?? 0;
            return sum + (p + rec > 0 ? 2 * p * rec / (p + rec) : 0);
          }, 0) / nerCases.length
        : 1,
      sentimentAccuracy: sentCases.length > 0
        ? sentCases.filter((r) => r.sentimentMatch).length / sentCases.length
        : 1,
      stanceAccuracy: stanceCases.length > 0
        ? stanceCases.filter((r) => r.stanceMatch).length / stanceCases.length
        : 1,
    },
    failures: allFailures,
  };
}

export function formatEvalReport(summary: EvalSummary): string {
  const lines = [
    `=== NLP Eval Results ===`,
    `Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Weighted score: ${summary.weightedScore}/100`,
    ``,
    `Per metric:`,
    `  Classification accuracy : ${(summary.byMetric.classificationAccuracy * 100).toFixed(1)}%`,
    `  NER F1                  : ${(summary.byMetric.nerF1 * 100).toFixed(1)}%`,
    `  Sentiment accuracy       : ${(summary.byMetric.sentimentAccuracy * 100).toFixed(1)}%`,
    `  Stance accuracy          : ${(summary.byMetric.stanceAccuracy * 100).toFixed(1)}%`,
    ``,
    `Per language:`,
    ...Object.entries(summary.byLanguage).map(([lang, s]) => `  ${lang}: ${s.passed}/${s.total}`),
  ];

  if (summary.failures.length > 0) {
    lines.push(``, `Failures:`);
    summary.failures.forEach((f) => lines.push(`  ✗ ${f}`));
  } else {
    lines.push(``, `✓ All cases passed.`);
  }

  return lines.join("\n");
}
