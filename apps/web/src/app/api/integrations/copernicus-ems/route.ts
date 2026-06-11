/**
 * GET /api/integrations/copernicus-ems — Copernicus EMS crisis-mapping surface.
 *
 * Feeds the proposed `crisis_mapping` map layer (EMS flood-extent / burn-scar /
 * damage-grading polygons), per-region activation banners, and report/investigation
 * citations. Source: Copernicus Emergency Management Service (public-domain EU
 * open data — mandatory Copernicus attribution).
 *
 * Query params:
 *   view     — "layer" (default) | "banners" | "activations" | "citations"
 *   country  — ISO 3166-1 alpha-2 (default UA)
 *   oblast   — oblast pcode (e.g. UA14) for the "banners" view
 *
 * Backed by the @ua-map/copernicus-ems package; types + demo fixtures are mirrored
 * here (no secrets, no @ua-map path alias in apps/web — same pattern as un-ocha).
 * Access tier: public. Cache 1h (EMS products publish on activation, not live).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ATTRIBUTION = {
  en: "Contains modified Copernicus Emergency Management Service information [2026]",
  uk: "Містить оброблену інформацію Служби управління надзвичайними ситуаціями Copernicus [2026]",
};

// ── Demo activations (mirror @ua-map/copernicus-ems — public-domain EMS) ─────────

interface Activation {
  code: string;
  hazard: "flood" | "fire" | "conflict" | "industrial" | "other";
  status: "ongoing" | "completed" | "closed";
  title: string;
  countries: string[];
  activatedAt: string;
  centroid: [number, number];
  url: string;
}

const ACTIVATIONS: Activation[] = [
  { code: "EMSR700", hazard: "conflict", status: "ongoing",   title: "Conflict damage assessment in eastern Ukraine", countries: ["UA"], activatedAt: "2026-05-28T08:00:00Z", centroid: [37.8, 48.02], url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700" },
  { code: "EMSR698", hazard: "flood",    status: "ongoing",   title: "Flooding along the Dnipro river, Ukraine",     countries: ["UA"], activatedAt: "2026-05-20T06:30:00Z", centroid: [35.04, 48.46], url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698" },
  { code: "EMSR695", hazard: "fire",     status: "completed", title: "Wildfires in southern Ukraine",                countries: ["UA"], activatedAt: "2026-05-12T11:15:00Z", centroid: [35.14, 47.0],  url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR695" },
];

// Per-activation vector outputs → crisis_mapping features.
interface CrisisFeature {
  type: "Feature";
  geometry:
    | { type: "Polygon"; coordinates: Array<Array<[number, number]>> }
    | { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

const FEATURES: CrisisFeature[] = [
  {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[34.95, 48.35], [35.15, 48.35], [35.15, 48.55], [34.95, 48.55], [34.95, 48.35]]] },
    properties: { activationCode: "EMSR698", aoiId: "AOI01", hazard: "flood", kind: "flood_extent", notation: "observed_flood_extent", url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698", releasedAt: "2026-05-20T18:00:00Z", source: "Copernicus EMS" },
  },
  {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[35.05, 46.85], [35.35, 46.85], [35.35, 47.15], [35.05, 47.15], [35.05, 46.85]]] },
    properties: { activationCode: "EMSR695", aoiId: "AOI01", hazard: "fire", kind: "burn_scar", notation: "burnt_area", url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR695", releasedAt: "2026-05-12T20:00:00Z", source: "Copernicus EMS" },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [37.81, 48.02] },
    properties: { activationCode: "EMSR700", aoiId: "AOI01", hazard: "conflict", kind: "damage_grade", grade: "destroyed", url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700", releasedAt: "2026-05-29T09:00:00Z", source: "Copernicus EMS" },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [37.82, 48.03] },
    properties: { activationCode: "EMSR700", aoiId: "AOI01", hazard: "conflict", kind: "damage_grade", grade: "damaged", url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700", releasedAt: "2026-05-29T09:00:00Z", source: "Copernicus EMS" },
  },
];

const OBLAST_CENTROIDS: Record<string, [number, number]> = {
  UA14: [37.8, 48.02], UA12: [35.04, 48.46], UA23: [35.14, 47.84], UA65: [32.6, 46.65], UA63: [36.23, 49.99],
};

const HAZARD_LABELS: Record<string, { en: string; uk: string }> = {
  flood: { en: "Flood", uk: "Повінь" },
  fire: { en: "Wildfire", uk: "Лісова пожежа" },
  conflict: { en: "Conflict / war damage", uk: "Воєнні руйнування" },
  industrial: { en: "Industrial accident", uk: "Промислова аварія" },
  other: { en: "Other hazard", uk: "Інша загроза" },
};

function flatDistanceKm(a: [number, number], b: [number, number]): number {
  const latMean = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  const dx = (a[0] - b[0]) * 111.32 * Math.cos(latMean);
  const dy = (a[1] - b[1]) * 110.57;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildLayer(country: string) {
  const codes = new Set(ACTIVATIONS.filter((a) => a.countries.includes(country)).map((a) => a.code));
  return {
    type: "FeatureCollection" as const,
    features: FEATURES.filter((f) => codes.has(f.properties.activationCode as string)),
  };
}

function buildBanners(oblast: string | null) {
  const pcodes = oblast ? [oblast] : Object.keys(OBLAST_CENTROIDS);
  const out: Record<string, unknown[]> = {};
  for (const pcode of pcodes) {
    const center = OBLAST_CENTROIDS[pcode];
    if (!center) continue;
    const banners = ACTIVATIONS.filter((a) => flatDistanceKm(a.centroid, center) <= 200).map((a) => {
      const hz = HAZARD_LABELS[a.hazard];
      const severity = a.status === "completed" || a.status === "closed" ? "info" : a.hazard === "conflict" || a.hazard === "flood" ? "critical" : "warning";
      return {
        activationCode: a.code,
        hazard: a.hazard,
        severity,
        title: { en: `Copernicus EMS active: ${hz.en} (${a.code})`, uk: `Активна карта Copernicus EMS: ${hz.uk} (${a.code})` },
        body: { en: `${a.title}. Authoritative EU crisis mapping is available for this area.`, uk: `${a.title}. Для цієї території доступне офіційне кризове картографування ЄС.` },
        url: a.url,
        region: pcode,
      };
    });
    if (banners.length) out[pcode] = banners;
  }
  return out;
}

function buildCitations() {
  const capturedAt = new Date().toISOString();
  return ACTIVATIONS.map((a) => ({
    sourceId: `Copernicus EMS — ${a.code}`,
    publisher: "Copernicus Emergency Management Service",
    license: "public-domain",
    url: a.url,
    attribution: ATTRIBUTION,
    capturedAt,
    activationCode: a.code,
    reference: {
      en: `Copernicus Emergency Management Service (© ${new Date(a.activatedAt).getUTCFullYear()} European Union), [${a.code}] ${a.title}. ${a.url} (accessed ${capturedAt.slice(0, 10)}).`,
      uk: `Служба управління надзвичайними ситуаціями Copernicus (© ${new Date(a.activatedAt).getUTCFullYear()} Європейський Союз), [${a.code}] ${a.title}. ${a.url} (доступ ${capturedAt.slice(0, 10)}).`,
    },
  }));
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:copernicus-ems:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "layer";
  const country = url.searchParams.get("country") ?? "UA";
  const oblast = url.searchParams.get("oblast");

  let data: unknown;
  if (view === "banners") data = buildBanners(oblast);
  else if (view === "activations") data = ACTIVATIONS.filter((a) => a.countries.includes(country));
  else if (view === "citations") data = buildCitations();
  else data = buildLayer(country);

  return NextResponse.json(
    {
      view,
      country,
      data,
      meta: {
        layer: "crisis_mapping",
        source: "Copernicus Emergency Management Service",
        attribution: ATTRIBUTION,
        license: "public-domain (Copernicus open data)",
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
