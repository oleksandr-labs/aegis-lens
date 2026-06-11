/**
 * Named Entity Recognition for conflict-domain text.
 *
 * RegexNER:  fast, zero-latency, covers high-frequency military/geo patterns
 * ModelNER:  calls an external NER REST endpoint (e.g. fine-tuned bert-NER)
 */

import type { NERExtractor } from "./pipeline";
import type { NERResult, Entity, NEREntityType } from "./types";

// ── Regex patterns ────────────────────────────────────────────────────────────

interface PatternEntry {
  pattern: RegExp;
  type: NEREntityType;
}

const PATTERNS: PatternEntry[] = [
  // Military units — e.g. "36th Army", "3rd Corps", "155th Brigade"
  {
    pattern: /\b(\d+(?:st|nd|rd|th)?\s+(?:Army|Corps|Division|Brigade|Battalion|Regiment|Company|Squadron|Fleet))\b/gi,
    type: "MILITARY_UNIT",
  },
  // Russian/Ukrainian formations with Cyrillic transliteration
  {
    pattern: /\b(?:VDV|GRU|FSB|SVR|SBU|ZSU|AFU|VSU|RF\s+Armed\s+Forces|Russian\s+Army|Ukrainian\s+Army)\b/gi,
    type: "MILITARY_UNIT",
  },
  // Weapons / equipment
  {
    pattern: /\b(?:Kalibr|Iskander|Kinzhal|Kh-\d+|Shahed(?:-\d+)?|Lancet|S-\d{3}|Patriot|HIMARS|ATACMS|Javelin|NLAW|Gepard|Leopard\s+\d|Abrams|Bradley|BTR-\d+|BMP-\d+|T-\d{2,3}|F-16|Su-\d{2}|Mi-\d+|Ka-\d+|MiG-\d+|Bayraktar)\b/gi,
    type: "EQUIPMENT",
  },
  // Weapons generic
  {
    pattern: /\b(?:drone|UAV|UCAV|missile|rocket|shell|bomb|mine|torpedo|mortar|artillery|tank|APC|IFV|helicopter|aircraft|warship|frigate|corvette|submarine)\b/gi,
    type: "WEAPON",
  },
  // Ukrainian oblasts / major cities (EN)
  {
    pattern: /\b(?:Kyiv|Kiev|Kharkiv|Kherson|Odesa|Odessa|Zaporizhzhia|Zaporizhia|Dnipro|Dnipropetrovsk|Donetsk|Luhansk|Lugansk|Mariupol|Bakhmut|Avdiivka|Kramatorsk|Sloviansk|Mykolaiv|Sumy|Chernihiv|Poltava|Vinnytsia|Zhytomyr|Rivne|Lviv|Ivano-Frankivsk|Ternopil|Cherkasy|Chernivtsi|Khmelnytskyi|Kropyvnytskyi|Lutsk|Uzhhorod|Mukachevo|Melitopol|Berdyansk|Kherson\s+region|Zaporizhzhia\s+region)\b/gi,
    type: "LOCATION",
  },
  // Russian territories / cities mentioned in conflict context
  {
    pattern: /\b(?:Belgorod|Kursk|Bryansk|Rostov|Crimea|Sevastopol|Simferopol|Kerch|Donetsk\s+People's\s+Republic|DNR|LNR|Luhansk\s+People's\s+Republic)\b/gi,
    type: "LOCATION",
  },
  // Geographic features
  {
    pattern: /\b(?:Black Sea|Sea of Azov|Dnieper|Dnipro\s+River|Siverskyi\s+Donets|Kakhovka|Nova\s+Kakhovka|Zaporizhzhia\s+NPP|ZNPP)\b/gi,
    type: "LOCATION",
  },
  // Organizations
  {
    pattern: /\b(?:NATO|UN|OSCE|Red Cross|ICRC|UNHCR|WFP|MSF|Doctors\s+Without\s+Borders|EU|European\s+Union|G7|IMF|World\s+Bank|Amnesty\s+International|Human\s+Rights\s+Watch)\b/gi,
    type: "ORGANIZATION",
  },
  // Ukrainian/Russian gov organizations
  {
    pattern: /\b(?:Verkhovna\s+Rada|Kremlin|Ministry\s+of\s+Defense|MoD|General\s+Staff|Ukrinform|DSNS|State\s+Emergency\s+Service)\b/gi,
    type: "ORGANIZATION",
  },
  // Dates (simple patterns)
  {
    pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?\b/gi,
    type: "DATE",
  },
  {
    pattern: /\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/g,
    type: "DATE",
  },
];

