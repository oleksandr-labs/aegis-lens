/**
 * Task 9 — Compare slider (before / after dates).
 *
 * Typed before/after pair model for the UI swipe slider. Each side references a
 * rendered scene (its tile/output URL) + its metadata so the footer/attribution
 * and date labels can update as the analyst drags the divider.
 */

import type { SceneMetadata } from "./scene-metadata";

/** One side of the comparison (a single dated image). */
export interface CompareSide {
  /** Tile template or single-image output URL. */
  tileUrl: string | null;
  /** Date label shown on this side (ISO date or pretty string). */
  date: string;
  metadata?: SceneMetadata;
}

export type SwipeOrientation = "horizontal" | "vertical";

/** A before/after comparison the slider component renders. */
export interface ComparePair {
  before: CompareSide;
  after: CompareSide;
  /** Divider position 0–1 (0 = all "before", 1 = all "after"). */
  sliderPosition: number;
  orientation: SwipeOrientation;
}

/** Clamp the slider position into [0,1]. */
export function clampSlider(position: number): number {
  if (Number.isNaN(position)) return 0.5;
  return Math.min(1, Math.max(0, position));
}

/** Build a ComparePair with sensible defaults. */
export function makeComparePair(
  before: CompareSide,
  after: CompareSide,
  opts?: { sliderPosition?: number; orientation?: SwipeOrientation },
): ComparePair {
  return {
    before,
    after,
    sliderPosition: clampSlider(opts?.sliderPosition ?? 0.5),
    orientation: opts?.orientation ?? "horizontal",
  };
}

/** True when before truly precedes after (guards against swapped dates). */
export function isChronological(pair: ComparePair): boolean {
  const b = Date.parse(pair.before.date);
  const a = Date.parse(pair.after.date);
  if (Number.isNaN(b) || Number.isNaN(a)) return true;
  return b <= a;
}

/** Returns the pair with sides swapped if the dates are reversed. */
export function normalizeChronology(pair: ComparePair): ComparePair {
  if (isChronological(pair)) return pair;
  return { ...pair, before: pair.after, after: pair.before };
}
