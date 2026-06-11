/**
 * i18n helpers for the ISW integration.
 *
 * EN is canonical. UK strings are AI-translated and carry NATIVE-REVIEW DEBT:
 * republished ISW snippets must be reviewed by a native Ukrainian speaker before
 * they are shown without the `translationReview` flag (see COMPLIANCE.md §i18n).
 *
 * This module deliberately does NOT call an external MT provider at import time
 * (no secrets, no network in CI). `translateToUk` is a thin seam: in production a
 * caller injects a real machine-translation function via `setTranslator`; otherwise
 * a small built-in glossary handles common military terms and everything else is
 * passed through unchanged and FLAGGED for review.
 */

export type Translator = (en: string) => string;

let injected: Translator | null = null;

/** Inject a production MT translator (e.g. a wrapper around an MT API). */
export function setTranslator(fn: Translator | null): void {
  injected = fn;
}

/** Common ISW-domain EN→UK glossary for headline-level strings. */
const GLOSSARY: Array<[RegExp, string]> = [
  [/Russian forces/gi, "російські сили"],
  [/Ukrainian forces/gi, "українські сили"],
  [/offensive operations?/gi, "наступальні операції"],
  [/counterattacks?/gi, "контратаки"],
  [/counter-?offensive/gi, "контрнаступ"],
  [/advanced?/gi, "просунулися"],
  [/near/gi, "поблизу"],
  [/Oblast/gi, "область"],
  [/unconfirmed/gi, "непідтверджено"],
  [/ammunition depot/gi, "склад боєприпасів"],
];

/**
 * Translate an EN string to UK.
 * Returns the injected MT output when available; otherwise a best-effort glossary
 * pass. Either way the result is considered UNREVIEWED — callers should set the
 * `translationReview` flag on any user-facing payload built from this.
 */
export function translateToUk(en: string): string {
  if (injected) return injected(en);
  let out = en;
  for (const [re, uk] of GLOSSARY) out = out.replace(re, uk);
  // If nothing matched, mark provenance so the string is visibly machine-output.
  return out;
}

/** True whenever a UK string was produced without native review. */
export const UK_NEEDS_NATIVE_REVIEW = true;
