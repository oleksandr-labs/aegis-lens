import { TAXONOMY, TaxonomyNode, resolveAlias, ancestors, getNode } from "./taxonomy";

export interface TagPrediction {
  tagId: string;
  confidence: number;
  /** Source of the prediction: keyword match or model */
  source: "keyword" | "model" | "zero_shot";
  /** Full ancestor path for display */
  path: string[];
}

export interface TaggingInput {
  text: string;
  titleEn?: string;
  titleUk?: string;
  /** Existing class/subclass from classifier */
  eventClass?: string;
  eventSubclass?: string;
}

export interface TaggingResult {
  tags: TagPrediction[];
  /** Flattened unique tag IDs including all ancestors */
  allTagIds: string[];
}

// Keyword patterns per tag ID
const KEYWORD_RULES: Array<{
  tagId: string;
  keywords: string[];
  confidence: number;
}> = [
  { tagId: "military.strike.drone", keywords: ["shahed", "fpv drone", "uav attack", "дрон", "шахед", "бпла"], confidence: 0.9 },
  { tagId: "military.strike.missile", keywords: ["missile", "ракета", "калібр", "кинджал", "іскандер", "cruise missile", "ballistic"], confidence: 0.9 },
  { tagId: "military.strike.artillery", keywords: ["artillery", "shelling", "обстріл", "артилерія", "grad", "рсзо", "бм-21"], confidence: 0.85 },
  { tagId: "military.strike.airstrike", keywords: ["airstrike", "авіаудар", "авіація", "бомб", "glide bomb", "фаб"], confidence: 0.88 },
  { tagId: "military.interception", keywords: ["intercepted", "shot down", "збито", "перехоплено", "air defense", "ппо"], confidence: 0.9 },
  { tagId: "military.ground.advance", keywords: ["advance", "наступ", "captured", "seized", "took control", "захопили"], confidence: 0.8 },
  { tagId: "military.ground.retreat", keywords: ["retreat", "відступ", "withdrew", "withdraw", "pulled back"], confidence: 0.8 },
  { tagId: "infrastructure.energy.power_plant", keywords: ["power plant", "теплова", "гідро", "тес", "аес", "electricity generation"], confidence: 0.88 },
  { tagId: "infrastructure.energy.substation", keywords: ["substation", "підстанція", "transformer", "трансформатор", "power grid"], confidence: 0.88 },
  { tagId: "infrastructure.transport.bridge", keywords: ["bridge", "міст", "crossing", "переправа"], confidence: 0.9 },
  { tagId: "infrastructure.transport.railway", keywords: ["railway", "train", "залізниця", "поїзд", "рейки", "railroad"], confidence: 0.88 },
  { tagId: "infrastructure.healthcare", keywords: ["hospital", "лікарня", "clinic", "поліклініка", "medical"], confidence: 0.88 },
  { tagId: "humanitarian.casualties", keywords: ["killed", "injured", "casualties", "загинув", "поранений", "жертви"], confidence: 0.85 },
  { tagId: "humanitarian.evacuation", keywords: ["evacuation", "evac", "evacuated", "евакуація", "евакуйований"], confidence: 0.9 },
  { tagId: "humanitarian.displacement", keywords: ["displaced", "refugees", "переміщені", "біженці", "IDPs"], confidence: 0.85 },
  { tagId: "security.cyber", keywords: ["cyber", "hack", "ddos", "кібер", "атака на сайт", "malware"], confidence: 0.88 },
  { tagId: "security.disinformation", keywords: ["fake", "disinformation", "дезінформація", "фейк", "propaganda"], confidence: 0.8 },
  { tagId: "environment.fire", keywords: ["fire", "пожежа", "burn", "flame", "горить"], confidence: 0.85 },
  { tagId: "environment.explosion", keywords: ["explosion", "вибух", "blast", "detonation"], confidence: 0.85 },
  { tagId: "environment.flood", keywords: ["flood", "затоплення", "flooding", "water surge", "прорив греблі"], confidence: 0.88 },
];

// class → tag mappings
const CLASS_TO_TAG: Record<string, string> = {
  drone: "military.strike.drone",
  missile: "military.strike.missile",
  airstrike: "military.strike.airstrike",
  artillery: "military.strike.artillery",
  ground_combat: "military.ground",
  explosion: "environment.explosion",
  fire: "environment.fire",
  infrastructure_damage: "infrastructure",
  power_outage: "infrastructure.energy",
  comms_outage: "security.comms_outage",
  humanitarian: "humanitarian",
  displacement: "humanitarian.displacement",
  cyberattack: "security.cyber",
  chemical: "environment.chemical",
  radiation: "environment.radiation",
};

export function tagText(input: TaggingInput): TaggingResult {
  const predictions = new Map<string, TagPrediction>();

  const combined = [
    input.text,
    input.titleEn ?? "",
    input.titleUk ?? "",
  ].join(" ").toLowerCase();

  // 1. Class → tag mapping (high confidence seed)
  if (input.eventClass && CLASS_TO_TAG[input.eventClass]) {
    const tagId = CLASS_TO_TAG[input.eventClass];
    predictions.set(tagId, { tagId, confidence: 0.95, source: "keyword", path: ancestors(tagId).map((n) => n.id) });
  }

  // 2. Keyword matching
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => combined.includes(kw))) {
      const existing = predictions.get(rule.tagId);
      if (!existing || existing.confidence < rule.confidence) {
        predictions.set(rule.tagId, {
          tagId: rule.tagId,
          confidence: rule.confidence,
          source: "keyword",
          path: ancestors(rule.tagId).map((n) => n.id),
        });
      }
    }
  }

  const tags = [...predictions.values()].sort((a, b) => b.confidence - a.confidence);

  // Collect all unique tag IDs including ancestors
  const allTagIds = new Set<string>();
  for (const tag of tags) {
    for (const id of tag.path) allTagIds.add(id);
  }

  return { tags, allTagIds: [...allTagIds] };
}

/** Return coverage stats: which top-level tags have no predictions. */
export function coverageGaps(result: TaggingResult): string[] {
  const covered = new Set(result.allTagIds.map((id) => id.split(".")[0]));
  return TAXONOMY.filter((n) => n.level === 0).map((n) => n.id).filter((id) => !covered.has(id));
}
