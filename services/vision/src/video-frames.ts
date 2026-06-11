/**
 * Frame-level video analysis with scene segmentation (Verification cluster).
 *
 * Splits a video into shots/scenes and selects keyframes so that per-image
 * detectors (object/aircraft/vessel/damage/manipulation/geolocation) can run on
 * representative stills. Scene boundaries also help spot stitched/edited footage.
 *
 * === MODEL WEIGHTS PENDING ===
 * The learned shot-boundary model (`scene-seg-v0`: TransNetV2) is a stub. The
 * heuristic baseline segments on frame-to-frame difference: the worker decodes
 * frames and hands this module a small per-frame feature (mean luma + a coarse
 * colour histogram), and we declare a hard cut where the inter-frame distance
 * spikes above an adaptive threshold. This catches hard cuts well; soft
 * dissolves/fades need the learned model.
 *
 * Decoding (ffmpeg) lives in the worker, not here, to keep this package pure-TS.
 */

import { VideoFrameRef, VideoScene, VideoSceneResult } from "./types";
import { calibrate } from "./confidence";

const SCENE_MODEL_ID = "scene-seg-v0";

/** Per-frame feature the worker extracts during decode. */
export interface FrameFeature {
  index: number;
  tsSec: number;
  /** Mean luma 0–1. */
  meanLuma: number;
  /** Coarse colour histogram (normalized bins summing to ~1). */
  histogram: number[];
  /** Optional extracted still media id for downstream image tasks. */
  frameMediaId?: string;
}

/** Chi-square-ish distance between two normalized histograms. */
function histDistance(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) {
    const s = a[i] + b[i];
    if (s > 0) d += ((a[i] - b[i]) ** 2) / s;
  }
  return d / 2; // 0..1-ish
}

function frameDistance(a: FrameFeature, b: FrameFeature): number {
  const luma = Math.abs(a.meanLuma - b.meanLuma);
  const hist = histDistance(a.histogram, b.histogram);
  return 0.4 * luma + 0.6 * hist;
}

export interface SegmentOptions {
  /** Sampling rate the worker used (frames per second). */
  sampledFps: number;
  /** Total duration (seconds). */
  durationSec: number;
  /** Cut sensitivity: cut declared when distance > mean + k*stddev. Default 3. */
  cutSensitivityK?: number;
  /** Minimum scene length (seconds) to avoid over-segmentation. Default 1. */
  minSceneSec?: number;
}

/**
 * Segment a decoded frame sequence into scenes with keyframes.
 * Returns the full VideoSceneResult contract.
 */
export function segmentScenes(mediaId: string, frames: FrameFeature[], opts: SegmentOptions): VideoSceneResult {
  const start = Date.now();
  const k = opts.cutSensitivityK ?? 3;
  const minScene = opts.minSceneSec ?? 1;

  const refs: VideoFrameRef[] = frames.map((f) => ({ index: f.index, tsSec: f.tsSec, frameMediaId: f.frameMediaId }));

  // Inter-frame distances.
  const dists: number[] = [];
  for (let i = 1; i < frames.length; i++) dists.push(frameDistance(frames[i - 1], frames[i]));

  const cutPointsSec: number[] = [];
  if (dists.length > 0) {
    const mean = dists.reduce((a, b) => a + b, 0) / dists.length;
    const variance = dists.reduce((a, b) => a + (b - mean) ** 2, 0) / dists.length;
    const std = Math.sqrt(variance);
    const threshold = mean + k * std;
    let lastCutSec = 0;
    for (let i = 0; i < dists.length; i++) {
      const ts = frames[i + 1].tsSec;
      if (dists[i] > threshold && ts - lastCutSec >= minScene) {
        cutPointsSec.push(parseFloat(ts.toFixed(2)));
        lastCutSec = ts;
      }
    }
  }

  // Build scenes from cut points.
  const boundaries = [0, ...cutPointsSec, opts.durationSec];
  const scenes: VideoScene[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const startSec = boundaries[i];
    const endSec = boundaries[i + 1];
    if (endSec <= startSec) continue;
    const midSec = (startSec + endSec) / 2;
    const keyframe = refs.reduce((best, r) =>
      Math.abs(r.tsSec - midSec) < Math.abs(best.tsSec - midSec) ? r : best, refs[0] ?? { index: 0, tsSec: midSec });
    scenes.push({
      startSec: parseFloat(startSec.toFixed(2)),
      endSec: parseFloat(endSec.toFixed(2)),
      keyframe,
      confidence: calibrate(cutPointsSec.length ? 0.55 : 0.4, SCENE_MODEL_ID),
    });
  }

  return {
    mediaId,
    durationSec: opts.durationSec,
    sampledFps: opts.sampledFps,
    frames: refs,
    scenes,
    cutPointsSec,
    processingMs: Date.now() - start,
  };
}

/**
 * Pick keyframes for downstream per-image analysis: one per scene, capped at `max`.
 * Returns frame refs that the worker can resolve to extracted stills.
 */
export function selectKeyframes(result: VideoSceneResult, max = 12): VideoFrameRef[] {
  const frames = result.scenes.map((s) => s.keyframe);
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  const out: VideoFrameRef[] = [];
  for (let i = 0; i < max; i++) out.push(frames[Math.floor(i * step)]);
  return out;
}
