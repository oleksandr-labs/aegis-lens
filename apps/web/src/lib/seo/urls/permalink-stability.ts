/**
 * Permalink Stability — slug-change registry and redirect governance.
 *
 * Core principle: URLs are forever. Every slug change must produce a 301.
 * Deleted entities get 410 Gone. No redirect chains. No /v2/ in user-facing URLs.
 *
 * See TODO/urls_slugs/TODO_permalink_stability.md for the full task backlog.
 *
 * Usage:
 *   permalinkRedirectStore.recordSlugChange({ entityId: "evt-001", oldSlug: "kyiv-attack",
 *     newSlug: "kyiv-attack-june-2024", redirectType: 301, changedAt: new Date().toISOString(),
 *     approvedBy: "editor@aegislens.com" });
 *
 *   const target = permalinkRedirectStore.getRedirectTarget("kyiv-attack");
 *   // → "kyiv-attack-june-2024"
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SlugChangeRecord {
  /** Stable entity identifier — never changes even when the slug does. */
  entityId: string;
  /** The slug that no longer resolves (source of the redirect). */
  oldSlug: string;
  /** The slug the redirect points to. */
  newSlug: string;
  /**
   * 301 Moved Permanently for renamed/moved content.
   * 410 Gone for intentionally deleted content.
   */
  redirectType: 301 | 410;
  /** ISO-8601 timestamp of when the change was approved and recorded. */
  changedAt: string;
  /** Email or username of the content owner who approved the rename. */
  approvedBy: string;
}

// ── Governance rules ──────────────────────────────────────────────────────────

/**
 * Authoritative permalink policy rules.
 * Consumed by CI linting, CMS validation, and the redirect store.
 */
export const PERMALINK_RULES = {
  /** Entity ID is stored as a separate stable field; slug is display-only. */
  entityIdSeparateFromSlug: true,

  /** Every recorded slug change automatically generates a 301 redirect entry. */
  autoRedirectOnSlugChange: true,

  /**
   * Maximum tolerated redirect-chain length.
   * Value of 1 means: old → new (direct). No A → B → C chains.
   * collapseRedirectChain() enforces this at write time.
   */
  maxRedirectChainLength: 1,

  /**
   * Intentionally deleted entities return 410 Gone, not 404 Not Found.
   * This signals to crawlers that the removal is deliberate.
   */
  deletedEntities: "410-not-404" as const,

  /**
   * Archived investigations remain accessible indefinitely.
   * Take-downs are never performed without a published retraction explanation.
   */
  archivedInvestigations: "stay-live" as const,

  /**
   * /v2/ prefixes are forbidden in user-facing URLs.
   * Version segments may only appear in API routes (/api/v2/...).
   */
  noVersionInUserFacingUrls: true,

  /**
   * Slug renames require: content-owner approval + a filed redirect plan.
   * Governance string matches slugRenameGovernance below.
   */
  slugRenameGovernance: "requires-content-owner-approval-plus-redirect-plan" as const,

  /** A broken-link scanner audit runs annually over all published URLs. */
  annualAudit: true,

  /**
   * CMS slug fields validate on save: changing a slug triggers a confirmation
   * dialog and auto-files a redirect record.
   */
  perCmsFieldValidation: true,
} as const;

// ── Policy notes (i18n) ───────────────────────────────────────────────────────

export const PERMALINK_NOTE_EN =
  "A 404 on a previously-ranked URL = lost compounding link equity. Treat permalinks as data.";

export const PERMALINK_NOTE_UK =
  "404 за раніше проіндексованим URL = втрачений накопичений капітал посилань. Ставтесь до permalink як до даних.";

export const SLUG_RENAME_GOVERNANCE_EN =
  "Slug rename requires: (1) content owner approval, (2) redirect plan filed, (3) SEO review.";

export const SLUG_RENAME_GOVERNANCE_UK =
  "Перейменування slug вимагає: (1) схвалення власника контенту, (2) плану переадресації, (3) SEO-огляду.";

// ── Redirect store ────────────────────────────────────────────────────────────

/**
 * In-memory redirect registry.
 *
 * Primary index: oldSlug → SlugChangeRecord (for fast redirect lookups).
 * Secondary index: entityId → SlugChangeRecord[] (full history per entity).
 *
 * Replace with a DB-backed adapter for production use.
 */
export class PermalinkRedirectStore {
  /** oldSlug → most-recent SlugChangeRecord */
  private readonly byOldSlug = new Map<string, SlugChangeRecord>();
  /** entityId → all historical records for that entity */
  private readonly byEntityId = new Map<string, SlugChangeRecord[]>();

  /**
   * Record a slug change and register the corresponding redirect.
   * If the newSlug itself is already a redirect source (i.e. a chain would
   * form), the chain is collapsed: the stored record points directly to the
   * final destination so maxRedirectChainLength is never exceeded.
   */
  recordSlugChange(record: SlugChangeRecord): void {
    // Collapse chains: if newSlug is itself already an old slug, follow it.
    const finalSlug = this.collapseRedirectChain(record.newSlug);
    const stored: SlugChangeRecord =
      finalSlug !== record.newSlug ? { ...record, newSlug: finalSlug } : record;

    this.byOldSlug.set(stored.oldSlug, stored);

    const history = this.byEntityId.get(stored.entityId) ?? [];
    history.push(stored);
    this.byEntityId.set(stored.entityId, history);
  }

  /**
   * Return the redirect target slug for a given old slug, or undefined if
   * no redirect is registered (caller should treat the slug as authoritative).
   */
  getRedirectTarget(oldSlug: string): string | undefined {
    return this.byOldSlug.get(oldSlug)?.newSlug;
  }

  /**
   * Follow the redirect chain from a starting slug and return the final
   * destination. Stops after 20 hops as a safety guard against loops that
   * sneak in before hasRedirectLoop() is called.
   */
  collapseRedirectChain(slug: string): string {
    const MAX_HOPS = 20;
    let current = slug;
    for (let i = 0; i < MAX_HOPS; i++) {
      const next = this.byOldSlug.get(current)?.newSlug;
      if (!next || next === current) break;
      current = next;
    }
    return current;
  }

  /**
   * Detect redirect loops (A → B → A or longer cycles).
   * Returns true if following the chain from `slug` revisits a slug.
   */
  hasRedirectLoop(slug: string): boolean {
    const visited = new Set<string>();
    let current = slug;
    while (true) {
      if (visited.has(current)) return true;
      visited.add(current);
      const next = this.byOldSlug.get(current)?.newSlug;
      if (!next || next === current) return false;
      current = next;
    }
  }

  /** Return full redirect history for an entity (oldest first). */
  getEntityHistory(entityId: string): SlugChangeRecord[] {
    return [...(this.byEntityId.get(entityId) ?? [])];
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const permalinkRedirectStore = new PermalinkRedirectStore();
