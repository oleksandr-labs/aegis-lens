/**
 * LLM / AI Training Data Licensing — Aegis Lens / Ukrainian MAP
 *
 * Curated, verified corpora licensed to AI/ML labs for training and evaluation.
 * Highest-margin product; highest ethical responsibility.
 *
 * Ліцензування корпусів для навчання AI/ML. Найвища маржинальність,
 * найвищий етичний ризик. Одна помилка стирає роки brand-trust.
 *
 * All monetary values in USD.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Category of data contained in a corpus. */
export type CorpusType =
  | "verified-osint-text"
  | "multimodal-image-text"
  | "audio-transcript"
  | "geolocation-eval-set"
  | "disinfo-labelled"
  | "kg-dump"
  | "social-media-posts";

/**
 * A licensable corpus dataset for AI/ML training or evaluation.
 *
 * Набір даних для ліцензування AI/ML-лабораторіям.
 */
export interface CorpusDataset {
  /** Stable identifier. */
  id: string;
  /** Category of data. */
  type: CorpusType;
  /** Dataset name in English. */
  name_en: string;
  /** Description in English. */
  description_en: string;
  /** Human-readable size description (e.g. "~4.2M rows, 12 GB"). */
  sizeDescription: string;
  /** How often the dataset is updated. */
  updateFrequency: "one-time" | "annual" | "quarterly";
  /** BCP-47 language codes covered. */
  languages: string[];
  /** Types of annotations included (e.g. "geoparsed", "source-url", "confidence-score"). */
  annotations: string[];
  /** Whether PII has been scrubbed according to the platform PII policy. */
  piiScrubbed: boolean;
  /** Whether faces are redacted / blurred. */
  facesRedacted: boolean;
  /** Whether civilian names are removed. */
  civilianNamesRemoved: boolean;
  /** License category offered: commercial rights, research-only, or academic. */
  licenseType: "commercial" | "research-only" | "academic";
  /**
   * One-time flat-fee pricing tiers in USD.
   * Array of [min, max] — actual quote depends on scope negotiation.
   */
  pricingOneTimeUsd: number[];
  /**
   * Annual updating-feed pricing tiers in USD [min, max].
   * Undefined for one-time datasets.
   */
  pricingAnnualFeedUsd?: number[];
  /** Whether a Non-Disclosure Agreement is required before purchase. */
  requiresNDA: boolean;
  /** Product maturity / roadmap phase. */
  phase: 2 | 3 | 4;
}

// ── Corpus catalog ────────────────────────────────────────────────────────────

/**
 * All licensable LLM/AI training corpora.
 *
 * Повний каталог корпусів для ліцензування.
 */
