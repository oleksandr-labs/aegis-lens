/**
 * Client for SSSCIP (cip.gov.ua).
 *
 * State Service of Special Communications and Information Protection of Ukraine —
 * the parent agency of CERT-UA. Publishes strategic-comms cyber announcements,
 * quarterly threat reviews, and attribution statements (often higher-level /
 * sector-wide than individual CERT-UA technical advisories).
 *
 * Channels:
 *   - News pages : https://cip.gov.ua/ua/news
 *   - RSS        : https://cip.gov.ua/ua/rss   (where available)
 *
 * Cadence: SSSCIP announcements are RETROSPECTIVE summaries (weekly/quarterly).
 * Poll once per 12h. See COMPLIANCE.md for ToS / attribution.
 */

import type { CertAdvisory } from "./types";
import { CertUaError, parseRss, type RssItem } from "./cert-client";

const DEFAULT_RSS_URL = "https://cip.gov.ua/ua/rss";
const USER_AGENT = "AegisLens-SSSCIP-Adapter/1.0 (+https://aegis-lens.ua; OSINT cyber-incident mirror)";

export interface SsscipClientConfig {
  rssUrl?: string;
  timeoutMs?: number;
  minPollIntervalMs?: number;
}

// ── DEMO fixture ────────────────────────────────────────────────────────────────

export const DEMO_SSSCIP_ANNOUNCEMENTS: CertAdvisory[] = [
  {
    advisoryId: "SSSCIP#DEMO-2001",
    source: "ssscip",
    titleUk: "Огляд кіберзагроз за квартал: зростання атак на критичну інфраструктуру",
    titleEn: "Quarterly cyber-threat review: rise in attacks on critical infrastructure",
    bodyText:
      "За звітний період Держспецзв'язку зафіксувало збільшення кількості кіберінцидентів, " +
      "спрямованих проти енергетичного, телекомунікаційного та урядового секторів. " +
      "Переважали фішинг та DDoS. Атрибуція: переважно проросійські угруповання UAC-0010, UAC-0002.",
    url: "https://cip.gov.ua/ua/news/demo-2001",
    publishedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    severity: "high",
    sectors: ["energy", "telecom", "gov"],
    regions: ["UA-ALL"],
    actor: "UAC-0010, UAC-0002",
  },
  {
    advisoryId: "SSSCIP#DEMO-2002",
    source: "ssscip",
    titleUk: "Попередження для медіа-сектору щодо інформаційно-психологічних операцій",
    titleEn: "Warning to the media sector regarding information-psychological operations",
    bodyText:
      "Держспецзв'язку попереджає медіа-організації про спроби несанкціонованого доступу до " +
      "систем публікації з метою поширення дезінформації. Рекомендовано посилити автентифікацію.",
    url: "https://cip.gov.ua/ua/news/demo-2002",
    publishedAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    severity: "medium",
    sectors: ["media"],
    regions: ["UA-ALL"],
  },
];

export class SsscipClient {
  private readonly rssUrl: string;
  private readonly timeoutMs: number;
  private readonly minPollIntervalMs: number;
  private lastPollAt = 0;

  constructor(config: SsscipClientConfig = {}) {
    this.rssUrl = config.rssUrl ?? DEFAULT_RSS_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minPollIntervalMs = config.minPollIntervalMs ?? 12 * 3_600_000;
  }

  canPoll(now = Date.now()): boolean {
    return now - this.lastPollAt >= this.minPollIntervalMs;
  }

  async fetchRssItems(): Promise<RssItem[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.rssUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
        signal: controller.signal,
      });
      if (!res.ok) throw new CertUaError(res.status, await res.text());
      this.lastPollAt = Date.now();
      return parseRss(await res.text());
    } finally {
      clearTimeout(timer);
    }
  }

  async getAnnouncements(): Promise<CertAdvisory[]> {
    let items: RssItem[];
    try {
      items = await this.fetchRssItems();
    } catch {
      return DEMO_SSSCIP_ANNOUNCEMENTS;
    }
    if (items.length === 0) return DEMO_SSSCIP_ANNOUNCEMENTS;
    return items.map((it, i) => ({
      advisoryId: `SSSCIP#${i}-${Date.parse(it.pubDate) || Date.now()}`,
      source: "ssscip" as const,
      titleUk: it.title,
      bodyText: it.description,
      url: it.link,
      publishedAt: new Date(Date.parse(it.pubDate) || Date.now()).toISOString(),
      severity: "medium" as const,
      sectors: [],
      regions: ["UA-ALL"] as ("UA-ALL")[],
    }));
  }

  getDemoAnnouncements(): CertAdvisory[] {
    return DEMO_SSSCIP_ANNOUNCEMENTS;
  }
}
