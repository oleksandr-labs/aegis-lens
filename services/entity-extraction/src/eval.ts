/**
 * Entity-extraction evaluation — precision / recall / F1 per entity class.
 *
 * Mirrors the NLP service eval harness (services/nlp/src/eval): a labelled golden
 * set of UK + EN sentences with expected `EntityMention`s, and a scorer that
 * computes per-class and macro precision/recall/F1 against an extractor's output.
 * Matching is span-overlap + class-equality (lenient on exact offsets, strict on
 * type) so transliteration variants still count when text overlaps.
 *
 * Run against `extractWithPatterns` (patterns.ts) or any function with the
 * `ExtractorFn` shape, so model upgrades are regression-checked the same way.
 */

import { EntityClass, EntityMention } from "./types";
import { extractWithPatterns } from "./patterns";

export interface EntityEvalCase {
  id: string;
  text: string;
  language: "uk" | "en";
  expected: Array<{ text: string; entityClass: EntityClass }>;
}

export type ExtractorFn = (text: string, lang: string) => EntityMention[];

// ── Golden set (UK + EN, conflict domain) ──────────────────────────────────────

export const ENTITY_GOLDEN_SET: EntityEvalCase[] = [
  {
    id: "ee-en-001",
    text: "A Shahed-136 drone was intercepted over Kyiv as the 3rd Separate Assault Brigade advanced.",
    language: "en",
    expected: [
      { text: "Shahed-136", entityClass: "equipment" },
      { text: "Kyiv", entityClass: "region" },
      { text: "3rd Separate Assault Brigade", entityClass: "military_unit" },
    ],
  },
  {
    id: "ee-en-002",
    text: "Kinzhal and Kalibr missiles struck Kharkiv overnight; two Lancet-3 munitions were also used.",
    language: "en",
    expected: [
      { text: "Kinzhal", entityClass: "equipment" },
      { text: "Kalibr", entityClass: "equipment" },
      { text: "Kharkiv", entityClass: "region" },
      { text: "Lancet-3", entityClass: "equipment" },
    ],
  },
  {
    id: "ee-en-003",
    text: "Patriot and NASAMS systems defended Odesa; the GRU was blamed for the cyberattack.",
    language: "en",
    expected: [
      { text: "Patriot", entityClass: "equipment" },
      { text: "NASAMS", entityClass: "equipment" },
      { text: "Odesa", entityClass: "region" },
    ],
  },
  {
    id: "ee-uk-001",
    text: "Шахед-136 був збитий над Києвом; ЗСУ повідомили про обстріл Харкова.",
    language: "uk",
    expected: [
      { text: "Шахед-136", entityClass: "equipment" },
      { text: "Києв", entityClass: "region" },
      { text: "ЗСУ", entityClass: "organisation" },
      { text: "Харков", entityClass: "region" },
    ],
  },
  {
    id: "ee-uk-002",
    text: "Кинджал та Калібр уразили Львів і Дніпро; задіяно ланцет-3.",
    language: "uk",
    expected: [
      { text: "Кинджал", entityClass: "equipment" },
      { text: "Львів", entityClass: "region" },
      { text: "Дніпро", entityClass: "region" },
      { text: "ланцет-3", entityClass: "equipment" },
    ],
  },
  {
    id: "ee-uk-003",
    text: "С-300 і С-400 били по Запоріжжю; СБУ та ГУР розслідують.",
    language: "uk",
    expected: [
      { text: "С-300", entityClass: "equipment" },
      { text: "С-400", entityClass: "equipment" },
      { text: "Запоріжж", entityClass: "region" },
    ],
  },
];

// ── Scoring ────────────────────────────────────────────────────────────────────

export interface ClassMetrics {
  entityClass: EntityClass;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  support: number; // number of gold mentions of this class
}

export interface EntityEvalSummary {
  perClass: ClassMetrics[];
  /** Unweighted mean of per-class F1 (treats rare classes equally). */
  macroF1: number;
  /** Pooled precision/recall/F1 across all classes. */
  microPrecision: number;
  microRecall: number;
  microF1: number;
  byLanguage: Record<string, { precision: number; recall: number; f1: number }>;
  totalGold: number;
  totalPredicted: number;
}

function matches(gold: { text: string }, pred: EntityMention): boolean {
  const g = gold.text.toLowerCase();
  const p = pred.text.toLowerCase();
  return p.includes(g) || g.includes(p);
}

