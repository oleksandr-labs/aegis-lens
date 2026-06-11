/**
 * GitHub mirror of daily DeepStateMAP snapshots (TODO task:
 * "GitHub mirror of daily snapshots").
 *
 * Several community projects mirror DeepState's daily GeoJSON to a public Git repo
 * (one file per day, e.g. `geojson/YYYY-MM-DD.geojson`). Mirroring is preferable to
 * hammering DeepState's own API: it is a single fetch per day from a static raw URL,
 * it provides a stable historical archive for playback, and it shifts load off the
 * volunteer-run source. Republication of the *content* is still gated by COMPLIANCE.md.
 *
 * This module reads a mirror repo via the GitHub raw + contents API. Configure with:
 *   DEEPSTATE_MIRROR_REPO   e.g. "owner/deepstate-snapshots"
 *   DEEPSTATE_MIRROR_PATH   e.g. "geojson"            (dir holding YYYY-MM-DD.geojson)
 *   DEEPSTATE_MIRROR_BRANCH e.g. "main"               (default: main)
 *   GITHUB_TOKEN            optional, raises rate limit (read-only)
 * Absent config → demo mode (lists/returns the bundled demo snapshot).
 */

import type { DeepStateRawSnapshot, FrontlineSnapshot } from "./types";
import { DeepStateMapClient, DEMO_SNAPSHOT } from "./client";

export interface MirrorConfig {
  repo?: string; // owner/name
  path?: string; // dir of snapshot files
  branch?: string;
  githubToken?: string;
  userAgent?: string;
  timeoutMs?: number;
}

const RAW_BASE = "https://raw.githubusercontent.com";
const API_BASE = "https://api.github.com";

export class DeepStateMirror {
  private readonly repo?: string;
  private readonly path: string;
  private readonly branch: string;
  private readonly token?: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly client = new DeepStateMapClient();

  constructor(config: MirrorConfig = {}) {
    this.repo = config.repo ?? process.env.DEEPSTATE_MIRROR_REPO;
    this.path = config.path ?? process.env.DEEPSTATE_MIRROR_PATH ?? "geojson";
    this.branch = config.branch ?? process.env.DEEPSTATE_MIRROR_BRANCH ?? "main";
    this.token = config.githubToken ?? process.env.GITHUB_TOKEN;
    this.userAgent = config.userAgent ?? "AegisLens-DeepStateMirror/1.0";
    this.timeoutMs = config.timeoutMs ?? 15_000;
  }

  get isConfigured(): boolean {
    return Boolean(this.repo);
  }

  /** List available snapshot dates (YYYY-MM-DD) in the mirror, newest first. */
  async listDates(): Promise<string[]> {
    if (!this.isConfigured) return [DEMO_SNAPSHOT.date];
    const url = `${API_BASE}/repos/${this.repo}/contents/${this.path}?ref=${this.branch}`;
    const items = await this.fetchJson<Array<{ name: string }>>(url);
    return items
      .map((i) => i.name.replace(/\.geojson$/i, ""))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();
  }

  /** Fetch + normalize a single dated snapshot from the mirror. */
  async getSnapshot(date: string): Promise<FrontlineSnapshot> {
    if (!this.isConfigured) return DEMO_SNAPSHOT;
    const url = `${RAW_BASE}/${this.repo}/${this.branch}/${this.path}/${date}.geojson`;
    const raw = await this.fetchJson<DeepStateRawSnapshot>(url);
    return this.client.normalize(raw, date);
  }

  /** Fetch the most recent snapshot available in the mirror. */
  async getLatest(): Promise<FrontlineSnapshot> {
    if (!this.isConfigured) return DEMO_SNAPSHOT;
    const dates = await this.listDates();
    if (dates.length === 0) return DEMO_SNAPSHOT;
    return this.getSnapshot(dates[0]);
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
      Accept: "application/vnd.github+json",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) throw new Error(`GitHub mirror fetch failed ${res.status} for ${url}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
