/**
 * @ua-map/integration-troop-movement
 *
 * The most ethically loaded layer. Fuzzing, delay, editorial review and gating
 * are the DEFAULT (fail-closed) throughout this package:
 *   - ingestion-policy: only post-event + publicly-attributed reports enter.
 *   - verification:     ≥2 independent sources + media corroboration.
 *   - delay-policy:     no near-real-time precise positions (per-scenario delay).
 *   - oob:              publicly-attributed order-of-battle only.
 *   - movement-vectors: low-precision compass buckets, never exact coords.
 *   - equipment-link:   cross-links into the equipment layer per unit.
 *   - review-queue:     mandatory editorial approval before publish.
 *   - kill-switch:      disable the whole layer on a misuse spike.
 */

export * from "./types";
export * from "./ingestion-policy";
export * from "./verification";
export * from "./delay-policy";
export * from "./oob";
export * from "./movement-vectors";
export * from "./equipment-link";
export * from "./review-queue";
export * from "./kill-switch";
