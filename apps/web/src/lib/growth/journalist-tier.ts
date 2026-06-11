/**
 * Journalist Tier — free verified-press credential tier for media professionals.
 *
 * Journalists gain full read access (equivalent to Pro) in exchange for
 * verified press credentials. Drives organic citation & media coverage.
 *
 * Безкоштовний рівень для журналістів з підтвердженням прес-посвідчення.
 */

// ── Verification methods ──────────────────────────────────────────────────────

export type JournalistVerificationMethod =
  | "press-card"        // physical or digital press card
  | "newsroom-email"    // corporate email matching known newsroom domain
  | "IFCN-badge"        // IFCN-certified fact-checker badge
  | "application";      // manual editorial review application

// ── Config ────────────────────────────────────────────────────────────────────

export interface JournalistTierConfig {
  /** Allowed verification methods. / Дозволені методи верифікації. */
  verificationMethods: JournalistVerificationMethod[];
  /** Days before re-verification is required. / Днів до повторної верифікації. */
  reVerifyDays: number;
  /** Whether newsroom-email auto-approves without review. / Авто-апрув по email. */
  autoApproveNewsroomEmail: boolean;
  /** Domains whose email suffix auto-qualifies (e.g. ".bbc.co.uk"). */
  trustedNewsroomDomains: string[];
}

// ── Benefits ──────────────────────────────────────────────────────────────────

/**
 * Benefits granted to verified journalists.
 *
 * Переваги верифікованого журналіста.
 */
export const JOURNALIST_TIER_BENEFITS: readonly string[] = [
  "Full Pro-tier API access (rate-limited to 10k calls/day)",
  "Priority data export (CSV / GeoJSON) with attribution waiver",
  "Direct analyst contact for fact-check requests",
  "Press embed kit with hotlinkable charts and no attribution bar",
  "Advance access to quarterly reports 48 h before public release",
] as const;

// ── Journalist record ─────────────────────────────────────────────────────────

export interface JournalistRecord {
  userId: string;
  verificationMethod: JournalistVerificationMethod;
  outlet: string;
  verifiedAt: string;
  expiresAt: string;
  approved: boolean;
  notes?: string;
}

// ── JournalistTierStore ───────────────────────────────────────────────────────

export class JournalistTierStore {
  private readonly records = new Map<string, JournalistRecord>();

  private readonly config: JournalistTierConfig = {
    verificationMethods: [
      "press-card",
      "newsroom-email",
      "IFCN-badge",
      "application",
    ],
    reVerifyDays: 365,
    autoApproveNewsroomEmail: true,
    trustedNewsroomDomains: [
      ".bbc.co.uk",
      ".reuters.com",
      ".ap.org",
      ".theguardian.com",
      ".ft.com",
    ],
  };

  getConfig(): Readonly<JournalistTierConfig> {
    return this.config;
  }

  /**
   * Register or update a journalist record.
   *
   * Реєструє або оновлює запис журналіста.
   */
  upsert(record: JournalistRecord): void {
    this.records.set(record.userId, record);
  }

  /**
   * Get a journalist record by user ID.
   *
   * Повертає запис журналіста за ID користувача.
   */
  get(userId: string): JournalistRecord | undefined {
    return this.records.get(userId);
  }

  /**
   * Check whether a user has an active (non-expired, approved) journalist tier.
   *
   * Перевіряє чи активний журналістський доступ.
   */
  isActive(userId: string): boolean {
    const rec = this.records.get(userId);
    if (!rec || !rec.approved) return false;
    return new Date(rec.expiresAt) > new Date();
  }

  /**
   * List all approved journalist users.
   *
   * Повертає список усіх верифікованих журналістів.
   */
  listApproved(): JournalistRecord[] {
    return Array.from(this.records.values()).filter(
      (r) => r.approved && new Date(r.expiresAt) > new Date(),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global journalist tier store. */
export const journalistTierStore = new JournalistTierStore();
