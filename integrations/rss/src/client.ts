import 'server-only';
import type { AegisEventV1 } from '@ua-map/event-schema';

export interface RssFeed {
  id: string;
  url: string;
  name: string;
  lang: string;           // BCP-47 e.g. 'uk', 'en'
  category: string;       // e.g. 'news', 'humanitarian', 'military-analysis'
  refreshIntervalMinutes: number;
}

export interface RssItem {
  feedId: string;
  guid: string;
  title: string;
  link: string;
  pubDate: string;        // ISO-8601
  content: string;
  author?: string;
}

/** 20+ curated conflict-relevant RSS/Atom feeds. */
export const CURATED_RSS_FEEDS: RssFeed[] = [
  // Ukrainian state / news agencies
  {
    id: 'ukrinform-uk',
    url: 'https://www.ukrinform.ua/rss/block-lastnews',
    name: 'Ukrinform (UK)',
    lang: 'uk',
    category: 'news',
    refreshIntervalMinutes: 5,
  },
  {
    id: 'ukrinform-en',
    url: 'https://www.ukrinform.net/rss/block-lastnews',
    name: 'Ukrinform (EN)',
    lang: 'en',
    category: 'news',
    refreshIntervalMinutes: 5,
  },
  {
    id: 'kyiv-independent',
    url: 'https://kyivindependent.com/rss',
    name: 'Kyiv Independent',
    lang: 'en',
    category: 'news',
    refreshIntervalMinutes: 10,
  },
  {
    id: 'suspilne-uk',
    url: 'https://suspilne.media/rss/all.xml',
    name: 'Suspilne Media (UK)',
    lang: 'uk',
    category: 'news',
    refreshIntervalMinutes: 10,
  },
  // International outlets with Ukraine coverage
  {
    id: 'rferl-ukraine-en',
    url: 'https://www.rferl.org/api/ztrqopveup-mvopom',
    name: 'RFE/RL Ukraine (EN)',
    lang: 'en',
    category: 'news',
    refreshIntervalMinutes: 15,
  },
  {
    id: 'rferl-ukraine-uk',
    url: 'https://www.radiosvoboda.org/api/zymjomymq-omop',
    name: 'Radio Svoboda (UK)',
    lang: 'uk',
    category: 'news',
    refreshIntervalMinutes: 15,
  },
  {
    id: 'reuters-ukraine',
    url: 'https://feeds.reuters.com/reuters/worldNews',
    name: 'Reuters World News',
    lang: 'en',
    category: 'news',
    refreshIntervalMinutes: 10,
  },
  {
    id: 'bbc-ukraine',
    url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml',
    name: 'BBC Europe',
    lang: 'en',
    category: 'news',
    refreshIntervalMinutes: 15,
  },
  // Military analysis
  {
    id: 'isw',
    url: 'https://www.understandingwar.org/rss.xml',
    name: 'ISW (Institute for the Study of War)',
    lang: 'en',
    category: 'military-analysis',
    refreshIntervalMinutes: 60,
  },
  {
    id: 'defense-express',
    url: 'https://defence-ua.com/rss',
    name: 'Defense Express (UK)',
    lang: 'uk',
    category: 'military-analysis',
    refreshIntervalMinutes: 30,
  },
  {
    id: 'militarnyi',
    url: 'https://mil.in.ua/uk/feed/',
    name: 'Militarnyi (UK)',
    lang: 'uk',
    category: 'military-analysis',
    refreshIntervalMinutes: 20,
  },
  {
    id: 'inform-napalm',
    url: 'https://informnapalm.org/en/feed/',
    name: 'InformNapalm (EN)',
    lang: 'en',
    category: 'military-analysis',
    refreshIntervalMinutes: 60,
  },
  // International organisations
  {
    id: 'osce-smm',
    url: 'https://www.osce.org/feed/smm',
    name: 'OSCE SMM',
    lang: 'en',
    category: 'humanitarian',
    refreshIntervalMinutes: 60,
  },
  {
    id: 'un-ukraine',
    url: 'https://ukraine.un.org/en/rss.xml',
    name: 'UN Ukraine',
    lang: 'en',
    category: 'humanitarian',
    refreshIntervalMinutes: 60,
  },
  {
    id: 'icrc-ukraine',
    url: 'https://www.icrc.org/en/rss-feeds',
    name: 'ICRC',
    lang: 'en',
    category: 'humanitarian',
    refreshIntervalMinutes: 60,
  },
  {
    id: 'msf-ukraine',
    url: 'https://www.msf.org/rss/crisis_updates/ukraine',
    name: 'Medecins Sans Frontieres',
    lang: 'en',
    category: 'humanitarian',
    refreshIntervalMinutes: 120,
  },
  {
    id: 'unhcr-ukraine',
    url: 'https://www.unhcr.org/ukraine.rss',
    name: 'UNHCR Ukraine',
    lang: 'en',
    category: 'humanitarian',
    refreshIntervalMinutes: 120,
  },
  {
    id: 'minregion-ua',
    url: 'https://www.minregion.gov.ua/rss/',
    name: 'Ministry of Regional Development (UA)',
    lang: 'uk',
    category: 'official',
    refreshIntervalMinutes: 60,
  },
  {
    id: 'ua-genstaff',
    url: 'https://www.mil.gov.ua/rss.xml',
    name: 'UA General Staff',
    lang: 'uk',
    category: 'official',
    refreshIntervalMinutes: 30,
  },
  {
    id: 'acled-ukraine',
    url: 'https://acleddata.com/feed/?tag=ukraine',
    name: 'ACLED Ukraine',
    lang: 'en',
    category: 'data',
    refreshIntervalMinutes: 1440, // daily
  },
  {
    id: 'bellingcat',
    url: 'https://www.bellingcat.com/feed/',
    name: 'Bellingcat',
    lang: 'en',
    category: 'osint',
    refreshIntervalMinutes: 120,
  },
];

