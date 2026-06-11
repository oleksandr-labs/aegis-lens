/**
 * NLP entity-extraction → Knowledge-Graph enrichment for ISW assessments.
 *
 * Heuristic / regex-based, modelled on `services/entity-extraction/src/patterns.ts`
 * (we mirror its `EntityClass` vocabulary and span-dedup approach so the KG sees a
 * consistent entity shape). This extracts place / military-unit / equipment mentions
 * from ISW assessment text and emits lightweight KG entity references that the
 * platform's linker can resolve to canonical entities.
 *
 * Scope note: this is a self-contained extractor (no import from the service, which
 * lives in a separate workspace) but it intentionally produces the same
 * `EntityMention` field shape so results are drop-in compatible.
 */

import type { IswAssessment } from "./types";

/** Mirror of services/entity-extraction EntityClass (subset relevant to ISW text). */
export type EntityClass =
  | "military_unit"
  | "equipment"
  | "location"
  | "region"
  | "organisation";

export interface EntityMention {
  text: string;
  start: number;
  end: number;
  entityClass: EntityClass;
  confidence: number;
  /** Normalised value (lowercased / hyphenated) for KG keying. */
  normalised?: string;
  language: string;
}

/** Lightweight KG entity reference emitted for downstream linking. */
export interface KgEntityRef {
  /** Provisional KG key: `${entityClass}:${normalised}`. */
  refKey: string;
  entityClass: EntityClass;
  canonicalText: string;
  /** Event IDs that mention this entity (here: the ISW assessment event). */
  mentionEventIds: string[];
  occurrences: number;
  confidence: number;
}

export interface IswExtraction {
  assessmentId: string;
  eventId: string;
  mentions: EntityMention[];
  /** Deduplicated KG references ready for enrichment. */
  entityRefs: KgEntityRef[];
  engine: string;
}

interface PatternRule {
  pattern: RegExp;
  entityClass: EntityClass;
  confidence: number;
  normalise?: (m: string) => string;
}

// Mirrors the missile/equipment + unit + oblast patterns of the platform service,
// tuned for ISW's English-language assessment prose.
const PATTERNS: PatternRule[] = [
  // Equipment / weapon systems
  {
    pattern: /\b(shahed[-\s]?\d{2,3}|lancet[-\s]?\d?|kh[-\s]?\d{2,3}[a-z]?|iskander[-\s]?[mk]?|kalibr|kinzhal|himars|atacms|storm\s?shadow|scalp|patriot|s[-\s]?300|s[-\s]?400)\b/gi,
    entityClass: "equipment",
    confidence: 0.9,
    normalise: (m) => m.toLowerCase().replace(/\s+/g, "-"),
  },
  {
    pattern: /\b(t[-\s]?(?:54|55|62|64|72|80|90)|leopard\s?2|abrams|bradley|bmp[-\s]?\d|btr[-\s]?\d{2,3})\b/gi,
    entityClass: "equipment",
    confidence: 0.82,
    normalise: (m) => m.toLowerCase().replace(/\s+/g, "-"),
  },
  // Military units (English ISW phrasing) + Russian formations
  {
    pattern: /\b(\d{1,3}(?:st|nd|rd|th)?\s+(?:separate\s+)?(?:guards\s+)?(?:combined\s+arms\s+army|assault|motorized\s+rifle|mechanized|tank|airborne|marine|artillery|spetsnaz)\s+(?:brigade|battalion|regiment|division|corps|army))\b/gi,
    entityClass: "military_unit",
    confidence: 0.8,
  },
  // Organisations
  {
    pattern: /\b(Russian Ministry of Defense|Wagner Group|Rosgvardia|Akhmat|GRU|FSB)\b/g,
    entityClass: "organisation",
    confidence: 0.85,
  },
  // Ukrainian oblasts (region)
  {
    pattern: /\b(Donetsk|Luhansk|Kharkiv|Zaporizhzhia|Kherson|Sumy|Dnipropetrovsk|Mykolaiv|Kyiv|Crimea)(?:\s+Oblast)?\b/g,
    entityClass: "region",
    confidence: 0.88,
  },
  // Settlements / front-line locations (proper-noun heuristic for known hotspots)
  {
    pattern: /\b(Pokrovsk|Avdiivka|Bakhmut|Chasiv Yar|Kupiansk|Vuhledar|Robotyne|Kreminna|Lyman|Toretsk|Marinka)\b/g,
    entityClass: "location",
    confidence: 0.86,
  },
];

function extractMentions(text: string, lang = "en"): EntityMention[] {
  const mentions: EntityMention[] = [];
  for (const rule of PATTERNS) {
    rule.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.pattern.exec(text)) !== null) {
      const surface = m[0];
      mentions.push({
        text: surface,
        start: m.index,
        end: m.index + surface.length,
        entityClass: rule.entityClass,
        confidence: rule.confidence,
        normalised: rule.normalise ? rule.normalise(surface) : surface.toLowerCase().replace(/\s+/g, "-"),
        language: lang,
      });
    }
  }
  return dedupeSpans(mentions);
}

/** Drop overlapping spans, keeping the higher-confidence mention. */
function dedupeSpans(mentions: EntityMention[]): EntityMention[] {
  const sorted = [...mentions].sort((a, b) => b.confidence - a.confidence);
  const kept: EntityMention[] = [];
  for (const c of sorted) {
    if (!kept.some((e) => c.start < e.end && c.end > e.start)) kept.push(c);
  }
  return kept.sort((a, b) => a.start - b.start);
}

/** Fold mentions into deduplicated KG entity references. */
function toEntityRefs(mentions: EntityMention[], eventId: string): KgEntityRef[] {
  const byKey = new Map<string, KgEntityRef>();
  for (const m of mentions) {
    const key = `${m.entityClass}:${m.normalised ?? m.text.toLowerCase()}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.occurrences += 1;
      existing.confidence = Math.max(existing.confidence, m.confidence);
    } else {
      byKey.set(key, {
        refKey: key,
        entityClass: m.entityClass,
        canonicalText: m.text,
        mentionEventIds: [eventId],
        occurrences: 1,
        confidence: m.confidence,
      });
    }
  }
  return [...byKey.values()].sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Extract entities from an ISW assessment and produce KG enrichment refs.
 * Runs over title + key takeaways + body text.
 */
export function extractEntities(assessment: IswAssessment, eventId: string): IswExtraction {
  const text = [assessment.title.en, ...assessment.keyTakeaways, assessment.bodyText].join("\n");
  const mentions = extractMentions(text, "en");
  return {
    assessmentId: assessment.assessmentId,
    eventId,
    mentions,
    entityRefs: toEntityRefs(mentions, eventId),
    engine: "isw-heuristic-regex/1.0",
  };
}
