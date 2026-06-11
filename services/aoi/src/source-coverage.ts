/**
 * Source-coverage detection per AOI.
 *
 * Computes which intelligence sources are actively mentioning an AOI and how
 * comprehensive their coverage is.  A higher score means the source is
 * reporting more events inside this area.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes */
export const SOURCE_COVERAGE_NOTES_EN = [
  "higher-is-better-coverage: coverageScore 0–1 where 1 = most active source for this AOI; used to surface under-reported zones",
  "used-for-source-health-per-AOI: compare per-AOI coverage scores to detect source bias, lag, or blind-spots",
] as const;

/** UA операційні примітки */
export const SOURCE_COVERAGE_NOTES_UK = [
  "higher-is-better-coverage: coverageScore 0–1, де 1 = найактивніше джерело для цього AOI; використовується для виявлення мало висвітлених зон",
  "used-for-source-health-per-AOI: порівнюйте оцінки покриття по AOI для виявлення упередженості, затримок або сліпих зон джерела",
] as const;

// ---------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------->

/** Coverage contribution from one source for a specific AOI */
export interface SourceCoverageResult {
  aoiId: string;
  sourceId: string;
  sourceName: string;
  /** Number of events from this source that overlap the AOI */
  eventCount: number;
  /** ISO-8601 timestamp of the most recent event from this source in the AOI */
  latestEventAt: string;
  /** Normalised coverage score 0–1 (proportion of total AOI events from this source) */
  coverageScore: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute per-source coverage scores for a given AOI.
 *
 * @param aoiId — the AOI being analysed
 * @param sourceCounts — raw counts pre-aggregated by the event store
 *   (one entry per source that has events overlapping the AOI)
 * @returns sorted descending by coverageScore
 */
export function computeSourceCoverage(
  aoiId: string,
  sourceCounts: {
    sourceId: string;
    sourceName: string;
    count: number;
    latestAt: string;
  }[],
): SourceCoverageResult[] {
  if (sourceCounts.length === 0) return [];

  const totalEvents = sourceCounts.reduce((sum, s) => sum + s.count, 0);

  const results: SourceCoverageResult[] = sourceCounts.map((s) => ({
    aoiId,
    sourceId: s.sourceId,
    sourceName: s.sourceName,
    eventCount: s.count,
    latestEventAt: s.latestAt,
    coverageScore: totalEvents > 0 ? Math.round((s.count / totalEvents) * 1000) / 1000 : 0,
  }));

  // Sort by coverage score descending, then by latestEventAt descending
  results.sort((a, b) => {
    if (b.coverageScore !== a.coverageScore) return b.coverageScore - a.coverageScore;
    return b.latestEventAt.localeCompare(a.latestEventAt);
  });

  return results;
}
