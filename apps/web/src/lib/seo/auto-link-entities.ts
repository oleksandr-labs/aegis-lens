import type { Locale } from "@aegis/i18n-config";

/**
 * Auto-link known entities (regions, conflicts, equipment, units) inside post
 * body text. Gazetteer-driven: a caller supplies the term list (built from
 * `entities-seed`, `regions-seed`, `seed-data` EQUIPMENT/CONFLICTS), and this
 * module returns either an annotated token stream (renderer-agnostic) or HTML.
 *
 * Locale-correct: each gazetteer entry carries a per-locale surface form and a
 * locale-aware `hrefFor(lc)` builder, so a UK body links UK surface text to the
 * UK URL — translated, never transliterated, never cross-locale.
 *
 * Guardrails (over-optimization / readability):
 *  - max links per paragraph (default 3),
 *  - each distinct target linked at most once per paragraph (first occurrence),
 *  - case-insensitive whole-word match; longest surface form wins on overlap,
 *  - never links text already inside an existing link (caller passes plain text).
 */

export type GazetteerEntry = {
  /** Stable id (entity/region/equipment slug). */
  id: string;
  /** Surface forms to match, per locale. Include aliases. */
  surfaces: Partial<Record<Locale, string[]>> & { en: string[] };
  /** Locale-aware target URL. */
  hrefFor: (lc: Locale) => string;
  /** Optional category for diagnostics. */
  kind?: "region" | "conflict" | "equipment" | "entity" | "unit";
};

export type LinkToken =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string; id: string };

export type AutoLinkOptions = {
  maxLinksPerParagraph?: number;
  /** Don't link the page's own subject (avoid self-links). */
  excludeIds?: Set<string>;
};

type CompiledTerm = {
  id: string;
  surface: string;
  lower: string;
  href: string;
};

/** Build the per-locale matcher list, sorted longest-first for greedy match. */
function compile(
  gazetteer: GazetteerEntry[],
  locale: Locale,
  excludeIds: Set<string>,
): CompiledTerm[] {
  const terms: CompiledTerm[] = [];
  for (const e of gazetteer) {
    if (excludeIds.has(e.id)) continue;
    const surfaces = e.surfaces[locale] ?? e.surfaces.en;
    const href = e.hrefFor(locale);
    for (const s of surfaces) {
      const t = s.trim();
      if (!t) continue;
      terms.push({ id: e.id, surface: t, lower: t.toLowerCase(), href });
    }
  }
  return terms.sort((a, b) => b.surface.length - a.surface.length);
}

function isWordChar(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  // Unicode letter/number/underscore — keeps Cyrillic words intact.
  return /[\p{L}\p{N}_]/u.test(ch);
}

/**
 * Tokenize a single paragraph into text/link tokens. Pure; no DOM.
 */
export function linkifyParagraph(
  paragraph: string,
  gazetteer: GazetteerEntry[],
  locale: Locale,
  opts: AutoLinkOptions = {},
): LinkToken[] {
  const max = opts.maxLinksPerParagraph ?? 3;
  const terms = compile(gazetteer, locale, opts.excludeIds ?? new Set());
  const lowerPara = paragraph.toLowerCase();

  const linkedIds = new Set<string>();
  // Collect non-overlapping matches scanning left→right, greedy longest.
  type Match = { start: number; end: number; surface: string; href: string; id: string };
  const matches: Match[] = [];
  let count = 0;

  for (let i = 0; i < paragraph.length && count < max; ) {
    let best: Match | null = null;
    for (const t of terms) {
      if (linkedIds.has(t.id)) continue;
      if (lowerPara.startsWith(t.lower, i)) {
        const before = paragraph[i - 1];
        const after = paragraph[i + t.surface.length];
        // Whole-word boundaries.
        if (isWordChar(before) || isWordChar(after)) continue;
        best = {
          start: i,
          end: i + t.surface.length,
          surface: paragraph.slice(i, i + t.surface.length),
          href: t.href,
          id: t.id,
        };
        break; // terms sorted longest-first → first hit is greediest
      }
    }
    if (best) {
      matches.push(best);
      linkedIds.add(best.id);
      count += 1;
      i = best.end;
    } else {
      i += 1;
    }
  }

  if (matches.length === 0) return [{ type: "text", value: paragraph }];

  const tokens: LinkToken[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      tokens.push({ type: "text", value: paragraph.slice(cursor, m.start) });
    }
    tokens.push({ type: "link", value: m.surface, href: m.href, id: m.id });
    cursor = m.end;
  }
  if (cursor < paragraph.length) {
    tokens.push({ type: "text", value: paragraph.slice(cursor) });
  }
  return tokens;
}

/**
 * Linkify a multi-paragraph body (paragraphs split on blank lines). Returns one
 * token stream per paragraph so a React/MD renderer can map links to <Link>.
 */
export function linkifyBody(
  body: string,
  gazetteer: GazetteerEntry[],
  locale: Locale,
  opts: AutoLinkOptions = {},
): LinkToken[][] {
  return body
    .split(/\n{2,}/)
    .map((p) => linkifyParagraph(p, gazetteer, locale, opts));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convenience: render a paragraph's tokens to an HTML string. */
export function tokensToHtml(tokens: LinkToken[]): string {
  return tokens
    .map((t) =>
      t.type === "text"
        ? escapeHtml(t.value)
        : `<a href="${escapeHtml(t.href)}">${escapeHtml(t.value)}</a>`,
    )
    .join("");
}
