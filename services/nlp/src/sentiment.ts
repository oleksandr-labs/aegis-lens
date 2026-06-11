/**
 * Sentiment & stance detection for conflict-domain text.
 *
 * Two components:
 *   1. Lexicon-based polarity (fast, language-agnostic backbone)
 *   2. Keyword-based stance detection (pro-Ukraine / pro-Russia / neutral)
 *
 * Production upgrade: swap the model-based path to a fine-tuned
 * multilingual DeBERTa or Llama-based classifier.
 */

import type { SentimentResult, SupportedLocale } from "./types";

// ── Polarity lexicon ─────────────────────────────────────────────────────────

interface LexiconEntry {
  terms: string[];
  polarity: number; // -1 to +1
}

const POLARITY_LEXICON: LexiconEntry[] = [
  // Negative (conflict domain)
  { terms: ["killed", "dead", "destroyed", "attack", "struck", "hit", "bombing", "shelling", "explosion",
            "убитий", "загинув", "знищено", "обстріл", "удар", "вибух", "пожежа", "жертви", "поранений",
            "casualties", "wounded", "damage", "зруйновано", "пошкоджено"], polarity: -0.7 },
  { terms: ["war", "conflict", "invasion", "occupation", "annexed", "atrocity",
            "війна", "конфлікт", "вторгнення", "окупація", "злочин", "геноцид"], polarity: -0.9 },
  { terms: ["warning", "alert", "evacuation", "danger", "threat", "risk",
            "попередження", "тривога", "евакуація", "небезпека", "загроза"], polarity: -0.5 },

  // Positive
  { terms: ["intercepted", "shot down", "defeated", "liberated", "repelled", "pushed back", "success",
            "збито", "перехоплено", "відбито", "звільнено", "успіх", "перемога"], polarity: 0.5 },
  { terms: ["humanitarian", "aid", "rescue", "evacuated", "safe", "restored", "repair",
            "допомога", "рятування", "безпечно", "відновлено", "відремонтовано"], polarity: 0.4 },
];

// ── Stance lexicon ────────────────────────────────────────────────────────────

const PRO_UKRAINE_TERMS = [
  "slava ukraini", "слава україні", "glory to ukraine", "zbrojni syly",
  "ukraine wins", "зсу", "armed forces of ukraine", "ukrainian army",
  "free ukraine", "ukrainian resistance", "ukraine defended",
  "ппо збила", "air defense destroyed",
];

const PRO_RUSSIA_TERMS = [
  "специальная военная операция", "свo", "denazification", "demilitarization",
  "nato expansion", "liberation", "referendum", "донбас вернулся",
  "russia defends", "russian forces advanced", "captured by russia",
  "z force", "#zov", "освобождение",
];

const NEUTRAL_INDICATORS = [
  "according to", "reports indicate", "confirmed by", "stated that",
  "за повідомленням", "за даними", "підтверджено", "зазначається",
];

// ── Implementation ─────────────────────────────────────────────────────────────

function computePolarity(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  let matches = 0;

  for (const entry of POLARITY_LEXICON) {
    for (const term of entry.terms) {
      if (lower.includes(term)) {
        score += entry.polarity;
        matches++;
        break; // one match per entry
      }
    }
  }

  if (matches === 0) return 0;
  return Math.max(-1, Math.min(1, score / matches));
}

function computeSubjectivity(text: string): number {
  // High subjectivity: first-person, emotive, exclamation
  const lower = text.toLowerCase();
  const signals = [
    /\bwe\b|\bour\b|\bі\b|\bнаш/i.test(lower),
    /!/.test(text),
    /(must|should|мають|треба|потрібно)/i.test(lower),
    /(victory|перемога|glory|слава)/i.test(lower),
  ].filter(Boolean).length;
  return Math.min(1, signals / 4 + 0.1);
}

function computeStance(text: string): SentimentResult["stance"] {
  const lower = text.toLowerCase();

  const proUAScore = PRO_UKRAINE_TERMS.filter((t) => lower.includes(t)).length;
  const proRUScore = PRO_RUSSIA_TERMS.filter((t) => lower.includes(t)).length;
  const neutralScore = NEUTRAL_INDICATORS.filter((t) => lower.includes(t)).length;

  if (proUAScore === 0 && proRUScore === 0) {
    return neutralScore > 0 ? "neutral" : "unclear";
  }
  if (proUAScore > proRUScore) return "pro_ukraine";
  if (proRUScore > proUAScore) return "pro_russia";
  return "unclear";
}

export function analyseSentiment(text: string, _locale?: SupportedLocale): SentimentResult {
  return {
    polarity: parseFloat(computePolarity(text).toFixed(3)),
    subjectivity: parseFloat(computeSubjectivity(text).toFixed(3)),
    stance: computeStance(text),
  };
}

/** Batch analysis — returns results in same order as inputs. */
export function analyseSentimentBatch(texts: string[]): SentimentResult[] {
  return texts.map((t) => analyseSentiment(t));
}
