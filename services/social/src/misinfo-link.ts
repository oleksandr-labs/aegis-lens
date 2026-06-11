/**
 * Misinfo flag — cross-layer with misinformation detection.
 *
 * A spike in social-media activity is an early-warning signal, but elevated
 * volume is exactly what coordinated misinformation campaigns produce. This
 * module links a social-activity signal to the misinfo-detection verdicts from
 * `@ua-map/misinfo` (DisputedBadge / MisinfoSignal / MisinfoFlag) so the
 * heatmap can show a "may be amplified by misinformation" caveat instead of
 * presenting raw volume as ground truth.
 *
 * It intentionally mirrors the shapes in services/misinfo/src/types.ts. To avoid
 * a hard build-time package dependency the relevant types are re-declared here
 * structurally (identical fields), the same lightweight-coupling approach used
 * elsewhere in the repo between services.
 */

/** Mirror of `MisinfoFlag` from @ua-map/misinfo (services/misinfo/src/types.ts). */
export type MisinfoFlag =
  | "recycled_media"
  | "location_contradiction"
  | "temporal_contradiction"
  | "narrative_cluster"
  | "coordinated_behavior"
  | "low_source_reputation";

/** Mirror of `MisinfoSignal` from @ua-map/misinfo. */
export interface MisinfoSignal {
  flag: MisinfoFlag;
  confidence: number;
  explanation: string;
  sourceIds?: string[];
}

/** Mirror of the verdict surface from @ua-map/misinfo `DisputedBadge`. */
export interface MisinfoVerdict {
  /** The entity (event/cluster/region-window) the verdict applies to. */
  eventId: string;
  signals: MisinfoSignal[];
  /** Aggregate suspicion 0–1. */
  suspicionScore: number;
  requiresHumanReview: boolean;
  humanReviewStatus?: "pending" | "cleared" | "confirmed_misinfo";
}

/** Minimal view of a social-activity signal (subset of the API's SocialRegionSignal). */
export interface SocialSignalRef {
  signalId: string;
  regionCode: string;
  /** Time bucket start, ISO-8601. */
  bucketStart: string;
  topic: string;
  intensity: number;
  vsBaseline: number;
  /** Optional cross-reference to a verified event in the same region/window. */
  linkedEventId?: string;
}

export type MisinfoRiskLevel = "none" | "watch" | "elevated" | "high";

/** A social signal annotated with any cross-layer misinfo risk. */
export interface SocialMisinfoLink {
  signalId: string;
  regionCode: string;
  /** Verdict ids that informed this annotation. */
  matchedVerdictIds: string[];
  /** Distinct misinfo flags observed across matched verdicts. */
  flags: MisinfoFlag[];
  /** Max suspicion across matched verdicts (0–1). */
  maxSuspicionScore: number;
  riskLevel: MisinfoRiskLevel;
  /** Whether any matched verdict is awaiting/confirmed by a human reviewer. */
  awaitingHumanReview: boolean;
  caveatEn: string;
  caveatUk: string;
}

const WATCH_THRESHOLD = 0.25;
const ELEVATED_THRESHOLD = 0.5;
const HIGH_THRESHOLD = 0.7;

/**
 * Coordinated/narrative volume is most suspicious when intensity is high but no
 * verified event backs it up. This nudges the risk band upward.
 */
const UNBACKED_AMPLIFICATION_BONUS = 0.1;

function toRiskLevel(score: number): MisinfoRiskLevel {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= ELEVATED_THRESHOLD) return "elevated";
  if (score >= WATCH_THRESHOLD) return "watch";
  return "none";
}

function buildCaveat(flags: MisinfoFlag[], level: MisinfoRiskLevel): { en: string; uk: string } {
  if (level === "none") {
    return {
      en: "No misinformation signals linked to this activity.",
      uk: "Жодних сигналів дезінформації не пов'язано з цією активністю.",
    };
  }
  const flagListEn = flags.join(", ");
  return {
    en: `This activity spike may be amplified by misinformation (flags: ${flagListEn}). Volume is not confirmation. Cross-check before reporting.`,
    uk: `Це сплеск активності може бути підсилений дезінформацією (позначки: ${flagListEn}). Обсяг не є підтвердженням. Перевірте перед публікацією.`,
  };
}

/**
 * Link a social signal to the relevant misinfo verdicts and produce a typed
 * cross-layer annotation. `verdicts` should already be filtered to the same
 * region/window (or matched via `linkedEventId`); this function tolerates a
 * broader list and matches by eventId / region.
 */
export function linkSocialToMisinfo(
  signal: SocialSignalRef,
  verdicts: MisinfoVerdict[],
): SocialMisinfoLink {
  // Match by the explicitly linked event id, or fall back to region-keyed verdicts.
  const matched = verdicts.filter(
    (v) =>
      (signal.linkedEventId && v.eventId === signal.linkedEventId) ||
      v.eventId === signal.regionCode,
  );

  const flags = Array.from(
    new Set(matched.flatMap((v) => v.signals.map((s) => s.flag))),
  );
  const rawMax = matched.reduce((m, v) => Math.max(m, v.suspicionScore), 0);

  // High-intensity, no verified backing → treat amplification risk as worse.
  const unbacked = !signal.linkedEventId && signal.vsBaseline >= 3 && signal.intensity >= 0.7;
  const adjusted = Math.min(1, rawMax + (unbacked && matched.length > 0 ? UNBACKED_AMPLIFICATION_BONUS : 0));

  const level = toRiskLevel(adjusted);
  const awaitingHumanReview = matched.some(
    (v) => v.requiresHumanReview && v.humanReviewStatus !== "cleared",
  );

  return {
    signalId: signal.signalId,
    regionCode: signal.regionCode,
    matchedVerdictIds: matched.map((v) => v.eventId),
    flags,
    maxSuspicionScore: parseFloat(adjusted.toFixed(3)),
    riskLevel: level,
    awaitingHumanReview,
    ...((): { caveatEn: string; caveatUk: string } => {
      const c = buildCaveat(flags, level);
      return { caveatEn: c.en, caveatUk: c.uk };
    })(),
  };
}

/** Annotate a batch of social signals against a verdict set. */
export function linkBatch(
  signals: SocialSignalRef[],
  verdicts: MisinfoVerdict[],
): SocialMisinfoLink[] {
  return signals.map((s) => linkSocialToMisinfo(s, verdicts));
}
