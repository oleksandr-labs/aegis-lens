/**
 * Plagiarism / near-duplicate guard.
 *
 * Two complementary checks, both dependency-free:
 *   1. Lexical near-duplicate via character-shingled Jaccard similarity.
 *   2. Optional semantic near-duplicate via cosine similarity of supplied
 *      embeddings (caller provides vectors from the embedding service).
 *
 * Used to (a) stop the generator from re-publishing copy that collides with an
 * EXISTING page, and (b) catch verbatim lifting from a source. Produces a
 * `near_duplicate` quality issue the caller folds into the gate.
 */

import type { QualityIssue } from "./types";

export interface ExistingPageText {
  pageId: string;
  text: string;
  embedding?: number[];
}

export interface DedupConfig {
  /** Jaccard >= this → lexical near-duplicate. */
  lexicalThreshold: number;
  /** Cosine >= this → semantic near-duplicate. */
  semanticThreshold: number;
  /** Shingle size in characters. */
  shingleSize: number;
}

export const DEFAULT_DEDUP_CONFIG: DedupConfig = {
  lexicalThreshold: 0.82,
  semanticThreshold: 0.95,
  shingleSize: 5,
};

export interface DedupMatch {
  pageId: string;
  lexical: number;
  semantic?: number;
}

export interface DedupResult {
  isDuplicate: boolean;
  matches: DedupMatch[];
  issue?: QualityIssue;
}

function shingles(text: string, size: number): Set<string> {
  const norm = text.toLowerCase().replace(/\s+/g, " ").trim();
  const out = new Set<string>();
  for (let i = 0; i + size <= norm.length; i++) out.add(norm.slice(i, i + size));
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  return inter / (a.size + b.size - inter);
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export function checkDuplicate(
  candidate: string,
  candidateEmbedding: number[] | undefined,
  existing: ExistingPageText[],
  config: Partial<DedupConfig> = {},
): DedupResult {
  const cfg = { ...DEFAULT_DEDUP_CONFIG, ...config };
  const candShingles = shingles(candidate, cfg.shingleSize);
  const matches: DedupMatch[] = [];

  for (const page of existing) {
    const lex = jaccard(candShingles, shingles(page.text, cfg.shingleSize));
    let sem: number | undefined;
    if (candidateEmbedding && page.embedding) sem = cosine(candidateEmbedding, page.embedding);
    const dup = lex >= cfg.lexicalThreshold || (sem !== undefined && sem >= cfg.semanticThreshold);
    if (dup) matches.push({ pageId: page.pageId, lexical: Number(lex.toFixed(4)), semantic: sem });
  }

  const isDuplicate = matches.length > 0;
  return {
    isDuplicate,
    matches,
    issue: isDuplicate
      ? {
          flag: "near_duplicate",
          severity: 0.85,
          detail: `Near-duplicate of existing page(s): ${matches.map((m) => m.pageId).join(", ")}.`,
        }
      : undefined,
  };
}
