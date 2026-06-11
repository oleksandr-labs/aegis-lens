/**
 * Task 8 — Per-tile attribution footer.
 *
 * Per-source attribution string builder (en/uk). Open Copernicus data and each
 * commercial provider carry a mandatory credit line; this assembles the footer
 * for whatever sources are currently visible on the map.
 */

import type { I18nText } from "./types";
import type { ImageryProvider } from "./scene-metadata";

/** Mandatory attribution text per imagery source. */
export const ATTRIBUTION: Record<ImageryProvider, I18nText> = {
  sentinel_hub: {
    en: "Contains modified Copernicus Sentinel data, processed by Sentinel Hub",
    uk: "Містить оброблені дані Copernicus Sentinel, опрацьовані Sentinel Hub",
  },
  copernicus: {
    en: "Contains modified Copernicus Sentinel data",
    uk: "Містить оброблені дані Copernicus Sentinel",
  },
  planet: {
    en: "Imagery © Planet Labs PBC",
    uk: "Знімки © Planet Labs PBC",
  },
  blacksky: {
    en: "Imagery © BlackSky",
    uk: "Знімки © BlackSky",
  },
  capella: {
    en: "SAR imagery © Capella Space",
    uk: "Знімки РСА © Capella Space",
  },
};

/**
 * Builds a deduplicated, localized attribution footer from the visible sources.
 * @param sources providers currently contributing tiles to the viewport
 * @param lang    "en" | "uk"
 */
export function buildAttribution(sources: ImageryProvider[], lang: "en" | "uk" = "en"): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const src of sources) {
    const entry = ATTRIBUTION[src];
    if (!entry) continue;
    const text = entry[lang];
    if (seen.has(text)) continue;
    seen.add(text);
    parts.push(text);
  }
  return parts.join(" · ");
}

/** Returns both en and uk footers at once (for SSR / dual-locale rendering). */
export function buildAttributionI18n(sources: ImageryProvider[]): I18nText {
  return {
    en: buildAttribution(sources, "en"),
    uk: buildAttribution(sources, "uk"),
  };
}
