/**
 * Bridge: entity-extraction → auto-tagging (TODO_auto_tagging.md integration).
 *
 * The auto-tagging service (`@ua-map/auto-tagging`, services/auto-tagging) tags an
 * event against the master taxonomy from text + an optional classifier
 * class/subclass. Extracted entities are a strong tagging signal: an `equipment`
 * mention of "Shahed-136" should bias the `military.strike.drone` tag, a `region`
 * mention seeds a geo facet, etc.
 *
 * This module produces a `TaggingInput`-shaped payload from extraction output and
 * derives entity-driven tag hints, without importing the auto-tagging package
 * across workspaces — we mirror its public `TaggingInput` field shape (the same
 * pattern ISW uses to mirror `EntityMention`). The auto-tagging worker consumes the
 * payload; the `entityTagHints` are advisory tags it can fuse with its own keyword
 * and model predictions.
 */

import { EntityMention, EntityClass } from "./types";

/**
 * Mirror of `@ua-map/auto-tagging` TaggingInput (services/auto-tagging/src/tagger.ts).
 * Kept in sync structurally; not imported to avoid a cross-workspace dependency.
 */
export interface TaggingInput {
  text: string;
  titleEn?: string;
  titleUk?: string;
  /** Existing class/subclass from the NLP classifier. */
  eventClass?: string;
  eventSubclass?: string;
}

/** An advisory tag derived from a specific entity mention. */
export interface EntityTagHint {
  /** Taxonomy tag id, e.g. "military.strike.drone". */
  tagId: string;
  /** The entity that triggered the hint. */
  sourceEntity: string;
  entityClass: EntityClass;
  confidence: number;
}

export interface TaggingHandoff {
  input: TaggingInput;
  /** Advisory tags the auto-tagger can fuse with its own predictions. */
  entityTagHints: EntityTagHint[];
  /** Distinct region mentions → geo facet seeds. */
  regionFacets: string[];
}

/**
 * Equipment-keyword → tag id map, aligned with auto-tagging's CLASS/keyword rules
 * (military.strike.* taxonomy ids). Surface forms are normalised (lowercased,
 * transliteration-agnostic via substring match).
 */
const EQUIPMENT_TAG_RULES: Array<{ match: RegExp; tagId: string; confidence: number }> = [
  { match: /shahed|шахед|герань|lancet|ланцет|fpv|orlan|орлан|bayraktar|байрактар/i, tagId: "military.strike.drone", confidence: 0.85 },
  { match: /kinzhal|кинджал|kalibr|калібр|iskander|іскандер|kh-\d|х-\d|missile|ракет/i, tagId: "military.strike.missile", confidence: 0.85 },
  { match: /patriot|nasams|s-?300|с-?300|s-?400|с-?400|iris-?t|gepard|hawk/i, tagId: "military.interception", confidence: 0.8 },
  { match: /grad|град|smerch|смерч|uragan|ураган|mlrs|рсзо|howitzer|гаубиц/i, tagId: "military.strike.artillery", confidence: 0.8 },
];

/** Derive entity-driven tag hints from extracted mentions. */
export function deriveEntityTagHints(mentions: EntityMention[]): EntityTagHint[] {
  const hints: EntityTagHint[] = [];
  const seen = new Set<string>();

  for (const m of mentions) {
    if (m.entityClass !== "equipment") continue;
    for (const rule of EQUIPMENT_TAG_RULES) {
      if (rule.match.test(m.text)) {
        const key = `${rule.tagId}:${m.text.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        hints.push({
          tagId: rule.tagId,
          sourceEntity: m.text,
          entityClass: m.entityClass,
          // hint confidence = min(rule, mention) — we are no more sure than either signal
          confidence: parseFloat(Math.min(rule.confidence, m.confidence).toFixed(3)),
        });
        break;
      }
    }
  }
  return hints;
}

/** Collect distinct region/location surface forms as geo facet seeds. */
export function deriveRegionFacets(mentions: EntityMention[]): string[] {
  return [
    ...new Set(
      mentions
        .filter((m) => m.entityClass === "region" || m.entityClass === "location")
        .map((m) => m.text),
    ),
  ];
}

/**
 * Build the full handoff payload for the auto-tagging worker from extracted
 * mentions + the source text and optional classifier output.
 */
export function buildTaggingHandoff(
  text: string,
  mentions: EntityMention[],
  opts: { titleEn?: string; titleUk?: string; eventClass?: string; eventSubclass?: string } = {},
): TaggingHandoff {
  return {
    input: {
      text,
      titleEn: opts.titleEn,
      titleUk: opts.titleUk,
      eventClass: opts.eventClass,
      eventSubclass: opts.eventSubclass,
    },
    entityTagHints: deriveEntityTagHints(mentions),
    regionFacets: deriveRegionFacets(mentions),
  };
}
