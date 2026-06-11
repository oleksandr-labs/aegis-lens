/**
 * Crawl-budget analysis pipeline.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Log analysis pipeline (CDN logs → Crawl-budget dashboard)
 *  - Top-crawled / low-value pages identified → `noindex` or block  → flagLowValue()
 *  - Crawl-stat regression alerts                                   → detectRegression()
 *
 * This is the *codeable contract*: a typed log-line model, a pure aggregation
 * function (CDN access logs → per-URL crawl frequency/value), a dashboard data
 * shape, low-value flagging, and regression detection. No network / no UI.
 *
 * Where a real metrics source plugs in: a CDN log shipper (Cloudflare Logpush,
 * Fastly, nginx access logs) emits `RawCrawlLogLine[]`; pipe it through
 * `parseCrawlLogLine` → `aggregateCrawlBudget` → `buildCrawlDashboard`.
 */

// ---------- Known crawler identification ----------

/** Search-engine bots whose crawl we want to *spend wisely*. */
export const SEARCH_BOTS = [
  { id: "googlebot", match: /googlebot/i },
  { id: "bingbot", match: /bingbot/i },
  { id: "yandexbot", match: /yandex(bot|images)/i },
  { id: "duckduckbot", match: /duckduckbot/i },
  { id: "applebot", match: /applebot/i },
] as const;

/** AI crawlers — allowed (LLMO), but tracked separately so they don't skew SEO crawl budget. */
export const AI_BOTS = [
  { id: "gptbot", match: /gptbot/i },
  { id: "claudebot", match: /claudebot|anthropic/i },
  { id: "perplexitybot", match: /perplexitybot/i },
  { id: "oai-searchbot", match: /oai-searchbot/i },
  { id: "google-extended", match: /google-extended/i },
] as const;

export type BotKind = "search" | "ai" | "other";

export type BotIdentity = {
  /** Canonical bot id, or null when not a recognised crawler. */
  id: string | null;
  kind: BotKind;
};

export function identifyBot(userAgent: string): BotIdentity {
  for (const b of SEARCH_BOTS) {
    if (b.match.test(userAgent)) return { id: b.id, kind: "search" };
  }
  for (const b of AI_BOTS) {
    if (b.match.test(userAgent)) return { id: b.id, kind: "ai" };
  }
  return { id: null, kind: "other" };
}

// ---------- Typed log-line model ----------

/** Raw access-log line as shipped by a CDN/edge before parsing. */
export type RawCrawlLogLine = {
  /** Request timestamp (ISO 8601). */
  timestamp: string;
  /** Requested path including locale prefix, query string stripped by caller or here. */
  path: string;
  /** HTTP status returned to the bot. */
  status: number;
  /** Raw User-Agent header. */
  userAgent: string;
  /** Bytes sent (for budget weighting). Optional. */
  bytes?: number;
  /** Response time in ms. Optional. */
  responseMs?: number;
};

/** Normalised, bot-classified crawl hit. */
export type CrawlHit = {
  timestamp: string;
  /** Path with query string removed and trailing slash normalised. */
  path: string;
  status: number;
  bot: BotIdentity;
  bytes: number;
  responseMs: number;
};

/** Strip query string + fragment, collapse trailing slash (except root). */
export function normalisePath(rawPath: string): string {
  let p = rawPath.split("#")[0]!.split("?")[0]!;
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p || "/";
}

export function parseCrawlLogLine(raw: RawCrawlLogLine): CrawlHit {
  return {
    timestamp: raw.timestamp,
    path: normalisePath(raw.path),
    status: raw.status,
    bot: identifyBot(raw.userAgent),
    bytes: raw.bytes ?? 0,
    responseMs: raw.responseMs ?? 0,
  };
}

// ---------- Per-URL aggregation ----------

/**
 * "Value" of a URL — how much we *want* it crawled. Supplied by the caller from
 * sitemap priority, analytics pageviews, conversions, etc. 0..1. When unknown we
 * fall back to a neutral 0.5.
 */
export type UrlValueLookup = (path: string) => number | undefined;

export type UrlCrawlStat = {
  path: string;
  /** Total bot hits in the window. */
  hits: number;
  /** Hits by recognised search bots only (the budget that matters for SEO). */
  searchHits: number;
  aiHits: number;
  /** Hits that returned an error/redirect status (3xx/4xx/5xx) — wasted budget. */
  wastedHits: number;
  /** Distinct days the URL was crawled (proxy for crawl frequency). */
  crawlDays: number;
  lastCrawledAt: string;
  totalBytes: number;
  /** 0..1 value signal supplied by caller. */
  value: number;
  /**
   * Crawl-budget efficiency: searchHits weighted against value. High hits + low
   * value = wasted budget (→ candidate for noindex/block). 0..1+, higher = more wasteful.
   */
  wasteScore: number;
};

