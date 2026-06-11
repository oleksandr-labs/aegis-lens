/**
 * NER + Classification — typed contract + NerClassifier service
 *
 * Extends the existing RegexNER / ModelNER implementations in ner.ts with:
 *  - Richer military-domain entity types (UNIT_UA, UNIT_RU, WEAPON_SYSTEM, …)
 *  - Tier-1 event classification (airstrike / artillery / ground-assault / …)
 *  - Heuristic keyword baseline for MVP; LLM-backed path for production
 *
 * Phase 1 — Basic NER + classification
 */

// ── Entity types ──────────────────────────────────────────────────────────────

export type EntityType_NER =
  | "UNIT_UA"
  | "UNIT_RU"
  | "WEAPON_SYSTEM"
  | "LOCATION"
  | "PERSON_MIL"
  | "ORGANIZATION"
  | "EVENT_TYPE"
  | "DATE_TIME";

export interface NerEntity {
  text: string;
  type: EntityType_NER;
  /** 0-1 detection confidence. */
  confidence: number;
  startOffset: number;
  endOffset: number;
  /** Normalised canonical form, e.g. "Kharkiv" for "Харків". */
  normalizedForm?: string;
  /** Wikidata QID if resolvable, e.g. "Q1899". */
  wikiEntityId?: string;
}

// ── Classification types ──────────────────────────────────────────────────────

export type ClassificationTier1 =
  | "airstrike"
  | "artillery"
  | "ground-assault"
  | "naval"
  | "cyber"
  | "humanitarian"
  | "political"
  | "logistics"
  | "other";

export interface NerClassificationResult {
  entities: NerEntity[];
  tier1Class: ClassificationTier1;
  /** Optional sub-tags, e.g. ["ballistic", "overnight"]. */
  tier2Classes: string[];
  /** 0-1 classification confidence. */
  confidence: number;
  /** Model / engine identifier used. */
  model: string;
}

// ── Keyword map ───────────────────────────────────────────────────────────────

export const HEURISTIC_KEYWORD_MAP: Record<ClassificationTier1, string[]> = {
  airstrike: [
    "airstrike", "air strike", "bombing", "missile strike", "drone strike",
    "авіаудар", "ракетний удар", "бомбардування", "shahed", "шахед",
    "kh-101", "kh-55", "iskander", "kalibr", "kinzhal",
  ],
  artillery: [
    "artillery", "shelling", "mortar", "howitzer", "grad", "mlrs",
    "обстріл", "артилерія", "мінометний", "гаубиця", "реактивна система",
    "himars", "caesar", "m777",
  ],
  "ground-assault": [
    "ground assault", "infantry attack", "tank advance", "storming",
    "наступ", "штурм", "піхота", "бронетехніка", "атака наземних",
    "assault", "attack positions", "seized village", "captured town",
  ],
  naval: [
    "naval", "warship", "frigate", "corvette", "submarine", "torpedo",
    "sea mine", "морський", "корабель", "фрегат", "підводний човен",
    "black sea fleet", "чорноморський флот",
  ],
  cyber: [
    "cyberattack", "hack", "ddos", "malware", "ransomware",
    "кібератака", "зламано", "вірус", "шпигунське", "фішинг",
    "data breach", "infrastructure disruption",
  ],
  humanitarian: [
    "evacuation", "civilian", "humanitarian corridor", "aid convoy",
    "евакуація", "цивільні", "гуманітарний коридор", "допомога",
    "refugee", "displaced", "casualties civilian",
  ],
  political: [
    "sanctions", "diplomacy", "summit", "parliament", "president",
    "санкції", "дипломатія", "саміт", "парламент", "президент",
    "ceasefire", "negotiation", "agreement",
  ],
  logistics: [
    "supply", "ammunition depot", "fuel depot", "convoy", "rail",
    "постачання", "склад боєприпасів", "паливо", "залізниця", "колона",
    "logistics hub", "bridge destroyed", "bridge strike",
  ],
  other: [],
};

