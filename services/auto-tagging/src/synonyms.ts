/**
 * Tag synonym registry + governance rules.
 *
 * - Synonyms auto-merge to a canonical tag (prevents tag sprawl)
 * - Per-tag minimum coverage threshold before a tag page is indexable
 * - Anti-spam: cap tags-per-content
 *
 * "Tag sprawl = duplicate-content hell. Govern from day 1."
 */

import { resolveAlias, getNode } from "./taxonomy";

/** Max tags allowed on a single piece of content (anti-spam). */
export const MAX_TAGS_PER_CONTENT = 7;

/** Minimum number of tagged items before a tag's page is indexable for SEO. */
export const MIN_COVERAGE_FOR_INDEX = 5;

// ── Synonym registry: variant → canonical tag id ─────────────────────────────

const SYNONYM_MAP = new Map<string, string>([
  // Drone synonyms
  ["uav", "military.strike.drone"],
  ["kamikaze drone", "military.strike.drone"],
  ["loitering munition", "military.strike.drone"],
  ["shahed", "military.strike.drone"],
  ["безпілотник", "military.strike.drone"],
  ["дрон-камікадзе", "military.strike.drone"],
  // Missile synonyms
  ["rocket strike", "military.strike.missile"],
  ["cruise missile", "military.strike.missile"],
  ["ballistic missile", "military.strike.missile"],
  ["ракетний удар", "military.strike.missile"],
  // Power synonyms
  ["blackout", "infrastructure.energy"],
  ["power cut", "infrastructure.energy"],
  ["відключення світла", "infrastructure.energy"],
  ["знеструмлення", "infrastructure.energy"],
  // Shelling
  ["bombardment", "military.strike.artillery"],
  ["shelling", "military.strike.artillery"],
  ["обстріл", "military.strike.artillery"],
]);

/** Resolve a free-form tag string to its canonical taxonomy id, if known. */
export function canonicalize(tagInput: string): string | undefined {
  const lower = tagInput.toLowerCase().trim();
  // 1. Direct synonym hit
  const syn = SYNONYM_MAP.get(lower);
  if (syn) return syn;
  // 2. Taxonomy alias resolution
  const aliased = resolveAlias(lower);
  if (aliased) return aliased;
  // 3. Already canonical?
  if (getNode(lower)) return lower;
  return undefined;
}

export interface SynonymRegistration {
  variant: string;
  canonicalId: string;
  /** Who proposed it (for governance audit) */
  proposedBy: string;
  /** auto = matched algorithmically, manual = human-curated */
  source: "auto" | "manual";
}

const _proposedSynonyms: SynonymRegistration[] = [];

/** Propose a new synonym mapping for review. */
export function proposeSynonym(reg: SynonymRegistration): { ok: boolean; reason?: string } {
  if (!getNode(reg.canonicalId)) {
    return { ok: false, reason: `Canonical tag "${reg.canonicalId}" does not exist` };
  }
  if (SYNONYM_MAP.has(reg.variant.toLowerCase())) {
    return { ok: false, reason: `Synonym "${reg.variant}" already registered` };
  }
  _proposedSynonyms.push(reg);
  return { ok: true };
}

/** Approve a proposed synonym (adds it to the live registry). */
export function approveSynonym(variant: string): boolean {
  const proposal = _proposedSynonyms.find((p) => p.variant.toLowerCase() === variant.toLowerCase());
  if (!proposal) return false;
  SYNONYM_MAP.set(proposal.variant.toLowerCase(), proposal.canonicalId);
  return true;
}

export function pendingSynonyms(): SynonymRegistration[] {
  return [..._proposedSynonyms];
}

// ── Anti-spam: dedupe + cap tags on content ──────────────────────────────────

export interface TagApplicationResult {
  tags: string[];
  dropped: string[];
  reason?: string;
}

/**
 * Normalise a raw tag list: canonicalize, dedupe, and cap at MAX_TAGS_PER_CONTENT.
 * Drops unrecognised tags and excess beyond the cap (lowest priority first).
 */
export function applyTags(
  rawTags: Array<{ id: string; confidence: number }>,
): TagApplicationResult {
  const seen = new Set<string>();
  const canonical: Array<{ id: string; confidence: number }> = [];
  const dropped: string[] = [];

  for (const raw of rawTags) {
    const id = canonicalize(raw.id) ?? raw.id;
    if (!getNode(id)) { dropped.push(raw.id); continue; }
    if (seen.has(id)) { dropped.push(raw.id); continue; }
    seen.add(id);
    canonical.push({ id, confidence: raw.confidence });
  }

  // Cap: keep highest-confidence tags
  canonical.sort((a, b) => b.confidence - a.confidence);
  const kept = canonical.slice(0, MAX_TAGS_PER_CONTENT);
  const excess = canonical.slice(MAX_TAGS_PER_CONTENT);
  excess.forEach((t) => dropped.push(t.id));

  return {
    tags: kept.map((t) => t.id),
    dropped,
    reason: excess.length > 0 ? `Capped at ${MAX_TAGS_PER_CONTENT} tags` : undefined,
  };
}

/** Whether a tag has enough coverage to have an indexable page. */
export function isIndexable(coverageCount: number): boolean {
  return coverageCount >= MIN_COVERAGE_FOR_INDEX;
}
