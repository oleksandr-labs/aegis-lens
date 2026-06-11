/**
 * Client for CERT-UA (cert.gov.ua).
 *
 * Computer Emergency Response Team of Ukraine — the national CERT operated by
 * SSSCIP. Publishes cyber-incident advisories ("Оповіщення"), IOCs and
 * mitigation guidance.
 *
 * Channels:
 *   - RSS feed     : https://cert.gov.ua/api/articles/rss   (Atom/RSS, public)
 *   - Article pages: https://cert.gov.ua/article/<id>
 *   - Telegram     : https://t.me/certua  (Bot API only — never scrape; see telegram integration)
 *
 * ToS / crawler discipline (see COMPLIANCE.md):
 *   - Polite single-threaded polling, default once per 6h (cyber feed is retrospective).
 *   - Identifiable User-Agent.
 *   - Respect robots.txt and any rate limits; cache between polls.
 *   - Attribute CERT-UA and link the source advisory on republication.
 *
 * No secrets are required for the public RSS feed. The optional Telegram bridge
 * reads a bot token from process.env.TELEGRAM_BOT_TOKEN (handled by the
 * @ua-map/telegram package — not hardcoded here).
 */

import type { CertAdvisory } from "./types";

const DEFAULT_RSS_URL = "https://cert.gov.ua/api/articles/rss";
const USER_AGENT = "AegisLens-CERT-UA-Adapter/1.0 (+https://aegis-lens.ua; OSINT cyber-incident mirror)";

export interface CertClientConfig {
  rssUrl?: string;
  timeoutMs?: number;
  /** Minimum interval between live polls, in ms. Default 6h (retrospective feed). */
  minPollIntervalMs?: number;
}

/** A raw RSS item before normalization into a CertAdvisory. */
export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid?: string;
}

// ── DEMO fixture ────────────────────────────────────────────────────────────────
// Representative (synthetic but realistic) CERT-UA advisories so the package is
// usable offline / without network. Mirrors the shape of real cert.gov.ua items.

export const DEMO_ADVISORIES: CertAdvisory[] = [
  {
    advisoryId: "CERT-UA#DEMO-1001",
    source: "cert_ua",
    titleUk: "Кібератака на енергетичний сектор з використанням шкідливої програми (UAC-0002)",
    titleEn: "Cyberattack on the energy sector using malware (UAC-0002)",
    bodyText:
      "CERT-UA зафіксовано кібератаку, спрямовану на об'єкти енергетичної інфраструктури. " +
      "Зловмисники використовували фішингові листи з вкладенням. Виявлено індикатори компрометації: " +
      "командний сервер 185.220.101.45, домен update-energo.com, файл з хешем " +
      "d41d8cd98f00b204e9800998ecf8427e. Експлуатувалася вразливість CVE-2023-23397. " +
      "Атаку віднесено до угруповання UAC-0002 (Sandworm).",
    url: "https://cert.gov.ua/article/demo-1001",
    publishedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    occurredAt: new Date(Date.now() - 9 * 86_400_000).toISOString(),
    severity: "critical",
    sectors: ["energy"],
    regions: ["UA-ALL"],
    actor: "UAC-0002 / Sandworm",
  },
  {
    advisoryId: "CERT-UA#DEMO-1002",
    source: "cert_ua",
    titleUk: "Фішингова кампанія проти державних установ (UAC-0010, Gamaredon)",
    titleEn: "Phishing campaign against government institutions (UAC-0010, Gamaredon)",
    bodyText:
      "Виявлено масову розсилку фішингових повідомлень на адреси державних органів. " +
      "Шкідливі домени: gov-ua-mail.net, mil-secure[.]org. IP: 91.218.114.32. " +
      "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855. " +
      "Контактна пошта зловмисників: support@gov-ua-mail.net.",
    url: "https://cert.gov.ua/article/demo-1002",
    publishedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    occurredAt: new Date(Date.now() - 11 * 86_400_000).toISOString(),
    severity: "high",
    sectors: ["gov"],
    regions: ["UA-30"],
    actor: "UAC-0010 / Gamaredon",
  },
  {
    advisoryId: "CERT-UA#DEMO-1003",
    source: "cert_ua",
    titleUk: "DDoS-атаки на банківські та телекомунікаційні сервіси",
    titleEn: "DDoS attacks on banking and telecom services",
    bodyText:
      "Зафіксовано серію DDoS-атак на онлайн-сервіси банків та операторів зв'язку. " +
      "Джерела трафіку включали ботнет з вузлами 45.143.200.10 та 2001:db8::1. " +
      "Рекомендовано посилити фільтрацію. Вразливість CVE-2024-3094 не підтверджено.",
    url: "https://cert.gov.ua/article/demo-1003",
    publishedAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    severity: "medium",
    sectors: ["finance", "telecom"],
    regions: ["UA-ALL"],
  },
];

