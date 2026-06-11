/**
 * Regex-based entity extraction patterns for military/OSINT domain.
 * Covers Ukrainian (Cyrillic) and English text.
 */

import { EntityClass, EntityMention } from "./types";

interface PatternRule {
  pattern: RegExp;
  entityClass: EntityClass;
  confidence: number;
  normalise?: (match: string) => string;
}

const PATTERNS: PatternRule[] = [
  // ── Equipment models ────────────────────────────────────────────────────
  {
    pattern: /\b(shahed[-\s]?\d{2,3}|шахед[-\s]?\d{2,3}|герань[-\s]?\d)\b/gi,
    entityClass: "equipment",
    confidence: 0.9,
    normalise: (m) => m.toLowerCase().replace(/\s/g, "-"),
  },
  {
    pattern: /\b(lancet[-\s]?\d|ланцет[-\s]?\d|kh[-\s]?\d{2,3}[a-z]?|х[-\s]?\d{2,3}[а-яa-z]?)\b/gi,
    entityClass: "equipment",
    confidence: 0.88,
  },
  {
    pattern: /\b(iskander[-\s][mk]|іскандер[-\s][мк]|kinzhal|кинджал|kalibr|каліьбр|himars|гімарс|atacms|атакмс)\b/gi,
    entityClass: "equipment",
    confidence: 0.92,
  },
  {
    pattern: /\b(t[-\s]?(?:54|55|62|64|72|80|90)|leopard\s?2|abrams\s?m1|bradley|bmp[-\s]?\d|btр[-\s]?\d{2,3})\b/gi,
    entityClass: "equipment",
    confidence: 0.85,
  },
  {
    pattern: /\b(patriot|gepard|iris[-\s]t|hawk missile|nasams|s[-\s]?300|с[-\s]?300|s[-\s]?400|с[-\s]?400)\b/gi,
    entityClass: "equipment",
    confidence: 0.9,
    normalise: (m) => m.toLowerCase(),
  },

  // ── Military units ────────────────────────────────────────────────────────
  {
    pattern: /\b(\d{1,3}(?:st|nd|rd|th)?\s+(?:separate\s+)?(?:assault|mechanized|tank|airborne|marine|artillery|special)\s+(?:brigade|battalion|regiment|division|corps))\b/gi,
    entityClass: "military_unit",
    confidence: 0.82,
  },
  {
    pattern: /\b(\d{1,3}[-\s](?:ОШБ|ОМБр|ТРО|АК|ДШБ|ПДМПБ))\b/g,
    entityClass: "military_unit",
    confidence: 0.85,
  },
  {
    pattern: /\b(ЗСУ|ГШ ЗСУ|СБУ|ГУР|НГУ|ДСНС|ВМС|ПС|АА)\b/g,
    entityClass: "organisation",
    confidence: 0.88,
  },

  // ── Ukrainian oblasts ─────────────────────────────────────────────────────
  {
    pattern: /\b(kyiv|kharkiv|odesa|dnipro|zaporizhzhia|lviv|donetsk|luhansk|sumy|mykolaiv|kherson|poltava|chernihiv|zhytomyr|vinnytsia|cherkasy|kirovohrad|rivne|volyn|zakarpattia|ternopil|khmelnytskyi|ivano[-\s]frankivsk|chernivtsi|crimea)\b/gi,
    entityClass: "region",
    confidence: 0.88,
  },
  {
    pattern: /\b(харків|київ|одеса|дніпро|запоріжжя|львів|донецьк|луганськ|суми|миколаїв|херсон|полтава|чернігів|житомир|вінниця|черкаси|кіровоград|рівне|волинь|закарпаття|тернопіль|хмельниць|івано[-\s]франківськ|чернівці|крим)\b/gi,
    entityClass: "region",
    confidence: 0.9,
  },

  // ── Temporal expressions ──────────────────────────────────────────────────
  {
    pattern: /\b(today|yesterday|tonight|this morning|this evening|вчора|сьогодні|сьогодні вночі|вранці)\b/gi,
    entityClass: "date_time",
    confidence: 0.75,
  },
  {
    pattern: /\b(\d{1,2}:\d{2}(?:\s?(?:AM|PM|UTC|GMT|EEST))?)|\b(\d{4}-\d{2}-\d{2})\b/gi,
    entityClass: "date_time",
    confidence: 0.85,
  },

  // ── Quantities ────────────────────────────────────────────────────────────
  {
    pattern: /\b(\d+(?:\.\d+)?\s*(?:km|км|meter|meter[s]|метр[ів]|tons?|тонн|missiles?|ракет|drones?|дрон|killed|загину|wounded|поранен))\b/gi,
    entityClass: "quantity",
    confidence: 0.8,
  },
];

export function extractWithPatterns(text: string, lang: string = "uk"): EntityMention[] {
  const mentions: EntityMention[] = [];

  for (const rule of PATTERNS) {
    let match: RegExpExecArray | null;
    // Reset lastIndex for global patterns
    rule.pattern.lastIndex = 0;

    while ((match = rule.pattern.exec(text)) !== null) {
      const surface = match[0];
      mentions.push({
        text: surface,
        start: match.index,
        end: match.index + surface.length,
        entityClass: rule.entityClass,
        confidence: rule.confidence,
        normalised: rule.normalise ? rule.normalise(surface) : undefined,
        language: lang,
      });
    }
  }

  // Deduplicate overlapping spans (keep highest confidence)
  return deduplicateSpans(mentions);
}

function deduplicateSpans(mentions: EntityMention[]): EntityMention[] {
  const sorted = [...mentions].sort((a, b) => b.confidence - a.confidence);
  const result: EntityMention[] = [];

  for (const candidate of sorted) {
    const overlaps = result.some(
      (existing) => candidate.start < existing.end && candidate.end > existing.start,
    );
    if (!overlaps) result.push(candidate);
  }

  return result.sort((a, b) => a.start - b.start);
}
