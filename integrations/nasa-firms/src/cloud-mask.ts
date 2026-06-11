/**
 * Cloud-mask evaluation for thermal satellite imagery.
 *
 * Heavy cloud cover degrades thermal anomaly detection because clouds absorb
 * and re-emit IR radiation, masking ground-level heat sources. Images with
 * cloud cover above the threshold should be flagged as low-quality.
 *
 * NOTES:
 * 1. Sen2Cor (EN): Sen2Cor atmospheric correction pipeline outputs per-pixel cloud probability masks.
 *    Sen2Cor (UK): Конвеєр атмосферної корекції Sen2Cor видає маски хмарності по пікселях.
 * 2. Copernicus cloud masks (EN): Copernicus Land/CLMS products include pre-computed cloud masks.
 *    Copernicus cloud masks (UK): Продукти Copernicus Land/CLMS містять заздалегідь обчислені маски хмарності.
 */

export interface CloudMaskResult {
  imageId: string;
  /** Percentage of image covered by cloud (0–100) */
  cloudCoverPct: number;
  /** True when cloudCoverPct > CLOUD_COVER_THRESHOLD */
  hasDenseCloudCover: boolean;
  /** Sub-regions with acceptable (<threshold) cloud cover, if any */
  clearRegions?: { lat: number; lng: number; radiusKm: number }[];
}

/** Cloud cover percentage above which thermal data quality is considered degraded. */
export const CLOUD_COVER_THRESHOLD = 30;

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const CLOUD_MASK_NOTES_EN = [
  "Sen2Cor: ESA's atmospheric correction tool produces per-pixel cloud probability; values above 50% per pixel are masked.",
  "Copernicus cloud masks: Copernicus Land Monitoring Service (CLMS) provides pre-computed cloud and cloud-shadow masks at 20 m resolution.",
] as const;

export const CLOUD_MASK_NOTES_UK = [
  "Sen2Cor: інструмент атмосферної корекції ESA формує хмарну імовірність попіксельно; значення >50% маскуються.",
  "Маски хмарності Copernicus: сервіс моніторингу суші Copernicus (CLMS) надає готові маски хмар і хмарних тіней із роздільністю 20 м.",
] as const;

// ── Evaluator ─────────────────────────────────────────────────────────────────

/**
 * Evaluate a cloud-cover percentage and return a CloudMaskResult.
 * `clearRegions` is not populated here (requires spatial pixel-mask data);
 * downstream processing can attach it after spatial analysis.
 */
export function evaluateCloudMask(
  cloudCoverPct: number,
  imageId = "unknown",
): CloudMaskResult {
  const clamped = Math.max(0, Math.min(100, cloudCoverPct));
  return {
    imageId,
    cloudCoverPct: clamped,
    hasDenseCloudCover: clamped > CLOUD_COVER_THRESHOLD,
  };
}
