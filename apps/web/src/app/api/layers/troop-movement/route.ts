/**
 * GET /api/layers/troop-movement — verified, post-event troop / unit movement.
 *
 * THE MOST ETHICALLY LOADED LAYER. Hard policy enforced here:
 *   - This route serves the PUBLIC (delayed + fuzzed) view only. Records are
 *     NEVER live, NEVER targeting-grade, NEVER precise.
 *   - DEMO records below are already DELAYED (occurred ≥ days ago) and FUZZED
 *     (coarse centroids only, no precise coordinates).
 *   - Records are only returned when editorially APPROVED, `isPublic`, and past
 *     their `publishableAt` instant (fail-closed on every condition).
 *
 * Query params (filter facets):
 *   side    — ua | ru
 *   branch  — ground | armor | artillery | air | air_defense | naval | airborne | marines | logistics | unknown
 *   era     — current | donbas_2014 | historical
 *   region  — ISO 3166-2 oblast code
 *
 * Cache: 300s (this layer changes slowly and is deliberately stale).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types (local mirror — kept in sync with @ua-map/integration-troop-movement) ─

type Side = "ua" | "ru";
type Branch =
  | "ground" | "armor" | "artillery" | "air" | "air_defense"
  | "naval" | "airborne" | "marines" | "logistics" | "unknown";
type Era = "current" | "donbas_2014" | "historical";
type BearingBucket = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
type PublishState = "draft" | "in_review" | "approved" | "rejected" | "retracted";

interface TroopMovementRecord {
  reportId: string;
  side: Side;
  branch: Branch;
  era: Era;
  unitId: string;
  unitNameEn: string;
  unitNameUk: string;
  /** FUZZED centroid only — coarse, never precise. */
  fuzzedLat: number;
  fuzzedLon: number;
  fuzzRadiusM: number;
  bearing?: { bucket: BearingBucket; confidence: "low" | "medium" | "high" };
  occurredAt: string;
  publishableAt: string;
  country: string;
  regionCode?: string;
  sourceUrls: string[];
  mediaUrls?: string[];
  titleEn?: string;
  titleUk?: string;
  equipmentRefs?: string[];
  publishState: PublishState;
  isPublic: boolean;
}

// ── Demo data — already DELAYED + FUZZED + editorially APPROVED ─────────────────

const DAY = 24 * 3600_000;

