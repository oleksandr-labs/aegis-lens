/**
 * Eval suite for cross-provider parity.
 *
 * Codeable contract: a typed eval harness + a baseline heuristic scorer + a
 * confidence schema. Runs the same {@link EvalCase}s against every configured
 * provider and produces a parity matrix so we can verify failover targets give
 * acceptable answers before they're relied on in production.
 *
 * The scorer here is a deterministic heuristic baseline (keyword / regex / JSON
 * checks) — NOT an LLM judge. A real LLM-judge scorer can be plugged in via the
 * `scorer` option without changing the harness shape. Per the i18n note, each
 * case carries a `locale` so parity is measured per-locale.
 */

import type {
  CompletionResult,
  LlmMessage,
  LlmProvider,
  ProviderId,
} from "./types";
import { anthropicProvider } from "./anthropic-client";
import { openaiProvider } from "./openai-client";
import { openweightsProvider } from "./openweights-client";

export interface EvalCase {
  id: string;
  locale: string; // e.g. "uk", "en", "ru" — per-locale parity coverage.
  messages: LlmMessage[];
  system?: string;
  /** Expected substrings (case-insensitive) the answer should contain. */
  expectContains?: string[];
  /** Patterns the answer must match (all). */
  expectMatches?: RegExp[];
  /** If set, the answer must parse as JSON satisfying this predicate. */
  expectJson?: (value: unknown) => boolean;
}

export interface CaseScore {
  caseId: string;
  provider: ProviderId;
  model: string;
  /** 0..1 fraction of checks passed. */
  score: number;
  passed: boolean;
  /** Heuristic confidence in the score itself (more checks → higher confidence). */
  confidence: number;
  detail: string;
}

export interface ParityReport {
  byCase: CaseScore[];
  /** provider → mean score across all cases. */
  meanByProvider: Record<string, number>;
  /** Mean absolute score gap between the best and worst provider, per case. */
  meanParityGap: number;
}

export type Scorer = (result: CompletionResult, evalCase: EvalCase) => {
  score: number;
  confidence: number;
  detail: string;
};

/** Deterministic baseline scorer — keyword / regex / JSON checks. */
export const heuristicScorer: Scorer = (result, c) => {
  const checks: boolean[] = [];
  const text = result.text ?? "";
  const lower = text.toLowerCase();

  for (const sub of c.expectContains ?? []) {
    checks.push(lower.includes(sub.toLowerCase()));
  }
  for (const re of c.expectMatches ?? []) {
    checks.push(re.test(text));
  }
  if (c.expectJson) {
    let ok = false;
    try {
      ok = c.expectJson(JSON.parse(text));
    } catch {
      ok = false;
    }
    checks.push(ok);
  }

  const total = checks.length;
  const passedCount = checks.filter(Boolean).length;
  const score = total === 0 ? (text.trim() ? 1 : 0) : passedCount / total;
  // Confidence grows with the number of explicit checks; a no-check case is weak.
  const confidence = total === 0 ? 0.2 : Math.min(1, 0.5 + total * 0.1);

  return {
    score,
    confidence,
    detail: total === 0 ? "non-empty output (no explicit checks)" : `${passedCount}/${total} checks`,
  };
};

const ALL_PROVIDERS: LlmProvider[] = [
  anthropicProvider,
  openaiProvider,
  openweightsProvider,
];

export interface RunEvalOptions {
  providers?: LlmProvider[];
  scorer?: Scorer;
  /** Pass threshold for `passed`. Default 0.5. */
  passThreshold?: number;
  /** Only run configured providers (default true; false includes fake-mode). */
  configuredOnly?: boolean;
  tenantId?: string;
}

/** Run all cases against all providers and produce a parity report. */
export async function runEvalSuite(
  cases: EvalCase[],
  opts: RunEvalOptions = {},
): Promise<ParityReport> {
  const scorer = opts.scorer ?? heuristicScorer;
  const threshold = opts.passThreshold ?? 0.5;
  const providers = (opts.providers ?? ALL_PROVIDERS).filter((p) =>
    opts.configuredOnly === false ? true : p.isConfigured(opts.tenantId),
  );

  const byCase: CaseScore[] = [];

  for (const c of cases) {
    for (const p of providers) {
      let result: CompletionResult;
      try {
        result = await p.complete(c.messages, {
          system: c.system,
          feature: "eval",
          tenantId: opts.tenantId,
        });
      } catch (err) {
        byCase.push({
          caseId: c.id,
          provider: p.id,
          model: p.defaultModel,
          score: 0,
          passed: false,
          confidence: 1,
          detail: `error: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
      const s = scorer(result, c);
      byCase.push({
        caseId: c.id,
        provider: p.id,
        model: result.model,
        score: s.score,
        passed: s.score >= threshold,
        confidence: s.confidence,
        detail: `[${c.locale}] ${s.detail}`,
      });
    }
  }

  // Aggregate.
  const meanByProvider: Record<string, number> = {};
  for (const p of providers) {
    const rows = byCase.filter((r) => r.provider === p.id);
    meanByProvider[p.id] = rows.length
      ? rows.reduce((sum, r) => sum + r.score, 0) / rows.length
      : 0;
  }

  // Parity gap per case = best - worst across providers.
  let gapSum = 0;
  let gapN = 0;
  for (const c of cases) {
    const rows = byCase.filter((r) => r.caseId === c.id);
    if (rows.length < 2) continue;
    const scores = rows.map((r) => r.score);
    gapSum += Math.max(...scores) - Math.min(...scores);
    gapN += 1;
  }

  return {
    byCase,
    meanByProvider,
    meanParityGap: gapN ? gapSum / gapN : 0,
  };
}
