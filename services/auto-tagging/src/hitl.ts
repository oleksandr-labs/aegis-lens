/**
 * Human-in-the-loop (HITL) tag correction loop → retraining signal.
 *
 * Reviewers accept / reject / add / remove auto-applied tags. Each action is
 * captured as a `TagCorrection`. This module:
 *   1. Records corrections (in-memory store; swap for a DB table in prod).
 *   2. Mines them into actionable retraining artefacts:
 *        - keyword-rule proposals (terms that co-occur with accepted tags),
 *        - synonym proposals (rejected free-form variant → accepted canonical),
 *        - a labelled training set (text → gold tag IDs) for an embedding/classifier
 *          fine-tune.
 *   3. Surfaces precision/recall per tag so we know which rules to fix first.
 *
 * The "retraining" itself (fitting model weights) is out of scope for this
 * dependency-free package — we deliver the typed dataset + proposal artefacts a
 * trainer consumes. This is the codeable contract for the loop.
 */

import { getNode } from "./taxonomy";
import { canonicalize, type SynonymRegistration } from "./synonyms";

export type CorrectionAction = "accept" | "reject" | "add" | "remove";

export interface TagCorrection {
  /** Content item the tag was applied to. */
  contentId: string;
  /** Raw text of the content (needed to mine features for retraining). */
  text: string;
  /** Tag the reviewer acted on. For "add"/"reject" this may be a free-form variant. */
  tagId: string;
  action: CorrectionAction;
  /** Original model/keyword confidence for the tag (if it was auto-applied). */
  modelConfidence?: number;
  reviewerId: string;
  reviewedAt: string; // ISO-8601
  note?: string;
}

const _corrections: TagCorrection[] = [];

/** Record a reviewer correction. Returns false if the canonical tag is unknown for accept/remove. */
export function recordCorrection(c: TagCorrection): { ok: boolean; reason?: string } {
  if ((c.action === "accept" || c.action === "remove") && !getNode(c.tagId)) {
    return { ok: false, reason: `Tag "${c.tagId}" is not a known taxonomy node` };
  }
  _corrections.push(c);
  return { ok: true };
}

export function allCorrections(): TagCorrection[] {
  return [..._corrections];
}

/** Clear the store (test helper / after a successful export). */
export function clearCorrections(): void {
  _corrections.length = 0;
}

// ── Per-tag precision / recall from corrections ──────────────────────────────

export interface TagQualityStat {
  tagId: string;
  /** Auto-applied & accepted. */
  truePositives: number;
  /** Auto-applied & rejected. */
  falsePositives: number;
  /** Manually added (model missed it). */
  falseNegatives: number;
  precision: number; // tp / (tp + fp)
  recall: number; // tp / (tp + fn)
  /** Suggested fix when quality is poor. */
  recommendation?: string;
}

export function tagQuality(): TagQualityStat[] {
  const agg = new Map<string, { tp: number; fp: number; fn: number }>();
  for (const c of _corrections) {
    const id = canonicalize(c.tagId) ?? c.tagId;
    const e = agg.get(id) ?? { tp: 0, fp: 0, fn: 0 };
    if (c.action === "accept") e.tp++;
    else if (c.action === "reject") e.fp++;
    else if (c.action === "add") e.fn++;
    // "remove" is treated as a false-positive signal too
    else if (c.action === "remove") e.fp++;
    agg.set(id, e);
  }

  return [...agg.entries()].map(([tagId, { tp, fp, fn }]) => {
    const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(3)) : 1;
    const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(3)) : 1;
    let recommendation: string | undefined;
    if (precision < 0.6 && fp >= 3) recommendation = "Tighten keyword rule — high false-positive rate.";
    else if (recall < 0.6 && fn >= 3) recommendation = "Add keywords/synonyms — tag is being missed.";
    return { tagId, truePositives: tp, falsePositives: fp, falseNegatives: fn, precision, recall, recommendation };
  });
}

// ── Retraining artefacts mined from corrections ──────────────────────────────

export interface TrainingExample {
  text: string;
  /** Gold tag IDs the model should predict for this text. */
  goldTagIds: string[];
}