export type CrawlBudgetReport = {
  windowStart: string;
  windowEnd: string;
  totalHits: number;
  searchHits: number;
  aiHits: number;
  otherHits: number;
  /** Per-URL stats, sorted by search crawl frequency (desc). */
  perUrl: UrlCrawlStat[];
  /** Per-bot hit counts. */
  byBot: Record<string, number>;
  /** Status-class distribution (e.g. "2xx", "3xx", "4xx", "5xx"). */
  byStatusClass: Record<string, number>;
};

function statusClass(status: number): string {
  return `${Math.floor(status / 100)}xx`;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Aggregate parsed crawl hits into a per-URL crawl-budget report. */
export function aggregateCrawlBudget(
  hits: CrawlHit[],
  valueLookup: UrlValueLookup = () => undefined,
): CrawlBudgetReport {
  const byUrl = new Map<
    string,
    {
      hits: number;
      searchHits: number;
      aiHits: number;
      wastedHits: number;
      days: Set<string>;
      last: string;
      bytes: number;
    }
  >();
  const byBot: Record<string, number> = {};
  const byStatusClass: Record<string, number> = {};
  let searchHits = 0;
  let aiHits = 0;
  let otherHits = 0;
  let windowStart = "";
  let windowEnd = "";

  for (const h of hits) {
    if (!windowStart || h.timestamp < windowStart) windowStart = h.timestamp;
    if (!windowEnd || h.timestamp > windowEnd) windowEnd = h.timestamp;

    const sc = statusClass(h.status);
    byStatusClass[sc] = (byStatusClass[sc] ?? 0) + 1;

    if (h.bot.kind === "search") searchHits++;
    else if (h.bot.kind === "ai") aiHits++;
    else otherHits++;
    if (h.bot.id) byBot[h.bot.id] = (byBot[h.bot.id] ?? 0) + 1;

    let u = byUrl.get(h.path);
    if (!u) {
      u = { hits: 0, searchHits: 0, aiHits: 0, wastedHits: 0, days: new Set(), last: h.timestamp, bytes: 0 };
      byUrl.set(h.path, u);
    }
    u.hits++;
    if (h.bot.kind === "search") u.searchHits++;
    if (h.bot.kind === "ai") u.aiHits++;
    if (h.status >= 300) u.wastedHits++;
    u.days.add(dayKey(h.timestamp));
    u.bytes += h.bytes;
    if (h.timestamp > u.last) u.last = h.timestamp;
  }

  const perUrl: UrlCrawlStat[] = [];
  for (const [path, u] of byUrl) {
    const value = clamp01(valueLookup(path) ?? 0.5);
    // Waste: frequent search crawls on low-value pages. Normalise hits by a soft
    // cap so a single mega-crawled junk page dominates the list.
    const freq = u.searchHits;
    const wasteScore = round3((freq / (freq + 5)) * (1 - value) + u.wastedHits / (u.hits || 1) * 0.5);
    perUrl.push({
      path,
      hits: u.hits,
      searchHits: u.searchHits,
      aiHits: u.aiHits,
      wastedHits: u.wastedHits,
      crawlDays: u.days.size,
      lastCrawledAt: u.last,
      totalBytes: u.bytes,
      value,
      wasteScore,
    });
  }
  perUrl.sort((a, b) => b.searchHits - a.searchHits);

  return {
    windowStart,
    windowEnd,
    totalHits: hits.length,
    searchHits,
    aiHits,
    otherHits,
    perUrl,
    byBot,
    byStatusClass,
  };
}

// ---------- Dashboard data shape ----------

export type CrawlDashboard = {
  generatedAt: string;
  summary: {
    totalHits: number;
    searchHits: number;
    aiHits: number;
    otherHits: number;
    distinctUrls: number;
    /** Share of search-bot budget spent on 3xx+ responses. 0..1. */
    wastedShare: number;
  };
  byBot: Record<string, number>;
  byStatusClass: Record<string, number>;
  /** Most-crawled URLs (top N by search hits). */
  topCrawled: UrlCrawlStat[];
  /** Low-value pages eating crawl budget (candidates for noindex/block). */
  lowValue: UrlCrawlStat[];
};

export function buildCrawlDashboard(
  report: CrawlBudgetReport,
  opts: { topN?: number; lowValueThreshold?: number } = {},
): CrawlDashboard {
  const { topN = 50, lowValueThreshold = 0.4 } = opts;
  const wasted = (report.byStatusClass["3xx"] ?? 0) +
    (report.byStatusClass["4xx"] ?? 0) +
    (report.byStatusClass["5xx"] ?? 0);
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalHits: report.totalHits,
      searchHits: report.searchHits,
      aiHits: report.aiHits,
      otherHits: report.otherHits,
      distinctUrls: report.perUrl.length,
      wastedShare: report.totalHits ? round3(wasted / report.totalHits) : 0,
    },
    byBot: report.byBot,
    byStatusClass: report.byStatusClass,
    topCrawled: report.perUrl.slice(0, topN),
    lowValue: flagLowValue(report, lowValueThreshold),
  };
}

