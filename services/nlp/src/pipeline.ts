import type {
  DetectionResult,
  TranslationResult,
  NERResult,
  ClassificationResult,
  SummaryResult,
  EmbeddingResult,
  ToxicityResult,
} from "./types";
import type { LanguageDetector } from "./language-detect";
import type { TextClassifier } from "./classifier";

export interface Translator {
  translate(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult>;
}

export interface NERExtractor {
  extract(text: string, language: string): Promise<NERResult>;
}

export interface Summarizer {
  summarize(text: string, language: string, targetLanguages: string[]): Promise<SummaryResult[]>;
}

export interface EmbeddingGenerator {
  embed(text: string): Promise<EmbeddingResult>;
}

export interface ToxicityClassifier {
  classify(text: string): Promise<ToxicityResult>;
}

export interface NLPInput {
  text: string;
  hint_language?: string;
}

export interface NLPOutput {
  detection: DetectionResult;
  translation?: TranslationResult;
  ner: NERResult;
  classification: ClassificationResult;
  summaries: SummaryResult[];
  embedding: EmbeddingResult;
  toxicity: ToxicityResult;
}

/**
 * Orchestrates the full NLP pipeline for a single text input.
 * Each stage can fail independently; failures are captured in the output.
 */
export class NLPPipeline {
  constructor(
    private readonly detector: LanguageDetector,
    private readonly translator: Translator,
    private readonly ner: NERExtractor,
    private readonly classifier: TextClassifier,
    private readonly summarizer: Summarizer,
    private readonly embedder: EmbeddingGenerator,
    private readonly toxicity: ToxicityClassifier,
    private readonly targetLocales: string[] = ["en", "uk"],
  ) {}

  async process(input: NLPInput): Promise<NLPOutput> {
    const detection = await this.detector.detect(input.text);
    const workingLang = detection.language;

    // Translate if not already in a target locale
    let translation: TranslationResult | undefined;
    if (!this.targetLocales.includes(workingLang)) {
      translation = await this.translator.translate(input.text, workingLang, "en").catch(() => undefined);
    }

    const workingText = translation?.translated ?? input.text;

    const [ner, classification, summaries, embedding, toxicity] = await Promise.allSettled([
      this.ner.extract(workingText, workingLang),
      this.classifier.classify(workingText, workingLang),
      this.summarizer.summarize(workingText, workingLang, this.targetLocales),
      this.embedder.embed(workingText),
      this.toxicity.classify(workingText),
    ]);

    return {
      detection,
      translation,
      ner: ner.status === "fulfilled" ? ner.value : { entities: [], language: workingLang },
      classification: classification.status === "fulfilled" ? classification.value : { class: "military_action", confidence: 0 },
      summaries: summaries.status === "fulfilled" ? summaries.value : [],
      embedding: embedding.status === "fulfilled" ? embedding.value : { vector: [], model: "none", dimensions: 0 },
      toxicity: toxicity.status === "fulfilled" ? toxicity.value : { toxic: false, score: 0, disinfo_score: 0, flags: [] },
    };
  }
}
