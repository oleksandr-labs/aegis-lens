/**
 * Traveler consent and data retention management.
 *
 * All location tracking and alert features require explicit per-traveler
 * consent.  Consent is granular (one record per consent type) and fully
 * revocable at any time.
 *
 * Data retention is enforced by the autoDeleteAt field; a scheduled job
 * should delete traveler data once this timestamp has passed.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN compliance notes */
export const CONSENT_NOTES_EN = [
  "explicit-consent-required: no location data is collected, processed, or shared until the traveler has granted the relevant consent type",
  "GDPR-Art-6: lawful basis is explicit consent per Art. 6(1)(a) GDPR; record ipAtGrant and grantedAt for audit trail",
  "auto-delete-after-retention: a background job must hard-delete all traveler data (location, alerts, reports) once autoDeleteAt is reached; default retention is 90 days",
] as const;

/** UA нотатки з відповідності */
export const CONSENT_NOTES_UK = [
  "explicit-consent-required: жодні дані про місцезнаходження не збираються, не обробляються і не передаються до того, як мандрівник надасть відповідний тип згоди",
  "GDPR-Art-6: правова підстава — явна згода відповідно до Статті 6(1)(a) GDPR; записуйте ipAtGrant і grantedAt для аудиторського сліду",
  "auto-delete-after-retention: фоновий процес повинен жорстко видаляти всі дані мандрівника (місцезнаходження, сповіщення, звіти) після досягнення autoDeleteAt; стандартне зберігання — 90 днів",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** What the traveler is consenting to */
export type ConsentType = "location_tracking" | "push_alerts" | "corporate_dashboard";

/** A single granular consent record */
export interface TravelerConsent {
  userId: string;
  orgId: string;
  consentType: ConsentType;
  granted: boolean;
  /** ISO-8601 timestamp when consent was granted */
  grantedAt?: string;
  /** ISO-8601 timestamp when consent was revoked */
  revokedAt?: string;
  /** IP address at time of grant (for GDPR audit trail) */
  ipAtGrant?: string;
}

/** Data retention policy for one traveler */
export interface TravelerDataRetention {
  userId: string;
  /** Number of days to retain traveler data after last activity */
  retentionDays: number;
  /** ISO-8601 auto-delete timestamp (set when retention policy is created or updated) */
  autoDeleteAt?: string;
}

/** Default retention period in days */
export const DEFAULT_RETENTION_DAYS = 90;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

type ConsentKey = `${string}:${ConsentType}`;

/**
 * In-memory consent store.
 *
 * Production: persist in the database with a unique index on (user_id, consent_type);
 * ensure writes are atomic to avoid double-grant races.
 */
export class ConsentStore {
  private readonly consents = new Map<ConsentKey, TravelerConsent>();
  private readonly retentions = new Map<string, TravelerDataRetention>();

  private key(userId: string, consentType: ConsentType): ConsentKey {
    return `${userId}:${consentType}`;
  }

  /** Record a consent grant */
  grant(consent: TravelerConsent): void {
    const key = this.key(consent.userId, consent.consentType);
    this.consents.set(key, {
      ...consent,
      granted: true,
      grantedAt: consent.grantedAt ?? new Date().toISOString(),
      revokedAt: undefined,
    });
  }

  /** Revoke a consent type for a user */
  revoke(userId: string, consentType: ConsentType, ipAtRevoke?: string): void {
    const key = this.key(userId, consentType);
    const existing = this.consents.get(key);
    if (!existing) return;
    this.consents.set(key, {
      ...existing,
      granted: false,
      revokedAt: new Date().toISOString(),
      // ipAtRevoke not in interface but stored via metadata in production
    });
    void ipAtRevoke; // acknowledged
  }

  /** Check whether a user has an active (granted) consent for a type */
  check(userId: string, consentType: ConsentType): boolean {
    const record = this.consents.get(this.key(userId, consentType));
    return record?.granted === true;
  }

  /** Get the full consent record, if any */
  get(userId: string, consentType: ConsentType): TravelerConsent | undefined {
    return this.consents.get(this.key(userId, consentType));
  }

  /**
   * Build and store a retention policy for a traveler.
   * autoDeleteAt is set to now + retentionDays.
   */
  buildRetentionPolicy(userId: string, retentionDays = DEFAULT_RETENTION_DAYS): TravelerDataRetention {
    const deleteAt = new Date(Date.now() + retentionDays * 86_400_000);
    const policy: TravelerDataRetention = {
      userId,
      retentionDays,
      autoDeleteAt: deleteAt.toISOString(),
    };
    this.retentions.set(userId, policy);
    return policy;
  }

  /** Get the retention policy for a user */
  getRetentionPolicy(userId: string): TravelerDataRetention | undefined {
    return this.retentions.get(userId);
  }

  /** List all users whose autoDeleteAt has passed (for the deletion job) */
  expiredRetentions(nowIso = new Date().toISOString()): TravelerDataRetention[] {
    return [...this.retentions.values()].filter(
      (r) => r.autoDeleteAt !== undefined && r.autoDeleteAt <= nowIso,
    );
  }
}

/** Module-level singleton */
export const consentStore = new ConsentStore();
