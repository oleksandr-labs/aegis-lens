/**
 * Shared scaffolding for all generators:
 *   - builds the grounded prompt (facts injected, "do not invent" guardrails)
 *   - runs the LLM
 *   - runs the quality gate + confidence + cost
 *   - routes through the editorial review gate
 *   - returns a fully-formed `SeoArtifact` (DRAFT/queued — never auto-published
 *     for YMYL or tier-1 locales)
 *
 * No generator publishes directly. Every artifact carries its issues,
 * confidence, used-fact ids and (once reviewed) an AI disclosure.
 */

import { estimateCost } from "./cost-tracking";
import { scoreConfidence } from "./confidence";
import { runQualityGate, type QualityGateConfig } from "./quality-gate";
import { routeForReview } from "./review-gate";
import type {
  GroundingFact,
  LLMBackend,
  LLMCompleteOptions,
  PageContext,
  QualityIssue,
  SeoArtifact,
  SeoArtifactKind,
} from "./types";

const SYSTEM_GUARDRAIL =
  "You write factual SEO copy for an OSINT map. Use ONLY the supplied facts. " +
  "Never invent statistics, dates, place names, casualty figures, or sources. " +
  "If the facts are insufficient, say so rather than guessing. Match the brand voice. " +
  "Do not keyword-stuff. Output only the requested artifact, no preamble.";

/** Render facts as a numbered, citeable evidence block. */
export function renderFacts(facts: GroundingFact[]): string {
  if (facts.length === 0) return "(no facts supplied — refuse to assert anything)";
  return facts
    .map(
      (f, i) =>
        `[${i + 1}] id=${f.id} :: ${f.statement}` +
        (f.sourceUrl ? ` (source: ${f.sourceUrl})` : "") +
        (f.observedAt ? ` (observed: ${f.observedAt})` : ""),
    )
    .join("\n");
}

export interface RunGenerationArgs<T> {
  llm: LLMBackend;
  ctx: PageContext;
  kind: SeoArtifactKind;
  prompt: string;
  llmOpts?: LLMCompleteOptions;
  /** Parse the raw LLM text into the typed content + the fact ids it used. */
  parse: (raw: string) => { content: T; usedFactIds: string[]; checkableText: string; totalClaims: number };
  gateConfig?: Partial<QualityGateConfig>;
  /** Extra issues from caller-side checks (e.g. dedup). */
  extraIssues?: QualityIssue[];
}

let _counter = 0;
function artifactId(kind: SeoArtifactKind, pageId: string): string {
  _counter += 1;
  return `seo_${kind}_${pageId}_${Date.now().toString(36)}_${_counter}`;
}

export async function runGeneration<T>(args: RunGenerationArgs<T>): Promise<SeoArtifact<T>> {
  const { llm, ctx, kind, prompt } = args;
  const createdAt = new Date().toISOString();

  const result = await llm.complete(prompt, {
    system: SYSTEM_GUARDRAIL + (ctx.brandVoice ? ` Brand voice: ${ctx.brandVoice}.` : ""),
    maxTokens: 600,
    temperature: 0.3,
    ...args.llmOpts,
  });

  const parsed = args.parse(result.text);

  const gate = runQualityGate({
    text: parsed.checkableText,
    pageType: ctx.pageType,
    facts: ctx.facts,
    usedFactIds: parsed.usedFactIds,
    keywords: ctx.keywords,
    config: args.gateConfig,
    hasDisclosure: false, // disclosure is attached only after review
  });
  const issues = [...gate.issues, ...(args.extraIssues ?? [])];

  const confidence = scoreConfidence({
    usedFactIds: parsed.usedFactIds,
    totalClaims: parsed.totalClaims,
    facts: ctx.facts,
    issues,
  });

  const cost = estimateCost(result);

  const routing = routeForReview({
    pageType: ctx.pageType,
    locale: ctx.locale,
    confidence: confidence.score,
    gate: { ...gate, issues },
  });

  return {
    artifactId: artifactId(kind, ctx.pageId),
    kind,
    pageId: ctx.pageId,
    pageType: ctx.pageType,
    locale: ctx.locale,
    status: routing.status,
    content: parsed.content,
    confidence,
    issues,
    usedFactIds: parsed.usedFactIds,
    cost,
    model: result.model,
    createdAt,
  };
}

/** Extract `[n]` citation markers and map them to fact ids. */
export function citationsToFactIds(text: string, facts: GroundingFact[]): string[] {
  const ids = new Set<string>();
  const re = /\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const idx = Number(m[1]) - 1;
    if (facts[idx]) ids.add(facts[idx].id);
  }
  return [...ids];
}
