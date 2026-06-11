/**
 * Slug length distribution monitoring (target ≤ 75 chars).
 *
 * Over-long slugs get truncated in SERPs and signal keyword stuffing. The
 * url-builder already caps at 75 (`slugify maxLength`), but programmatic
 * composition (multi-segment paths, `-vs-` comparisons, locale prefixes) can
 * still push the FULL path long. This module computes a distribution + flags
 * offenders so monitoring can alert.
 *
 * See TODO/seo/TODO_url_seo.md. Pure / testable. Measures the slug (or full
 * path) string length the caller supplies.
 */

export const SLUG_MAX_LENGTH = 75;

export interface LengthSample {
  /** Identifier (template + slug, or full path). */
  id: string;
  /** The string whose length is measured (slug or full path). */
  value: string;
}

export interface LengthDistribution {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p90: number;
  /** Histogram buckets of width 15: 0-15, 16-30, ... 76+. */
  buckets: Record<string, number>;
  /** Samples exceeding SLUG_MAX_LENGTH. */
  overLimit: LengthSample[];
  ok: boolean;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function bucketLabel(len: number): string {
  if (len > SLUG_MAX_LENGTH) return "76+";
  const lo = Math.floor((len - 1) / 15) * 15 + 1;
  const hi = lo + 14;
  return len <= 0 ? "0" : `${lo}-${hi}`;
}

/** Compute the length distribution over a batch of slugs/paths. */
export function analyzeSlugLengths(
  samples: LengthSample[],
  maxLength: number = SLUG_MAX_LENGTH,
): LengthDistribution {
  const lengths = samples.map((s) => s.value.length);
  const sorted = [...lengths].sort((a, b) => a - b);
  const sum = lengths.reduce((a, b) => a + b, 0);
  const buckets: Record<string, number> = {};
  for (const len of lengths) {
    const label = bucketLabel(len);
    buckets[label] = (buckets[label] ?? 0) + 1;
  }
  const overLimit = samples.filter((s) => s.value.length > maxLength);

  return {
    count: samples.length,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    mean: samples.length ? sum / samples.length : 0,
    median: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    buckets,
    overLimit,
    ok: overLimit.length === 0,
  };
}
