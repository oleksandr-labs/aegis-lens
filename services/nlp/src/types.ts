export type SupportedLocale = "uk" | "ru" | "en" | string;

export interface DetectionResult {
  language: SupportedLocale;
  /** 0-1 confidence */
  confidence: number;
  script: "Cyrillic" | "Latin" | "Other";
}

export interface TranslationResult {
  source_language: SupportedLocale;
  target_language: SupportedLocale;
  original: string;
  translated: string;
  provider: "deepl" | "nllb";
}

export interface Entity {
  text: string;
  type: NEREntityType;
  start: number;
  end: number;
  confidence: number;
  /** Resolved wikidata / gazetteer ID if available */
  resolved_id?: string;
}

export type NEREntityType =
  | "LOCATION"
  | "MILITARY_UNIT"
  | "EQUIPMENT"
  | "ORGANIZATION"
  | "PERSON"
  | "DATE"
  | "WEAPON";

export interface NERResult {
  entities: Entity[];
  language: SupportedLocale;
}

export interface ClassificationResult {
  /** Maps to taxonomy top-level class */
  class: string;
  /** Maps to taxonomy subclass */
  subclass?: string;
  confidence: number;
}

export interface SentimentResult {
  /** -1 (very negative) to +1 (very positive) */
  polarity: number;
  /** 0-1 subjectivity */
  subjectivity: number;
  stance: "pro_ukraine" | "pro_russia" | "neutral" | "unclear";
}

export interface SummaryResult {
  summary: string;
  language: SupportedLocale;
  model: string;
}

export interface EmbeddingResult {
  /** Float32 vector */
  vector: number[];
  model: string;
  dimensions: number;
}

export interface ToxicityResult {
  toxic: boolean;
  score: number;
  disinfo_score: number;
  flags: string[];
}
