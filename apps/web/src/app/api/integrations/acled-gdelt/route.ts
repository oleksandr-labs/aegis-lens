/**
 * GET /api/integrations/acled-gdelt — academic event-dataset trends + catalog.
 *
 * Powers the TREND pages and the DATASETS page (cross-referenced ACLED / GDELT /
 * UCDP). This is NOT a map layer — no GeoJSON, no live coordinates surfaced.
 *
 * IMPORTANT (licensing): ACLED raw rows are NOT republishable. This route only
 * returns DERIVED/AGGREGATED metrics + the dataset catalog + per-dataset
 * citations. It never emits raw ACLED events. (See
 * integrations/acled-gdelt/COMPLIANCE.md.)
 *
 * Query params:
 *   country      — ISO2 (default "UA")
 *   granularity  — year | month | week (default "year")
 *   dataset      — acled | gdelt | ucdp (optional; omitted = all)
 *   view         — trends | datasets | citations (default "trends")
 *
 * The web app does not have a path alias for the @ua-map/acled-gdelt package, so
 * (matching the missiles route precedent) the demo aggregates + catalog metadata
 * are mirrored inline here. The package remains the source of truth for ingest.
 *
 * Cache: 1h (academic datasets update daily→annually).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type DatasetId = "acled" | "gdelt" | "ucdp";
type Granularity = "year" | "month" | "week";

interface L10n { en: string; uk: string }

interface TrendPoint { period: string; events: number; fatalities: number; avgTone?: number }
interface TrendSeries { dataset: DatasetId; country: string; granularity: Granularity; points: TrendPoint[] }

interface CatalogEntry {
  id: DatasetId;
  name: L10n;
  publisher: L10n;
  coverageSinceYear: number;
  updateCadence: L10n;
  licenseTier: "open" | "attribution" | "academic" | "commercial";
  rawRepublishable: boolean;
  homepageUrl: string;
  crossReference: DatasetId[];
}

// ── Dataset catalog (mirror of integrations/acled-gdelt/src/datasets.ts) ───────

const CATALOG: Record<DatasetId, CatalogEntry> = {
  acled: {
    id: "acled",
    name: { en: "ACLED — Armed Conflict Location & Event Data", uk: "ACLED — дані про події збройних конфліктів" },
    publisher: { en: "ACLED Project", uk: "Проєкт ACLED" },
    coverageSinceYear: 2018,
    updateCadence: { en: "Weekly", uk: "Щотижня" },
    licenseTier: "attribution",
    rawRepublishable: false,
    homepageUrl: "https://acleddata.com",
    crossReference: ["ucdp", "gdelt"],
  },
  gdelt: {
    id: "gdelt",
    name: { en: "GDELT — Global Database of Events, Language, and Tone", uk: "GDELT — глобальна база подій, мови та тональності" },
    publisher: { en: "The GDELT Project", uk: "Проєкт GDELT" },
    coverageSinceYear: 2015,
    updateCadence: { en: "Every 15 minutes", uk: "Кожні 15 хвилин" },
    licenseTier: "open",
    rawRepublishable: true,
    homepageUrl: "https://www.gdeltproject.org",
    crossReference: ["acled", "ucdp"],
  },
  ucdp: {
    id: "ucdp",
    name: { en: "UCDP — Uppsala Conflict Data Program", uk: "UCDP — програма даних про конфлікти Уппсали" },
    publisher: { en: "Uppsala University", uk: "Уппсальський університет" },
    coverageSinceYear: 1989,
    updateCadence: { en: "Annual", uk: "Щорічно" },
    licenseTier: "open",
    rawRepublishable: true,
    homepageUrl: "https://ucdp.uu.se",
    crossReference: ["acled", "gdelt"],
  },
};

// ── Demo derived (aggregated) trend series — UA, yearly ────────────────────────
// NOTE: aggregates only. No raw rows, satisfying ACLED's republication restriction.

const DEMO_TRENDS: Record<DatasetId, TrendSeries> = {
  acled: {
    dataset: "acled", country: "UA", granularity: "year",
    points: [
      { period: "2021", events: 4120, fatalities: 380 },
      { period: "2022", events: 38400, fatalities: 24100 },
      { period: "2023", events: 41200, fatalities: 19800 },
      { period: "2024", events: 39600, fatalities: 17400 },
    ],
  },
  gdelt: {
    dataset: "gdelt", country: "UA", granularity: "year",
    points: [
      { period: "2021", events: 21000, fatalities: 0, avgTone: -3.1 },
      { period: "2022", events: 184000, fatalities: 0, avgTone: -7.8 },
      { period: "2023", events: 162000, fatalities: 0, avgTone: -6.9 },
      { period: "2024", events: 151000, fatalities: 0, avgTone: -6.4 },
    ],
  },
  ucdp: {
    dataset: "ucdp", country: "UA", granularity: "year",
    points: [
      { period: "2021", events: 980, fatalities: 1100 },
      { period: "2022", events: 12400, fatalities: 28000 },
      { period: "2023", events: 11800, fatalities: 21000 },
    ],
  },
};

// UCDP historical baseline (pre-2022 mean) for spike context.
const UCDP_BASELINE = {
  country: "UA",
  window: "2015–2021",
  meanFatalitiesPerYear: 1050,
  note: {
    en: "Pre-2022 UCDP baseline; 2022+ activity is far above the historical mean.",
    uk: "Базова лінія UCDP до 2022 р.; активність із 2022 р. значно перевищує історичне середнє.",
  } as L10n,
};

function coverageNote(country: string, year: number): L10n {
  const since = CATALOG.acled.coverageSinceYear;
  return year >= since
    ? { en: `ACLED covers ${country} for ${year}.`, uk: `ACLED охоплює ${country} за ${year} р.` }
    : {
        en: `ACLED coverage for ${country} begins in ${since}.`,
        uk: `Покриття ACLED для ${country} починається з ${since} р.`,
      };
}

function buildCitation(id: DatasetId, accessedAt: string): { datasetId: DatasetId; textEn: string; textUk: string; rawRepublishable: boolean } {
  const ds = CATALOG[id];
  const date = accessedAt.slice(0, 10);
  return {
    datasetId: id,
    textEn: `${ds.publisher.en}. ${ds.name.en}. ${ds.homepageUrl}. Accessed ${date}.`,
    textUk: `${ds.publisher.uk}. ${ds.name.uk}. ${ds.homepageUrl}. Дата доступу: ${date}.`,
    rawRepublishable: ds.rawRepublishable,
  };
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:acled-gdelt:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const country = (url.searchParams.get("country") ?? "UA").toUpperCase();
  const granularity = (url.searchParams.get("granularity") ?? "year") as Granularity;
  const datasetParam = url.searchParams.get("dataset") as DatasetId | null;
  const view = url.searchParams.get("view") ?? "trends";
  const accessedAt = new Date().toISOString();

  const datasetIds: DatasetId[] = datasetParam && CATALOG[datasetParam]
    ? [datasetParam]
    : ["acled", "gdelt", "ucdp"];

  const citations = datasetIds.map((id) => buildCitation(id, accessedAt));

  let body: Record<string, unknown>;

  if (view === "datasets") {
    body = {
      view: "datasets",
      datasets: datasetIds.map((id) => CATALOG[id]),
      citations,
    };
  } else if (view === "citations") {
    body = { view: "citations", citations };
  } else {
    // trends (default) — derived aggregates only
    body = {
      view: "trends",
      country,
      granularity,
      series: Object.fromEntries(
        datasetIds.map((id) => [id, DEMO_TRENDS[id]]),
      ),
      baseline: UCDP_BASELINE,
      coverageNote: coverageNote(country, new Date().getUTCFullYear()),
      citations,
      notice: {
        en: "Aggregated metrics only. ACLED raw rows are not republished (licence).",
        uk: "Лише агреговані показники. Необроблені рядки ACLED не публікуються (ліцензія).",
      },
    };
  }

  return NextResponse.json(
    {
      data: body,
      meta: {
        generatedAt: accessedAt,
        isDemo: true,
        layer: null, // not a map layer — powers trend/datasets pages
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
