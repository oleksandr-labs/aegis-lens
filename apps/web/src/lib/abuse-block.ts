import "server-only";

// ── Enum ─────────────────────────────────────────────────────────────────────

export enum AbuseSignal {
  HIGH_RATE            = "HIGH_RATE",
  SCRAPING_PATTERN     = "SCRAPING_PATTERN",
  CREDENTIAL_STUFFING  = "CREDENTIAL_STUFFING",
  MASS_EXPORT          = "MASS_EXPORT",
  AUTOMATED_AI_ABUSE   = "AUTOMATED_AI_ABUSE",
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AbuseBlock = {
  orgId: string;
  ip?: string;
  signal: AbuseSignal;
  /** ISO-8601 */
  blockedAt: string;
  /** ISO-8601 */
  unblockAt: string;
  notified: boolean;
};

// ── Block durations (ms) — graduated by severity ──────────────────────────────

export const BLOCK_DURATIONS: Record<AbuseSignal, number> = {
  [AbuseSignal.HIGH_RATE]:           5 * 60 * 1_000,         // 5 minutes
  [AbuseSignal.SCRAPING_PATTERN]:    30 * 60 * 1_000,        // 30 minutes
  [AbuseSignal.MASS_EXPORT]:         2 * 60 * 60 * 1_000,    // 2 hours
  [AbuseSignal.AUTOMATED_AI_ABUSE]:  6 * 60 * 60 * 1_000,    // 6 hours
  [AbuseSignal.CREDENTIAL_STUFFING]: 24 * 60 * 60 * 1_000,   // 24 hours
};

// ── In-memory store ───────────────────────────────────────────────────────────

/** Keyed by orgId or "ip:<address>" for anonymous IPs */
const abuseStore = new Map<string, AbuseBlock>();

function storeKey(orgId?: string, ip?: string): string {
  if (orgId) return orgId;
  if (ip) return `ip:${ip}`;
  return "unknown";
}

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Record an abuse signal and create (or extend) a block.
 * If a more severe block already exists it is left in place.
 */
export function recordAbuseSignal(
  target: { orgId?: string; ip?: string },
  signal: AbuseSignal,
): AbuseBlock {
  const key = storeKey(target.orgId, target.ip);
  const now = Date.now();
  const duration = BLOCK_DURATIONS[signal];
  const unblockAt = new Date(now + duration).toISOString();

  const existing = abuseStore.get(key);
  // Keep whichever unblockAt is later (more severe)
  if (existing && new Date(existing.unblockAt).getTime() >= now + duration) {
    return existing;
  }

  const block: AbuseBlock = {
    orgId: target.orgId ?? key,
    ip: target.ip,
    signal,
    blockedAt: new Date(now).toISOString(),
    unblockAt,
    notified: false,
  };

  abuseStore.set(key, block);

  // Fire-and-forget notification (no await — keep callers synchronous)
  notifyAbuse(block).then(() => {
    const updated = abuseStore.get(key);
    if (updated) abuseStore.set(key, { ...updated, notified: true });
  }).catch(() => {
    // Notification failures are non-fatal
  });

  return block;
}

/**
 * Check if an org / IP is currently blocked.
 * Returns the AbuseBlock if active, null otherwise.
 */
export function isBlocked(orgId: string, ip?: string): AbuseBlock | null {
  const now = Date.now();

  // Check orgId block
  const byOrg = abuseStore.get(orgId);
  if (byOrg && new Date(byOrg.unblockAt).getTime() > now) return byOrg;
  if (byOrg) abuseStore.delete(orgId); // Expired — clean up

  // Check IP block
  if (ip) {
    const ipKey = `ip:${ip}`;
    const byIp = abuseStore.get(ipKey);
    if (byIp && new Date(byIp.unblockAt).getTime() > now) return byIp;
    if (byIp) abuseStore.delete(ipKey);
  }

  return null;
}

/**
 * Manually unblock an org (e.g. after customer support review).
 */
export function unblock(orgId: string): void {
  abuseStore.delete(orgId);
}

/**
 * Queue an email / webhook notification that a block was applied.
 * No-op when email config is absent (EMAIL_FROM / SMTP_HOST not set).
 *
 * Sprint 2: replace stub with actual email sender (Resend / nodemailer).
 */
export async function notifyAbuse(block: AbuseBlock): Promise<void> {
  const emailFrom = process.env.EMAIL_FROM;
  const smtpHost = process.env.SMTP_HOST;

  if (!emailFrom || !smtpHost) {
    // Email not configured — log only
    console.warn(
      `[abuse-block] Block applied — no email config. orgId=${block.orgId} signal=${block.signal} until=${block.unblockAt}`,
    );
    return;
  }

  // Sprint 2: send actual email via configured transport
  // Example payload to pass to an email service:
  const _payload = {
    to: `${block.orgId}@customers.aegislens.io`, // placeholder — real lookup from org DB
    from: emailFrom,
    subject: `Aegis Lens: Temporary access restriction — ${block.signal}`,
    body: [
      `Your access has been temporarily restricted due to detected abuse: ${block.signal}.`,
      `Block expires at: ${block.unblockAt}.`,
      `If you believe this is a mistake, contact support@aegislens.io.`,
      `---`,
      `Ваш доступ тимчасово обмежено через виявлену аномальну активність: ${block.signal}.`,
      `Обмеження знімається: ${block.unblockAt}.`,
    ].join("\n"),
  };

  // No-op: email transport not yet wired
  console.info(`[abuse-block] Notification queued for orgId=${block.orgId}`);
}
