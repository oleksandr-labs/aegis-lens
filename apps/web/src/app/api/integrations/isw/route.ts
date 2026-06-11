/**
 * GET /api/integrations/isw — "ISW today" per-region summaries.
 *
 * Backs the per-region "ISW today" widget. Returns the latest ISW Russia Offensive
 * Campaign Assessment headline + assessed trend + short attributed snippets per oblast.
 *
 * Mirrors the providers in `integrations/isw/src/widget.ts` + `mentions.ts`. The route
 * ships a DEMO payload so it renders without live ISW fetches; in production the daily
 * ingest (`integrations/isw/src/daily-ingest.ts`) populates the same shape.
 *
 * Query params:
 *   region   — ISO 3166-2 oblast code (e.g. "UA-14"); omit for all front-line oblasts
 *   trend    — ru_advance | ua_advance | stable | contested | no_change
 *
 * ATTRIBUTION: every snippet carries an ISW attribution string + canonical URL,
 * and UK strings are AI-translated with `translationReview: true` (native-review debt).
 * See integrations/isw/COMPLIANCE.md.
 *
 * Cache: 1h (ISW publishes ~once per day).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Trend = "ru_advance" | "ua_advance" | "stable" | "contested" | "no_change";

interface IswSnippet {
  text: { en: string; uk: string };
  translationReview: boolean;
  attribution: string;
  url: string;
}

interface IswRegionSummary {
  oblastCode: string;
  oblastNameEn: string;
  oblastNameUk: string;
  assessmentDate: string;
  headline: { en: string; uk: string };
  trend: Trend;
  snippets: IswSnippet[];
  netRussianGainKm2: number;
  sourceUrl: string;
  translationReview: boolean;
}

const ATTRIBUTION = "Source: Institute for the Study of War (understandingwar.org)";
const ISW_URL =
  "https://www.understandingwar.org/backgrounder/russian-offensive-campaign-assessment-june-5-2026";
const ASSESSMENT_DATE = "2026-06-05";

const DEMO_SUMMARIES: IswRegionSummary[] = [
  {
    oblastCode: "UA-14",
    oblastNameEn: "Donetsk",
    oblastNameUk: "Донецька",
    assessmentDate: ASSESSMENT_DATE,
    headline: {
      en: "Russian forces made marginal confirmed advances southwest of Avdiivka.",
      uk: "російські сили зробили незначні підтверджені просування на південний захід від Авдіївки.",
    },
    trend: "ru_advance",
    snippets: [
      {
        text: {
          en: "Russian forces continued offensive operations near Pokrovsk and made marginal advances southwest of Avdiivka.",
          uk: "російські сили продовжили наступальні операції поблизу Покровська та просунулися на південний захід від Авдіївки.",
        },
        translationReview: true,
        attribution: ATTRIBUTION,
        url: ISW_URL,
      },
    ],
    netRussianGainKm2: 0.6,
    sourceUrl: ISW_URL,
    translationReview: true,
  },
  {
    oblastCode: "UA-63",
    oblastNameEn: "Kharkiv",
    oblastNameUk: "Харківська",
    assessmentDate: ASSESSMENT_DATE,
    headline: {
      en: "Ukrainian forces conducted localized counterattacks near Kupiansk.",
      uk: "українські сили провели локальні контратаки поблизу Куп'янська.",
    },
    trend: "ua_advance",
    snippets: [
      {
        text: {
          en: "Ukrainian forces conducted localized counterattacks near Kupiansk in Kharkiv Oblast.",
          uk: "українські сили провели локальні контратаки поблизу Куп'янська у Харківській області.",
        },
        translationReview: true,
        attribution: ATTRIBUTION,
        url: ISW_URL,
      },
    ],
    netRussianGainKm2: -0.3,
    sourceUrl: ISW_URL,
    translationReview: true,
  },
  {
    oblastCode: "UA-09",
    oblastNameEn: "Luhansk",
    oblastNameUk: "Луганська",
    assessmentDate: ASSESSMENT_DATE,
    headline: {
      en: "Russian claims of advances near Chasiv Yar remain unconfirmed by ISW.",
      uk: "російські заяви про просування поблизу Часового Яру залишаються непідтвердженими ISW.",
    },
    trend: "contested",
    snippets: [
      {
        text: {
          en: "Russian milbloggers claimed advances near Chasiv Yar, though ISW has not observed confirmation.",
          uk: "російські воєнблогери заявили про просування поблизу Часового Яру, проте ISW не спостерігав підтвердження.",
        },
        translationReview: true,
        attribution: ATTRIBUTION,
        url: ISW_URL,
      },
    ],
    netRussianGainKm2: 0,
    sourceUrl: ISW_URL,
    translationReview: true,
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:isw:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const trendFilter = url.searchParams.get("trend") as Trend | null;

  let data = DEMO_SUMMARIES;
  if (regionFilter) data = data.filter((s) => s.oblastCode === regionFilter);
  if (trendFilter) data = data.filter((s) => s.trend === trendFilter);

  const meta = {
    total: data.length,
    assessmentDate: ASSESSMENT_DATE,
    source: "Institute for the Study of War",
    attribution: ATTRIBUTION,
    sourceUrl: ISW_URL,
    /** UK strings are AI-translated and awaiting native review. */
    translationReview: true,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
