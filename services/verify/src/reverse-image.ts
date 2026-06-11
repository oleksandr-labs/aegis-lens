/**
 * Reverse image search — find prior appearances of an image across platforms.
 *
 * Checks our internal perceptual-hash index first, then falls back to
 * commercial providers (TinEye, Google Vision). Earlier appearances
 * undermines "exclusive" claims; recycled imagery is a common misinfo pattern.
 *
 * NOTES:
 * 1. TinEye (EN): TinEye API requires a commercial key — returns earliest date seen.
 *    TinEye (UK): TinEye API потребує комерційного ключа — повертає найранішу дату.
 * 2. Google Vision (EN): Google Vision API reverse search (web detection endpoint).
 *    Google Vision (UK): Зворотний пошук через Google Vision API (ендпоінт web detection).
 * 3. Internal (EN): Internal pHash index allows sub-second lookup for known images.
 *    Internal (UK): Внутрішній індекс pHash дозволяє пошук за долі секунди по відомих зображеннях.
 */

export type ReverseImageProvider = "internal" | "tineye" | "google" | "yandex";

export interface ReverseImageMatch {
  url: string;
  platform: string;
  /** ISO-8601 — when the image was first seen at this URL */
  firstSeenAt?: string;
  title?: string;
  /** 0–1 similarity confidence */
  confidence: number;
}

export interface ReverseImageSearchResult {
  queryImageUrl: string;
  matches: ReverseImageMatch[];
  searchedAt: string;
  provider: ReverseImageProvider;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const REVERSE_IMAGE_PROVIDERS_EN = [
  "TinEye API: commercial key required; returns reverse-chronological match list with earliest date seen.",
  "Google Vision API: web detection endpoint returns pages / visually similar images.",
  "Internal pHash index: millisecond lookup for images already in our corpus.",
] as const;

export const REVERSE_IMAGE_PROVIDERS_UK = [
  "TinEye API: потрібен комерційний ключ; повертає список збігів у зворотньому хронологічному порядку.",
  "Google Vision API: ендпоінт web detection повертає сторінки / візуально схожі зображення.",
  "Внутрішній індекс pHash: мілісекундний пошук для зображень, що вже є у нашому корпусі.",
] as const;

// ── Query builder ─────────────────────────────────────────────────────────────

/**
 * Build query parameters for a reverse image search request.
 * Each provider gets its own key in the returned record.
 */
export function buildReverseImageQuery(
  imageUrl: string,
  providers: string[],
): Record<string, string> {
  const params: Record<string, string> = {
    imageUrl,
    providers: providers.join(","),
    timestamp: new Date().toISOString(),
  };
  // Provider-specific params added on expansion
  if (providers.includes("tineye")) {
    params["tineye_sort"] = "earliest";
  }
  if (providers.includes("google")) {
    params["google_features"] = "WEB_DETECTION";
  }
  return params;
}

// ── Stub client ───────────────────────────────────────────────────────────────

class ReverseImageSearchClient {
  private readonly providers: ReverseImageProvider[];

  constructor(providers: ReverseImageProvider[] = ["internal", "tineye", "google"]) {
    this.providers = providers;
  }

  /**
   * Stub: returns empty match list. Replace with real HTTP calls per provider.
   */
  async search(imageUrl: string): Promise<ReverseImageSearchResult[]> {
    return this.providers.map((provider) => ({
      queryImageUrl: imageUrl,
      matches: [],
      searchedAt: new Date().toISOString(),
      provider,
    }));
  }

  /** Merge results from multiple providers, deduplicating by URL. */
  mergeResults(results: ReverseImageSearchResult[]): ReverseImageMatch[] {
    const seen = new Set<string>();
    const merged: ReverseImageMatch[] = [];
    for (const result of results) {
      for (const match of result.matches) {
        if (!seen.has(match.url)) {
          seen.add(match.url);
          merged.push(match);
        }
      }
    }
    return merged.sort((a, b) => b.confidence - a.confidence);
  }
}

export const reverseImageClient = new ReverseImageSearchClient();
