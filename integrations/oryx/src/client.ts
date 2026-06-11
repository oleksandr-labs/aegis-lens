/**
 * Oryx data client.
 *
 * Oryx (oryxspioenkop.com) is a volunteer-run blog with NO official API. It
 * publishes equipment-loss tallies as HTML blog posts; the community maintains
 * Google-Sheets mirrors of the same data. We therefore support two ingest
 * modes, both gated behind explicit, ToS-respecting configuration:
 *
 *   1. "sheet"  — fetch a community CSV export of an Oryx Google Sheet
 *                 (provide the published-CSV URL via env / config).
 *   2. "blog"   — fetch the Oryx HTML post (caller supplies a parsed-rows hook,
 *                 since robust HTML scraping is out of scope for this client).
 *   3. "demo"   — bundled fixture; the default so the package works offline.
 *
 * CRAWLER DISCIPLINE (see COMPLIANCE.md):
 *   - Oryx is a small volunteer project. We fetch at most ONCE PER DAY.
 *   - A descriptive User-Agent identifying Aegis Lens + contact is always sent.
 *   - Responses are cached; we never hammer the origin.
 *   - No secrets are hardcoded; CSV/source URLs come from process.env.
 */

import type { OryxSnapshot } from "./types";
import { demoEntries, parseRows, type OryxRawRow } from "./parser";

export type OryxIngestMode = "demo" | "sheet" | "blog";

export interface OryxClientConfig {
  mode?: OryxIngestMode;
  /** Published Google-Sheets CSV export URL (mode: "sheet"). From env. */
  sheetCsvUrl?: string;
  /** Oryx blog post URL (mode: "blog"). */
  blogUrl?: string;
  /** HTTP timeout, ms. */
  timeoutMs?: number;
  /** Minimum interval between live fetches, ms (default 24h). */
  minFetchIntervalMs?: number;
  /** Contact string embedded in the User-Agent (required for live modes). */
  contact?: string;
}

const DEFAULT_TIMEOUT = 15_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const USER_AGENT_BASE = "AegisLens-OryxClient/0.1 (+https://aegislens.example; respectful daily fetch)";

const RU_DEFAULT_POST = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html";

export class OryxClient {
  private readonly mode: OryxIngestMode;
  private readonly timeoutMs: number;
  private readonly minFetchIntervalMs: number;
  private lastFetchAt = 0;
  private cached?: OryxSnapshot;

  constructor(private readonly config: OryxClientConfig = {}) {
    this.mode = config.mode ?? "demo";
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT;
    this.minFetchIntervalMs = config.minFetchIntervalMs ?? ONE_DAY_MS;
  }

  /** User-Agent identifying us to the volunteer-run origin. */
  private userAgent(): string {
    return this.config.contact
      ? `${USER_AGENT_BASE.replace("aegislens.example", this.config.contact)}`
      : USER_AGENT_BASE;
  }

  /**
   * Fetch the current Oryx snapshot. Respects the daily fetch cadence: if a
   * live fetch was made within `minFetchIntervalMs`, the cached snapshot is
   * returned instead of hitting the origin again.
   */
  async getSnapshot(opts: { force?: boolean } = {}): Promise<OryxSnapshot> {
    if (this.mode === "demo") return this.demoSnapshot();

    const now = Date.now();
    if (!opts.force && this.cached && now - this.lastFetchAt < this.minFetchIntervalMs) {
      return this.cached;
    }

    try {
      const rows = this.mode === "sheet" ? await this.fetchSheetRows() : await this.fetchBlogRows();
      const entries = parseRows(rows);
      const snapshot: OryxSnapshot = {
        fetchedAt: new Date().toISOString(),
        entries,
        total: entries.length,
        isDemo: false,
        sourceUrl: this.mode === "sheet" ? this.config.sheetCsvUrl! : this.config.blogUrl ?? RU_DEFAULT_POST,
      };
      this.cached = snapshot;
      this.lastFetchAt = now;
      return snapshot;
    } catch {
      // Fail safe to the demo fixture so callers always have data.
      return this.demoSnapshot();
    }
  }

  /** Fetch + parse a community Google-Sheets CSV export into raw rows. */
  private async fetchSheetRows(): Promise<OryxRawRow[]> {
    const url = this.config.sheetCsvUrl ?? process.env.ORYX_SHEET_CSV_URL;
    if (!url) throw new OryxConfigError("ORYX_SHEET_CSV_URL not set");
    const csv = await this.fetchText(url);
    return parseSheetCsv(csv, this.config.blogUrl ?? RU_DEFAULT_POST);
  }

  /**
   * Blog mode: robust HTML extraction is intentionally out of scope (Oryx
   * markup is hand-maintained and fragile). This throws so callers either
   * supply a sheet export or use demo mode; we never silently scrape.
   */
  private async fetchBlogRows(): Promise<OryxRawRow[]> {
    throw new OryxConfigError(
      "Blog HTML parsing is not auto-enabled; use mode 'sheet' with a CSV export or 'demo'.",
    );
  }

  private async fetchText(url: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": this.userAgent(), Accept: "text/csv,text/plain,*/*" },
        signal: controller.signal,
      });
      if (!res.ok) throw new OryxFetchError(res.status, await res.text());
      return res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  private demoSnapshot(): OryxSnapshot {
    const entries = demoEntries();
    return {
      fetchedAt: new Date().toISOString(),
      entries,
      total: entries.length,
      isDemo: true,
      sourceUrl: RU_DEFAULT_POST,
    };
  }
}

/**
 * Parse a community CSV mirror of an Oryx sheet.
 * Expected headers (case-insensitive): side, category, model, seq, status,
 * date, location, evidence_url.
 */
export function parseSheetCsv(csv: string, fallbackPost: string): OryxRawRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const rows: OryxRawRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (name: string) => {
      const j = idx(name);
      return j >= 0 ? (cols[j] ?? "").trim() : "";
    };
    const side = get("side").toLowerCase() === "ukraine" ? "ukraine" : "russia";
    rows.push({
      side,
      category: (get("category") || "other") as OryxRawRow["category"],
      modelEn: get("model"),
      seq: parseInt(get("seq") || String(i), 10) || i,
      statusRaw: get("status") || "destroyed",
      dateRaw: get("date") || undefined,
      locationText: get("location") || undefined,
      evidenceUrl: get("evidence_url") || undefined,
      oryxPostUrl: get("oryx_post_url") || fallbackPost,
    });
  }
  return rows;
}

/** Minimal CSV field splitter (handles quoted commas). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export class OryxConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OryxConfigError";
  }
}

export class OryxFetchError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`Oryx fetch error ${status}: ${body.slice(0, 200)}`);
    this.name = "OryxFetchError";
  }
}
