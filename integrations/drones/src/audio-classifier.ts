/**
 * Audio signature classifier for drones (where audio sources are available).
 *
 * Distributed acoustic sensors / phone recordings capture the characteristic
 * engine note of UAVs — the Shahed's two-stroke "moped" buzz is the canonical
 * example. A production system trains on labelled spectrograms; here we define
 * the codeable contract (typed audio-feature input → model interface) plus a
 * heuristic baseline that matches extracted features against per-model acoustic
 * templates, emitting the same `FieldConfidence` schema as the visual/keyword
 * classifiers so results fuse via `mergeConfidence`.
 */

import { DroneModel, FieldConfidence } from "./types";

/** Acoustic features extractable from a short audio window (FFT-derived). */
export interface AudioFeatures {
  /** Fundamental engine/prop frequency in Hz. */
  fundamentalHz: number;
  /** Blade/cylinder pass harmonic spacing in Hz. */
  harmonicSpacingHz?: number;
  /** Spectral centroid (brightness) in Hz. */
  spectralCentroidHz?: number;
  /** Signal-to-noise ratio in dB. */
  snrDb: number;
  /** Window duration in seconds. */
  durationS: number;
}

/** Per-model acoustic template for the heuristic baseline. */
interface AcousticTemplate {
  model: DroneModel;
  /** Expected fundamental frequency band [lo, hi] Hz. */
  fundamentalBand: [number, number];
  /** Optional harmonic spacing band [lo, hi] Hz. */
  harmonicBand?: [number, number];
  baseConfidence: number;
}

const ACOUSTIC_TEMPLATES: AcousticTemplate[] = [
  // Shahed-136/131: distinctive ~90–130 Hz two-stroke buzz.
  { model: "shahed_136", fundamentalBand: [90, 130], harmonicBand: [90, 130], baseConfidence: 0.8 },
  { model: "shahed_131", fundamentalBand: [95, 140], harmonicBand: [95, 140], baseConfidence: 0.74 },
  // Electric FPV / quad: high-pitched prop whine.
  { model: "fpv_kamikaze", fundamentalBand: [180, 400], baseConfidence: 0.6 },
  { model: "mavic", fundamentalBand: [150, 320], baseConfidence: 0.58 },
  // Orlan-10: small ICE prop, mid band.
  { model: "orlan_10", fundamentalBand: [60, 110], baseConfidence: 0.62 },
];

/** Contract any acoustic drone classifier (heuristic or ML) must implement. */
export interface AudioDroneClassifier {
  readonly id: string;
  readonly version: string;
  readonly supportedModels: DroneModel[];
  /** Minimum SNR (dB) below which the classifier abstains. */
  readonly minSnrDb: number;
  classify(features: AudioFeatures): FieldConfidence | undefined;
}

/** Heuristic baseline acoustic classifier. */
export function classifyModelFromAudio(
  features: AudioFeatures,
  minSnrDb = 6,
): FieldConfidence | undefined {
  if (features.snrDb < minSnrDb) return undefined; // too noisy to call

  let best: { model: DroneModel; score: number } | undefined;
  for (const tpl of ACOUSTIC_TEMPLATES) {
    let score = 0;
    const [fLo, fHi] = tpl.fundamentalBand;
    if (features.fundamentalHz >= fLo && features.fundamentalHz <= fHi) score += 0.6;

    if (tpl.harmonicBand && features.harmonicSpacingHz != null) {
      const [hLo, hHi] = tpl.harmonicBand;
      if (features.harmonicSpacingHz >= hLo && features.harmonicSpacingHz <= hHi) score += 0.4;
    }
    if (score > 0 && (!best || score > best.score)) best = { model: tpl.model, score };
  }

  if (!best) return undefined;
  const tpl = ACOUSTIC_TEMPLATES.find((t) => t.model === best!.model)!;
  // SNR modestly boosts confidence up to a cap.
  const snrBonus = Math.min(0.15, (features.snrDb - minSnrDb) / 100);
  return {
    value: best.model,
    confidence: parseFloat(Math.min(1, tpl.baseConfidence * best.score + snrBonus).toFixed(3)),
    sourceCount: 1,
  };
}

/** Reference implementation of the audio-classifier contract. */
export const heuristicAudioClassifier: AudioDroneClassifier = {
  id: "audio_heuristic",
  version: "0.1.0",
  minSnrDb: 6,
  supportedModels: ACOUSTIC_TEMPLATES.map((t) => t.model),
  classify: (f) => classifyModelFromAudio(f),
};
