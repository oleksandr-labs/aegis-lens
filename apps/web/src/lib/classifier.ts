import "server-only";
import type { EventClass } from "@aegis/types";
import { ALL_CLASSES } from "@/lib/filter-config";
import { CITIES } from "@/lib/cities-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { EQUIPMENT } from "@/lib/seed-data";
import { COMPANIES } from "@/lib/directory-seed";

/**
 * Heuristic, server-side classifier + entity extractor.
 *
 * Pure regex / keyword mapping — no LLM required. Used by the
 * `/tools/classifier` demo page and the public `/api/classify` endpoint.
 *
 * Class IDs are pulled from {@link ALL_CLASSES} so the keyword table stays
 * in lockstep with the rest of the app's filter taxonomy.
 */

export type Classification = {
  class: EventClass | null;
  subclass: string | null;
  confidence: number;
  signals: string[];
};

export type Entity = {
  type: "place" | "person" | "org" | "equipment";
  value: string;
  span: [number, number];
};

type Rule = {
  class: EventClass;
  subclass: string;
  /** Lowercase keyword phrases — matched as whole-ish substrings. */
  keywords: string[];
  /** Per-rule base confidence. */
  confidence: number;
};

/**
 * Keyword → class/subclass table.
 * Order matters: first matching rule wins; later matches can still add signals.
 */
const RULES: Rule[] = [
  {
    class: "military_action",
    subclass: "drone_strike",
    keywords: ["shahed", "lancet", "kamikaze drone", "loitering munition", "fpv drone"],
    confidence: 0.85,
  },
  {
    class: "military_action",
    subclass: "missile_strike",
    keywords: ["iskander", "kalibr", "kinzhal", "kh-101", "kh-22", "cruise missile", "ballistic missile"],
    confidence: 0.85,
  },
  {
    class: "military_action",
    subclass: "artillery",
    keywords: ["artillery", "shelling", "mortar", "grad", "himars"],
    confidence: 0.75,
  },
  {
    class: "military_action",
    subclass: "ground_combat",
    keywords: ["offensive", "counter-offensive", "armored assault", "infantry assault"],
    confidence: 0.7,
  },
  {
    class: "infrastructure",
    subclass: "energy_grid",
    keywords: ["substation", "transformer", "power grid", "blackout", "tpp", "thermal power", "high-voltage"],
    confidence: 0.85,
  },
  {
    class: "infrastructure",
    subclass: "water",
    keywords: ["water supply", "pumping station", "reservoir", "dam"],
    confidence: 0.75,
  },
  {
    class: "infrastructure",
    subclass: "rail",
    keywords: ["railway", "rail line", "locomotive", "ukrzaliznytsia"],
    confidence: 0.75,
  },
  {
    class: "cyber",
    subclass: "malware",
    keywords: ["phishing", "ransomware", "malware", "trojan", "spear-phishing", "credential theft"],
    confidence: 0.85,
  },
  {
    class: "cyber",
    subclass: "ddos",
    keywords: ["ddos", "denial of service", "botnet flood"],
    confidence: 0.85,
  },
  {
    class: "cyber",
    subclass: "intrusion",
    keywords: ["data breach", "exfiltration", "lateral movement", "intrusion"],
    confidence: 0.75,
  },
  {
    class: "maritime",
    subclass: "ais_spoofing",
    keywords: ["ais spoof", "ais spoofing", "gnss spoof", "gps spoof"],
    confidence: 0.9,
  },
  {
    class: "maritime",
    subclass: "vessel_incident",
    keywords: ["tanker", "cargo ship", "vessel", "shadow fleet"],
    confidence: 0.65,
  },
  {
    class: "aviation",
    subclass: "airspace_incursion",
    keywords: ["airspace violation", "airspace incursion", "scrambled jets", "nato airspace"],
    confidence: 0.8,
  },
  {
    class: "aviation",
    subclass: "drone_overflight",
    keywords: ["unidentified drone", "drone sighting", "unknown uav"],
    confidence: 0.7,
  },
  {
    class: "civilian_alert",
    subclass: "air_raid",
    keywords: ["air raid", "air-raid alert", "siren", "shelter in place"],
    confidence: 0.85,
  },
  {
    class: "humanitarian",
    subclass: "aid_convoy",
    keywords: ["aid convoy", "humanitarian corridor", "evacuation", "refugee"],
    confidence: 0.75,
  },
  {
    class: "environmental",
    subclass: "spill",
    keywords: ["oil spill", "chemical leak", "contamination", "toxic plume"],
    confidence: 0.8,
  },
  {
    class: "political",
    subclass: "statement",
    keywords: ["sanctions", "summit", "ministry of foreign affairs", "diplomatic"],
    confidence: 0.6,
  },
  {
    class: "economic",
    subclass: "sanctions",
    keywords: ["export ban", "price cap", "frozen assets", "secondary sanctions"],
    confidence: 0.7,
  },
];