// ─── RSS/Atom XML parsing (no external deps) ──────────────────────────────────

function parseIsoDate(raw: string): string {
  try {
    return new Date(raw).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function extractText(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<\\!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  return xml.match(re)?.[1]?.trim() ?? '';
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    items.push(m[1] ?? m[2] ?? '');
  }
  return items;
}

function extractGuid(itemXml: string): string {
  const guid = extractText(itemXml, 'guid') || extractText(itemXml, 'id');
  if (guid) return guid;
  return extractText(itemXml, 'link') || String(Math.random());
}

function extractPubDate(itemXml: string): string {
  const raw =
    extractText(itemXml, 'pubDate') ||
    extractText(itemXml, 'published') ||
    extractText(itemXml, 'updated') ||
    extractText(itemXml, 'dc:date');
  return parseIsoDate(raw);
}

// ─── RssClient ────────────────────────────────────────────────────────────────

export class RssClient {
  /**
   * Fetches and parses a single RSS/Atom feed.
   * Returns an empty array on network or parse errors (fail-soft).
   */
  async fetchFeed(feed: RssFeed): Promise<RssItem[]> {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'AegisLens/1.0 (+https://aegislens.ua/about)' },
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: feed.refreshIntervalMinutes * 60 },
      });

      if (!res.ok) return [];

      const xml = await res.text();
      const itemXmls = extractItems(xml);

      return itemXmls.map((item): RssItem => ({
        feedId: feed.id,
        guid: extractGuid(item),
        title: extractText(item, 'title'),
        link:
          extractText(item, 'link') ||
          item.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? '',
        pubDate: extractPubDate(item),
        content:
          extractText(item, 'description') ||
          extractText(item, 'content') ||
          extractText(item, 'summary') ||
          '',
        author:
          extractText(item, 'author') ||
          extractText(item, 'dc:creator') ||
          undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetches all curated feeds concurrently.
   * Results are merged and sorted newest-first.
   */
  async fetchAll(): Promise<RssItem[]> {
    const results = await Promise.allSettled(
      CURATED_RSS_FEEDS.map((f) => this.fetchFeed(f)),
    );

    const items = results
      .filter((r): r is PromiseFulfilledResult<RssItem[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    return items.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    );
  }

  /**
   * Maps an RssItem to a partial AegisEventV1 for ingest pipeline consumption.
   * Callers must fill required fields (eventId, schemaVersion, severity, etc.).
   */
  normalizeToEvent(item: RssItem): Partial<AegisEventV1> {
    return {
      country: 'UA',
      title: { en: item.title },
      summary: { en: item.content.slice(0, 500) },
      citations: [
        {
          sourceId: item.feedId,
          sourceType: 'api',
          url: item.link,
          capturedAt: item.pubDate,
        },
      ],
      occurredAt: item.pubDate,
      verificationState: 'unverified',
      class: 'other',
    };
  }
}

export const rssClient = new RssClient();