/**
 * Build a labelled multi-label training set from corrections.
 * For each content item, gold = accepted tags ∪ manually-added tags,
 * minus rejected/removed tags.
 */
export function exportTrainingSet(): TrainingExample[] {
  const byContent = new Map<string, { text: string; pos: Set<string>; neg: Set<string> }>();
  for (const c of _corrections) {
    const id = canonicalize(c.tagId) ?? c.tagId;
    const entry = byContent.get(c.contentId) ?? { text: c.text, pos: new Set<string>(), neg: new Set<string>() };
    if (c.action === "accept" || c.action === "add") entry.pos.add(id);
    else entry.neg.add(id);
    byContent.set(c.contentId, entry);
  }
  return [...byContent.values()].map(({ text, pos, neg }) => ({
    text,
    goldTagIds: [...pos].filter((t) => !neg.has(t)),
  }));
}

export interface KeywordProposal {
  tagId: string;
  /** Candidate keyword terms mined from accepted/added examples. */
  terms: string[];
  support: number; // how many examples backed this
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "and", "or", "for", "with", "is", "are", "was",
  "та", "і", "в", "на", "до", "з", "за", "по", "що", "це", "як",
]);

/**
 * Mine keyword-rule proposals: terms that recur in the text of accepted/added
 * examples for a tag but aren't already noise. Feeds `KEYWORD_RULES` curation.
 */
export function proposeKeywordRules(minSupport = 2): KeywordProposal[] {
  const termsByTag = new Map<string, Map<string, number>>();
  for (const c of _corrections) {
    if (c.action !== "accept" && c.action !== "add") continue;
    const id = canonicalize(c.tagId) ?? c.tagId;
    if (!getNode(id)) continue;
    const counts = termsByTag.get(id) ?? new Map<string, number>();
    const words = c.text.toLowerCase().match(/[\p{L}]{4,}/gu) ?? [];
    for (const w of new Set(words)) {
      if (STOPWORDS.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    termsByTag.set(id, counts);
  }

  const out: KeywordProposal[] = [];
  for (const [tagId, counts] of termsByTag) {
    const terms = [...counts.entries()]
      .filter(([, n]) => n >= minSupport)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .slice(0, 8);
    if (terms.length) out.push({ tagId, terms, support: Math.max(...terms.map((t) => counts.get(t)!)) });
  }
  return out;
}

/**
 * Mine synonym proposals: a reviewer rejected a free-form variant and the same
 * content was accepted under a canonical tag → the variant is a candidate synonym.
 */
export function proposeSynonymsFromCorrections(): SynonymRegistration[] {
  const out: SynonymRegistration[] = [];
  const byContent = new Map<string, { rejected: string[]; accepted: string[] }>();
  for (const c of _corrections) {
    const e = byContent.get(c.contentId) ?? { rejected: [], accepted: [] };
    if ((c.action === "reject" || c.action === "remove") && !getNode(c.tagId)) e.rejected.push(c.tagId);
    if (c.action === "accept" || c.action === "add") {
      const id = canonicalize(c.tagId) ?? c.tagId;
      if (getNode(id)) e.accepted.push(id);
    }
    byContent.set(c.contentId, e);
  }
  for (const { rejected, accepted } of byContent.values()) {
    if (accepted.length !== 1) continue; // unambiguous mapping only
    for (const variant of rejected) {
      out.push({ variant, canonicalId: accepted[0], proposedBy: "hitl-miner", source: "auto" });
    }
  }
  return out;
}

/** One-shot retraining bundle a trainer/governance UI consumes. */
export interface RetrainingBundle {
  generatedAt: string;
  exampleCount: number;
  trainingSet: TrainingExample[];
  keywordProposals: KeywordProposal[];
  synonymProposals: SynonymRegistration[];
  quality: TagQualityStat[];
}

export function buildRetrainingBundle(): RetrainingBundle {
  const trainingSet = exportTrainingSet();
  return {
    generatedAt: new Date().toISOString(),
    exampleCount: trainingSet.length,
    trainingSet,
    keywordProposals: proposeKeywordRules(),
    synonymProposals: proposeSynonymsFromCorrections(),
    quality: tagQuality(),
  };
}
