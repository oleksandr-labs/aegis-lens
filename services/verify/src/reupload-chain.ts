/**
 * Re-upload chain tracer — identifies first seen platform / account.
 *
 * Traces media (image or video) across social platforms using perceptual-hash
 * matching and platform APIs (CrowdTangle, Telegram) to build the full
 * re-share timeline. The earliest entry in the chain is the most credible.
 *
 * NOTES:
 * 1. CrowdTangle (EN): CrowdTangle or Telegram Search API for Facebook/Instagram/Telegram tracing.
 *    CrowdTangle (UK): CrowdTangle або Telegram Search API для відстеження Facebook/Instagram/Telegram.
 * 2. Perceptual hash matching (EN): pHash/dHash used to match visually identical media across platforms.
 *    Perceptual hash matching (UK): pHash/dHash для пошуку візуально ідентичних медіа на різних платформах.
 * 3. First-seen credibility (EN): first-seen entry is the most credible origin; later entries may be amplification.
 *    First-seen credibility (UK): перший запис у ланцюгу є найбільш достовірним джерелом; пізніші — підсилення.
 */

export type Platform =
  | "telegram"
  | "twitter"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "other";

export interface ReuploadEntry {
  platform: Platform;
  /** Platform-specific account identifier */
  accountId?: string;
  /** ISO-8601 upload timestamp */
  uploadedAt: string;
  url: string;
  /** True only for the chronologically earliest known appearance */
  isFirst: boolean;
}

export interface ReuploadChain {
  /** Perceptual hash used to identify this media across platforms */
  mediaHash: string;
  /** Chronologically sorted list of appearances */
  chain: ReuploadEntry[];
  /** Convenience pointer to the first entry, or null if chain is empty */
  firstSeen: ReuploadEntry | null;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const REUPLOAD_CHAIN_NOTES_EN = [
  "CrowdTangle / Telegram API: use CrowdTangle for Facebook/Instagram and the Telegram Search API for Telegram channels.",
  "Perceptual hash matching: pHash or dHash fingerprints are used to surface visually identical media across platforms.",
  "First-seen is most credible: the chronologically earliest entry in the chain is treated as the likely original source.",
] as const;

export const REUPLOAD_CHAIN_NOTES_UK = [
  "CrowdTangle / Telegram API: CrowdTangle для Facebook/Instagram, Telegram Search API для каналів Telegram.",
  "Зіставлення pHash/dHash: відбитки pHash або dHash дозволяють знаходити візуально ідентичні медіа на різних платформах.",
  "Перший запис найдостовірніший: хронологічно найраніший запис у ланцюгу вважається найімовірнішим першоджерелом.",
] as const;

// ── Stub tracer ───────────────────────────────────────────────────────────────

class ReuploadTracer {
  /**
   * Stub: returns an empty chain. Replace with CrowdTangle / Telegram API calls
   * combined with perceptual-hash index lookups.
   */
  async trace(mediaHash: string): Promise<ReuploadChain> {
    return {
      mediaHash,
      chain: [],
      firstSeen: null,
    };
  }

  /** Sort a list of entries chronologically and mark the first. */
  buildChain(entries: Omit<ReuploadEntry, "isFirst">[]): ReuploadChain {
    if (entries.length === 0) {
      return { mediaHash: "", chain: [], firstSeen: null };
    }
    const sorted = [...entries].sort(
      (a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
    );
    const chain: ReuploadEntry[] = sorted.map((e, i) => ({ ...e, isFirst: i === 0 }));
    return {
      mediaHash: "",
      chain,
      firstSeen: chain[0] ?? null,
    };
  }
}

export const reuploadTracer = new ReuploadTracer();
