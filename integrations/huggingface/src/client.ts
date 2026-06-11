import 'server-only';

export interface HuggingFaceConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

/**
 * Curated model registry for Aegis Lens use cases.
 * Keys are task names; values are the default model ID for that task.
 */
export const HF_MODELS: Record<string, string> = {
  // OCR / document recognition
  'ocr-printed': 'microsoft/trocr-base-printed',
  'ocr-handwritten': 'microsoft/trocr-base-handwritten',
  // Named-entity recognition (multilingual)
  'ner-multi': 'flair/ner-multi',
  // Ukrainian ↔ English translation
  'translate-uk-en': 'Helsinki-NLP/opus-mt-uk-en',
  'translate-en-uk': 'Helsinki-NLP/opus-mt-en-uk',
  // Zero-shot classification (e.g. conflict event type)
  'zero-shot': 'facebook/bart-large-mnli',
  // Image classification
  'image-classification': 'google/vit-base-patch16-224',
  // Object detection (vehicles, military equipment proxy)
  'object-detection': 'facebook/detr-resnet-50',
  // Semantic segmentation
  'segmentation': 'nvidia/segformer-b0-finetuned-ade-512-512',
};

export interface InferenceError {
  error: string;
  estimated_time?: number; // seconds until model is loaded (cold start)
}

export class HuggingFaceClient {
  private readonly apiKey: string;
  /** HuggingFace Inference API base (public or private endpoint). */
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(config?: Partial<HuggingFaceConfig>) {
    this.apiKey = config?.apiKey ?? process.env.HUGGINGFACE_API_KEY ?? '';
    // HF_ENDPOINT_URL overrides to a private dedicated inference endpoint.
    this.baseUrl =
      config?.baseUrl ??
      (process.env.HF_ENDPOINT_URL || 'https://api-inference.huggingface.co/models');
    this.defaultModel =
      config?.defaultModel ??
      (process.env.HF_DEFAULT_MODEL || HF_MODELS['zero-shot']);
  }

  /** Returns true when HUGGINGFACE_API_KEY is present. */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Returns true when running against a private inference endpoint
   * (HF_ENDPOINT_URL env is set and not the default public API).
   */
  isSelfHosted(): boolean {
    return (
      !!process.env.HF_ENDPOINT_URL &&
      !process.env.HF_ENDPOINT_URL.includes('api-inference.huggingface.co')
    );
  }

  /**
   * Runs inference against a HuggingFace model.
   *
   * @param model — model ID (e.g. "microsoft/trocr-base-printed") or a key from HF_MODELS
   * @param input — request payload; shape depends on model pipeline type
   * @returns inference output; shape depends on model
   * @throws if the API returns an error or the model is loading (check `estimated_time`)
   */
  async infer<TInput, TOutput>(model: string, input: TInput): Promise<TOutput> {
    // Resolve alias from HF_MODELS registry
    const modelId = HF_MODELS[model] ?? model;

    const url = this.isSelfHosted()
      ? this.baseUrl // private endpoints use the full URL directly
      : `${this.baseUrl}/${modelId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({ error: res.statusText }))) as InferenceError;
      if (errBody.estimated_time) {
        throw new Error(
          `HuggingFace model "${modelId}" is loading. ` +
            `Retry in ~${Math.ceil(errBody.estimated_time)}s.`,
        );
      }
      throw new Error(
        `HuggingFace inference failed for "${modelId}" (${res.status}): ${errBody.error}`,
      );
    }

    return res.json() as Promise<TOutput>;
  }

  /**
   * Convenience wrapper for image inputs.
   * Accepts a base64-encoded image string or a Buffer and returns model output.
   */
  async inferImage<TOutput>(
    model: string,
    imageBase64: string,
  ): Promise<TOutput> {
    return this.infer<{ inputs: string }, TOutput>(model, {
      inputs: imageBase64,
    });
  }
}

export const huggingFaceClient = new HuggingFaceClient();