// ── Minimal RSS parser ───────────────────────────────────────────────────────
// Dependency-free: extracts <item> blocks. CERT-UA RSS is well-formed; this is a
// pragmatic parser (no external XML lib) sufficient for title/link/description/pubDate.

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    items.push({
      title: field(block, "title"),
      link: field(block, "link"),
      description: field(block, "description"),
      pubDate: field(block, "pubDate") || field(block, "dc:date"),
      guid: field(block, "guid") || undefined,
    });
  }
  return items;
}

function field(block: string, tag: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return "";
  return decodeEntities(stripCdata(m[1])).trim();
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// ── Client ───────────────────────────────────────────────────────────────────

export class CertUaClient {
  private readonly rssUrl: string;
  private readonly timeoutMs: number;
  private readonly minPollIntervalMs: number;
  private lastPollAt = 0;

  constructor(config: CertClientConfig = {}) {
    this.rssUrl = config.rssUrl ?? DEFAULT_RSS_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minPollIntervalMs = config.minPollIntervalMs ?? 6 * 3_600_000;
  }

  /** True if enough time has elapsed since the last live poll (retrospective cadence). */
  canPoll(now = Date.now()): boolean {
    return now - this.lastPollAt >= this.minPollIntervalMs;
  }

  /**
   * Fetch and parse the CERT-UA RSS feed into raw RSS items.
   * Falls back to an empty array on network failure (callers should use demo data).
   */
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

  /**
   * Best-effort live fetch returning partially-populated advisories.
   * RSS gives title/link/summary/date only; sector/region/IOC enrichment is done
   * downstream by sector-tagging + ioc-extractor. On failure returns the demo set.
   */
  async getAdvisories(): Promise<CertAdvisory[]> {
    let items: RssItem[];
    try {
      items = await this.fetchRssItems();
    } catch {
      return DEMO_ADVISORIES;
    }
    if (items.length === 0) return DEMO_ADVISORIES;
    return items.map((it, i) => rssItemToAdvisory(it, i));
  }

  /** Always-available demo fixture (no network). */
  getDemoAdvisories(): CertAdvisory[] {
    return DEMO_ADVISORIES;
  }
}

export function rssItemToAdvisory(item: RssItem, index: number): CertAdvisory {
  const id = item.guid || item.link || `cert-ua-rss-${index}`;
  return {
    advisoryId: id.startsWith("CERT-UA") ? id : `CERT-UA#${shortHash(id)}`,
    source: "cert_ua",
    titleUk: item.title,
    bodyText: item.description,
    url: item.link,
    publishedAt: normalizeDate(item.pubDate),
    severity: "medium",
    sectors: [],
    regions: ["UA-ALL"],
  };
}

function normalizeDate(s: string): string {
  const t = Date.parse(s);
  return Number.isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
}

function shortHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0");
}

export class CertUaError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`CERT-UA fetch error ${status}: ${body.slice(0, 200)}`);
    this.name = "CertUaError";
  }
}
