/**
 * Per-locale variant generator (ADAPTED, not raw machine translation).
 *
 * Takes approved source-locale copy and produces a locale variant that adapts
 * tone, idiom and SEO conventions for the target locale rather than translating
 * literally. The `adapted` flag and a `localeAdaptation` score feed confidence.
 *
 * Tier-1 target locales (en, uk) ALWAYS route to native-reviewer sign-off via
 * the editorial gate — a machine pass can never approve them (i18n policy).
 */

import { runGeneration } from "./generate-common";
import type { LLMBackend, Locale, LocaleVariantContent, PageContext, SeoArtifact } from "./types";

export interface LocaleVariantInput {
  sourceLocale: Locale;
  sourceText: string;
}

export function buildVariantPrompt(targetLocale: Locale, input: LocaleVariantInput): string {
  return [
    `Adapt the following ${input.sourceLocale} SEO copy for ${targetLocale} readers.`,
    "Do NOT translate literally: adapt idiom, tone and search phrasing for the target market.",
    "Preserve all factual content and any [n] citation markers exactly. Add no new facts.",
    "",
    "SOURCE:",
    input.sourceText,
  ].join("\n");
}

/** Cheap heuristic for "did real adaptation happen vs near-identical literal MT". */
function adaptationScore(source: string, target: string): number {
  const a = new Set(source.toLowerCase().split(/\s+/));
  const b = new Set(target.toLowerCase().split(/\s+/));
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const overlap = inter / Math.max(1, Math.min(a.size, b.size));
  // High token overlap across locales ⇒ likely literal ⇒ low adaptation.
  return Number(Math.max(0, 1 - overlap).toFixed(4));
}

export async function generateLocaleVariant(
  llm: LLMBackend,
  ctx: PageContext,
  input: LocaleVariantInput,
): Promise<SeoArtifact<LocaleVariantContent>> {
  // ctx.locale is the TARGET locale.
  return runGeneration<LocaleVariantContent>({
    llm,
    ctx,
    kind: "locale_variant",
    prompt: buildVariantPrompt(ctx.locale, input),
    llmOpts: { maxTokens: 800, temperature: 0.4 },
    parse: (raw) => {
      const text = raw.trim();
      const adaptation = adaptationScore(input.sourceText, text);
      const usedFactIds = ctx.facts
        .filter((_, i) => new RegExp(`\\[${i + 1}\\]`).test(text))
        .map((f) => f.id);
      return {
        content: {
          sourceLocale: input.sourceLocale,
          targetLocale: ctx.locale,
          text,
          adapted: adaptation > 0.15,
        },
        usedFactIds,
        checkableText: text,
        totalClaims: Math.max(1, usedFactIds.length),
      };
    },
  });
}