export const LLM_TRAINING_CORPUS: CorpusDataset[] = [
  {
    id: "corpus-verified-osint-text",
    type: "verified-osint-text",
    name_en: "Verified OSINT Text Corpus",
    description_en:
      "Millions of human-verified OSINT records: event descriptions, intelligence summaries, source attributions, and analyst notes. Ideal for training domain-specific LLMs or fine-tuning general models on conflict and geopolitical intelligence.",
    sizeDescription: "~8M rows, ~22 GB (JSONL + Parquet)",
    updateFrequency: "quarterly",
    languages: ["en", "uk", "ru", "pl"],
    annotations: [
      "event-type",
      "confidence-score",
      "source-url",
      "source-credibility-tier",
      "geoparsed-location",
      "iso-date",
      "analyst-notes",
    ],
    piiScrubbed: true,
    facesRedacted: false, // text-only corpus
    civilianNamesRemoved: true,
    licenseType: "commercial",
    pricingOneTimeUsd: [500_000, 5_000_000],
    pricingAnnualFeedUsd: [250_000, 1_000_000],
    requiresNDA: true,
    phase: 2,
  },
  {
    id: "corpus-multimodal-image-text",
    type: "multimodal-image-text",
    name_en: "Multimodal Image + Text Pairs",
    description_en:
      "Verified photographs paired with structured captions: geolocation fix, timestamp, event context, and confidence score. Suitable for training multimodal models on conflict-domain image understanding and geolocation.",
    sizeDescription: "~2.4M image-text pairs, ~180 GB",
    updateFrequency: "quarterly",
    languages: ["en", "uk"],
    annotations: [
      "lat-lon",
      "confidence-radius-m",
      "iso-date",
      "event-context",
      "source-url",
      "verification-method",
    ],
    piiScrubbed: true,
    facesRedacted: true,
    civilianNamesRemoved: true,
    licenseType: "commercial",
    pricingOneTimeUsd: [750_000, 5_000_000],
    pricingAnnualFeedUsd: [375_000, 1_000_000],
    requiresNDA: true,
    phase: 2,
  },
  {
    id: "corpus-audio-transcript",
    type: "audio-transcript",
    name_en: "Audio + Transcript Pairs",
    description_en:
      "STT-grade audio recordings paired with verified transcripts. Multilingual coverage (Ukrainian, Russian, Polish) with speaker diarisation and noise labels. Suitable for training ASR and multilingual LLMs.",
    sizeDescription: "~3,200 hours, ~480 GB (MP3 + JSONL)",
    updateFrequency: "annual",
    languages: ["uk", "ru", "pl"],
    annotations: [
      "speaker-diarisation",
      "noise-level",
      "domain-label",
      "source-type",
      "iso-date",
    ],
    piiScrubbed: true,
    facesRedacted: false, // audio corpus
    civilianNamesRemoved: true,
    licenseType: "commercial",
    pricingOneTimeUsd: [100_000, 2_000_000],
    pricingAnnualFeedUsd: [250_000, 750_000],
    requiresNDA: true,
    phase: 3,
  },
  {
    id: "corpus-geolocation-eval-set",
    type: "geolocation-eval-set",
    name_en: "Geolocation Evaluation Set (Gold-Labelled)",
    description_en:
      "Gold-standard benchmark dataset for evaluating vision and text-based geolocation models. Each sample has a verified ground-truth location to within 50 m, with multiple analyst confirmations.",
    sizeDescription: "~85,000 samples, ~9 GB",
    updateFrequency: "annual",
    languages: ["en"],
    annotations: [
      "ground-truth-lat-lon",
      "confidence-radius-m",
      "analyst-count",
      "verification-method",
      "difficulty-tier",
    ],
    piiScrubbed: true,
    facesRedacted: true,
    civilianNamesRemoved: true,
    licenseType: "research-only",
    pricingOneTimeUsd: [100_000, 500_000],
    pricingAnnualFeedUsd: undefined,
    requiresNDA: false,
    phase: 2,
  },
  {
    id: "corpus-disinfo-labelled",
    type: "disinfo-labelled",
    name_en: "Disinformation / Misinformation Labelled Set",
    description_en:
      "Labelled corpus of confirmed true, false, and misleading claims with structured evidence chains. Designed for training safety classifiers and disinformation-detection models.",
    sizeDescription: "~1.2M claims, ~4 GB (JSONL)",
    updateFrequency: "quarterly",
    languages: ["en", "uk", "ru"],
    annotations: [
      "truth-label",
      "evidence-chain",
      "source-url",
      "claim-type",
      "debunk-method",
      "confidence-score",
    ],
    piiScrubbed: true,
    facesRedacted: false,
    civilianNamesRemoved: true,
    licenseType: "commercial",
    pricingOneTimeUsd: [150_000, 1_500_000],
    pricingAnnualFeedUsd: [250_000, 500_000],
    requiresNDA: true,
    phase: 3,
  },
  {
    id: "corpus-kg-dump",
    type: "kg-dump",
    name_en: "Knowledge Graph Dump",
    description_en:
      "Structured entity-relationship graph of conflict-domain entities: organisations, persons, locations, equipment, events, and their temporal relations. Ideal for KG-RAG and graph neural network training.",
    sizeDescription: "~12M nodes, ~80M edges, ~28 GB (Parquet + RDF/N-Triples)",
    updateFrequency: "quarterly",
    languages: ["en", "uk"],
    annotations: [
      "entity-type",
      "relation-type",
      "temporal-bounds",
      "source-provenance",
      "confidence-score",
    ],
    piiScrubbed: true,
    facesRedacted: false,
    civilianNamesRemoved: true,
    licenseType: "commercial",
    pricingOneTimeUsd: [250_000, 3_000_000],
    pricingAnnualFeedUsd: [250_000, 750_000],
    requiresNDA: true,
    phase: 2,
  },
  {
    id: "corpus-social-media-posts",
    type: "social-media-posts",
    name_en: "Verified Social Media Posts",
    description_en:
      "Curated social media posts (Telegram, Twitter/X, forums) with verified metadata: geolocation, timestamp confirmation, and source-credibility rating. Upstream source licenses honored; scrubbed of civilian PII.",
    sizeDescription: "~5.5M posts, ~7 GB (JSONL)",
    updateFrequency: "quarterly",
    languages: ["en", "uk", "ru"],
    annotations: [
      "platform",
      "verified-date",
      "geoparsed-location",
      "source-credibility-tier",
      "engagement-metrics",
      "scrub-method",
    ],
    piiScrubbed: true,
    facesRedacted: false,
    civilianNamesRemoved: true,
    licenseType: "research-only",
    pricingOneTimeUsd: [200_000, 2_000_000],
    pricingAnnualFeedUsd: [300_000, 800_000],
    requiresNDA: true,
    phase: 3,
  },
];

