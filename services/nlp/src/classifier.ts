import type { ClassificationResult } from "./types";
import { isValidClass, isValidSubclass, allClassCodes } from "@ua-map/schema";

export interface TextClassifier {
  classify(text: string, language: string): Promise<ClassificationResult>;
}

/**
 * Keyword-based tier-1 classifier.
 * Fast, no network, used as a pre-filter before the ML classifier.
 * Covers the most common event types for UA conflict monitoring.
 */

type KeywordRule = {
  class: string;
  subclass?: string;
  keywords: string[];
};

const KEYWORD_RULES: KeywordRule[] = [
  // Military
  { class: "military_action", subclass: "airstrike", keywords: ["авіаудар", "airstrike", "air strike", "авіація", "бомбардування", "бомба"] },
  { class: "military_action", subclass: "missile_strike", keywords: ["ракета", "ракетний удар", "missile", "крилата ракета", "балістична", "шахед"] },
  { class: "military_action", subclass: "drone_strike", keywords: ["бпла", "дрон", "drone", "shahed", "shaheed", "герань", "ланцет"] },
  { class: "military_action", subclass: "artillery_strike", keywords: ["артилерія", "артудар", "обстріл", "artillery", "мінометний"] },
  { class: "military_action", subclass: "air_defense", keywords: ["ппо", "перехоплено", "збито", "air defense", "intercepted", "знищено в повітрі"] },
  { class: "military_action", subclass: "ground_assault", keywords: ["штурм", "атака", "наступ", "assault", "ground attack", "піхота"] },
  // Infrastructure
  { class: "infrastructure", subclass: "energy", keywords: ["підстанція", "електростанція", "тец", "гес", "енергетика", "power plant", "substation"] },
  { class: "infrastructure", subclass: "transport", keywords: ["міст", "залізниця", "аеропорт", "bridge", "railway", "road"] },
  { class: "infrastructure", subclass: "telecom", keywords: ["зв'язок", "інтернет", "телекомунікації", "telecom", "internet outage"] },
  // Civilian
  { class: "civilian_alert", subclass: "air_raid_siren", keywords: ["повітряна тривога", "тривога", "air raid", "сирена", "alert"] },
  { class: "civilian_alert", subclass: "evacuation_order", keywords: ["евакуація", "евакуйте", "evacuation", "evacuate"] },
  // Environmental
  { class: "environmental", subclass: "wildfire", keywords: ["пожежа", "вогонь", "горить", "fire", "wildfire", "палає"] },
  // Maritime
  { class: "maritime", keywords: ["чорне море", "азовське море", "флот", "корабель", "судно", "vessel", "ship", "naval"] },
  // Cyber
  { class: "cyber", subclass: "ddos", keywords: ["ddos", "кібератака", "сайт не працює", "cyberattack"] },
];

export class KeywordClassifier implements TextClassifier {
  async classify(text: string, _language: string): Promise<ClassificationResult> {
    const lower = text.toLowerCase();

    let bestMatch: ClassificationResult | null = null;
    let bestScore = 0;

    for (const rule of KEYWORD_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          class: rule.class,
          subclass: rule.subclass,
          confidence: Math.min(0.5 + score * 0.1, 0.9),
        };
      }
    }

    return bestMatch ?? { class: "military_action", confidence: 0.2 };
  }
}

/**
 * ML-backed classifier calling a microservice endpoint.
 * Falls back to KeywordClassifier on failure.
 */
export class ModelClassifier implements TextClassifier {
  private readonly fallback = new KeywordClassifier();

  constructor(private readonly endpoint: string) {}

  async classify(text: string, language: string): Promise<ClassificationResult> {
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2000), language }),
      });

      if (!res.ok) return this.fallback.classify(text, language);

      const data = await res.json() as { class: string; subclass?: string; confidence: number };

      if (!isValidClass(data.class)) return this.fallback.classify(text, language);
      if (data.subclass && !isValidSubclass(data.class, data.subclass)) delete data.subclass;

      return data;
    } catch {
      return this.fallback.classify(text, language);
    }
  }
}
