/**
 * Task — Archive each ingested URL via Wayback.
 *
 * Internet Archive "Save Page Now" (SPN2) client. OSINT evidence URLs are
 * volatile (deleted tweets, removed videos, pulled posts), so every ingested
 * source URL is archived and its snapshot URL preserved on the canonical event's
 * `sources[].archiveUrl`.
 *
 * This client is intentionally generic so it is reusable by the youtube, reddit
 * and twitter/x integrations (the twitter package re-exports it via
 * `integrations/twitter/src/archive.ts`).
 *
 * Auth: SPN2 requires an Archive.org account's S3-style keys, read from env by
 * name (`IA_ACCESS_KEY`, `IA_SECRET_KEY`) — never hardcoded. Without keys the
 * client degrades to "availability-only" (checks the Wayback CDX for an existing
 * snapshot) so it is still usable in demo/CI.
 */

const SPN_ENDPOINT = "https://web.archive.org/save";
const AVAILABILITY_ENDPOINT = "https://archive.org/wayback/available";

export interface WaybackConfig {
  /** IA S3 access key (from env IA_ACCESS_KEY). */
  accessKey?: string;
  /** IA S3 secret key (from env IA_SECRET_KEY). */
  secretKey?: string;
  userAgent?: string;
  /** Polite minimum gap between Save-Page-Now calls (SPN is heavily rate-limited). */
  minIntervalMs?: number;
}

export interface ArchiveResult {
  /** The original URL submitted. */
  url: string;
  /** Resolved snapshot URL, or null if archiving/lookup failed. */
  archiveUrl: string | null;
  /** How the snapshot was obtained. */
  via: "save_page_now" | "existing_snapshot" | "none";
  /** ISO timestamp of the snapshot, where known. */
  snapshotAt?: string;
  error?: string;
}

/** Build a WaybackConfig from process.env (names only — values from env). */
export function waybackConfigFromEnv(env: Record<string, string | undefined> = process.env): WaybackConfig {
  return {
    accessKey: env.IA_ACCESS_KEY,
    secretKey: env.IA_SECRET_KEY,
    userAgent: env.AEGIS_USER_AGENT ?? "AegisLens/1.0 (+osint-archive)",
    minIntervalMs: 6_000,
  };
}

export class WaybackClient {
  private lastCallAt = 0;

  constructor(private readonly config: WaybackConfig = {}) {}

  private get hasKeys(): boolean {
    return Boolean(this.config.accessKey && this.config.secretKey);
  }

  private async throttle(): Promise<void> {
    const gap = this.config.minIntervalMs ?? 6_000;
    const wait = this.lastCallAt + gap - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastCallAt = Date.now();
  }

  /**
   * Check the Wayback availability API for an existing snapshot of `url`.
   * Free, keyless, low-rate — used as a fallback and to avoid re-archiving.
   */
  async findExisting(url: string): Promise<ArchiveResult> {
    try {
      const api = new URL(AVAILABILITY_ENDPOINT);
      api.searchParams.set("url", url);
      const res = await fetch(api.toString(), {
        headers: { "User-Agent": this.config.userAgent ?? "AegisLens/1.0" },
      });
      if (!res.ok) return { url, archiveUrl: null, via: "none", error: `availability ${res.status}` };
      const json = (await res.json()) as {
        archived_snapshots?: { closest?: { available: boolean; url: string; timestamp: string } };
      };
      const closest = json.archived_snapshots?.closest;
      if (closest?.available) {
        return {
          url,
          archiveUrl: closest.url,
          via: "existing_snapshot",
          snapshotAt: parseWaybackTimestamp(closest.timestamp),
        };
      }
      return { url, archiveUrl: null, via: "none" };
    } catch (err) {
      return { url, archiveUrl: null, via: "none", error: String(err) };
    }
  }

  /**
   * Archive `url` via Save-Page-Now (requires IA keys). Falls back to an existing
   * snapshot lookup when keys are absent or SPN fails.
   */
  async archive(url: string): Promise<ArchiveResult> {
    if (!this.hasKeys) {
      // No credentials → can only report an existing snapshot.
      return this.findExisting(url);
    }

    await this.throttle();
    try {
      const body = new URLSearchParams({ url, capture_outlinks: "0", skip_first_archive: "1" });
      const res = await fetch(SPN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `LOW ${this.config.accessKey}:${this.config.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": this.config.userAgent ?? "AegisLens/1.0",
        },
        body: body.toString(),
      });

      if (res.status === 429) {
        // SPN over quota → degrade to existing-snapshot lookup.
        const fallback = await this.findExisting(url);
        return fallback.archiveUrl ? fallback : { url, archiveUrl: null, via: "none", error: "spn 429" };
      }
      if (!res.ok) {
        return this.findExisting(url);
      }

      const json = (await res.json()) as { job_id?: string; url?: string; timestamp?: string };
      // SPN returns a job; the snapshot URL is reconstructable from job timestamp.
      if (json.timestamp && json.url) {
        return {
          url,
          archiveUrl: `https://web.archive.org/web/${json.timestamp}/${json.url}`,
          via: "save_page_now",
          snapshotAt: parseWaybackTimestamp(json.timestamp),
        };
      }
      // Job accepted but snapshot not yet resolved — best effort.
      return { url, archiveUrl: `https://web.archive.org/web/2/${url}`, via: "save_page_now" };
    } catch (err) {
      const fallback = await this.findExisting(url);
      return fallback.archiveUrl ? fallback : { url, archiveUrl: null, via: "none", error: String(err) };
    }
  }

  /** Archive many URLs, respecting the polite interval. */
  async archiveAll(urls: string[]): Promise<ArchiveResult[]> {
    const out: ArchiveResult[] = [];
    for (const u of urls) out.push(await this.archive(u));
    return out;
  }
}

/** Wayback timestamps are `YYYYMMDDHHMMSS` → ISO-8601. */
export function parseWaybackTimestamp(ts: string): string | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(ts);
  if (!m) return undefined;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}
