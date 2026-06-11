/**
 * Casualty-statistics widget model (aggregate only).
 *
 * Produces a fully de-identified, respectfully-framed view-model for the
 * casualty-statistics widget. It composes: the aggregate funnel (`aggregate.ts`,
 * fail-closed), the rollups (`rollups.ts`), always-on attribution
 * (`attribution.ts`), respectful framing (`ethics-gate.ts`), and any active
 * take-down suppression. The output object contains NO per-person field by
 * construction — it is built only from `PublicAggregate` rollups.
 */

import type { CasualtyAggregate, CasualtySource, LocalizedText, TakedownSuppression } from "./types";
import { toPublicAggregates } from "./aggregate";
import { rollupByRegion, rollupByPeriod, totalsBySide, grandTotal, type RegionRollup, type PeriodRollup, type SideTotals } from "./rollups";
import { attributionBlock } from "./attribution";
import { RESPECTFUL_FRAMING } from "./ethics-gate";

export interface CasualtyWidgetModel {
  locale: "uk" | "en";
  /** Respectful header text (dignity, aggregate-only, verification caveats). */
  framing: { dignity: string; aggregateOnly: string; verify: string };
  headline: string;
  grandTotal: number;
  byRegion: RegionRollup[];
  byPeriod: PeriodRollup[];
  bySide: SideTotals[];
  attribution: { sources: ReturnType<typeof attributionBlock>["sources"]; footer: LocalizedText };
  /** Audit counters (shown to operators, not the public). */
  audit: { blockedCount: number; suppressedCount: number };
  generatedAt: string;
}

export interface BuildWidgetOptions {
  locale?: "uk" | "en";
  suppression?: TakedownSuppression;
}

export function buildCasualtyWidget(
  records: CasualtyAggregate[],
  opts: BuildWidgetOptions = {},
): CasualtyWidgetModel {
  const locale = opts.locale ?? "uk";
  const { aggregates, blockedCount, suppressedCount } = toPublicAggregates(records, opts.suppression);

  const byRegion = rollupByRegion(aggregates);
  const byPeriod = rollupByPeriod(aggregates);
  const bySide = totalsBySide(aggregates);
  const total = grandTotal(aggregates);

  const usedSources = [...new Set(aggregates.map((a) => a.source))] as CasualtySource[];
  const attribution = attributionBlock(usedSources);

  const headline =
    locale === "uk"
      ? `Зведені дані про втрати за ${byRegion.length} регіонами та ${byPeriod.length} періодами.`
      : `Aggregate casualty figures across ${byRegion.length} regions and ${byPeriod.length} periods.`;

  return {
    locale,
    framing: RESPECTFUL_FRAMING[locale],
    headline,
    grandTotal: total,
    byRegion,
    byPeriod,
    bySide,
    attribution,
    audit: { blockedCount, suppressedCount },
    generatedAt: new Date().toISOString(),
  };
}
