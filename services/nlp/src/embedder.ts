/**
 * Text embedding generation.
 *
 * OpenAIEmbedder:  text-embedding-3-small / text-embedding-3-large
 * LocalEmbedder:   bge-m3 or any OpenAI-compatible endpoint (LiteLLM / Ollama)
 * NullEmbedder:    no-op stub for tests / offline mode
 */

import type { EmbeddingGenerator } from "./pipeline";
import type { EmbeddingResult } from "./types";

// ── OpenAI Embeddings API ─────────────────────────────────────────────────────

type OpenAIEmbeddingModel =
  | "text-embedding-3-small"
  | "text-embedding-3-large"
  | "text-embedding-ada-002";

const DIMENSIONS: Record<OpenAIEmbeddingModel, number> = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  "text-embedding-ada-002": 1536,
};

export class OpenAIEmbedder implements EmbeddingGenerator {
  constructor(
    private readonly apiKey: string,
    private readonly model: OpenAIEmbeddingModel = "text-embedding-3-small",
    private readonly baseUrl = "https://api.openai.com/v1",
  ) {}

  async embed(text: string): Promise<EmbeddingResult> {
    const truncated = text.slice(0, 8_000);

    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: truncated, model: this.model }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI embeddings error ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      data: { embedding: number[] }[];
      model: string;
    };

    return {
      vector: json.data[0]?.embedding ?? [],
      model: json.model ?? this.model,
      dimensions: DIMENSIONS[this.model],
    };
  }
}

// ── Local / OpenAI-compatible endpoint ───────────────────────────────────────

export class LocalEmbedder implements EmbeddingGenerator {
  constructor(
    private readonly endpointUrl: string,
    private readonly modelName: string = "bge-m3",
    private readonly dimensions: number = 1024,
  ) {}

  async embed(text: string): Promise<EmbeddingResult> {
    const res = await fetch(`${this.endpointUrl}/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, model: this.modelName }),
    });

    if (!res.ok) {
      throw new Error(`Local embedder error ${res.status}`);
    }

    const json = (await res.json()) as {
      data: { embedding: number[] }[];
    };

    return {
      vector: json.data[0]?.embedding ?? [],
      model: this.modelName,
      dimensions: this.dimensions,
    };
  }
}

// ── Null embedder (tests / CI) ────────────────────────────────────────────────

export class NullEmbedder implements EmbeddingGenerator {
  async embed(_text: string): Promise<EmbeddingResult> {
    return { vector: [], model: "null", dimensions: 0 };
  }
}

// ── Cosine similarity helper ──────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
