/**
 * Task — Frame sampling for CV checks.
 *
 * Computer-vision verification (deepfake/manipulation detection, weapon/vehicle
 * recognition, geolocation cues) does not run on whole videos — it runs on a
 * sampled set of keyframes. This module produces a deterministic *sampling plan*
 * (which timestamps to extract) and defines the CV-handoff model: the integration
 * never decodes video itself; it hands the plan to a pluggable frame extractor +
 * CV analyzer.
 */

import type { YTVideo } from "./types";

/** Strategy for choosing which frames to sample. */
export type SampleStrategy =
  | "uniform"        // every N seconds
  | "head_tail"      // dense at start/end (intros/outros often carry claims)
  | "scene_change";  // hand off to extractor's scene-change detector

export interface FrameSamplePlanOptions {
  strategy?: SampleStrategy;
  /** For "uniform": seconds between samples. */
  intervalSec?: number;
  /** Hard cap on frames (cost / CV-quota guard). */
  maxFrames?: number;
}

/** One planned frame to extract + analyze. */
export interface PlannedFrame {
  /** Offset from video start, seconds. */
  atSec: number;
  /** Stable id: `<videoId>@<atSec>`. */
  frameId: string;
  reason: SampleStrategy;
}

export interface FrameSamplePlan {
  videoId: string;
  durationSec: number;
  strategy: SampleStrategy;
  frames: PlannedFrame[];
}

const DEFAULT_INTERVAL_SEC = 15;
const DEFAULT_MAX_FRAMES = 40;

/** Parse an ISO-8601 duration (e.g. "PT1H2M3S") into seconds. */
export function parseIsoDuration(iso?: string): number {
  if (!iso) return 0;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  const [, h, min, s] = m;
  return Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0);
}

/** Build a deterministic frame-sampling plan for a video. */
export function buildSamplePlan(
  video: Pick<YTVideo, "id" | "duration">,
  opts: FrameSamplePlanOptions = {},
): FrameSamplePlan {
  const strategy = opts.strategy ?? "uniform";
  const durationSec = parseIsoDuration(video.duration);
  const maxFrames = opts.maxFrames ?? DEFAULT_MAX_FRAMES;
  const frames: PlannedFrame[] = [];

  const push = (atSec: number, reason: SampleStrategy) => {
    const t = Math.max(0, Math.round(atSec));
    if (frames.some((f) => f.atSec === t)) return;
    frames.push({ atSec: t, frameId: `${video.id}@${t}`, reason });
  };

  if (durationSec <= 0) {
    // Unknown duration — sample only the start.
    push(0, strategy);
    return { videoId: video.id, durationSec, strategy, frames };
  }

  if (strategy === "head_tail") {
    const dense = Math.min(8, maxFrames / 2);
    for (let i = 0; i < dense; i++) push((i * durationSec) / (dense * 4), "head_tail");
    for (let i = 0; i < dense; i++) push(durationSec - (i * durationSec) / (dense * 4), "head_tail");
  } else if (strategy === "scene_change") {
    // The extractor runs real scene detection; we seed evenly so the contract is
    // exercisable without a decoder.
    const step = durationSec / Math.min(maxFrames, 12);
    for (let t = 0; t < durationSec; t += step) push(t, "scene_change");
  } else {
    const interval = opts.intervalSec ?? DEFAULT_INTERVAL_SEC;
    for (let t = 0; t < durationSec; t += interval) push(t, "uniform");
  }

  // Enforce the cap deterministically (keep evenly spread frames).
  frames.sort((a, b) => a.atSec - b.atSec);
  const capped = capFrames(frames, maxFrames);
  return { videoId: video.id, durationSec, strategy, frames: capped };
}

function capFrames(frames: PlannedFrame[], max: number): PlannedFrame[] {
  if (frames.length <= max) return frames;
  const out: PlannedFrame[] = [];
  const stride = frames.length / max;
  for (let i = 0; i < max; i++) out.push(frames[Math.floor(i * stride)]);
  return out;
}

// ── CV handoff model ────────────────────────────────────────────────────────

/** What a CV check returns for one frame. */
export interface FrameCvResult {
  frameId: string;
  atSec: number;
  /** e.g. "manipulation", "weapon", "vehicle", "geo_cue". */
  checks: Array<{ type: string; label: string; confidence: number }>;
}

/**
 * Pluggable frame extractor + CV analyzer. The host implements this with ffmpeg
 * (or yt-dlp + a decoder) and a CV model. The integration only orchestrates.
 */
export interface FrameCvAnalyzer {
  analyze(plan: FrameSamplePlan): Promise<FrameCvResult[]>;
}

/** Aggregate CV results into a per-video verification summary. */
export interface CvVideoSummary {
  videoId: string;
  framesAnalyzed: number;
  /** Highest-confidence manipulation signal across frames, if any. */
  maxManipulationConfidence: number;
  /** Distinct detected object labels. */
  detectedLabels: string[];
}

export function summariseCv(videoId: string, results: FrameCvResult[]): CvVideoSummary {
  let maxManip = 0;
  const labels = new Set<string>();
  for (const r of results) {
    for (const c of r.checks) {
      if (c.type === "manipulation") maxManip = Math.max(maxManip, c.confidence);
      else labels.add(c.label);
    }
  }
  return {
    videoId,
    framesAnalyzed: results.length,
    maxManipulationConfidence: maxManip,
    detectedLabels: [...labels],
  };
}
