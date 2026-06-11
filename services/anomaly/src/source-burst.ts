/**
 * Source-burst detection.
 *
 * Detects when a single channel suddenly dominates a topic —
 * a potential indicator of coordinated infoops or technical issue.
 *
 * Approach: compute source diversity (HHI) over a rolling window.
 * Low diversity + high volume → flagged.
 */

export interface SourceContribution {
  source_id: string;
  count: number;
}

export interface BurstResult {
  isBurst: boolean;
  /** Herfindahl–Hirschman Index: 0 (max diversity) to 1 (monopoly) */
  hhi: number;
  /** The dominant source (by count) */
  dominantSource: string;
  /** Share of the dominant source (0-1) */
  dominantShare: number;
  /** Total event count in the window */
  totalCount: number;
}

/**
 * Compute HHI for source distribution.
 * HHI > 0.5 with volume > minCount triggers a burst flag.
 */
export function detectSourceBurst(
  contributions: SourceContribution[],
  minCount = 10,
  hhiThreshold = 0.5,
): BurstResult {
  const totalCount = contributions.reduce((s, c) => s + c.count, 0);

  if (totalCount < minCount) {
    return {
      isBurst: false,
      hhi: 0,
      dominantSource: "",
      dominantShare: 0,
      totalCount,
    };
  }

  const hhi = contributions.reduce((s, c) => {
    const share = c.count / totalCount;
    return s + share * share;
  }, 0);

  const dominant = contributions.reduce((best, c) => (c.count > best.count ? c : best), {
    source_id: "",
    count: 0,
  });

  const dominantShare = totalCount > 0 ? dominant.count / totalCount : 0;

  return {
    isBurst: hhi > hhiThreshold,
    hhi,
    dominantSource: dominant.source_id,
    dominantShare,
    totalCount,
  };
}

// ── Rolling source tracker ────────────────────────────────────────────────────

export class SourceDiversityTracker {
  /** topic → source → count (sliding window entries) */
  private readonly windows = new Map<
    string,
    { entries: { source_id: string; timestampMs: number }[] }
  >();

  constructor(private readonly windowMs = 3_600_000) {} // 1 hour default

  record(topic: string, source_id: string, timestampMs = Date.now()): void {
    if (!this.windows.has(topic)) {
      this.windows.set(topic, { entries: [] });
    }
    const w = this.windows.get(topic)!;
    w.entries.push({ source_id, timestampMs });
    // Evict old entries
    const cutoff = timestampMs - this.windowMs;
    w.entries = w.entries.filter((e) => e.timestampMs > cutoff);
  }

  analyze(topic: string, minCount = 10, hhiThreshold = 0.5): BurstResult {
    const w = this.windows.get(topic);
    if (!w) {
      return { isBurst: false, hhi: 0, dominantSource: "", dominantShare: 0, totalCount: 0 };
    }

    const counts = new Map<string, number>();
    for (const e of w.entries) {
      counts.set(e.source_id, (counts.get(e.source_id) ?? 0) + 1);
    }

    const contributions: SourceContribution[] = [...counts.entries()].map(
      ([source_id, count]) => ({ source_id, count }),
    );

    return detectSourceBurst(contributions, minCount, hhiThreshold);
  }

  allTopics(): string[] {
    return [...this.windows.keys()];
  }
}
