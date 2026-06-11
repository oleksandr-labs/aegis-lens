/**
 * Title + meta-description drafter (per template, with brand voice).
 *
 * Produces an SEO `<title>` and `<meta name="description">` grounded in the
 * page facts. Length windows match SERP rendering (title ~60 chars, description
 * ~155). The quality gate enforces those windows and the no-fabrication rule.
 */

import { citationsToFactIds, renderFacts, runGeneration } from "./generate-common";
import type { LLMBackend, MetadataContent, PageContext, SeoArtifact } from "./types";

export const TITLE_MAX = 60;
export const DESC_MIN = 70;
export const DESC_MAX = 158;

export function buildMetadataPrompt(ctx: PageContext): string {
  return [
    `Page type: ${ctx.pageType}. Subject: ${ctx.subject}. Locale: ${ctx.locale}.`,
    ctx.keywords?.length ? `Target keywords (use naturally, do not stuff): ${ctx.keywords.join(", ")}.` : "",
    `Facts you may use (cite by [n]):\n${renderFacts(ctx.facts)}`,
    "",
    `Write an SEO title (<= ${TITLE_MAX} chars) and a meta description (${DESC_MIN}-${DESC_MAX} chars).`,
    "Return EXACTLY two lines, no labels:",
    "<title>",
    "<meta description>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateMetadata(
  llm: LLMBackend,
  ctx: PageContext,
): Promise<SeoArtifact<MetadataContent>> {
  return runGeneration<MetadataContent>({
    llm,
    ctx,
    kind: "metadata",
    prompt: buildMetadataPrompt(ctx),
    llmOpts: { maxTokens: 200 },
    gateConfig: { minLength: 1, maxLength: TITLE_MAX + DESC_MAX + 4 },
    parse: (raw) => {
      const lines = raw
        .split("\n")
        .map((l) => l.replace(/^\s*(?:title|description)\s*:\s*/i, "").trim())
        .filter(Boolean);
      const title = (lines[0] ?? "").slice(0, TITLE_MAX);
      const metaDescription = (lines[1] ?? lines[0] ?? "").slice(0, DESC_MAX);
      const usedFactIds = citationsToFactIds(raw, ctx.facts);
      return {
        content: { title, metaDescription },
        usedFactIds,
        checkableText: `${title} ${metaDescription}`,
        // title + description ~ two assertions
        totalClaims: 2,
      };
    },
  });
}
