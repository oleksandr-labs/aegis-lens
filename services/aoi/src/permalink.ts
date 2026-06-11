/**
 * Per-AOI sharing permalinks.
 *
 * Generates stable share links for public or private AOIs.  Share IDs are
 * short random tokens; optional human-readable slugs are also supported.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Permalink record for sharing an AOI */
export interface AOIPermalink {
  shareId: string;
  aoiId: string;
  createdByUserId: string;
  isPublic: boolean;
  viewCount: number;
  /** Optional human-readable slug, e.g. "kharkiv-frontline-2024" */
  slug?: string;
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = "https://aegis.lens";

/**
 * Build the full permalink URL for an AOI share.
 * Path: /aoi/<shareId>
 */
export function buildAOIPermalinkUrl(share: AOIPermalink, baseUrl = DEFAULT_BASE_URL): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/aoi/${share.shareId}`;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * In-memory AOI permalink store.
 *
 * Production: persist in the database; add a unique index on shareId and slug.
 */
export class AOIPermalinkStore {
  private readonly byShareId = new Map<string, AOIPermalink>();
  private readonly bySlug = new Map<string, string>(); // slug → shareId

  /** Create a new permalink (share must have a unique shareId) */
  create(permalink: AOIPermalink): void {
    if (this.byShareId.has(permalink.shareId)) {
      throw new Error(`Share ID already exists: ${permalink.shareId}`);
    }
    if (permalink.slug && this.bySlug.has(permalink.slug)) {
      throw new Error(`Slug already in use: ${permalink.slug}`);
    }
    this.byShareId.set(permalink.shareId, { ...permalink });
    if (permalink.slug) {
      this.bySlug.set(permalink.slug, permalink.shareId);
    }
  }

  /** Retrieve a permalink by its share ID (or slug) */
  get(shareIdOrSlug: string): AOIPermalink | undefined {
    if (this.byShareId.has(shareIdOrSlug)) {
      return this.byShareId.get(shareIdOrSlug);
    }
    const shareId = this.bySlug.get(shareIdOrSlug);
    if (shareId) return this.byShareId.get(shareId);
    return undefined;
  }

  /** Increment the view counter for a permalink */
  incrementView(shareId: string): number {
    const permalink = this.byShareId.get(shareId);
    if (!permalink) return 0;
    permalink.viewCount += 1;
    return permalink.viewCount;
  }

  /** List all public permalinks for a given AOI */
  listPublicForAOI(aoiId: string): AOIPermalink[] {
    return [...this.byShareId.values()].filter((p) => p.aoiId === aoiId && p.isPublic);
  }

  /** Generate a new unique share ID */
  static generateShareId(): string {
    return `sh_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  }
}

/** Module-level singleton */
export const aoiPermalinkStore = new AOIPermalinkStore();
