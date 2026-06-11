/**
 * Heuristic emergency classifier (missiles-classifier style).
 *
 * Maps DSNS report text (uk + en keywords) → a typed EmergencyType plus a
 * derived severity. Order matters: more specific / higher-severity types are
 * tested first so that, e.g., "вибух + пожежа" classifies primarily as
 * explosion while still recording fire as a secondary signal.
 */

import type {
  DsnsRawReport,
  EmergencyClassification,
  EmergencyType,
} from "./types";
import { EMERGENCY_TYPE_META } from "./types";

interface Pattern {
  type: EmergencyType;
  /** Lowercased substrings (uk + en). */
  keywords: string[];
  confidence: number;
}

/** Probe order = priority. */
const PATTERNS: Pattern[] = [
  {
    type: "explosion",
    keywords: ["вибух", "детонац", "explosion", "detonat", "blast"],
    confidence: 0.85,
  },
  {
    type: "demining",
    keywords: [
      "розмінуван", "знешкодж", "піротехн", "сапер", "боєприпас",
      "вибухонебезпечн", "demining", "eod", "ordnance", "ulo", "uxo", "defus",
    ],
    confidence: 0.88,
  },
  {
    type: "collapse",
    keywords: ["обвален", "завал", "руйнуван", "collapse", "rubble", "debris"],
    confidence: 0.82,
  },
  {
    type: "hazmat",
    keywords: [
      "хімічн", "небезпечн речовин", "витік", "аміак", "хлор",
      "hazmat", "chemical", "leak", "ammonia", "chlorine",
    ],
    confidence: 0.8,
  },
  {
    type: "flood",
    keywords: ["підтоплен", "повін", "затоплен", "дамб", "flood", "inundat", "dam breach"],
    confidence: 0.82,
  },
  {
    type: "fire",
    keywords: ["пожеж", "займанн", "загорянн", "горінн", "вогон", "fire", "blaze", "ablaze"],
    confidence: 0.84,
  },
  {
    type: "evacuation",
    keywords: ["евакуац", "евакуй", "відселен", "evacuat"],
    confidence: 0.8,
  },
  {
    type: "rescue",
    keywords: [
      "врятован", "порятун", "рятувальн", "деблокув", "розбир завал",
      "rescue", "rescued", "extricat", "search and rescue", "trapped",
    ],
    confidence: 0.78,
  },
];

function matches(lower: string, kws: string[]): string[] {
  return kws.filter((kw) => lower.includes(kw));
}

/** Classify a single block of text. */
export function classifyText(text: string): EmergencyClassification {
  const lower = text.toLowerCase();
  let primary: { type: EmergencyType; confidence: number; matched: string[] } | undefined;
  const also: EmergencyType[] = [];

  for (const p of PATTERNS) {
    const hit = matches(lower, p.keywords);
    if (hit.length === 0) continue;
    if (!primary) {
      primary = { type: p.type, confidence: p.confidence, matched: hit };
    } else if (p.type !== primary.type && !also.includes(p.type)) {
      also.push(p.type);
    }
  }

  if (!primary) {
    return { type: "other", confidence: 0.4, matchedKeywords: [] };
  }

  // Multiple corroborating signals nudge confidence up (capped).
  const boosted = Math.min(0.97, primary.confidence + Math.min(also.length, 2) * 0.03);
  return {
    type: primary.type,
    confidence: boosted,
    matchedKeywords: primary.matched,
    alsoDetected: also.length ? also : undefined,
  };
}

/** Derive a 1–5 severity from the type + corroborating signals. */
export function deriveSeverity(c: EmergencyClassification): 1 | 2 | 3 | 4 | 5 {
  let sev = EMERGENCY_TYPE_META[c.type].baseSeverity;
  // Explosion co-occurring with fire/collapse → escalate.
  if (c.type === "explosion" && (c.alsoDetected?.includes("collapse") || c.alsoDetected?.includes("fire"))) {
    sev = 5;
  }
  if (c.type === "collapse" && c.alsoDetected?.includes("rescue")) {
    sev = Math.min(5, sev + 1) as 1 | 2 | 3 | 4 | 5;
  }
  return sev;
}

/** Convenience: classify a raw report and return type + severity + confidence. */
export function extractEmergency(report: DsnsRawReport): {
  classification: EmergencyClassification;
  severity: 1 | 2 | 3 | 4 | 5;
} {
  const classification = classifyText(`${report.titleUk ?? ""}. ${report.text}`);
  return { classification, severity: deriveSeverity(classification) };
}
