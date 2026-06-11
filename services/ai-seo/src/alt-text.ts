/**
 * OG / image alt-text generator.
 *
 * Generates concise, descriptive alt text for an image, grounded in the
 * supplied facts (e.g. an event's location/type). Length-bounded for
 * accessibility (alt text should be short). Goes through the standard gate so
 * fabricated detail (a place/number not in the facts) is caught.
 */

import { citationsToFactIds, renderFacts, runGeneration } from "./generate-common";
import type { AltTextContent, LLMBackend, PageContext, SeoArtifact } from "./types";

export const ALT_MAX = 125;

export interface AltTextInput {
  imageRef: string;
  /** Short description of what the image actually shows, from the asset pipeline. */
  imageSubject?: string;
}

export function buildAltPrompt(ctx: PageContext, input: AltTextInput): string {
  return [
    `Locale: ${ctx.locale}. Image ref: ${input.imageRef}.`,
    input.imageSubject ? `Image depicts: ${input.imageSubject}.` : "",
    `Facts you may use (cite by [n]):\n${renderFacts(ctx.facts)}`,
    "",
    `Write ONE alt-text string (<= ${ALT_MAX} chars). Describe only what the image shows.`,
    "No fabricated detail, no 'image of' prefix, no keyword stuffing.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateAltText(
  llm: LLMBackend,
  ctx: PageContext,
  input: AltTextInput,
): Promise<SeoArtifact<AltTextContent>> {
  return runGeneration<AltTextContent>({
    llm,
    ctx,
    kind: "alt_text",
    prompt: buildAltPrompt(ctx, input),
    llmOpts: { maxTokens: 120 },
    gateConfig: { minLength: 1, maxLength: ALT_MAX },
    parse: (raw) => {
      const altText = raw.trim().replace(/^["']|["']$/g, "").slice(0, ALT_MAX);
      const usedFactIds = citationsToFactIds(raw, ctx.facts);
      return {
        content: { imageRef: input.imageRef, altText },
        usedFactIds,
        checkableText: altText,
        totalClaims: 1,
      };
    },
  });
}
