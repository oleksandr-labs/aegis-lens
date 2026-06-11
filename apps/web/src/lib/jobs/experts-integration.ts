/**
 * Experts Directory Integration — match experts to job postings.
 *
 * The job board is built atop the experts directory. When a job is posted,
 * we surface relevant opt-in expert profiles as potential candidates.
 * This module provides the matching stub and data types.
 *
 * Інтеграція з директорієм експертів: підбір кандидатів для вакансій.
 */

// ── Notes ──────────────────────────────────────────────────────────────────────

/**
 * Integration note — English.
 * Expert profiles from the directory are surfaced as candidate matches when a
 * job is posted. Matching is based on skills, verified certifications, and
 * region tags. Only opt-in profiles are matched. Employers see a anonymised
 * summary until they unlock the contact via Talent Search subscription.
 */
export const EXPERTS_INTEGRATION_NOTE_EN =
  "Job postings are automatically matched against opt-in expert profiles " +
  "from the Aegis Lens Experts Directory. " +
  "Matches are ranked by skill overlap, Academy certification badges, and region. " +
  "Full contact details require an active Talent Search subscription ($499/mo) " +
  "or an Annual Employer plan.";

/**
 * Integration note — Ukrainian.
 * Вакансії автоматично зіставляються з профілями експертів з директорію.
 * Ранжування за навичками, бейджами Academy та регіоном.
 * Повні контактні дані — за підпискою Talent Search ($499/міс) або річним планом роботодавця.
 */
export const EXPERTS_INTEGRATION_NOTE_UK =
  "Вакансії автоматично зіставляються з профілями експертів у директорії Aegis Lens. " +
  "Ранжування за збігом навичок, бейджами Academy та регіоном. " +
  "Повні контактні дані доступні за підпискою Talent Search ($499/міс) " +
  "або річним планом роботодавця.";

// ── ExpertJobMatch ─────────────────────────────────────────────────────────────

export interface ExpertJobMatch {
  /** Job posting ID */
  jobId: string;
  /** Expert profile ID from the directory */
  expertId: string;
  /**
   * Match score 0–1.
   * 1.0 = perfect skill + region + certification overlap.
   * Оцінка збігу 0–1.
   */
  score: number;
  /** Skills from the expert profile that overlap with the job requirements */
  matchedSkills: string[];
  /** Whether the expert holds a relevant Academy certification */
  hasCertification: boolean;
  /** Expert's location tag, e.g. "UA", "PL", "Remote" */
  regionTag: string;
  /**
   * If false, the employer must upgrade to Talent Search to see contact details.
   * false = роботодавець бачить тільки анонімний профіль без контактів.
   */
  contactUnlocked: boolean;
}

// ── matchExpertsToJob ──────────────────────────────────────────────────────────

/**
 * Return a ranked list of expert matches for the given job posting.
 *
 * Stub: in production, query the experts directory with skill+region filters
 * and run the scoring model. Results are cached per jobId for 1 hour.
 *
 * Заглушка: повертає порожній масив. У продакшн — запит до директорію + ранжування.
 */
export function matchExpertsToJob(jobId: string): ExpertJobMatch[] {
  // TODO: implement real matching:
  //   1. fetch job requirements from job-board store
  //   2. query expert directory for opt-in profiles with overlapping skills
  //   3. score each candidate (skill jaccard + cert bonus + region weight)
  //   4. return top-N results sorted by score desc
  void jobId; // suppress unused-param lint until implemented
  return [];
}
