/**
 * Cross-reference between curated accounts for a confidence boost.
 *
 * When multiple INDEPENDENT same-camp accounts report the same event, our
 * confidence in that event rises. Critically:
 *
 *   - Opposing sides NEVER corroborate each other (no false equivalence). A
 *     RU-side post and a UA-side post about the same event CONTRAST; they are
 *     surfaced for comparison (see narrative-compare.ts), not merged as
 *     mutual confirmation.
 *   - Corroboration weight is bounded and reputation-weighted, so two low-rep
 *     accounts cannot manufacture high confidence.
 */

import type { ClassifiedPost } from "./types";
import { mayCorroborate } from "./side-label";

export interface CorroborationGroup {
  /** Key the posts were grouped under (e.g. normalized event signature). */
  key: string;
  posts: ClassifiedPost[];
  /** Distinct corroborating accounts on the SAME camp. */
  corroboratingAccounts: string[];
  /** Confidence boost contributed by corroboration, 0–0.3. */
  confidenceBoost: number;
}

const MAX_BOOST = 0.3;

/** Per-additional-source boost, reputation-weighted and bounded. */
function corroborationBoost(posts: ClassifiedPost[]): number {
  const distinct = new Map<string, number>();
  for (const p of posts) {
    distinct.set(p.accountId, Math.max(distinct.get(p.accountId) ?? 0, p.sourceReputation));
  }
  if (distinct.size <= 1) return 0;
  // Sum reputation of corroborating sources beyond the first; diminishing.
  const reps = [...distinct.values()].sort((a, b) => b - a).slice(1);
  const raw = reps.reduce((sum, r) => sum + r * 0.15, 0);
  return Math.min(MAX_BOOST, raw);
}

/**
 * Group posts by an event signature and compute same-camp corroboration.
 * `signature` should map a post to a normalized event key (caller-supplied so
 * this stays embedding/geo-agnostic).
 */
export function crossReference(
  posts: ClassifiedPost[],
  signature: (p: ClassifiedPost) => string,
): CorroborationGroup[] {
  const groups = new Map<string, ClassifiedPost[]>();
  for (const p of posts) {
    const key = signature(p);
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  const result: CorroborationGroup[] = [];
  for (const [key, members] of groups) {
    // Only same-camp members corroborate. Partition by corroboration eligibility.
    const camps = new Map<string, ClassifiedPost[]>();
    for (const m of members) {
      // Camp key: "ru" vs "non-ru" (mayCorroborate boundary).
      const camp = m.side === "ru" ? "ru" : "aligned";
      const arr = camps.get(camp) ?? [];
      arr.push(m);
      camps.set(camp, arr);
    }
    for (const [, campMembers] of camps) {
      // Sanity: every pair in a camp must be allowed to corroborate.
      const ok = campMembers.every((a, i) =>
        campMembers.slice(i + 1).every((b) => mayCorroborate(a.side, b.side)),
      );
      if (!ok) continue;
      result.push({
        key,
        posts: campMembers,
        corroboratingAccounts: [...new Set(campMembers.map((m) => m.accountId))],
        confidenceBoost: corroborationBoost(campMembers),
      });
    }
  }
  return result;
}
