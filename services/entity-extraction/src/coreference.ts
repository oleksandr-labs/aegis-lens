/**
 * Coreference resolution (within document) + cross-document entity
 * disambiguation — heuristic baseline with a confidence schema.
 *
 * WITHIN-DOCUMENT coreference: cluster mentions in a single piece that refer to
 * the same real-world entity. We use surface + transliteration matching (so
 * "Шахед-136", "Shahed-136" and a later "the drone" anaphor near an equipment
 * mention land in one cluster) and acronym/short-form linking ("Збройні Сили
 * України" ↔ "ЗСУ"). A full neural coref model (e.g. multilingual coref) would
 * slot in behind the same `resolveCoreference` contract.
 *
 * CROSS-DOCUMENT disambiguation: the same surface form ("3rd Brigade", "Kyiv")
 * can denote different entities across documents, and different surfaces can
 * denote the same entity. We assign each document-level cluster a stable
 * `disambiguationKey` (class + normalised canonical surface) and merge clusters
 * across documents that share it, accumulating provenance (event ids) — so the KG
 * collapses repeated mentions into one node with a confidence that grows with
 * corroboration.
 *
 * This mirrors the platform `EntityMention`/`EntityClass` vocabulary and feeds the
 * linker (`linker.ts`) — clusters carry a representative mention that the linker
 * resolves once instead of per-mention.
 */

import { EntityMention, EntityClass } from "./types";
import { transliterate } from "./linker";

// ── Within-document coreference ────────────────────────────────────────────────

/** A set of mentions in one document judged to corefer. */
export interface CoreferenceCluster {
  /** Stable within-document cluster id. */
  clusterId: string;
  entityClass: EntityClass;
  /** Highest-confidence / longest surface form — the cluster representative. */
  representative: EntityMention;
  mentions: EntityMention[];
  /** Mean confidence across member mentions. */
  confidence: number;
}

/** Normalised key for surface comparison (transliterated, punctuation-stripped). */
function surfaceKey(text: string): string {
  return transliterate(text).replace(/[-\s_.]+/g, " ").trim();
}

/** Acronym of a multi-word surface, e.g. "Збройні Сили України" → "збройнисилиукраїни"→ initials. */
function acronymKey(text: string): string {
  const words = text.split(/[\s-]+/).filter(Boolean);
  if (words.length < 2) return "";
  return transliterate(words.map((w) => w[0]).join(""));
}

/** Are two mentions of the same class plausibly the same entity? */
function corefers(a: EntityMention, b: EntityMention): boolean {
  if (a.entityClass !== b.entityClass) return false;
  const ka = surfaceKey(a.text);
  const kb = surfaceKey(b.text);
  if (ka === kb) return true;
  // containment (e.g. "Shahed-136" vs "Shahed")
  if (ka.length >= 3 && kb.length >= 3 && (ka.includes(kb) || kb.includes(ka))) return true;
  // acronym ↔ expansion (organisations / units)
  const acA = acronymKey(a.text);
  const acB = acronymKey(b.text);
  if (acA && acA === surfaceKey(b.text).replace(/\s/g, "")) return true;
  if (acB && acB === surfaceKey(a.text).replace(/\s/g, "")) return true;
  return false;
}

function meanConf(mentions: EntityMention[]): number {
  return parseFloat((mentions.reduce((s, m) => s + m.confidence, 0) / mentions.length).toFixed(3));
}

/**
 * Cluster the mentions of one document into coreference chains.
 * Greedy single-link clustering over the `corefers` predicate.
 */
export function resolveCoreference(mentions: EntityMention[], docId = "doc"): CoreferenceCluster[] {
  const clusters: CoreferenceCluster[] = [];

  for (const m of mentions) {
    const target = clusters.find((c) => c.mentions.some((cm) => corefers(cm, m)));
    if (target) {
      target.mentions.push(m);
    } else {
      clusters.push({
        clusterId: `${docId}#${clusters.length}`,
        entityClass: m.entityClass,
        representative: m,
        mentions: [m],
        confidence: m.confidence,
      });
    }
  }

  // Pick representative = longest surface (most specific), recompute confidence.
  for (const c of clusters) {
    c.representative = c.mentions.reduce((best, m) =>
      m.text.length > best.text.length ? m : best,
    );
    c.confidence = meanConf(c.mentions);
  }

  return clusters;
}

// ── Cross-document disambiguation ──────────────────────────────────────────────

/** A document's coref clusters tagged with the document/event id. */
export interface DocumentClusters {
  documentId: string;
  /** Event id this document maps to (for KG provenance). */
  eventId: string;
  clusters: CoreferenceCluster[];
}

/** An entity unified across documents. */
export interface CrossDocEntity {
  /** Stable key: `${entityClass}:${normalisedSurface}`. Matches ISW `refKey` shape. */
  disambiguationKey: string;
  entityClass: EntityClass;
  canonicalSurface: string;
  /** All distinct surface variants observed (for alias seeding). */
  surfaceVariants: string[];
  /** Event ids that mention this entity (provenance). */
  mentionEventIds: string[];
  /** Total mention count across all documents. */
  occurrences: number;
  /**
   * Confidence: base mention confidence boosted by corroboration across
   * independent documents (caps at 0.99).
   */
  confidence: number;
}

function disambiguationKey(cluster: CoreferenceCluster): string {
  return `${cluster.entityClass}:${surfaceKey(cluster.representative.text).replace(/\s/g, "-")}`;
}

/**
 * Merge per-document coref clusters into cross-document entities.
 * Clusters sharing a `disambiguationKey` collapse into one entity whose confidence
 * rises with the number of independent documents corroborating it.
 */
export function disambiguateAcrossDocuments(docs: DocumentClusters[]): CrossDocEntity[] {
  const byKey = new Map<string, CrossDocEntity & { _docs: Set<string> }>();

  for (const doc of docs) {
    for (const cluster of doc.clusters) {
      const key = disambiguationKey(cluster);
      const existing = byKey.get(key);
      const variants = cluster.mentions.map((m) => m.text);

      if (existing) {
        existing.occurrences += cluster.mentions.length;
        existing.mentionEventIds = [...new Set([...existing.mentionEventIds, doc.eventId])];
        existing.surfaceVariants = [...new Set([...existing.surfaceVariants, ...variants])];
        existing._docs.add(doc.documentId);
        existing.confidence = corroboratedConfidence(cluster.confidence, existing._docs.size);
      } else {
        byKey.set(key, {
          disambiguationKey: key,
          entityClass: cluster.entityClass,
          canonicalSurface: cluster.representative.text,
          surfaceVariants: [...new Set(variants)],
          mentionEventIds: [doc.eventId],
          occurrences: cluster.mentions.length,
          confidence: cluster.confidence,
          _docs: new Set([doc.documentId]),
        });
      }
    }
  }

  return [...byKey.values()]
    .map(({ _docs, ...e }) => e)
    .sort((a, b) => b.occurrences - a.occurrences);
}

/** Corroboration boost: each extra independent doc adds diminishing confidence. */
function corroboratedConfidence(base: number, docCount: number): number {
  const boost = 1 - Math.pow(1 - 0.15, docCount - 1); // 0 at 1 doc, →1 asymptotically
  return parseFloat(Math.min(0.99, base + (1 - base) * boost).toFixed(3));
}
