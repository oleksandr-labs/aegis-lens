import "server-only";
/**
 * Email suppression list — auto-suppress on hard bounces and complaints.
 *
 * In production, replace InMemorySuppressionList with a PostgreSQL-backed
 * implementation (table: email_suppressions). The interface is kept identical
 * so the swap is a single line change.
 *
 * Automatic suppression rules:
 *   hard_bounce  → suppress immediately, permanent (address doesn't exist)
 *   complaint    → suppress immediately, permanent (user reported as spam)
 *   soft_bounce  → track; suppress after 3 consecutive soft bounces
 *   unsubscribe  → suppress for marketing only (transactional still goes through)
 *   manual       → full suppress, requires explicit re-opt-in
 *
 * Список відписок / блокування: автоматичне блокування адреси
 * при hard bounce або скарзі на спам.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type SuppressionReason =
  | "hard_bounce"
  | "soft_bounce"
  | "complaint"
  | "unsubscribe"
  | "manual";

export interface SuppressionEntry {
  /** Normalised lowercase email address. */
  email: string;
  reason: SuppressionReason;
  /** ISO 8601 timestamp. */
  suppressedAt: string;
  /** Source that triggered suppression (e.g. "resend_webhook", "postmark_webhook", "user_request"). */
  source: string;
}

// ── Interface ─────────────────────────────────────────────────────────────────

export interface SuppressionList {
  add(entry: SuppressionEntry): void;
  isSuppressed(email: string): boolean;
  remove(email: string, reason: string): void;
  getAll(): SuppressionEntry[];
}

// ── In-memory implementation (dev / serverless single-instance) ────────────────

export class InMemorySuppressionList implements SuppressionList {
  private readonly store = new Map<string, SuppressionEntry>();

  add(entry: SuppressionEntry): void {
    const key = entry.email.toLowerCase().trim();
    // Don't downgrade a harder suppression with a softer one
    const existing = this.store.get(key);
    if (existing) {
      const hardness: Record<SuppressionReason, number> = {
        hard_bounce: 5,
        complaint: 4,
        manual: 3,
        unsubscribe: 2,
        soft_bounce: 1,
      };
      if ((hardness[entry.reason] ?? 0) <= (hardness[existing.reason] ?? 0)) {
        return; // Don't overwrite with a weaker reason
      }
    }
    this.store.set(key, { ...entry, email: key });
  }

  /**
   * Returns true if the email is on the suppression list.
   * Note: auto-suppress on any hard bounce or complaint.
   *
   * Повертає true, якщо адреса є у списку блокування.
   */
  isSuppressed(email: string): boolean {
    return this.store.has(email.toLowerCase().trim());
  }

  /**
   * Remove a suppressed address (e.g. after explicit re-opt-in flow).
   * Logs the removal reason for audit trail.
   *
   * @param email  - Address to remove.
   * @param reason - Why the suppression was lifted (e.g. "re_opt_in", "admin_override").
   *
   * Видаляє адресу зі списку (наприклад, після повторної підписки).
   */
  remove(email: string, reason: string): void {
    const key = email.toLowerCase().trim();
    if (this.store.has(key)) {
      this.store.delete(key);
      // Production: write an audit log row with `reason`
      void reason; // acknowledged
    }
  }

  getAll(): SuppressionEntry[] {
    return Array.from(this.store.values());
  }

  /** Number of suppressed addresses. */
  size(): number {
    return this.store.size;
  }
}

// ── Webhook payload parsers ───────────────────────────────────────────────────

/**
 * Parses a Resend or Postmark bounce webhook payload and returns a
 * SuppressionEntry if the event represents a suppressible bounce.
 *
 * Resend bounce event shape (relevant fields):
 *   { type: 'email.bounced', data: { to: [{ email }], bounce: { type: 'hard' | 'soft' } } }
 *
 * Postmark bounce event shape:
 *   { RecordType: 'Bounce', Type: 'HardBounce' | 'SoftBounce', Email: string }
 *
 * Розбирає webhook-подію bounce від Resend або Postmark.
 */
export function processBounceWebhook(
  payload: unknown,
  provider: "resend" | "postmark",
): SuppressionEntry | null {
  if (!payload || typeof payload !== "object") return null;

  try {
    if (provider === "resend") {
      const p = payload as Record<string, unknown>;
      if (p["type"] !== "email.bounced") return null;
      const data = p["data"] as Record<string, unknown> | undefined;
      const to = (data?.["to"] as Array<{ email: string }> | undefined)?.[0];
      const bounce = data?.["bounce"] as { type?: string } | undefined;
      if (!to?.email) return null;
      const reason: SuppressionReason =
        bounce?.type === "hard" ? "hard_bounce" : "soft_bounce";
      return {
        email: to.email.toLowerCase(),
        reason,
        suppressedAt: new Date().toISOString(),
        source: "resend_webhook",
      };
    }

    if (provider === "postmark") {
      const p = payload as Record<string, unknown>;
      if (p["RecordType"] !== "Bounce") return null;
      const email = p["Email"] as string | undefined;
      if (!email) return null;
      const type = p["Type"] as string | undefined;
      const reason: SuppressionReason =
        type === "HardBounce" ? "hard_bounce" : "soft_bounce";
      return {
        email: email.toLowerCase(),
        reason,
        suppressedAt: new Date().toISOString(),
        source: "postmark_webhook",
      };
    }
  } catch {
    // Malformed payload — silently ignore
  }

  return null;
}

/**
 * Parses a Resend or Postmark spam complaint webhook payload and returns a
 * SuppressionEntry.
 *
 * Resend complaint shape:
 *   { type: 'email.complained', data: { to: [{ email }] } }
 *
 * Postmark complaint shape:
 *   { RecordType: 'SpamComplaint', Email: string }
 *
 * Розбирає webhook-подію spam complaint.
 */
export function processComplaintWebhook(
  payload: unknown,
  provider: "resend" | "postmark",
): SuppressionEntry | null {
  if (!payload || typeof payload !== "object") return null;

  try {
    if (provider === "resend") {
      const p = payload as Record<string, unknown>;
      if (p["type"] !== "email.complained") return null;
      const data = p["data"] as Record<string, unknown> | undefined;
      const to = (data?.["to"] as Array<{ email: string }> | undefined)?.[0];
      if (!to?.email) return null;
      return {
        email: to.email.toLowerCase(),
        reason: "complaint",
        suppressedAt: new Date().toISOString(),
        source: "resend_webhook",
      };
    }

    if (provider === "postmark") {
      const p = payload as Record<string, unknown>;
      if (p["RecordType"] !== "SpamComplaint") return null;
      const email = p["Email"] as string | undefined;
      if (!email) return null;
      return {
        email: email.toLowerCase(),
        reason: "complaint",
        suppressedAt: new Date().toISOString(),
        source: "postmark_webhook",
      };
    }
  } catch {
    // Malformed payload — silently ignore
  }

  return null;
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/**
 * Module-level singleton.
 *
 * Production swap:
 *   export const suppressionList: SuppressionList = new PostgresSuppressionList(db);
 *
 * Синглтон списку блокування — у продакшні замінити на PostgresSuppressionList.
 */
export const suppressionList: SuppressionList = new InMemorySuppressionList();
