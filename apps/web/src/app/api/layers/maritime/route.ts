/**
 * GET /api/layers/maritime — AIS maritime vessel layer (Black Sea / Sea of Azov)
 *
 * Query params (filter facets):
 *   region        — focus zone id: black_sea | sea_of_azov | nw_black_sea | kerch_strait | danube_delta
 *   type          — vessel type: cargo | tanker | passenger | military | fishing | tugboat | ...
 *   flag          — ISO 3166-1 alpha-2 flag state (e.g. "RU", "UA", "PA")
 *   sanctions     — sanctions status: clear | ofac | eu | ofac_eu | uk | flagged
 *   ais           — AIS status: transmitting | intermittent | dark
 *   cargo         — cargo class: crude_oil | refined_products | grain | containers | ...
 *   shadowTier    — shadow-fleet tier: none | watch | likely | high
 *   minShadow     — minimum shadow-fleet score 0..1
 *   sanctionedOnly — "true" = sanctioned vessels only
 *
 * Cache: 30s (positions update near real-time)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type ShipType =
  | "cargo" | "tanker" | "passenger" | "military" | "sailing" | "pleasure"
  | "fishing" | "tugboat" | "pilot" | "sar" | "other" | "unknown";
type AisStatus = "transmitting" | "intermittent" | "dark";
type SanctionsStatus = "clear" | "ofac" | "eu" | "ofac_eu" | "uk" | "flagged";
type CargoClass =
  | "crude_oil" | "refined_products" | "lng" | "lpg" | "chemicals"
  | "dry_bulk" | "grain" | "containers" | "general_cargo" | "ro_ro"
  | "passengers" | "unknown";
type ShadowTier = "none" | "watch" | "likely" | "high";
type ZoneId = "black_sea" | "sea_of_azov" | "nw_black_sea" | "kerch_strait" | "danube_delta";

interface Vessel {
  mmsi: string;
  imo: string | null;
  shipName: string | null;
  nameEn: string | null;
  nameUk: string | null;
  shipType: ShipType;
  cargoClass: CargoClass | null;
  flag: string | null;
  flagNameEn: string | null;
  flagNameUk: string | null;
  flagOfConvenience: boolean;
  lat: number;
  lon: number;
  speedKnots: number | null;
  headingDeg: number | null;
  courseDeg: number | null;
  navStatus: string;
  destination: string | null;
  zone: ZoneId | null;
  aisStatus: AisStatus;
  sanctionsStatus: SanctionsStatus;
  sanctioned: boolean;
  sanctionsLists: string[];
  highlight: boolean;
  shadowScore: number;
  shadowTier: ShadowTier;
  titleEn: string;
  titleUk: string;
  summaryEn: string;
  summaryUk: string;
  sourceUrls: string[];
  lastReportAt: string;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_VESSELS: Vessel[] = [
  {
    mmsi: "273345678",
    imo: "9512345",
    shipName: "VOLGA STAR",
    nameEn: "Volga Star",
    nameUk: "Волга Стар",
    shipType: "tanker",
    cargoClass: "crude_oil",
    flag: "GA",
    flagNameEn: "Gabon",
    flagNameUk: "Габон",
    flagOfConvenience: true,
    lat: 45.2,
    lon: 36.55,
    speedKnots: 0.3,
    headingDeg: 210,
    courseDeg: 208,
    navStatus: "at_anchor",
    destination: "STS KAVKAZ",
    zone: "kerch_strait",
    aisStatus: "dark",
    sanctionsStatus: "ofac_eu",
    sanctioned: true,
    sanctionsLists: ["OFAC SDN", "EU Consolidated"],
    highlight: true,
    shadowScore: 0.82,
    shadowTier: "high",
    titleEn: "Sanctioned tanker 'Volga Star' at Kerch STS anchorage (AIS dark)",
    titleUk: "Підсанкційний танкер «Волга Стар» на рейді STS Керч (AIS вимкнено)",
    summaryEn: "Ageing Gabon-flagged crude tanker, OFAC + EU listed, conducting ship-to-ship transfer with AIS switched off.",
    summaryUk: "Старий танкер під прапором Габону, у списках OFAC та ЄС, виконує перевалку «судно-судно» з вимкненим AIS.",
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:273345678"],
    lastReportAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    mmsi: "272123456",
    imo: "9456789",
    shipName: "KOROLEVA",
    nameEn: "Koroleva",
    nameUk: "Королева",
    shipType: "cargo",
    cargoClass: "grain",
    flag: "UA",
    flagNameEn: "Ukraine",
    flagNameUk: "Україна",
    flagOfConvenience: false,
    lat: 46.35,
    lon: 30.9,
    speedKnots: 11.4,
    headingDeg: 195,
    courseDeg: 196,
    navStatus: "under_way_engine",
    destination: "ISTANBUL",
    zone: "nw_black_sea",
    aisStatus: "transmitting",
    sanctionsStatus: "clear",
    sanctioned: false,
    sanctionsLists: [],
    highlight: false,
    shadowScore: 0.0,
    shadowTier: "none",
    titleEn: "Grain bulk carrier 'Koroleva' outbound from Odesa",
    titleUk: "Зерновоз «Королева» виходить з Одеси",
    summaryEn: "Ukraine-flagged bulk carrier on the grain corridor, destination Istanbul.",
    summaryUk: "Балкер під прапором України на зерновому коридорі, курс на Стамбул.",
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:272123456"],
    lastReportAt: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  {
    mmsi: "273900111",
    imo: null,
    shipName: "PROJECT 22160",
    nameEn: "Naval patrol (est.)",
    nameUk: "Військовий патруль (оцінка)",
    shipType: "military",
    cargoClass: null,
    flag: "RU",
    flagNameEn: "Russia",
    flagNameUk: "Росія",
    flagOfConvenience: false,
    lat: 44.9,
    lon: 33.5,
    speedKnots: 14.0,
    headingDeg: 90,
    courseDeg: 92,
    navStatus: "under_way_engine",
    destination: null,
    zone: "black_sea",
    aisStatus: "intermittent",
    sanctionsStatus: "eu",
    sanctioned: true,
    sanctionsLists: ["EU Consolidated"],
    highlight: true,
    shadowScore: 0.0,
    shadowTier: "none",
    titleEn: "Russian naval patrol vessel, central Black Sea",
    titleUk: "Російський військовий патрульний корабель, центральне Чорне море",
    summaryEn: "Estimated Russian Black Sea Fleet patrol vessel, intermittent AIS.",
    summaryUk: "Імовірний патрульний корабель Чорноморського флоту РФ, AIS з перебоями.",
    sourceUrls: [],
    lastReportAt: new Date(Date.now() - 35 * 60_000).toISOString(),
  },
  {
    mmsi: "636019888",
    imo: "9301122",
    shipName: "ATLAS PRIDE",
    nameEn: "Atlas Pride",
    nameUk: "Атлас Прайд",
    shipType: "tanker",
    cargoClass: "refined_products",
    flag: "LR",
    flagNameEn: "Liberia",
    flagNameUk: "Ліберія",
    flagOfConvenience: true,
    lat: 44.7,
    lon: 37.78,
    speedKnots: 0.1,
    headingDeg: 300,
    courseDeg: 0,
    navStatus: "moored",
    destination: "NOVOROSSIYSK",
    zone: "black_sea",
    aisStatus: "transmitting",
    sanctionsStatus: "flagged",
    sanctioned: false,
    sanctionsLists: [],
    highlight: false,
    shadowScore: 0.5,
    shadowTier: "likely",
    titleEn: "Products tanker 'Atlas Pride' berthed at Novorossiysk",
    titleUk: "Продуктовоз «Атлас Прайд» пришвартований у Новоросійську",
    summaryEn: "Liberia-flagged products tanker loading at a Russian oil port; shadow-fleet indicators present.",
    summaryUk: "Продуктовоз під прапором Ліберії завантажується в російському нафтопорту; наявні ознаки тіньового флоту.",
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:636019888"],
    lastReportAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    mmsi: "271045300",
    imo: "9655443",
    shipName: "ANADOLU",
    nameEn: "Anadolu",
    nameUk: "Анадолу",
    shipType: "passenger",
    cargoClass: "passengers",
    flag: "TR",
    flagNameEn: "Türkiye",
    flagNameUk: "Туреччина",
    flagOfConvenience: false,
    lat: 41.4,
    lon: 36.33,
    speedKnots: 18.2,
    headingDeg: 25,
    courseDeg: 24,
    navStatus: "under_way_engine",
    destination: "SAMSUN",
    zone: "black_sea",
    aisStatus: "transmitting",
    sanctionsStatus: "clear",
    sanctioned: false,
    sanctionsLists: [],
    highlight: false,
    shadowScore: 0.0,
    shadowTier: "none",
    titleEn: "Passenger ferry 'Anadolu' approaching Samsun",
    titleUk: "Пасажирський пором «Анадолу» підходить до Самсуна",
    summaryEn: "Türkiye-flagged passenger ferry on a southern Black Sea route.",
    summaryUk: "Пасажирський пором під прапором Туреччини на південному маршруті Чорного моря.",
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:271045300"],
    lastReportAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
];

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:maritime:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region") as ZoneId | null;
  const typeFilter = url.searchParams.get("type") as ShipType | null;
  const flagFilter = url.searchParams.get("flag");
  const sanctionsFilter = url.searchParams.get("sanctions") as SanctionsStatus | null;
  const aisFilter = url.searchParams.get("ais") as AisStatus | null;
  const cargoFilter = url.searchParams.get("cargo") as CargoClass | null;
  const shadowTierFilter = url.searchParams.get("shadowTier") as ShadowTier | null;
  const minShadow = parseFloat(url.searchParams.get("minShadow") ?? "0");
  const sanctionedOnly = url.searchParams.get("sanctionedOnly") === "true";

  let vessels = DEMO_VESSELS.slice();

  if (regionFilter) vessels = vessels.filter((v) => v.zone === regionFilter);
  if (typeFilter) vessels = vessels.filter((v) => v.shipType === typeFilter);
  if (flagFilter) vessels = vessels.filter((v) => v.flag === flagFilter.toUpperCase());
  if (sanctionsFilter) vessels = vessels.filter((v) => v.sanctionsStatus === sanctionsFilter);
  if (aisFilter) vessels = vessels.filter((v) => v.aisStatus === aisFilter);
  if (cargoFilter) vessels = vessels.filter((v) => v.cargoClass === cargoFilter);
  if (shadowTierFilter) vessels = vessels.filter((v) => v.shadowTier === shadowTierFilter);
  if (minShadow > 0) vessels = vessels.filter((v) => v.shadowScore >= minShadow);
  if (sanctionedOnly) vessels = vessels.filter((v) => v.sanctioned);

  const SHIP_TYPES: ShipType[] = ["cargo", "tanker", "passenger", "military", "fishing", "tugboat", "other", "unknown"];
  const AIS_STATES: AisStatus[] = ["transmitting", "intermittent", "dark"];
  const SANCTION_STATES: SanctionsStatus[] = ["clear", "ofac", "eu", "ofac_eu", "uk", "flagged"];

  const meta = {
    total: vessels.length,
    byType: Object.fromEntries(SHIP_TYPES.map((t) => [t, vessels.filter((v) => v.shipType === t).length])),
    byAisStatus: Object.fromEntries(AIS_STATES.map((s) => [s, vessels.filter((v) => v.aisStatus === s).length])),
    bySanctionsStatus: Object.fromEntries(SANCTION_STATES.map((s) => [s, vessels.filter((v) => v.sanctionsStatus === s).length])),
    sanctionedCount: vessels.filter((v) => v.sanctioned).length,
    darkCount: vessels.filter((v) => v.aisStatus === "dark").length,
    shadowFleetCount: vessels.filter((v) => v.shadowTier === "likely" || v.shadowTier === "high").length,
    flags: Array.from(new Set(DEMO_VESSELS.map((v) => v.flag).filter(Boolean))),
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: vessels, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