const DEMO_RECORDS: TroopMovementRecord[] = [
  {
    reportId: "tm-001",
    side: "ua",
    branch: "ground",
    era: "current",
    unitId: "ua-47-mech",
    unitNameEn: "47th Separate Mechanised Brigade",
    unitNameUk: "47-ма окрема механізована бригада",
    fuzzedLat: 48.6, // coarse centroid (~1 dp), fuzzed
    fuzzedLon: 37.9,
    fuzzRadiusM: 15000,
    bearing: { bucket: "E", confidence: "medium" },
    occurredAt: new Date(Date.now() - 6 * DAY).toISOString(),
    publishableAt: new Date(Date.now() - 3 * DAY).toISOString(),
    country: "UA",
    regionCode: "UA-14",
    sourceUrls: ["https://www.understandingwar.org/", "https://en.wikipedia.org/wiki/47th_Separate_Mechanized_Brigade_(Ukraine)"],
    mediaUrls: ["https://example.org/media/tm-001.jpg"],
    titleEn: "47th Mechanised Brigade rotation reported, Donetsk Oblast (general area)",
    titleUk: "Повідомлення про ротацію 47-ї механізованої бригади, Донецька область (загальний район)",
    equipmentRefs: ["equip-m2-bradley", "equip-leopard-2a6"],
    publishState: "approved",
    isPublic: true,
  },
  {
    reportId: "tm-002",
    side: "ru",
    branch: "armor",
    era: "current",
    unitId: "ru-1-tank-army",
    unitNameEn: "1st Guards Tank Army",
    unitNameUk: "1-ша гвардійська танкова армія",
    fuzzedLat: 50.0,
    fuzzedLon: 37.5,
    fuzzRadiusM: 20000,
    bearing: { bucket: "SW", confidence: "low" },
    occurredAt: new Date(Date.now() - 9 * DAY).toISOString(),
    publishableAt: new Date(Date.now() - 6 * DAY).toISOString(),
    country: "UA",
    regionCode: "UA-63",
    sourceUrls: ["https://www.understandingwar.org/", "https://en.wikipedia.org/wiki/1st_Guards_Tank_Army"],
    mediaUrls: ["https://example.org/media/tm-002.jpg"],
    titleEn: "1st Guards Tank Army elements reported north of Kharkiv (general area)",
    titleUk: "Повідомлення про підрозділи 1-ї гвардійської танкової армії на північ від Харкова (загальний район)",
    equipmentRefs: ["equip-t-90m", "equip-t-80bvm"],
    publishState: "approved",
    isPublic: true,
  },
  {
    reportId: "tm-003",
    side: "ua",
    branch: "airborne",
    era: "donbas_2014",
    unitId: "ua-80-airborne",
    unitNameEn: "80th Separate Air Assault Brigade",
    unitNameUk: "80-та окрема десантно-штурмова бригада",
    fuzzedLat: 48.9,
    fuzzedLon: 38.5,
    fuzzRadiusM: 25000,
    occurredAt: new Date(Date.now() - 30 * DAY).toISOString(),
    publishableAt: new Date(Date.now() - 27 * DAY).toISOString(),
    country: "UA",
    regionCode: "UA-09",
    sourceUrls: ["https://www.understandingwar.org/", "https://example.org/oob/80odshbr"],
    mediaUrls: ["https://example.org/media/tm-003.jpg"],
    titleEn: "80th Air Assault Brigade historical deployment, Luhansk Oblast (general area)",
    titleUk: "Історичне розгортання 80-ї десантно-штурмової бригади, Луганська область (загальний район)",
    equipmentRefs: ["equip-bmd-2"],
    publishState: "approved",
    isPublic: true,
  },
];

// ── Fail-closed public gate ─────────────────────────────────────────────────────

function isPubliclyServable(r: TroopMovementRecord, now: number): boolean {
  if (r.publishState !== "approved") return false; // editorial gate
  if (r.isPublic !== true) return false;            // delay-policy flag
  const t = new Date(r.publishableAt).getTime();
  if (Number.isNaN(t) || now < t) return false;     // delay not yet elapsed
  return true;
}

// ── Handler ─────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:troop-movement:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const sideFilter = url.searchParams.get("side") as Side | null;
  const branchFilter = url.searchParams.get("branch") as Branch | null;
  const eraFilter = url.searchParams.get("era") as Era | null;
  const regionFilter = url.searchParams.get("region");

  const now = Date.now();

  // Fail-closed: only delayed + fuzzed + editorially-approved public records.
  let records = DEMO_RECORDS.filter((r) => isPubliclyServable(r, now));

  if (sideFilter) records = records.filter((r) => r.side === sideFilter);
  if (branchFilter) records = records.filter((r) => r.branch === branchFilter);
  if (eraFilter) records = records.filter((r) => r.era === eraFilter);
  if (regionFilter) records = records.filter((r) => r.regionCode === regionFilter);

  const meta = {
    total: records.length,
    bySide: Object.fromEntries(
      (["ua", "ru"] as Side[]).map((s) => [s, records.filter((r) => r.side === s).length]),
    ),
    byBranch: Object.fromEntries(
      (["ground","armor","artillery","air","air_defense","naval","airborne","marines","logistics","unknown"] as Branch[])
        .map((b) => [b, records.filter((r) => r.branch === b).length]),
    ),
    byEra: Object.fromEntries(
      (["current","donbas_2014","historical"] as Era[]).map((e) => [e, records.filter((r) => r.era === e).length]),
    ),
    // Transparency: these records are deliberately delayed + fuzzed.
    policy: { delayed: true, fuzzed: true, precise: false, live: false, targetingGrade: false },
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: records, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
