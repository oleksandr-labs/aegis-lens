/**
 * Perceptual hash utilities for image deduplication.
 *
 * Perceptual hashes (pHash, dHash, aHash) allow fuzzy image matching by
 * comparing bit-level similarity rather than exact byte equality. Hamming
 * distance below threshold = likely duplicate / recycled image.
 *
 * NOTES:
 * 1. pHash (EN): 12×12 DCT-grid hash — robust to brightness/contrast changes.
 *    pHash (UK): Хеш на основі ДКП 12×12 — стійкий до змін яскравості/контрасту.
 * 2. dHash (EN): Difference hash — compares adjacent pixel brightness in 8×8 grid.
 *    dHash (UK): Хеш різниць — порівнює яскравість сусідніх пікселів у сітці 8×8.
 * 3. Production (EN): Use blockhash-npm or a GPU-backed service for scale.
 *    Production (UK): Для масштабу використовуйте blockhash-npm або GPU-сервіс.
 */

export type ImageHashType = "phash" | "dhash" | "ahash" | "embedding";

export interface ImageHash {
  hashType: ImageHashType;
  /** Hex string (pHash/dHash/aHash) or base64 (embedding vector) */
  value: string;
  bitLength: number;
}

export interface PerceptualHashResult {
  imageUrl: string;
  hashes: ImageHash[];
  computedAt: string;
}

/** Hamming distance thresholds — images with distance BELOW are likely duplicates. */
export const HAMMING_DISTANCE_THRESHOLDS: Record<"phash" | "dhash" | "ahash", number> = {
  phash: 10,
  dhash: 8,
  ahash: 12,
};

/**
 * Compute the Hamming distance between two hex-encoded hashes.
 * XOR each hex nibble pair and count set bits.
 */
export function computeHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error(
      `Hash length mismatch: ${hash1.length} vs ${hash2.length}`,
    );
  }
  let distance = 0;
  for (let i = 0; i < hash1.length; i += 2) {
    const byte1 = parseInt(hash1.slice(i, i + 2), 16);
    const byte2 = parseInt(hash2.slice(i, i + 2), 16);
    let xor = byte1 ^ byte2;
    // Count set bits (Kernighan's algorithm)
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Returns true if two ImageHash values indicate a likely duplicate.
 * Both hashes must be the same hashType; embedding comparison is not supported here.
 */
export function isDuplicate(hash1: ImageHash, hash2: ImageHash): boolean {
  if (hash1.hashType !== hash2.hashType) return false;
  if (hash1.hashType === "embedding") return false; // cosine similarity needed
  const threshold =
    HAMMING_DISTANCE_THRESHOLDS[hash1.hashType as "phash" | "dhash" | "ahash"];
  const distance = computeHammingDistance(hash1.value, hash2.value);
  return distance < threshold;
}

// ── Bilingual notes (exported for UI display) ─────────────────────────────────

export const PHASH_NOTES_EN = [
  "pHash: 12×12 DCT-grid hash — robust to brightness, contrast, and minor cropping changes.",
  "dHash: Difference hash — compares adjacent pixel brightness in an 8×8 gradient grid.",
  "Production: Use blockhash-npm or a GPU-backed embedding service for high-volume matching.",
] as const;

export const PHASH_NOTES_UK = [
  "pHash: хеш ДКП 12×12 — стійкий до змін яскравості, контрасту та незначного кадрування.",
  "dHash: хеш різниць — порівнює яскравість сусідніх пікселів у градієнтній сітці 8×8.",
  "Production: для великих обсягів використовуйте blockhash-npm або GPU-сервіс ембедингів.",
] as const;
