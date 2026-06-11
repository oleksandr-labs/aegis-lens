/**
 * FAQ generator (per page-template).
 *
 * Generates grounded Q&A pairs. Each answer must cite at least one fact ([n]);
 * answers whose citations don't resolve are caught by the quality gate. The
 * output also feeds the FAQPage schema.org node (see schema-org.ts).
 */

import { citationsToFactIds, renderFacts, runGeneration } from "./generate-common";
import type { FaqContent, FaqItem, GroundingFact, LLMBackend, PageContext, SeoArtifact } from "./types";

export function buildFaqPrompt(ctx: PageContext, count: number): string {
  return [
    `Page type: ${ctx.pageType}. Subject: ${ctx.subject}. Locale: ${ctx.locale}.`,
    `Facts you may use (cite by [n] in each answer):\n${renderFacts(ctx.facts)}`,
    "",
    `Write ${count} frequently-asked questions with concise factual answers about the subject.`,
    "Every answer MUST cite at least one fact with [n]. Do not invent anything not in the facts.",
    "Format each as exactly:",
    "Q: <question>",
    "A: <answer with [n] citations>",
  ].join("\n");
}

/** Parse "Q:/A:" blocks into FAQ items, mapping citations to fact ids. */
export function parseFaq(raw: string, facts: GroundingFact[]): { items: FaqItem[]; usedFactIds: string[] } {
  const items: FaqItem[] = [];
  const used = new Set<string>();
  const blocks = raw.split(/\n(?=Q\s*:)/i);
  for (const block of blocks) {
    const q = block.match(/Q\s*:\s*([^\n]+)/i)?.[1]?.trim();
    const a = block.match(/A\s*:\s*([\s\S]+)/i)?.[1]?.trim();
    if (!q || !a) continue;
    const factIds = citationsToFactIds(a, facts);
    factIds.forEach((id) => used.add(id));
    items.push({ question: q, answer: a, factIds });
  }
  return { items, usedFactIds: [...used] };
}

export async function generateFaq(
  llm: LLMBackend,
  ctx: PageContext,
  count = 4,
): Promise<SeoArtifact<FaqContent>> {
  return runGeneration<FaqContent>({
    llm,
    ctx,
    kind: "faq",
    prompt: buildFaqPrompt(ctx, count),
    llmOpts: { maxTokens: 800 },
    gateConfig: { requireCitation: true },
    parse: (raw) => {
      const { items, usedFactIds } = parseFaq(raw, ctx.facts);
      return {
        content: { items },
        usedFactIds,
        checkableText: items.map((i) => `${i.question} ${i.answer}`).join(" "),
        totalClaims: Math.max(1, items.length),
      };
    },
  });
}