// Ukrainian-language patterns (Cyrillic)
const UA_PATTERNS: PatternEntry[] = [
  {
    pattern: /\b(?:Київ|Харків|Херсон|Одеса|Запоріжжя|Дніпро|Донецьк|Луганськ|Маріуполь|Бахмут|Авдіївка|Миколаїв|Суми|Чернігів|Полтава|Вінниця|Житомир|Рівне|Львів)\b/g,
    type: "LOCATION",
  },
  {
    pattern: /\b(?:ЗСУ|ГУР|СБУ|ДСНС|ВМС|ПС|НГУ)\b/g,
    type: "MILITARY_UNIT",
  },
  {
    pattern: /\b(?:Шахед|Калібр|Іскандер|Кинджал|Байрактар|Герань|Lancet|Ланцет)\b/gi,
    type: "EQUIPMENT",
  },
];

export class RegexNER implements NERExtractor {
  async extract(text: string, language: string): Promise<NERResult> {
    const patterns = language === "uk" || language === "ru"
      ? [...PATTERNS, ...UA_PATTERNS]
      : PATTERNS;

    const entities: Entity[] = [];
    const seen = new Set<string>();

    for (const { pattern, type } of patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const key = `${match.index}:${match[0]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        entities.push({
          text: match[0],
          type,
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.75,
        });
      }
    }

    // Sort by position
    entities.sort((a, b) => a.start - b.start);

    return { entities, language };
  }
}

// ── Model NER (REST) ──────────────────────────────────────────────────────────

interface ModelEntity {
  word: string;
  entity_group: string;
  score: number;
  start: number;
  end: number;
}

const MODEL_ENTITY_TYPE_MAP: Record<string, NEREntityType> = {
  LOC: "LOCATION",
  GPE: "LOCATION",
  ORG: "ORGANIZATION",
  PER: "PERSON",
  MISC: "EQUIPMENT",
};

export class ModelNER implements NERExtractor {
  constructor(private readonly endpointUrl: string) {}

  async extract(text: string, language: string): Promise<NERResult> {
    const res = await fetch(this.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      throw new Error(`NER model error ${res.status}`);
    }

    const json = (await res.json()) as ModelEntity[];
    const entities: Entity[] = json.map((e) => ({
      text: e.word,
      type: (MODEL_ENTITY_TYPE_MAP[e.entity_group] ?? "ORGANIZATION") as NEREntityType,
      start: e.start,
      end: e.end,
      confidence: e.score,
    }));

    return { entities, language };
  }
}

// ── Ensemble ──────────────────────────────────────────────────────────────────

export class EnsembleNER implements NERExtractor {
  constructor(
    private readonly regex: RegexNER,
    private readonly model: ModelNER,
  ) {}

  async extract(text: string, language: string): Promise<NERResult> {
    const [regexResult, modelResult] = await Promise.allSettled([
      this.regex.extract(text, language),
      this.model.extract(text, language),
    ]);

    const regexEntities =
      regexResult.status === "fulfilled" ? regexResult.value.entities : [];
    const modelEntities =
      modelResult.status === "fulfilled" ? modelResult.value.entities : [];

    // Merge: model wins for overlapping spans (higher confidence typically)
    const merged = [...modelEntities];
    for (const re of regexEntities) {
      const overlaps = merged.some(
        (me) => re.start < me.end && re.end > me.start,
      );
      if (!overlaps) merged.push(re);
    }

    merged.sort((a, b) => a.start - b.start);
    return { entities: merged, language };
  }
}