// Sanity guard: every rule references a known class id.
const KNOWN_CLASS_IDS = new Set(ALL_CLASSES.map((c) => c.id));
for (const r of RULES) {
  if (!KNOWN_CLASS_IDS.has(r.class)) {
    throw new Error(`classifier: unknown class id "${r.class}" in rule table`);
  }
}

/**
 * Classify free text via keyword matching.
 *
 * Returns the first rule that matches, with `signals` listing every matched
 * keyword across all rules (useful for explainability). If nothing matches,
 * returns `{ class: null, subclass: null, confidence: 0, signals: [] }`.
 */
export function classifyText(text: string): Classification {
  const haystack = text.toLowerCase();
  const signals: string[] = [];
  let winner: Rule | null = null;

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (haystack.includes(kw)) {
        if (!signals.includes(kw)) signals.push(kw);
        if (!winner) winner = rule;
      }
    }
  }

  if (!winner) {
    return { class: null, subclass: null, confidence: 0, signals: [] };
  }
  return {
    class: winner.class,
    subclass: winner.subclass,
    confidence: winner.confidence,
    signals,
  };
}

/** Escape a string for safe use inside a RegExp source. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find all case-insensitive whole-word occurrences of `needle` in `text`.
 * Returns the matched span(s) using the original (un-lowercased) value
 * read from `text` at each span position.
 */
function findAll(text: string, needle: string): { value: string; span: [number, number] }[] {
  if (!needle) return [];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(needle)}(?![\\p{L}\\p{N}])`, "giu");
  const out: { value: string; span: [number, number] }[] = [];
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    out.push({ value: text.slice(start, start + m[0].length), span: [start, start + m[0].length] });
  }
  return out;
}

/**
 * Extract place / equipment / org entities by matching seed-data names
 * against the input text. People are intentionally skipped for now.
 */
export function extractEntities(text: string): Entity[] {
  const found: Entity[] = [];
  const seen = new Set<string>();

  const push = (type: Entity["type"], value: string, span: [number, number]) => {
    const key = `${type}:${span[0]}:${span[1]}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ type, value, span });
  };

  // Places: cities (all locale names) + oblasts.
  for (const city of CITIES) {
    for (const n of Object.values(city.name)) {
      if (!n) continue;
      for (const hit of findAll(text, n)) push("place", hit.value, hit.span);
    }
  }
  for (const ob of listOblasts("ua").concat(listOblasts("pl")).concat(listOblasts("de"))) {
    for (const n of Object.values(ob.name)) {
      if (!n) continue;
      for (const hit of findAll(text, n)) push("place", hit.value, hit.span);
    }
  }

  // Equipment: slug (kebab-case) + English name.
  for (const eq of EQUIPMENT) {
    for (const hit of findAll(text, eq.slug)) push("equipment", hit.value, hit.span);
    if (eq.name.en) {
      for (const hit of findAll(text, eq.name.en)) push("equipment", hit.value, hit.span);
    }
  }

  // Orgs: company names.
  for (const co of COMPANIES) {
    for (const hit of findAll(text, co.name)) push("org", hit.value, hit.span);
  }

  // Sort by span start for stable, readable output.
  found.sort((a, b) => a.span[0] - b.span[0]);
  return found;
}

/**
 * Pull the first plausible decimal-degrees coordinate pair from `text`.
 * Matches forms like `50.4501, 30.5234` or `46.98,31.99`. Ranges are
 * validated against the WGS84 lat/lon envelope.
 */
export function extractCoords(text: string): { lat: number; lon: number } | null {
  const re = /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/g;
  for (const m of text.matchAll(re)) {
    const lat = Number(m[1]);
    const lon = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { lat, lon };
    }
  }
  return null;
}
