/**
 * Anchor-text recommender for the CMS.
 *
 * Given a link target (its translated title + primary keywords) and the anchors
 * already used on the page, suggests natural, descriptive anchor variants that:
 *  - include a target keyword naturally (not stuffed),
 *  - differ from anchors already on the page (variety),
 *  - are translated, not transliterated (caller supplies locale strings).
 *
 * Pure & deterministic. Integration point: the CMS link dialog calls
 * {@link recommendAnchors} and shows the ranked suggestions.
 */

import type { Locale } from "@aegis/i18n-config";

export type AnchorTarget = {
  /** Target page title in the active locale (translated). */
  title: string;
  /** Primary keyword(s) in the active locale. */
  keywords: string[];
  locale: Locale;
};

export type AnchorSuggestion = {
  text: string;
  /** Why it was suggested (for CMS UI). */
  rationale: string;
};

/** Localized lead-in templates that read naturally around a keyword. */
const LEAD_INS: Record<Locale, ((kw: string) => string)[]> = {
  en: [
    (k) => k,
    (k) => `our ${k} guide`,
    (k) => `how to ${k}`,
    (k) => `${k} explained`,
    (k) => `more on ${k}`,
  ],
  uk: [
    (k) => k,
    (k) => `посібник з теми «${k}»`,
    (k) => `як ${k}`,
    (k) => `${k}: пояснення`,
    (k) => `докладніше про ${k}`,
  ],
  ru: [(k) => k],
  pl: [(k) => k],
  de: [(k) => k],
  ro: [(k) => k],
  fr: [(k) => k],
  es: [(k) => k],
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Trim a title into a concise anchor (first clause, max ~8 words). */
function conciseTitle(title: string): string {
  const clause = title.split(/[—:|–-]/)[0]?.trim() || title.trim();
  const words = clause.split(/\s+/);
  return words.length > 8 ? words.slice(0, 8).join(" ") : clause;
}

/**
 * Recommend up to `limit` natural anchor variants for `target`, excluding any
 * already used on the page (case-insensitive) for variety.
 */
export function recommendAnchors(
  target: AnchorTarget,
  usedOnPage: string[] = [],
  limit = 5,
): AnchorSuggestion[] {
  const used = new Set(usedOnPage.map(normalize));
  const seen = new Set<string>();
  const out: AnchorSuggestion[] = [];

  const push = (text: string, rationale: string) => {
    const t = text.trim();
    const key = normalize(t);
    if (!t || seen.has(key) || used.has(key)) return;
    seen.add(key);
    out.push({ text: t, rationale });
  };

  // 1) Concise title — most descriptive, aligns with target.
  push(conciseTitle(target.title), "Descriptive title — aligns with the target page.");

  // 2) Keyword-led natural variants.
  const templates = LEAD_INS[target.locale] ?? LEAD_INS.en;
  for (const kw of target.keywords) {
    const k = kw.trim();
    if (!k) continue;
    for (const tpl of templates) {
      push(tpl(k), `Includes the keyword "${k}" naturally.`);
      if (out.length >= limit) break;
    }
    if (out.length >= limit) break;
  }

  return out.slice(0, limit);
}
