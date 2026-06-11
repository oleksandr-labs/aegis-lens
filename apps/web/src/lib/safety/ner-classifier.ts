/**
 * NER Classifier — named entity recognition for private vs public person detection.
 *
 * Classifies person mentions as private individuals, public figures, organizations,
 * or locations. Used as the first gate in the anti-doxxing pipeline.
 *
 * Класифікує згадки осіб: приватна особа, публічна фігура, організація, локація.
 * Перша перевірка у конвеєрі захисту від доксингу.
 */

// ── PersonType ────────────────────────────────────────────────────────────────

export type PersonType =
  | "private-individual"
  | "public-figure"
  | "organization"
  | "location";

// ── Confidence threshold ──────────────────────────────────────────────────────

/**
 * Minimum confidence score to accept a NER classification result.
 * Below this threshold the entity is treated as ambiguous → escalate to review.
 *
 * Мінімальний рівень впевненості для прийняття результату класифікації.
 */
export const NER_CONFIDENCE_THRESHOLD = 0.8;

// ── Notes ─────────────────────────────────────────────────────────────────────

export const NER_NOTE_EN =
  "Heuristic NER stub. Replace with fine-tuned NLP model (e.g. uk-BERT) in production.";

export const NER_NOTE_UK =
  "Евристичний стаб NER. У продакшені замінити навченою NLP-моделлю (uk-BERT тощо).";

// ── Public-figure name seeds (heuristic baseline) ─────────────────────────────

/**
 * Known public-figure name fragments. Matched case-insensitively.
 * Extend via admin panel; this list is a compile-time baseline only.
 *
 * Відомі публічні особи — базовий список. Розширюється через адмін-панель.
 */
const PUBLIC_FIGURE_SEEDS: string[] = [
  "zelensky",
  "zelenskyy",
  "зеленський",
  "putin",
  "путін",
  "biden",
  "macron",
  "scholz",
  "stoltenberg",
  "zaluzhny",
  "залужний",
  "yermak",
  "єрмак",
];

/**
 * Position / role titles that strongly indicate a public figure.
 *
 * Титули посад, що вказують на публічність особи.
 */
const PUBLIC_FIGURE_TITLES: RegExp[] = [
  /\bpresident\b/i,
  /\bprime\s+minister\b/i,
  /\bminister\b/i,
  /\bgeneral\b/i,
  /\bambassador\b/i,
  /\bсенатор\b/i,
  /\bпрезидент\b/i,
  /\bпрем'єр\b/i,
  /\bміністр\b/i,
  /\bгенерал\b/i,
  /\bпосол\b/i,
  /\bchief\s+executive\b/i,
  /\bceo\b/i,
  /\bмер\s+міста\b/i,
];

const ORGANIZATION_MARKERS: RegExp[] = [
  /\bltd\b/i,
  /\bllc\b/i,
  /\bplc\b/i,
  /\binc\b/i,
  /\bcorp\b/i,
  /\bgroup\b/i,
  /\bтов\b/i,
  /\bпат\b/i,
  /\bат\b/i,
];

const LOCATION_MARKERS: RegExp[] = [
  /\bcity\s+of\b/i,
  /\bvillage\b/i,
  /\bdistrict\b/i,
  /\boblast\b/i,
  /\bобласть\b/i,
  /\bмісто\b/i,
  /\bсело\b/i,
  /\bрайон\b/i,
];

// ── Result type ───────────────────────────────────────────────────────────────

export interface NerClassifierResult {
  /** The matched token / span in the original text */
  span: string;
  /** Character offset where the span starts */
  startIndex: number;
  personType: PersonType;
  /** 0-1 confidence score produced by the heuristic */
  confidence: number;
  /** True when confidence >= NER_CONFIDENCE_THRESHOLD */
  accepted: boolean;
}

// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * Classify all person-like mentions in `text`.
 * Heuristic stub: uses seed lists + regex patterns to assign PersonType.
 * Confidence is 0.9 for seed hits, 0.75 for title-only matches.
 *
 * Класифікує всі згадки осіб у тексті за евристиками.
 */
export function classifyPersonMentions(text: string): NerClassifierResult[] {
  const results: NerClassifierResult[] = [];
  const lower = text.toLowerCase();

  // ── Pass 1: known public-figure seeds ─────────────────────────────────────
  for (const seed of PUBLIC_FIGURE_SEEDS) {
    let idx = lower.indexOf(seed.toLowerCase());
    while (idx !== -1) {
      // Extract the surrounding word boundary (simple: grab the token)
      const start = idx;
      const end = idx + seed.length;
      const span = text.slice(start, end);
      const confidence = 0.9;
      results.push({
        span,
        startIndex: start,
        personType: "public-figure",
        confidence,
        accepted: confidence >= NER_CONFIDENCE_THRESHOLD,
      });
      idx = lower.indexOf(seed.toLowerCase(), end);
    }
  }

  // ── Pass 2: position title detection → public figure ──────────────────────
  for (const pattern of PUBLIC_FIGURE_TITLES) {
    const match = pattern.exec(text);
    if (match) {
      const confidence = 0.75;
      results.push({
        span: match[0],
        startIndex: match.index,
        personType: "public-figure",
        confidence,
        accepted: confidence >= NER_CONFIDENCE_THRESHOLD,
      });
    }
  }

  // ── Pass 3: organization markers ──────────────────────────────────────────
  for (const pattern of ORGANIZATION_MARKERS) {
    const match = pattern.exec(text);
    if (match) {
      const confidence = 0.85;
      results.push({
        span: match[0],
        startIndex: match.index,
        personType: "organization",
        confidence,
        accepted: confidence >= NER_CONFIDENCE_THRESHOLD,
      });
    }
  }

  // ── Pass 4: location markers ───────────────────────────────────────────────
  for (const pattern of LOCATION_MARKERS) {
    const match = pattern.exec(text);
    if (match) {
      const confidence = 0.85;
      results.push({
        span: match[0],
        startIndex: match.index,
        personType: "location",
        confidence,
        accepted: confidence >= NER_CONFIDENCE_THRESHOLD,
      });
    }
  }

  return results;
}