// ── PII scrub policy ──────────────────────────────────────────────────────────

/**
 * Platform-wide PII scrub policy applied to all corpus products.
 * All deviations require written exception approval.
 *
 * Загальнопlatformна політика очищення персональних даних.
 */
export const PII_SCRUB_POLICY: {
  facesRedacted: boolean;
  civilianNamesRemoved: boolean;
  victimDataExcluded: boolean;
  childDataExcluded: boolean;
  geoPrecisionLimit: string;
  auditFrequency: string;
} = {
  facesRedacted: true,
  civilianNamesRemoved: true,
  victimDataExcluded: true,
  childDataExcluded: true,
  geoPrecisionLimit:
    "Civilian residential locations rounded to nearest 500 m; military/infrastructure precise",
  auditFrequency: "Every corpus release + random 5% spot-check within 30 days",
};

// ── ML license addendum ───────────────────────────────────────────────────────

/**
 * Addendum text for ML training licenses.
 * Must be incorporated into every LLM/AI corpus license agreement.
 *
 * Текст доповнення до договорів ліцензування для ML-навчання.
 */
export const LLM_LICENSE_ADDENDUM_EN = `
MACHINE LEARNING TRAINING DATA LICENSE ADDENDUM

This Addendum supplements the Master Data License Agreement (the "Agreement")
between Aegis Lens Ltd ("Licensor") and the purchasing organisation ("Licensee").

1. GRANT OF RIGHTS
   Licensor grants Licensee a non-exclusive, non-transferable right to use the
   licensed corpus solely for training, fine-tuning, evaluating, or benchmarking
   machine learning models as described in the Agreement.

2. PROHIBITED USES
   Licensee shall not use the licensed data, or models trained on it, to:
   a) Target, identify, track, or harm any individual or civilian population;
   b) Develop autonomous weapons systems or components thereof;
   c) Enable mass surveillance of civilian populations;
   d) Facilitate doxxing, harassment, or stalking of individuals;
   e) Train models intended to generate disinformation or propaganda;
   f) Circumvent sanctions, export controls, or AML regulations;
   g) Re-sell, sublicense, or redistribute the raw data to any third party.

3. PROVENANCE & ATTRIBUTION
   Models released publicly that were trained on Aegis Lens data must include
   in their model card: "Training data includes materials licensed from
   Aegis Lens Ltd (aegislens.com)."

4. UPSTREAM SOURCE LICENSES
   Certain rows carry upstream source license restrictions. Licensee must honour
   all such restrictions as indicated in the per-row provenance metadata.

5. OPT-OUT & RETRACTION
   Licensor may notify Licensee of opt-out or retraction requests. Licensee must
   remove identified records from any future training runs within 30 days of notice.

6. AUDIT
   Licensor reserves the right to audit Licensee's use of the data once per year
   with 30 days' written notice. Licensee shall maintain records sufficient to
   demonstrate compliance with this Addendum for the duration of the Agreement
   plus three years.

7. LIMITATION OF LIABILITY
   The data is provided "as is" without warranty. Licensor is not liable for
   model outputs, downstream harms, or decisions made by systems trained on
   the licensed corpus.
`.trim();

// ── Pricing helper ────────────────────────────────────────────────────────────

/**
 * Estimate corpus license price based on type, license, and whether annual feed is included.
 * Returns the midpoint of the applicable price range.
 * This is an estimate only — final pricing requires commercial negotiation.
 *
 * Оцінка вартості ліцензії на корпус (середина діапазону; фінальна ціна — переговори).
 */
export function computeCorpusPrice(
  type: CorpusType,
  licenseType: string,
  annualFeed: boolean,
): number {
  const dataset = LLM_TRAINING_CORPUS.find((d) => d.type === type);
  if (!dataset) return 0;

  const range = annualFeed && dataset.pricingAnnualFeedUsd
    ? dataset.pricingAnnualFeedUsd
    : dataset.pricingOneTimeUsd;

  const [min, max] = range;
  const midpoint = Math.round((min + max) / 2);

  // Academic / research-only licence gets 30% discount on headline price
  if (licenseType === "academic" || dataset.licenseType === "research-only") {
    return Math.round(midpoint * 0.7);
  }

  return midpoint;
}
