import "server-only";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DeprecationNotice = {
  /** Endpoint path or pattern being deprecated, e.g. "/api/v1/events" */
  endpoint: string;
  /** ISO-8601 date when the endpoint will be shut down */
  sunsetDate: string;
  /** URL to the migration guide page */
  migrationGuideUrl: string;
};

export type NotificationCheckResult = {
  shouldNotify: boolean;
  daysRemaining: number;
};

// ── Configuration ─────────────────────────────────────────────────────────────

/**
 * Number of days before sunset at which customer notifications are sent.
 * Matches the policy in docs/api/breaking-change-policy.md.
 */
export const NOTIFICATION_CADENCE_DAYS: ReadonlyArray<number> = [60, 30, 7] as const;

/**
 * Registry of endpoints scheduled for deprecation.
 *
 * HOW TO ADD AN ENTRY:
 * 1. Add a DeprecationNotice object to this array.
 * 2. Set `sunsetDate` to a date at least 12 months from announcement.
 * 3. Ensure a migration guide exists at `migrationGuideUrl`.
 * 4. Deploy — the notification cron job (Sprint 2) will handle emails automatically.
 *
 * Example entry (commented out — no live deprecations yet):
 *
 * {
 *   endpoint: "/api/v1/events",
 *   sunsetDate: "2027-06-10",
 *   migrationGuideUrl: "https://docs.aegislens.io/api/v2-migration",
 * },
 */
export const DEPRECATION_REGISTRY: DeprecationNotice[] = [
  // Add deprecation entries here when scheduling endpoint removals
];

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Return all registered deprecation notices.
 * Sprint 2: swap static array for DB-backed query.
 */
export function getDeprecationNotices(): DeprecationNotice[] {
  return DEPRECATION_REGISTRY;
}

/**
 * Determine whether a notification should be sent today for a given sunset date.
 *
 * Returns `shouldNotify: true` when `today` falls within ±1 day of a
 * configured cadence point (60d / 30d / 7d before sunset).
 *
 * @param sunsetDate  — ISO-8601 date string, e.g. "2027-06-10"
 * @param today       — ISO-8601 date string, defaults to current UTC date
 */
export function shouldNotifyToday(
  sunsetDate: string,
  today: string = new Date().toISOString().slice(0, 10),
): NotificationCheckResult {
  const sunsetMs = new Date(sunsetDate).getTime();
  const todayMs = new Date(today).getTime();

  const msPerDay = 24 * 60 * 60 * 1_000;
  const daysRemaining = Math.round((sunsetMs - todayMs) / msPerDay);

  // Check if today is within ±1 day of any cadence point
  const shouldNotify = NOTIFICATION_CADENCE_DAYS.some(
    (cadenceDays) => Math.abs(daysRemaining - cadenceDays) <= 1,
  );

  return { shouldNotify, daysRemaining };
}

/**
 * Return all notices that should trigger a customer notification today.
 *
 * @param today — ISO-8601 date string (injectable for testing)
 */
export function getDueNotifications(
  today: string = new Date().toISOString().slice(0, 10),
): Array<DeprecationNotice & { daysRemaining: number }> {
  return DEPRECATION_REGISTRY.flatMap((notice) => {
    const { shouldNotify, daysRemaining } = shouldNotifyToday(notice.sunsetDate, today);
    return shouldNotify ? [{ ...notice, daysRemaining }] : [];
  });
}
