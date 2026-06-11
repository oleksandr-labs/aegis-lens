/**
 * Recommendation Engine — public barrel export.
 *
 * Import everything from this module:
 *   import { getColdStartRecommendations, computeHybridScore, ... }
 *     from "@/lib/recommendations";
 */

export * from "./types";
export * from "./cold-start";
export * from "./scoring";
export * from "./explainability";
export * from "./editorial-overrides";
export * from "./opt-out";
export * from "./per-surface-metrics";
