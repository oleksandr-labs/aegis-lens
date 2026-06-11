/**
 * News aggregator client — GDELT GKG v2, NewsAPI.org, MediaCloud.
 *
 * GDELT: Free, no key required, CC0 license.
 * NewsAPI: API key required; 100 req/day free tier; commercial license for production.
 * MediaCloud: API key required; academic license.
 *
 * Rate limits:
 * - GDELT: ~1 query/min recommended
 * - NewsAPI: 100 req/day (free), 250ms between requests
 * - MediaCloud: 1 req/sec
 */

import type {
  GdeltGkgRecord,
  NewsApiArticle,
  MediaCloudStory,
  NewsAggregatorClient,
} from "./types";

const GDELT_GKG_URL = "https://api.gdeltproject.org/api/v2/doc/doc";
const NEWSAPI_BASE = "https://newsapi.org/v2";
const MEDIACLOUD_BASE = "https://api.mediacloud.org/api/v2";

const UKRAINE_KEYWORDS = [
  "ukraine", "russia ukraine", "ukraine war", "ukraine attack",
  "Kyiv", "Kharkiv", "Donbas", "Zaporizhzhia", "Kherson",
];

function gdeltDateFormat(d: Date): string {
  return d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

function parseGdeltTsv(tsv: string): GdeltGkgRecord[] {
  const lines = tsv.trim().split("\n").filter(Boolean);
  const records: GdeltGkgRecord[] = [];

  for (const line of lines) {
    try {
      const cols = line.split("\t");
      if (cols.length < 8) continue;

      const [gkgId, dateRaw, , , , themes, locationsRaw, personsRaw, orgsRaw, tone] = cols;

      const parsedLocations = (locationsRaw ?? "").split(";").filter(Boolean).map((loc) => {
        const parts = loc.split("#");
        return {
          type: parts[0] ?? "",
          fullname: parts[1] ?? "",
          country_code: parts[2] ?? "",
          lat: parseFloat(parts[4] ?? "") || undefined,
          lon: parseFloat(parts[5] ?? "") || undefined,
        };
      });

      const toneVals = (tone ?? "").split(",").map(Number);

      const dateStr = dateRaw.length >= 14
        ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}T${dateRaw.slice(8, 10)}:${dateRaw.slice(10, 12)}:${dateRaw.slice(12, 14)}Z`
        : new Date().toISOString();

      records.push({
        gkg_record_id: gkgId ?? "",
        date: dateStr,
        document_identifier: cols[2] ?? "",
        source_collection_identifier: cols[3] ?? "",
        themes: (themes ?? "").split(";").filter(Boolean),
        locations: parsedLocations,
        persons: (personsRaw ?? "").split(";").filter(Boolean),
        organizations: (orgsRaw ?? "").split(";").filter(Boolean),
        tone: {
          positive: toneVals[0] ?? 0,
          negative: toneVals[1] ?? 0,
          polarity: toneVals[2] ?? 0,
          activity: toneVals[3] ?? 0,
        },
      });
    } catch {
      // Skip malformed record
    }
  }

  return records;
}

export class NewsAggregatorApiClient implements NewsAggregatorClient {
  private lastGdeltRequest = 0;
  private lastNewsApiRequest = 0;
  private lastMediaCloudRequest = 0;

  constructor(
    private readonly newsApiKey?: string,
    private readonly mediaCloudApiKey?: string,
  ) {}

  async fetchGdelt(since: Date, keywords: string[] = UKRAINE_KEYWORDS): Promise<GdeltGkgRecord[]> {
    const elapsed = Date.now() - this.lastGdeltRequest;
    if (elapsed < 60_000) {
      await new Promise<void>((r) => setTimeout(r, 60_000 - elapsed));
    }

    const query = keywords.slice(0, 3).join(" OR ");
    const startDt = gdeltDateFormat(since);

    const url = new URL(GDELT_GKG_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("mode", "artlist");
    url.searchParams.set("maxrecords", "25");
    url.searchParams.set("startdatetime", startDt);
    url.searchParams.set("format", "TSV");
    url.searchParams.set("sourcelang", "english");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    this.lastGdeltRequest = Date.now();

    if (!res.ok) {
      throw new Error(`GDELT API ${res.status}: ${await res.text()}`);
    }

    const tsv = await res.text();
    return parseGdeltTsv(tsv);
  }

  async fetchNewsApi(
    since: Date,
    opts: { query?: string; language?: string } = {},
  ): Promise<NewsApiArticle[]> {
    if (!this.newsApiKey) {
      throw new Error("NewsAPI key required (set NEWSAPI_KEY)");
    }

    const elapsed = Date.now() - this.lastNewsApiRequest;
    if (elapsed < 1_000) {
      await new Promise<void>((r) => setTimeout(r, 1_000 - elapsed));
    }

    const url = new URL(`${NEWSAPI_BASE}/everything`);
    url.searchParams.set("q", opts.query ?? "Ukraine war");
    url.searchParams.set("from", since.toISOString().slice(0, 10));
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("language", opts.language ?? "en");
    url.searchParams.set("apiKey", this.newsApiKey);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    this.lastNewsApiRequest = Date.now();

    if (res.status === 429) {
      throw Object.assign(new Error("NewsAPI rate limited"), { retryAfterMs: 3_600_000 });
    }

    if (!res.ok) {
      throw new Error(`NewsAPI ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      articles?: Array<{
        url: string;
        source: { id?: string; name: string };
        author?: string;
        title: string;
        description?: string;
        content?: string;
        publishedAt: string;
        urlToImage?: string;
      }>;
    };

    return (json.articles ?? []).map(
      (a): NewsApiArticle => ({
        url: a.url,
        source_name: a.source.name,
        source_id: a.source.id ?? undefined,
        author: a.author ?? undefined,
        title: a.title,
        description: a.description ?? undefined,
        content: a.content ?? undefined,
        published_at: a.publishedAt,
        url_to_image: a.urlToImage ?? undefined,
        language: opts.language ?? "en",
      }),
    );
  }

  async fetchMediaCloud(
    since: Date,
    opts: { query?: string } = {},
  ): Promise<MediaCloudStory[]> {
    if (!this.mediaCloudApiKey) {
      throw new Error("MediaCloud API key required (set MEDIACLOUD_API_KEY)");
    }

    const elapsed = Date.now() - this.lastMediaCloudRequest;
    if (elapsed < 1_000) {
      await new Promise<void>((r) => setTimeout(r, 1_000 - elapsed));
    }

    const url = new URL(`${MEDIACLOUD_BASE}/stories/list`);
    url.searchParams.set("q", opts.query ?? "Ukraine");
    url.searchParams.set("fq", `publish_date:[${since.toISOString().slice(0, 10)}T00:00:00Z TO NOW]`);
    url.searchParams.set("rows", "20");
    url.searchParams.set("key", this.mediaCloudApiKey);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AegisLens/1.0" },
    });

    this.lastMediaCloudRequest = Date.now();

    if (!res.ok) {
      throw new Error(`MediaCloud API ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      response?: {
        docs?: Array<{
          stories_id: number;
          url: string;
          media_name: string;
          media_url: string;
          title: string;
          publish_date: string;
          language: string;
          tags?: Array<{ tag: string; tag_set: string }>;
        }>;
      };
    };

    return (json.response?.docs ?? []).map(
      (s): MediaCloudStory => ({
        stories_id: s.stories_id,
        url: s.url,
        media_name: s.media_name,
        media_url: s.media_url,
        title: s.title,
        publish_date: s.publish_date,
        language: s.language,
        tags: s.tags,
      }),
    );
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const res = await fetch(
        `${GDELT_GKG_URL}?query=ukraine&mode=artlist&maxrecords=1&format=TSV`,
        { headers: { "User-Agent": "AegisLens/1.0" } },
      );
      if (res.ok) return { healthy: true };
      return { healthy: false, message: `GDELT health check returned ${res.status}` };
    } catch (err) {
      return { healthy: false, message: String(err) };
    }
  }
}
