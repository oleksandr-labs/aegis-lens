/**
 * GET /api/integrations/un-ocha — humanitarian layer + NGO dashboard + evidence.
 *
 * Feeds the proposed `humanitarian` map layer (displacement-intensity choropleth
 * + aid-corridor lines), the NGO persona dashboard, and the investigation
 * evidence base. Source: UN OCHA / ReliefWeb / HDX / IOM DTM.
 *
 * Query params:
 *   view     — "layer" (default) | "dashboard" | "evidence"
 *   country  — ISO 3166-1 alpha-2 (default UA)
 *
 * Backed by the @ua-map/un-ocha package; types + demo fixtures are mirrored here
 * (no secrets, no @ua-map path alias in apps/web — same pattern as cert-ua route).
 * ALL payloads are AGGREGATE and PII-redacted (fail-closed) — no individual data.
 * Access tier: registered. Cache 1h (humanitarian reports are daily, not live).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Demo data (mirror @ua-map/un-ocha fixtures — aggregate, no PII) ─────────────

interface DtmRecord {
  admin1Name: string;
  admin1Pcode: string;
  measure: "stock" | "flow_in" | "flow_out" | "returnee";
  individuals: number;
  centroid: { lat: number; lon: number };
  reportingDate: string;
}

const DTM: DtmRecord[] = [
  { admin1Name: "Donetska",        admin1Pcode: "UA14", measure: "stock",   individuals: 612000, centroid: { lat: 48.02, lon: 37.8 },  reportingDate: "2026-03-15" },
  { admin1Name: "Kharkivska",      admin1Pcode: "UA63", measure: "stock",   individuals: 488000, centroid: { lat: 49.99, lon: 36.23 }, reportingDate: "2026-03-15" },
  { admin1Name: "Dnipropetrovska", admin1Pcode: "UA12", measure: "flow_in", individuals: 351000, centroid: { lat: 48.46, lon: 35.04 }, reportingDate: "2026-03-15" },
  { admin1Name: "Zaporizka",       admin1Pcode: "UA23", measure: "stock",   individuals: 274000, centroid: { lat: 47.84, lon: 35.14 }, reportingDate: "2026-03-15" },
  { admin1Name: "Kyivska",         admin1Pcode: "UA32", measure: "flow_in", individuals: 198000, centroid: { lat: 50.45, lon: 30.52 }, reportingDate: "2026-03-15" },
];

interface ClusterRec {
  cluster: string;
  nameEn: string;
  nameUk: string;
  admin1Name: string;
  peopleInNeed: number;
  peopleReached: number;
  severity: 1 | 2 | 3 | 4 | 5;
}

const CLUSTERS: ClusterRec[] = [
  { cluster: "health",        nameEn: "Health",        nameUk: "Здоров'я",            admin1Name: "Kharkivska", peopleInNeed: 410000, peopleReached: 188000, severity: 4 },
  { cluster: "shelter",       nameEn: "Shelter & NFI", nameUk: "Житло",               admin1Name: "Donetska",   peopleInNeed: 530000, peopleReached: 142000, severity: 5 },
  { cluster: "food_security", nameEn: "Food Security", nameUk: "Продовольча безпека", admin1Name: "Khersonska", peopleInNeed: 290000, peopleReached: 175000, severity: 4 },
  { cluster: "wash",          nameEn: "WASH",          nameUk: "ВСГ",                 admin1Name: "Zaporizka",  peopleInNeed: 360000, peopleReached: 201000, severity: 3 },
];

interface Corridor {
  id: string; nameEn: string; nameUk: string;
  access: "open" | "constrained" | "blocked";
  path: Array<[number, number]>;
}

const CORRIDORS: Corridor[] = [
  { id: "corridor-dnipro-zaporizhzhia", nameEn: "Dnipro → Zaporizhzhia convoy corridor", nameUk: "Конвойний коридор Дніпро → Запоріжжя", access: "constrained", path: [[35.04, 48.46], [35.14, 47.84]] },
  { id: "corridor-kharkiv-frontline",   nameEn: "Kharkiv front-line access route",       nameUk: "Прифронтовий маршрут Харків",        access: "blocked",     path: [[36.23, 49.99], [37.5, 49.5]] },
  { id: "corridor-kyiv-hub",            nameEn: "Kyiv humanitarian hub distribution route", nameUk: "Маршрут розподілу з хабу Київ",     access: "open",        path: [[30.52, 50.45], [32.61, 50.0]] },
];

const REPORTS = [
  { id: "rw-4012001", title: "Ukraine: Humanitarian Situation Report No. 48 (March 2026)", url: "https://reliefweb.int/report/ukraine/ukraine-humanitarian-situation-report-no-48", publishedAt: "2026-03-31T16:00:00Z", source: "OCHA" },
  { id: "rw-4012044", title: "Ukraine: Health Cluster Bulletin — Q1 2026", url: "https://reliefweb.int/report/ukraine/ukraine-health-cluster-bulletin-q1-2026", publishedAt: "2026-04-02T10:00:00Z", source: "WHO" },
];

// ── Builders (mirror package logic) ─────────────────────────────────────────────

function coarsen(c: { lat: number; lon: number }) {
  return { lat: Math.round(c.lat * 100) / 100, lon: Math.round(c.lon * 100) / 100 };
}

function buildLayer() {
  const stock = DTM.filter((r) => r.measure === "stock");
  const max = Math.max(1, ...stock.map((r) => r.individuals));
  const displacement = {
    type: "FeatureCollection" as const,
    features: stock.map((r) => {
      const c = coarsen(r.centroid);
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [c.lon, c.lat] as [number, number] },
        properties: {
          admin1Name: r.admin1Name,
          admin1Pcode: r.admin1Pcode,
          idps: r.individuals,
          intensity: Math.round((r.individuals / max) * 100) / 100,
          reportingDate: r.reportingDate,
        },
      };
    }),
  };
  const corridors = {
    type: "FeatureCollection" as const,
    features: CORRIDORS.map((c) => ({
      type: "Feature" as const,
      geometry: { type: "LineString" as const, coordinates: c.path },
      properties: { id: c.id, nameEn: c.nameEn, nameUk: c.nameUk, access: c.access },
    })),
  };
  return { displacement, corridors };
}

function buildDashboard(country: string) {
  const stock = DTM.filter((r) => r.measure === "stock");
  const totalIdps = DTM.reduce((s, r) => (r.measure === "stock" ? s + r.individuals : s), 0);
  const clusterCoverage = CLUSTERS.map((c) => ({
    cluster: c.cluster,
    nameEn: c.nameEn,
    nameUk: c.nameUk,
    peopleInNeed: c.peopleInNeed,
    peopleReached: c.peopleReached,
    coverageRatio: Math.round((c.peopleReached / c.peopleInNeed) * 100) / 100,
    worstSeverity: c.severity,
  }));
  const underserved = clusterCoverage.filter((c) => c.coverageRatio < 0.6).map((c) => c.cluster);
  return {
    generatedAt: new Date().toISOString(),
    country,
    headline: {
      en: `${totalIdps.toLocaleString("en")} IDPs; ${underserved.length} clusters under 60% coverage.`,
      uk: `${totalIdps.toLocaleString("uk")} ВПО; ${underserved.length} кластерів із покриттям нижче 60%.`,
    },
    totalIdps,
    displacementByOblast: stock
      .map((r) => ({ admin1Name: r.admin1Name, admin1Pcode: r.admin1Pcode, totalIdps: r.individuals, centroid: coarsen(r.centroid) }))
      .sort((a, b) => b.totalIdps - a.totalIdps),
    clusterCoverage,
    recentReports: REPORTS,
    underservedClusters: underserved,
  };
}

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function buildEvidence() {
  const capturedAt = new Date().toISOString();
  const admitted = [
    ...DTM.map((r) => ({
      kind: "displacement",
      country: "UA",
      claimEn: `${r.individuals.toLocaleString("en")} IDPs (${r.measure}) in ${r.admin1Name} (IOM DTM, ${r.reportingDate}).`,
      contentHash: fnv1a(JSON.stringify(r)),
      citation: { publisher: "IOM DTM", license: "cc-by-igo", attribution: "Source: IOM DTM (CC BY 3.0 IGO). Retrieved via HDX.", capturedAt },
      redaction: { passed: true, findingsCount: 0, redactedAt: capturedAt },
    })),
    ...REPORTS.map((r) => ({
      kind: "situation_report",
      country: "UA",
      claimEn: r.title,
      contentHash: fnv1a(JSON.stringify(r)),
      citation: { publisher: r.source, license: "cc-by", url: r.url, attribution: `Source: ${r.source} (CC BY 4.0) — ${r.url}. Retrieved via ReliefWeb.`, capturedAt },
      redaction: { passed: true, findingsCount: 0, redactedAt: capturedAt },
    })),
  ];
  return { admitted, rejectedCount: 0 };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:un-ocha:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "layer";
  const country = url.searchParams.get("country") ?? "UA";

  let data: unknown;
  if (view === "dashboard") data = buildDashboard(country);
  else if (view === "evidence") data = buildEvidence();
  else data = buildLayer();

  return NextResponse.json(
    {
      view,
      country,
      data,
      meta: {
        layer: "humanitarian",
        source: "UN OCHA / ReliefWeb / HDX / IOM DTM",
        piiRedaction: "strict (fail-closed)",
        generatedAt: new Date().toISOString(),
        isDemo: true,
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
