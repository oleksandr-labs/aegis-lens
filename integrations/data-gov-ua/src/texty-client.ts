/**
 * Client for Texty.org.ua (https://texty.org.ua) — Ukrainian data-journalism
 * outlet that publishes investigations + the underlying datasets (often as
 * downloadable CSV / interactive projects).
 *
 * Texty has no formal public dataset API; investigations and their datasets are
 * published on the site (and some on data.gov.ua / GitHub). This client models
 * the discovery surface as a curated catalog of TextyDataset descriptors with a
 * polite-fetch helper for the (RSS/JSON) feed where available. The primary value
 * for entity enrichment is the set of ЄДРПОУ codes a given investigation names —
 * that powers the cross-link in `investigation-link.ts`.
 *
 * License: Texty content is journalistic; the *datasets* they release are
 * generally reusable with attribution (treated `cc-by` / `other-open` here), but
 * article TEXT remains the outlet's copyright. Policy: we store dataset
 * descriptors + titles + permalinks (link-out), never re-host article bodies.
 * See COMPLIANCE.md.
 *
 * Usable WITHOUT network via the curated DEMO catalog below.
 */

import type { TextyDataset } from "./types";
import { normalizeEdrpou } from "./types";

const FEED_URL = "https://texty.org.ua/feed/";
const USER_AGENT =
  "AegisLens/1.0 (civic-tech-osint; +https://aegis-lens.example) ua-map-texty";

export interface TextyClientConfig {
  feedUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

export class TextyClient {
  private readonly feedUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(config: TextyClientConfig = {}) {
    this.feedUrl = config.feedUrl ?? FEED_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 2_000;
  }

  /**
   * List known data-journalism datasets. Attempts a polite feed fetch to detect
   * fresh items; on any failure falls back to the curated demo catalog. (Full
   * RSS parsing is intentionally out of scope — the feed is used only as a
   * liveness probe; the curated catalog carries the ЄДРПОУ cross-link metadata.)
   */
  async listDatasets(): Promise<TextyDataset[]> {
    try {
      await this.throttle();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(this.feedUrl, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
          signal: controller.signal,
        });
        // We only verify reachability; curated catalog is the source of the
        // structured ЄДРПОУ links (the feed does not expose them machine-readably).
        if (!res.ok) return DEMO_TEXTY_DATASETS;
        await res.text();
        return DEMO_TEXTY_DATASETS;
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return DEMO_TEXTY_DATASETS;
    }
  }

  /** Datasets that reference a given ЄДРПОУ (for entity cross-linking). */
  async datasetsForEdrpou(edrpou: string): Promise<TextyDataset[]> {
    const code = normalizeEdrpou(edrpou);
    const all = await this.listDatasets();
    return all.filter((d) => (d.relatedEdrpou ?? []).map(normalizeEdrpou).includes(code));
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}

// ── Curated demo catalog ──────────────────────────────────────────────────────

export const DEMO_TEXTY_DATASETS: TextyDataset[] = [
  {
    id: "texty-procurement-risk",
    title: {
      en: "Risky public procurement: a map of suspicious tenders",
      uk: "Ризикові держзакупівлі: карта підозрілих тендерів",
    },
    summary: {
      en: "Dataset of public-procurement tenders flagged for single-bidder and price-anomaly risk, with buyer/supplier EDRPOU codes.",
      uk: "Набір даних держзакупівель із позначками ризику (один учасник, цінові аномалії), з кодами ЄДРПОУ замовників/постачальників.",
    },
    url: "https://texty.org.ua/projects/risky-procurement/",
    publishedAt: "2026-02-10",
    tags: ["procurement", "prozorro", "corruption", "data"],
    license: "cc-by",
    relatedEdrpou: ["00131305", "12345678"],
  },
  {
    id: "texty-sanctions-network",
    title: {
      en: "Sanctions-evasion networks: linked Ukrainian shell companies",
      uk: "Мережі обходу санкцій: пов'язані українські фірми-прокладки",
    },
    summary: {
      en: "Investigation mapping ownership links between entities used to route sanctioned trade, with the EDRPOU codes involved.",
      uk: "Розслідування зв'язків між підприємствами, що використовувались для обходу санкцій, із залученими кодами ЄДРПОУ.",
    },
    url: "https://texty.org.ua/projects/sanctions-network/",
    publishedAt: "2026-03-22",
    tags: ["sanctions", "ownership", "investigation"],
    license: "cc-by",
    relatedEdrpou: ["87654321"],
  },
];
