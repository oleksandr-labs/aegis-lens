/**
 * Intro paragraph generator (factual, citation-REQUIRED).
 *
 * Produces a single grounded opening paragraph. Citation is mandatory: the
 * quality gate is run with `requireCitation` so an uncited intro fails closed
 * and is routed to review. Numbers/dates are checked against evidence.
 */

import { citationsToFactIds, renderFacts, runGeneration } from "./generate-common";
import type { IntroContent, LLMBackend, PageContext, SeoArtifact } from "./types";

export const INTRO_MIN = 220;
export const INTRO_MAX = 700;

export function buildIntroPrompt(ctx: PageContext): string {
  return [
    `Page type: ${ctx.pageType}. Subject: ${ctx.subject}. Locale: ${ctx.locale}.`,
    ctx.keywords?.length ? `Target keywords (natural use only): ${ctx.keywords.join(", ")}.` : "",
    `Facts you may use (cite by [n]):\n${renderFacts(ctx.facts)}`,
    "",
    `Write ONE factual intro paragraph (${INTRO_MIN}-${INTRO_MAX} chars).`,
    "Cite every factual claim with [n]. Use measured, non-sensational language.",
    "Do NOT state any number, date or place that is not in the facts.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateIntro(
  llm: LLMBackend,
  ctx: PageContext,
): Promise<SeoArtifact<IntroContent>> {
  return runGeneration<IntroContent>({
    llm,
    ctx,
    kind: "intro",
    prompt: buildIntroPrompt(ctx),
    llmOpts: { maxTokens: 400 },
    gateConfig: { requireCitation: true, minLength: INTRO_MIN, maxLength: INTRO_MAX },
    parse: (raw) => {
      const paragraph = raw.trim();
      const citationFactIds = citationsToFactIds(paragraph, ctx.facts);
      // count claims ~ number of citation markers (min 1)
      const totalClaims = Math.max(1, (paragraph.match(/\[\d+\]/g) ?? []).length);
      return {
        content: { paragraph, citationFactIds },
        usedFactIds: citationFactIds,
        checkableText: paragraph,
        totalClaims,
      };
    },
  });
}
