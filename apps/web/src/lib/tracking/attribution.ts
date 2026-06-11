import "server-only";

/**
 * Multi-touch attribution models.
 *
 * Server-only: touch-point data must never be sent to the client raw.
 */

import type { AcquisitionChannel } from "./types";

// ── Core types ────────────────────────────────────────────────────────────

export type AttributionModel =
  | "first_touch"
  | "last_touch"
  | "linear"
  | "position_based"
  | "time_decay";

export interface TouchPoint {
  channel: AcquisitionChannel;
  timestamp: string; // ISO 8601
  weight?: number;   // pre-assigned weight (optional; computed by model)
}

export interface AttributionResult {
  userId: string;
  touchPoints: TouchPoint[];
  model: AttributionModel;
  creditedChannel: AcquisitionChannel;
  creditWeight: number;
}

export interface LtvPerChannel {
  channel: AcquisitionChannel;
  avgLtv: number;
  conversionRate: number;
  sampleSize: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Return the channel that accumulated the highest total weight. */
function topChannel(weights: Map<AcquisitionChannel, number>): AcquisitionChannel {
  let best: AcquisitionChannel = "direct";
  let bestWeight = -1;
  for (const [channel, w] of weights) {
    if (w > bestWeight) {
      best = channel;
      bestWeight = w;
    }
  }
  return best;
}

// ── Linear attribution ────────────────────────────────────────────────────

/**
 * Distributes 100% credit equally across all touch-points.
 * Returns a result with the channel that earned the most total credit.
 *
 * @param touchPoints - Ordered list of touch-points (oldest first).
 * @param userId      - Owner of the journey (defaults to "unknown").
 */
export function computeLinearAttribution(
  touchPoints: TouchPoint[],
  userId = "unknown",
): AttributionResult {
  if (touchPoints.length === 0) {
    return {
      userId,
      touchPoints,
      model: "linear",
      creditedChannel: "direct",
      creditWeight: 0,
    };
  }

  const sharePerPoint = 1 / touchPoints.length;
  const weights = new Map<AcquisitionChannel, number>();

  for (const tp of touchPoints) {
    const prev = weights.get(tp.channel) ?? 0;
    weights.set(tp.channel, prev + sharePerPoint);
  }

  const credited = topChannel(weights);
  return {
    userId,
    touchPoints: touchPoints.map((tp) => ({ ...tp, weight: sharePerPoint })),
    model: "linear",
    creditedChannel: credited,
    creditWeight: weights.get(credited) ?? sharePerPoint,
  };
}

// ── Position-based (U-shaped) attribution ────────────────────────────────

/**
 * Gives `firstWeight` to the first touch, `lastWeight` to the last touch,
 * and distributes the remainder equally among middle touch-points.
 *
 * Defaults: 40% first, 40% last, 20% split evenly across the middle.
 *
 * @param touchPoints - Ordered list (oldest first).
 * @param firstWeight - Credit fraction for first touch (0–1). Default 0.4.
 * @param lastWeight  - Credit fraction for last touch  (0–1). Default 0.4.
 * @param userId      - Owner of the journey.
 */
export function computePositionBasedAttribution(
  touchPoints: TouchPoint[],
  firstWeight = 0.4,
  lastWeight = 0.4,
  userId = "unknown",
): AttributionResult {
  if (touchPoints.length === 0) {
    return {
      userId,
      touchPoints,
      model: "position_based",
      creditedChannel: "direct",
      creditWeight: 0,
    };
  }

  // Clamp weights so they never exceed 1 combined
  const clampedFirst = Math.min(firstWeight, 1);
  const clampedLast  = Math.min(lastWeight,  Math.max(0, 1 - clampedFirst));
  const middleTotal  = Math.max(0, 1 - clampedFirst - clampedLast);

  const n = touchPoints.length;
  const middleCount = Math.max(0, n - 2);
  const middleShare = middleCount > 0 ? middleTotal / middleCount : 0;

  const assignedWeights: number[] = touchPoints.map((_, i) => {
    if (i === 0)      return clampedFirst;
    if (i === n - 1)  return clampedLast;
    return middleShare;
  });

  // Single touch-point: it gets everything
  if (n === 1) assignedWeights[0] = 1;

  const weights = new Map<AcquisitionChannel, number>();
  for (let i = 0; i < touchPoints.length; i++) {
    const ch = touchPoints[i].channel;
    const prev = weights.get(ch) ?? 0;
    weights.set(ch, prev + assignedWeights[i]);
  }

  const credited = topChannel(weights);
  return {
    userId,
    touchPoints: touchPoints.map((tp, i) => ({ ...tp, weight: assignedWeights[i] })),
    model: "position_based",
    creditedChannel: credited,
    creditWeight: weights.get(credited) ?? assignedWeights[0],
  };
}