function prf(tp: number, fp: number, fn: number): { precision: number; recall: number; f1: number } {
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return {
    precision: parseFloat(precision.toFixed(3)),
    recall: parseFloat(recall.toFixed(3)),
    f1: parseFloat(f1.toFixed(3)),
  };
}

/** Evaluate an extractor against the golden set; returns per-class + aggregate metrics. */
export function evaluateExtractor(
  extractor: ExtractorFn = extractWithPatterns,
  cases: EntityEvalCase[] = ENTITY_GOLDEN_SET,
): EntityEvalSummary {
  // Per-class tallies
  const tally = new Map<EntityClass, { tp: number; fp: number; fn: number; support: number }>();
  const langTally = new Map<string, { tp: number; fp: number; fn: number }>();

  const bump = (m: Map<string, { tp: number; fp: number; fn: number }>, k: string) => {
    if (!m.has(k)) m.set(k, { tp: 0, fp: 0, fn: 0 });
    return m.get(k)!;
  };
  const bumpClass = (k: EntityClass) => {
    if (!tally.has(k)) tally.set(k, { tp: 0, fp: 0, fn: 0, support: 0 });
    return tally.get(k)!;
  };

  let totalGold = 0;
  let totalPredicted = 0;

  for (const c of cases) {
    const predicted = extractor(c.text, c.language);
    totalGold += c.expected.length;
    totalPredicted += predicted.length;

    const usedPred = new Set<number>();
    const lt = bump(langTally, c.language);

    // Gold-driven: each gold mention is a TP if some unused prediction of the same class matches.
    for (const gold of c.expected) {
      const ct = bumpClass(gold.entityClass);
      ct.support++;
      const idx = predicted.findIndex(
        (p, i) => !usedPred.has(i) && p.entityClass === gold.entityClass && matches(gold, p),
      );
      if (idx >= 0) {
        usedPred.add(idx);
        ct.tp++;
        lt.tp++;
      } else {
        ct.fn++;
        lt.fn++;
      }
    }

    // Unmatched predictions = false positives.
    predicted.forEach((p, i) => {
      if (!usedPred.has(i)) {
        bumpClass(p.entityClass).fp++;
        lt.fp++;
      }
    });
  }

  const perClass: ClassMetrics[] = [...tally.entries()].map(([entityClass, t]) => ({
    entityClass,
    truePositives: t.tp,
    falsePositives: t.fp,
    falseNegatives: t.fn,
    support: t.support,
    ...prf(t.tp, t.fp, t.fn),
  }));

  const macroF1 = perClass.length > 0
    ? parseFloat((perClass.reduce((s, c) => s + c.f1, 0) / perClass.length).toFixed(3))
    : 0;

  const micro = (() => {
    const tp = perClass.reduce((s, c) => s + c.truePositives, 0);
    const fp = perClass.reduce((s, c) => s + c.falsePositives, 0);
    const fn = perClass.reduce((s, c) => s + c.falseNegatives, 0);
    return prf(tp, fp, fn);
  })();

  const byLanguage: Record<string, { precision: number; recall: number; f1: number }> = {};
  for (const [lang, t] of langTally.entries()) byLanguage[lang] = prf(t.tp, t.fp, t.fn);

  return {
    perClass: perClass.sort((a, b) => b.support - a.support),
    macroF1,
    microPrecision: micro.precision,
    microRecall: micro.recall,
    microF1: micro.f1,
    byLanguage,
    totalGold,
    totalPredicted,
  };
}

/** Human-readable report (regression dashboard / CI log). */
export function formatEntityEvalReport(summary: EntityEvalSummary): string {
  const lines = [
    "=== Entity Extraction Eval ===",
    `Micro  P/R/F1 : ${summary.microPrecision} / ${summary.microRecall} / ${summary.microF1}`,
    `Macro  F1     : ${summary.macroF1}`,
    `Gold: ${summary.totalGold} | Predicted: ${summary.totalPredicted}`,
    "",
    "Per class (P / R / F1, support):",
    ...summary.perClass.map(
      (c) => `  ${c.entityClass.padEnd(14)} ${c.precision} / ${c.recall} / ${c.f1}  (n=${c.support})`,
    ),
    "",
    "Per language (P / R / F1):",
    ...Object.entries(summary.byLanguage).map(([l, m]) => `  ${l}: ${m.precision} / ${m.recall} / ${m.f1}`),
  ];
  return lines.join("\n");
}
