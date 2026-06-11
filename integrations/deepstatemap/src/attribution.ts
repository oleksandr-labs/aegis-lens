/**
 * Prominent attribution for DeepStateMAP (TODO task: "Attribution prominent").
 *
 * DeepStateMAP data is NOT public-domain. Their community norm and license require a
 * clear, visible credit with a link back, on every surface that displays the data.
 * This module is the single source of truth for that attribution string and the
 * republication gate. The map layer, API route, and any export MUST consume it.
 *
 * Republication is GATED: until the license check / partnership in COMPLIANCE.md is
 * confirmed, `republicationPermitted` defaults to false and the public API serves the
 * DEMO fixture only (never live DeepState polygons). Flip via env once cleared.
 */

import type { SourceAttribution } from "./types";

export const DEEPSTATE_SOURCE_URL = "https://deepstatemap.live";
export const DEEPSTATE_TELEGRAM_URL = "https://t.me/DeepStateUA";

/**
 * Republication gate. Defaults to FALSE (conservative). Only set to true once the
 * license/partnership in COMPLIANCE.md is confirmed in writing.
 *   DEEPSTATE_REPUBLICATION_PERMITTED=true
 */
export function isRepublicationPermitted(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.DEEPSTATE_REPUBLICATION_PERMITTED === "true";
}

export function buildAttribution(
  env: Record<string, string | undefined> = process.env,
): SourceAttribution {
  return {
    sourceName: "DeepStateMAP",
    sourceUrl: DEEPSTATE_SOURCE_URL,
    notice: {
      en: "Frontline data © DeepStateMAP (deepstatemap.live) — used with attribution. Not an official military source.",
      uk: "Дані про лінію фронту © DeepStateMAP (deepstatemap.live) — використано із зазначенням джерела. Не є офіційним військовим джерелом.",
    },
    license: "DeepStateMAP-ToS (republication by permission + attribution)",
    republicationPermitted: isRepublicationPermitted(env),
  };
}

/** Short one-line credit for compact UI placements (map corner, legend footer). */
export function attributionLine(locale: "en" | "uk" = "en"): string {
  return locale === "uk"
    ? "Джерело: DeepStateMAP (deepstatemap.live)"
    : "Source: DeepStateMAP (deepstatemap.live)";
}
