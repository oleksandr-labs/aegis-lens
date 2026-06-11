/**
 * Source attribution — ALWAYS present (task 6).
 *
 * Every casualty figure the product shows MUST credit its source. Attribution is
 * not optional and not best-effort: `requireAttribution` throws if a source is
 * unknown, so a figure can never be displayed without a credit line. Community
 * sources additionally carry a verification caveat in their credit.
 */

import type { CasualtySource, SourceAttribution, LocalizedText } from "./types";
import { UALOSSES_ATTRIBUTION } from "./ualosses-client";
import { KIU_ATTRIBUTION } from "./kiu-client";
import { MEDIAZONA_ATTRIBUTION } from "./mediazona-client";

export const ATTRIBUTIONS: Record<CasualtySource, SourceAttribution> = {
  ualosses: UALOSSES_ATTRIBUTION,
  killed_in_ukraine: KIU_ATTRIBUTION,
  mediazona: MEDIAZONA_ATTRIBUTION,
};

/** Look up attribution; THROWS if the source is unknown (no unattributed data). */
export function requireAttribution(source: CasualtySource): SourceAttribution {
  const a = ATTRIBUTIONS[source];
  if (!a) throw new Error(`No attribution registered for source "${source}" — refusing to display unattributed casualty data.`);
  return a;
}

/** Build a localized credit line, with a community caveat where relevant. */
export function creditLine(source: CasualtySource, locale: "uk" | "en"): string {
  const a = requireAttribution(source);
  return a.credit[locale];
}

/** Deduplicated attribution block for a set of sources (e.g. a widget footer). */
export function attributionBlock(sources: CasualtySource[]): {
  sources: SourceAttribution[];
  footer: LocalizedText;
} {
  const seen = new Set<CasualtySource>();
  const list: SourceAttribution[] = [];
  for (const s of sources) {
    if (seen.has(s)) continue;
    seen.add(s);
    list.push(requireAttribution(s));
  }
  return {
    sources: list,
    footer: {
      en: "Sources: " + list.map((a) => a.publisher.en).join("; ") + ".",
      uk: "Джерела: " + list.map((a) => a.publisher.uk).join("; ") + ".",
    },
  };
}
