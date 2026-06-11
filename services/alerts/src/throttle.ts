/**
 * In-memory throttle + dedup store for alert delivery.
 * In production: replace with Redis INCR/EX + SET NX.
 */

export interface ThrottleStore {
  /** Returns true if the alert should be sent (not throttled / deduped). Marks it. */
  shouldSend(ruleId: string, eventId: string, dedupWindowS: number, maxPerHour: number): Promise<{
    send: boolean;
    reason?: "dedup" | "throttle" | "quiet_hours";
  }>;
}

export class InMemoryThrottleStore implements ThrottleStore {
  /** ruleId:eventId → expiry timestamp */
  private readonly dedupKeys = new Map<string, number>();
  /** ruleId → [timestamps of deliveries in last hour] */
  private readonly rateCounters = new Map<string, number[]>();

  async shouldSend(
    ruleId: string,
    eventId: string,
    dedupWindowS: number,
    maxPerHour: number,
  ): Promise<{ send: boolean; reason?: "dedup" | "throttle" }> {
    const now = Date.now();

    // Dedup check
    const dedupKey = `${ruleId}:${eventId}`;
    const dedupExpiry = this.dedupKeys.get(dedupKey);
    if (dedupExpiry && now < dedupExpiry) {
      return { send: false, reason: "dedup" };
    }

    // Rate check
    const timestamps = (this.rateCounters.get(ruleId) ?? []).filter(
      (ts) => now - ts < 3_600_000,
    );
    if (timestamps.length >= maxPerHour) {
      return { send: false, reason: "throttle" };
    }

    // Mark
    this.dedupKeys.set(dedupKey, now + dedupWindowS * 1000);
    timestamps.push(now);
    this.rateCounters.set(ruleId, timestamps);

    return { send: true };
  }
}

/**
 * Check if current time falls within quiet hours.
 * @param quietHours "22:00-07:00" format (HH:MM-HH:MM), in UTC for now.
 */
export function isInQuietHours(quietHours: string | undefined): boolean {
  if (!quietHours) return false;
  const [startStr, endStr] = quietHours.split("-");
  if (!startStr || !endStr) return false;

  const now = new Date();
  const nowMins = now.getUTCHours() * 60 + now.getUTCMinutes();

  const toMins = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };

  const start = toMins(startStr);
  const end = toMins(endStr);

  // Handle overnight quiet hours (e.g. 22:00-07:00)
  if (start > end) return nowMins >= start || nowMins < end;
  return nowMins >= start && nowMins < end;
}