// ── Entity patterns ───────────────────────────────────────────────────────────

interface EntityPattern {
  pattern: RegExp;
  type: EntityType_NER;
  confidence: number;
  normalizedForm?: (match: string) => string;
}

const ENTITY_PATTERNS: EntityPattern[] = [
  // Ukrainian military units
  {
    pattern: /\b(?:ЗСУ|ZSU|AFU|VSU|Ukrainian\s+Armed\s+Forces|НГУ|ГУР|СБУ|ВМС\s+України|ПС\s+ЗСУ)\b/gi,
    type: "UNIT_UA",
    confidence: 0.9,
  },
  {
    pattern: /\b(\d+(?:st|nd|rd|th)?\s+(?:Separate\s+)?(?:Mechanized|Tank|Airborne|Assault|Marine)\s+Brigade)\b/gi,
    type: "UNIT_UA",
    confidence: 0.8,
  },
  // Russian military units
  {
    pattern: /\b(?:VDV|GRU|FSB|SVR|Wagner|ЧВК\s+Вагнера|Russian\s+Armed\s+Forces|RF\s+Army|ВКС\s+РФ|ФСБ|ГРУ)\b/gi,
    type: "UNIT_RU",
    confidence: 0.9,
  },
  {
    pattern: /\b(\d+(?:st|nd|rd|th)?\s+(?:Russian\s+)?(?:Army|Guards\s+Army|Combined\s+Arms\s+Army))\b/gi,
    type: "UNIT_RU",
    confidence: 0.78,
  },
  // Weapon systems
  {
    pattern: /\b(?:Kalibr|Іскандер|Iskander|Kinzhal|Кинджал|Kh-\d+|Х-\d+|Shahed(?:-\d+)?|Шахед|Lancet|Ланцет|HIMARS|ATACMS|Storm\s+Shadow|Patriot|S-300|S-400|Gepard|Leopard\s*2?|Abrams|Bradley|BTR-\d+|BMP-\d+|T-(?:72|80|90)|F-16|Su-\d{2}|Mi-\d+|Ka-\d+|Bayraktar)\b/gi,
    type: "WEAPON_SYSTEM",
    confidence: 0.88,
  },
  // Locations (Ukraine/conflict zone)
  {
    pattern: /\b(?:Kyiv|Kharkiv|Kherson|Odesa|Zaporizhzhia|Dnipro|Donetsk|Luhansk|Mariupol|Bakhmut|Avdiivka|Kramatorsk|Sloviansk|Mykolaiv|Sumy|Chernihiv|Belgorod|Kursk|Crimea|Sevastopol|Melitopol|Kherson|Київ|Харків|Херсон|Одеса|Запоріжжя|Дніпро|Донецьк|Луганськ)\b/gi,
    type: "LOCATION",
    confidence: 0.85,
  },
  // Military persons
  {
    pattern: /\b(?:General|Colonel|Lt\.\s+Col\.|Major|Captain|Генерал|Полковник|Майор|Капітан)\s+[A-ZА-ЯІЇЄ][a-zа-яіїє]+/g,
    type: "PERSON_MIL",
    confidence: 0.72,
  },
  // Organizations
  {
    pattern: /\b(?:NATO|UN|OSCE|EU|ICRC|Red\s+Cross|MSF|Verkhovna\s+Rada|Kremlin|Ministry\s+of\s+Defense|MoD|НАТО|ООН|МЗС|Верховна\s+Рада)\b/gi,
    type: "ORGANIZATION",
    confidence: 0.88,
  },
  // Date-time
  {
    pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?\b/gi,
    type: "DATE_TIME",
    confidence: 0.95,
  },
  {
    pattern: /\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/g,
    type: "DATE_TIME",
    confidence: 0.9,
  },
];

// ── Classifier ────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