// ---------- Low-value flagging (task 2) ----------

export type LowValueAction = "noindex" | "block";

export type LowValueFlag = UrlCrawlStat & {
  action: LowValueAction;
  reason: string;
};

/**
 * Identify top-crawled, low-value URLs and recommend `noindex` (let it be
 * crawled but drop from index) vs `block` (robots Disallow — stop the crawl
 * entirely). Block is reserved for clearly parametric/duplicate surfaces.
 */
export function flagLowValue(
  report: CrawlBudgetReport,
  wasteThreshold = 0.4,
): LowValueFlag[] {
  const flags: LowValueFlag[] = [];
  for (const u of report.perUrl) {
    if (u.wasteScore < wasteThreshold) continue;
    // Parametric / faceted / duplicate surfaces → block at robots level.
    const looksParametric = /[?&]/.test(u.path) || /\/(page|p)\/\d+$/.test(u.path);
    const action: LowValueAction = looksParametric ? "block" : "noindex";
    const reason =
      action === "block"
        ? `parametric/paginated surface, ${u.searchHits} search hits, value ${u.value}`
        : `high crawl (${u.searchHits}) vs low value (${u.value}), waste ${u.wasteScore}`;
    flags.push({ ...u, action, reason });
  }
  return flags.sort((a, b) => b.wasteScore - a.wasteScore);
}

// ---------- Regression detection (task 12) ----------

export type CrawlSnapshot = {
  /** ISO date the snapshot represents. */
  date: string;
  searchHits: number;
  distinctUrls: number;
  wastedShare: number;
};

export type CrawlRegression = {
  severity: "info" | "warning" | "critical";
  metric: "searchHits" | "distinctUrls" | "wastedShare";
  message: string;
  /** Fractional change vs baseline. */
  delta: number;
};

/**
 * Compare a current snapshot against a baseline (e.g. trailing 7-day mean) and
 * emit regression alerts. Drops in crawl coverage or spikes in wasted budget fire.
 */
export function detectRegression(
  current: CrawlSnapshot,
  baseline: CrawlSnapshot,
  opts: { dropWarn?: number; dropCrit?: number; wasteWarn?: number; wasteCrit?: number } = {},
): CrawlRegression[] {
  const { dropWarn = 0.2, dropCrit = 0.5, wasteWarn = 0.15, wasteCrit = 0.3 } = opts;
  const out: CrawlRegression[] = [];

  const hitDelta = pctChange(current.searchHits, baseline.searchHits);
  if (hitDelta <= -dropCrit) {
    out.push({ severity: "critical", metric: "searchHits", delta: round3(hitDelta), message: `Search crawl hits fell ${pct(hitDelta)} vs baseline` });
  } else if (hitDelta <= -dropWarn) {
    out.push({ severity: "warning", metric: "searchHits", delta: round3(hitDelta), message: `Search crawl hits fell ${pct(hitDelta)} vs baseline` });
  }

  const urlDelta = pctChange(current.distinctUrls, baseline.distinctUrls);
  if (urlDelta <= -dropCrit) {
    out.push({ severity: "critical", metric: "distinctUrls", delta: round3(urlDelta), message: `Distinct crawled URLs fell ${pct(urlDelta)} — coverage regression` });
  } else if (urlDelta <= -dropWarn) {
    out.push({ severity: "warning", metric: "distinctUrls", delta: round3(urlDelta), message: `Distinct crawled URLs fell ${pct(urlDelta)} — coverage regression` });
  }

  const wasteDelta = current.wastedShare - baseline.wastedShare;
  if (wasteDelta >= wasteCrit) {
    out.push({ severity: "critical", metric: "wastedShare", delta: round3(wasteDelta), message: `Wasted-crawl share rose by ${pct(wasteDelta)} (now ${pct(current.wastedShare)})` });
  } else if (wasteDelta >= wasteWarn) {
    out.push({ severity: "warning", metric: "wastedShare", delta: round3(wasteDelta), message: `Wasted-crawl share rose by ${pct(wasteDelta)} (now ${pct(current.wastedShare)})` });
  }

  return out;
}

// ---------- helpers ----------

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
function pctChange(cur: number, base: number): number {
  if (base === 0) return cur === 0 ? 0 : 1;
  return (cur - base) / base;
}
function pct(frac: number): string {
  return `${(frac * 100).toFixed(1)}%`;
}
