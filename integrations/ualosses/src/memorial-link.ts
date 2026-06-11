/**
 * Memorial cross-references for investigation pages (task 8).
 *
 * Some investigation pages relate to events with casualties. Rather than scrape
 * or republish any individual's memorial record, we provide a respectful LINK to
 * the public memorial's own region/period view. The link carries NO scraped
 * personal data — only a source, a URL, and a localized respectful label.
 *
 * Take-down: a suppressed memorial URL (from `takedown.ts`) is never linked.
 */

import type { CasualtySource, LocalizedText, TakedownSuppression } from "./types";
import { requireAttribution } from "./attribution";

export interface MemorialLink {
  source: CasualtySource;
  /** Deep-ish link to the source's PUBLIC region/period view (not a person). */
  url: string;
  label: LocalizedText;
  /** Respectful note shown beside the link. */
  note: LocalizedText;
  community: boolean;
}

export interface MemorialLinkContext {
  source: CasualtySource;
  /** Optional region the investigation concerns (ISO 3166-2). */
  regionCode?: string;
  /** Optional period the investigation concerns. */
  period?: string;
}

/**
 * Build a respectful memorial link for an investigation page. Returns null if
 * the relevant memorial reference is suppressed by an active take-down, or if
 * all references are suppressed.
 */
export function buildMemorialLink(
  ctx: MemorialLinkContext,
  suppression?: TakedownSuppression,
): MemorialLink | null {
  const attr = requireAttribution(ctx.source);

  // Construct a link to the source's PUBLIC aggregate view (no per-person path).
  const base = attr.url.replace(/\/$/, "");
  const qs: string[] = [];
  if (ctx.regionCode) qs.push(`region=${encodeURIComponent(ctx.regionCode)}`);
  if (ctx.period) qs.push(`period=${encodeURIComponent(ctx.period)}`);
  const url = qs.length ? `${base}/?${qs.join("&")}` : base;

  if (suppression) {
    if (suppression.suppressAllReferences) return null;
    if (suppression.suppressedMemorialUrls.includes(url) || suppression.suppressedMemorialUrls.includes(base)) {
      return null;
    }
    const regionPeriodSuppressed = suppression.suppressedRegionPeriods.some(
      (rp) =>
        (rp.regionCode === undefined || rp.regionCode === ctx.regionCode) &&
        (rp.period === undefined || rp.period === ctx.period),
    );
    if (regionPeriodSuppressed) return null;
  }

  return {
    source: ctx.source,
    url,
    label: {
      en: `Public memorial — ${attr.publisher.en}`,
      uk: `Публічний меморіал — ${attr.publisher.uk}`,
    },
    note: {
      en: "Honoring the fallen at the source's public memorial. We do not republish personal records.",
      uk: "Вшанування памʼяті полеглих на публічному меморіалі джерела. Ми не публікуємо персональні записи.",
    },
    community: attr.community,
  };
}