const NER_SYSTEM_PROMPT = `You are a military-conflict NER and classification system.
Given input text return ONLY valid JSON with:
{
  "entities": [{ "text": "...", "type": "UNIT_UA|UNIT_RU|WEAPON_SYSTEM|LOCATION|PERSON_MIL|ORGANIZATION|EVENT_TYPE|DATE_TIME", "confidence": 0.0-1.0, "startOffset": N, "endOffset": N }],
  "tier1Class": "airstrike|artillery|ground-assault|naval|cyber|humanitarian|political|logistics|other",
  "tier2Classes": ["..."],
  "confidence": 0.0-1.0
}
No markdown, no explanation.`;

function heuristicClassify(text: string): {
  tier1Class: ClassificationTier1;
  confidence: number;
  tier2Classes: string[];
} {
  const lower = text.toLowerCase();
  let best: ClassificationTier1 = "other";
  let bestScore = 0;

  for (const [cls, keywords] of Object.entries(HEURISTIC_KEYWORD_MAP) as [
    ClassificationTier1,
    string[],
  ][]) {
    if (cls === "other") continue;
    const hits = keywords.filter((kw) => lower.includes(kw)).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = cls;
    }
  }

  const confidence = bestScore === 0 ? 0.3 : Math.min(0.5 + bestScore * 0.08, 0.85);
  return { tier1Class: best, confidence, tier2Classes: [] };
}

function heuristicExtractEntities(text: string): NerEntity[] {
  const entities: NerEntity[] = [];
  const seen = new Set<string>();

  for (const { pattern, type, confidence } of ENTITY_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const key = `${m.index}:${m[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entities.push({
        text: m[0],
        type,
        confidence,
        startOffset: m.index,
        endOffset: m.index + m[0].length,
      });
    }
  }

  return entities.sort((a, b) => a.startOffset - b.startOffset);
}

class NerClassifier {
  async classify(
    text: string,
    lang: "en" | "uk" | "ru",
  ): Promise<NerClassificationResult> {
    const key = process.env.ANTHROPIC_API_KEY;

    // Heuristic baseline — always computed as fallback
    const heuristic = heuristicClassify(text);
    const heuristicEntities = heuristicExtractEntities(text);

    if (!key) {
      return {
        entities: heuristicEntities,
        ...heuristic,
        model: "heuristic-keyword-v1",
      };
    }

    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 800,
          system: NER_SYSTEM_PROMPT,
          messages: [
            { role: "user", content: `Language: ${lang}\n\nText:\n${text}` },
          ],
        }),
      });

      if (!res.ok) throw new Error(`Anthropic ${res.status}`);

      const json = (await res.json()) as {
        content?: { type: string; text?: string }[];
      };
      const raw =
        json.content
          ?.map((c) => (c.type === "text" ? c.text : ""))
          .filter(Boolean)
          .join("") ?? "";

      const parsed = JSON.parse(raw) as {
        entities: NerEntity[];
        tier1Class: ClassificationTier1;
        tier2Classes: string[];
        confidence: number;
      };

      // Merge: prefer LLM entities, supplement with heuristic ones
      const llmSpans = new Set(parsed.entities.map((e) => `${e.startOffset}:${e.endOffset}`));
      const extra = heuristicEntities.filter(
        (e) => !llmSpans.has(`${e.startOffset}:${e.endOffset}`),
      );

      return {
        entities: [...parsed.entities, ...extra].sort(
          (a, b) => a.startOffset - b.startOffset,
        ),
        tier1Class: parsed.tier1Class,
        tier2Classes: parsed.tier2Classes ?? [],
        confidence: parsed.confidence,
        model: DEFAULT_MODEL,
      };
    } catch {
      return {
        entities: heuristicEntities,
        ...heuristic,
        model: "heuristic-keyword-v1",
      };
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const nerClassifier = new NerClassifier();
export { NerClassifier };
