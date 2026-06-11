/**
 * Defined-term linker — auto-links glossary terms on their first occurrence.
 *
 * Wraps the first text-match of each glossary term in:
 *   <a href="/glossary/{slug}">{term}</a>
 *
 * Rules:
 *  - Case-insensitive matching
 *  - Only the FIRST occurrence per term per text block
 *  - Skips matches that are already inside an <a> tag
 *  - Longer terms matched before shorter ones to avoid partial overwrites
 */

import type { SchemaEntityType, SameAsLink, EntityMention } from "./types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GlossaryTerm {
  /** Canonical display form of the term. */
  term: string;
  /** URL slug for the glossary page (e.g. "osint", "geolocation"). */
  slug: string;
  /** Locale this term belongs to. */
  locale: "en" | "uk";
  /** Alternative surface forms that should also match (case-insensitive). */
  aliases: string[];
}

// ─── Linker ────────────────────────────────────────────────────────────────

/**
 * Find the first occurrence of each glossary term (and its aliases) in `text`
 * and wrap it in an anchor pointing to `/glossary/{slug}`.
 *
 * Already-linked occurrences (inside `<a …>…</a>`) are left untouched.
 *
 * @param text    Raw HTML or plain text to process.
 * @param terms   Glossary terms to link.
 * @param locale  Active locale — only terms matching this locale are applied.
 * @returns       Modified text with inline anchor tags inserted.
 */
export function linkDefinedTerms(
  text: string,
  terms: GlossaryTerm[],
  locale: string,
): string {
  // Filter to matching locale only
  const localTerms = terms.filter((t) => t.locale === locale);

  // Sort longest surface forms first to prevent partial-match stomping
  const sortedTerms = localTerms
    .flatMap((t) =>
      [t.term, ...t.aliases].map((surface) => ({ surface, slug: t.slug })),
    )
    .sort((a, b) => b.surface.length - a.surface.length);

  let result = text;
  const linkedSlugs = new Set<string>();

  for (const { surface, slug } of sortedTerms) {
    if (linkedSlugs.has(slug)) continue; // already linked for this slug

    const escapedSurface = surface.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escapedSurface, "i");

    // We need to find the first occurrence that is NOT already inside an <a>
    const newResult = replaceFirstOutsideAnchor(result, pattern, slug);
    if (newResult !== result) {
      result = newResult;
      linkedSlugs.add(slug);
    }
  }

  return result;
}

/**
 * Replace the first regex match in `text` that is not inside an `<a>` tag.
 * Returns the original string if no eligible match is found.
 */
function replaceFirstOutsideAnchor(
  text: string,
  pattern: RegExp,
  slug: string,
): string {
  // Split text into segments: [outside-a, inside-a, outside-a, ...]
  // We process only the "outside" segments.
  const anchorPattern = /<a[\s\S]*?<\/a>/gi;
  let lastIndex = 0;
  const segments: Array<{ content: string; isAnchor: boolean }> = [];

  let match: RegExpExecArray | null;
  while ((match = anchorPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ content: text.slice(lastIndex, match.index), isAnchor: false });
    }
    segments.push({ content: match[0], isAnchor: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ content: text.slice(lastIndex), isAnchor: false });
  }

  let replaced = false;
  const result = segments.map((seg) => {
    if (seg.isAnchor || replaced) return seg.content;

    const termMatch = pattern.exec(seg.content);
    if (!termMatch) return seg.content;

    replaced = true;
    const before = seg.content.slice(0, termMatch.index);
    const after = seg.content.slice(termMatch.index + termMatch[0].length);
    return `${before}<a href="/glossary/${slug}">${termMatch[0]}</a>${after}`;
  });

  return replaced ? result.join("") : text;
}

// ─── Entity mention extractor ──────────────────────────────────────────────

/**
 * Scan `text` for occurrences of known entity names and return a list of
 * EntityMention objects with character position and schema.org type.
 *
 * Only the first occurrence of each entity is captured (same convention
 * as linkDefinedTerms).
 *
 * @param text           Raw plain text or stripped HTML.
 * @param knownEntities  Catalogue of entities to look for.
 */
export function extractEntityMentions(
  text: string,
  knownEntities: {
    name: string;
    type: SchemaEntityType;
    sameAs?: SameAsLink[];
  }[],
): EntityMention[] {
  const mentions: EntityMention[] = [];
  const seen = new Set<string>();

  for (const entity of knownEntities) {
    if (seen.has(entity.name)) continue;

    const escapedName = entity.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escapedName, "i");
    const match = pattern.exec(text);

    if (match) {
      mentions.push({
        entityId: entity.name.toLowerCase().replace(/\s+/g, "-"),
        entityType: entity.type,
        text: match[0],
        position: match.index,
        sameAs: entity.sameAs ?? [],
      });
      seen.add(entity.name);
    }
  }

  // Sort by position in text
  return mentions.sort((a, b) => a.position - b.position);
}
