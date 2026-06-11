import "server-only";

// ---------------------------------------------------------------------------
// Synthetic Health Checks — one scheduled probe per external OSINT source
// ---------------------------------------------------------------------------

export interface SyntheticCheck {
  sourceId: string;
  name: string;
  url: string;
  expectedStatusCodes: number[];
  timeoutMs: number;
  intervalMs: number;
  headers?: Record<string, string>;
}

export interface SyntheticCheckResult {
  sourceId: string;
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
  checkedAt: string;
}

// ---------------------------------------------------------------------------
// Check registry — one entry per major public OSINT source
// ---------------------------------------------------------------------------

export const SYNTHETIC_CHECKS: SyntheticCheck[] = [
  {
    sourceId: "isw",
    name: "Institute for the Study of War",
    url: "https://www.understandingwar.org/",
    expectedStatusCodes: [200],
    timeoutMs: 10_000,
    intervalMs: 5 * 60_000,
  },
  {
    sourceId: "oryx",
    name: "Oryx Equipment Losses",
    url: "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html",
    expectedStatusCodes: [200],
    timeoutMs: 15_000,
    intervalMs: 10 * 60_000,
  },
  {
    sourceId: "deepstatemap",
    name: "DeepState Map",
    url: "https://deepstatemap.live/api/history/last",
    expectedStatusCodes: [200],
    timeoutMs: 8_000,
    intervalMs: 5 * 60_000,
  },
  {
    sourceId: "alerts-in-ua",
    name: "Alerts in UA API",
    url: "https://alerts.in.ua/api/v1/airs/active.json",
    expectedStatusCodes: [200],
    timeoutMs: 6_000,
    intervalMs: 2 * 60_000,
  },
  {
    sourceId: "ukrenergo",
    name: "Ukrenergo Outage Info",
    url: "https://ukrenergo.energy.gov.ua/",
    expectedStatusCodes: [200, 301, 302],
    timeoutMs: 10_000,
    intervalMs: 15 * 60_000,
  },
  {
    sourceId: "acled",
    name: "ACLED (Armed Conflict Location & Event Data)",
    url: "https://api.acleddata.com/acled/read.csv?limit=1&country=Ukraine",
    expectedStatusCodes: [200],
    timeoutMs: 12_000,
    intervalMs: 30 * 60_000,
    headers: {
      "Accept": "text/csv",
    },
  },
  {
    sourceId: "cert-ua",
    name: "CERT-UA",
    url: "https://cert.gov.ua/api/articles",
    expectedStatusCodes: [200],
    timeoutMs: 8_000,
    intervalMs: 10 * 60_000,
  },
  {
    sourceId: "dsns",
    name: "DSNS Ukraine (State Emergency Service)",
    url: "https://www.dsns.gov.ua/",
    expectedStatusCodes: [200, 301, 302],
    timeoutMs: 10_000,
    intervalMs: 15 * 60_000,
  },
  {
    sourceId: "un-ocha",
    name: "UN OCHA Ukraine Situation Reports",
    url: "https://www.unocha.org/ukraine",
    expectedStatusCodes: [200],
    timeoutMs: 12_000,
    intervalMs: 60 * 60_000,
  },
  {
    sourceId: "liveuamap",
    name: "LiveUAMap API",
    url: "https://liveuamap.com/",
    expectedStatusCodes: [200],
    timeoutMs: 8_000,
    intervalMs: 5 * 60_000,
  },
  {
    sourceId: "militarnyi",
    name: "Militarnyi News",
    url: "https://mil.in.ua/en/",
    expectedStatusCodes: [200],
    timeoutMs: 8_000,
    intervalMs: 10 * 60_000,
  },
  {
    sourceId: "ukrinform",
    name: "Ukrinform RSS",
    url: "https://www.ukrinform.ua/rss/block-lastnews",
    expectedStatusCodes: [200],
    timeoutMs: 8_000,
    intervalMs: 5 * 60_000,
  },
  {
    sourceId: "minusrus",
    name: "Minusrus Equipment Tracker",
    url: "https://minusrus.com/en",
    expectedStatusCodes: [200],
    timeoutMs: 10_000,
    intervalMs: 15 * 60_000,
  },
  {
    sourceId: "ukraine-world",
    name: "Ukraine World",
    url: "https://ukraineworld.org/",
    expectedStatusCodes: [200],
    timeoutMs: 10_000,
    intervalMs: 30 * 60_000,
  },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Run a single synthetic check with a per-request timeout.
 * Never throws — returns an error result on failure.
 */
export async function runCheck(check: SyntheticCheck): Promise<SyntheticCheckResult> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), check.timeoutMs);

    let statusCode: number | undefined;
    try {
      const res = await fetch(check.url, {
        method: "HEAD",
        headers: check.headers,
        signal: controller.signal,
        redirect: "follow",
      });
      statusCode = res.status;
    } finally {
      clearTimeout(timer);
    }

    const latencyMs = Date.now() - start;
    const ok = check.expectedStatusCodes.includes(statusCode);

    return { sourceId: check.sourceId, ok, latencyMs, statusCode, checkedAt };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const error =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Timeout after ${check.timeoutMs}ms`
          : err.message
        : String(err);
    return { sourceId: check.sourceId, ok: false, latencyMs, error, checkedAt };
  }
}

/**
 * Run all synthetic checks concurrently and return results.
 */
export async function runAllChecks(): Promise<SyntheticCheckResult[]> {
  return Promise.all(SYNTHETIC_CHECKS.map(runCheck));
}
