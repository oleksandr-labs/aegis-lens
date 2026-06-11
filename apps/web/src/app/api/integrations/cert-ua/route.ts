/**
 * GET /api/integrations/cert-ua — CERT-UA + SSSCIP cyber-incident feed.
 *
 * Serves enriched cyber advisories, a per-region intensity model for the
 * `cyber_incidents` map layer, a feed-widget payload, and per-sector roll-ups.
 *
 * Query params:
 *   view     — "advisories" (default) | "layer" | "widget" | "sectors"
 *   sector   — energy | telecom | finance | gov | media | transport | defense | healthcare
 *   severity — info | low | medium | high | critical (min severity)
 *   region   — ISO 3166-2 oblast code
 *   limit    — max advisories (widget/advisories views)
 *
 * IMPORTANT — RETROSPECTIVE: this feed lags the underlying activity by DAYS.
 * Cache 6h; never present as real-time. Backed by the @ua-map/cert-ua package
 * demo fixtures here (no secrets); the daily ingest pipeline replaces these in prod.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types (mirror @ua-map/cert-ua) ──────────────────────────────────────────────

type Sector = "energy" | "telecom" | "finance" | "gov" | "media" | "transport" | "defense" | "healthcare" | "other";
type Severity = "info" | "low" | "medium" | "high" | "critical";
const SEVERITY_RANK: Record<Severity, number> = { info: 1, low: 2, medium: 3, high: 4, critical: 5 };

interface Advisory {
  advisoryId: string;
  source: "cert_ua" | "ssscip" | "misp";
  titleUk: string;
  titleEn: string;
  bodyText: string;
  url: string;
  publishedAt: string;
  occurredAt?: string;
  severity: Severity;
  sectors: Sector[];
  regions: string[];
  actor?: string;
  iocCount: number;
  cveIds: string[];
}

const SECTOR_LABELS: Record<Sector, { en: string; uk: string }> = {
  energy: { en: "Energy", uk: "Енергетика" },
  telecom: { en: "Telecom", uk: "Телеком" },
  finance: { en: "Finance / Banking", uk: "Фінанси / банки" },
  gov: { en: "Government", uk: "Державний сектор" },
  media: { en: "Media", uk: "ЗМІ" },
  transport: { en: "Transport", uk: "Транспорт" },
  defense: { en: "Defense", uk: "Оборона" },
  healthcare: { en: "Healthcare", uk: "Охорона здоров'я" },
  other: { en: "Other", uk: "Інше" },
};

const REGION_CENTER: Record<string, [number, number]> = {
  "UA-46": [24.03, 49.84], "UA-30": [30.52, 50.45], "UA-63": [36.23, 49.99],
  "UA-23": [35.17, 47.84], "UA-51": [30.74, 46.49], "UA-12": [35.04, 48.46],
};

// ── Demo advisories (retrospective; dates are days old) ─────────────────────────

const DEMO: Advisory[] = [
  {
    advisoryId: "CERT-UA#DEMO-1001",
    source: "cert_ua",
    titleUk: "Кібератака на енергетичний сектор (UAC-0002)",
    titleEn: "Cyberattack on the energy sector (UAC-0002)",
    bodyText: "Фішинг проти об'єктів енергетики; IOC: 185.220.101.45, update-energo.com; CVE-2023-23397.",
    url: "https://cert.gov.ua/article/demo-1001",
    publishedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    occurredAt: new Date(Date.now() - 9 * 86_400_000).toISOString(),
    severity: "critical", sectors: ["energy"], regions: ["UA-ALL"],
    actor: "UAC-0002 / Sandworm", iocCount: 3, cveIds: ["CVE-2023-23397"],
  },
  {
    advisoryId: "CERT-UA#DEMO-1002",
    source: "cert_ua",
    titleUk: "Фішинг проти державних установ (UAC-0010, Gamaredon)",
    titleEn: "Phishing against government institutions (UAC-0010, Gamaredon)",
    bodyText: "Шкідливі домени gov-ua-mail.net; IP 91.218.114.32.",
    url: "https://cert.gov.ua/article/demo-1002",
    publishedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    severity: "high", sectors: ["gov"], regions: ["UA-30"],
    actor: "UAC-0010 / Gamaredon", iocCount: 3, cveIds: [],
  },
  {
    advisoryId: "CERT-UA#DEMO-1003",
    source: "cert_ua",
    titleUk: "DDoS на банки та телеком",
    titleEn: "DDoS on banking and telecom",
    bodyText: "Серія DDoS-атак на онлайн-сервіси банків та операторів зв'язку.",
    url: "https://cert.gov.ua/article/demo-1003",
    publishedAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    severity: "medium", sectors: ["finance", "telecom"], regions: ["UA-ALL"], iocCount: 2, cveIds: [],
  },
  {
    advisoryId: "SSSCIP#DEMO-2001",
    source: "ssscip",
    titleUk: "Квартальний огляд кіберзагроз для критичної інфраструктури",
    titleEn: "Quarterly cyber-threat review for critical infrastructure",
    bodyText: "Зростання атак на енергетичний, телеком та урядовий сектори.",
    url: "https://cip.gov.ua/ua/news/demo-2001",
    publishedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    severity: "high", sectors: ["energy", "telecom", "gov"], regions: ["UA-ALL"],
    actor: "UAC-0010, UAC-0002", iocCount: 0, cveIds: [],
  },
  {
    advisoryId: "SSSCIP#DEMO-2002",
    source: "ssscip",
    titleUk: "Попередження медіа-сектору щодо ІПсО",
    titleEn: "Warning to the media sector regarding info-ops",
    bodyText: "Спроби несанкціонованого доступу до систем публікації ЗМІ.",
    url: "https://cip.gov.ua/ua/news/demo-2002",
    publishedAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    severity: "medium", sectors: ["media"], regions: ["UA-ALL"], iocCount: 0, cveIds: [],
  },
];

// ── Per-region intensity (recency-weighted, sector-aware) ───────────────────────

function buildLayer(advs: Advisory[], now: number) {
  const HALF_LIFE = 14, NATION_W = 0.25;
  const real = Object.keys(REGION_CENTER);
  const totals: Record<string, number> = {};
  const top: Record<string, { sector: Sector; v: number }> = {};
  const bump = (code: string, sector: Sector, amt: number) => {
    totals[code] = (totals[code] ?? 0) + amt;
    if (!top[code] || amt > top[code].v) top[code] = { sector, v: amt };
  };
  for (const a of advs) {
    const age = Math.max(0, (now - Date.parse(a.publishedAt)) / 86_400_000);
    const w = Math.pow(0.5, age / HALF_LIFE) * SEVERITY_RANK[a.severity];
    const sectors = a.sectors.length ? a.sectors : (["other"] as Sector[]);
    const nationwide = a.regions.every((r) => r === "UA-ALL");
    if (nationwide) {
      for (const code of real) for (const s of sectors) bump(code, s, (w * NATION_W) / sectors.length);
    } else {
      for (const r of a.regions) if (r !== "UA-ALL" && REGION_CENTER[r]) for (const s of sectors) bump(r, s, w / sectors.length);
    }
  }
  const max = Math.max(1, ...Object.values(totals));
  const features = Object.keys(totals).map((code) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: REGION_CENTER[code] },
    properties: {
      regionCode: code,
      intensity: Math.round((totals[code] / max) * 100),
      topSector: top[code]?.sector ?? "other",
      topSectorLabel: SECTOR_LABELS[top[code]?.sector ?? "other"],
    },
  }));
  return {
    layerId: "cyber_incidents",
    type: "FeatureCollection" as const,
    features,
    cadenceLabel: { en: "Daily, retrospective (lags events by days)", uk: "Щоденно, ретроспективно (відстає на дні)" },
    isRetrospective: true,
  };
}

// ── Handler ─────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:cert-ua:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "advisories";
  const sector = url.searchParams.get("sector") as Sector | null;
  const region = url.searchParams.get("region");
  const minSevParam = url.searchParams.get("severity") as Severity | null;
  const minSev = minSevParam ? SEVERITY_RANK[minSevParam] : 1;
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") ?? "20", 10) || 20);
  const now = Date.now();

  let advs = DEMO.filter((a) => SEVERITY_RANK[a.severity] >= minSev);
  if (sector) advs = advs.filter((a) => a.sectors.includes(sector));
  if (region) advs = advs.filter((a) => a.regions.includes(region));
  advs.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const headers = {
    "Cache-Control": "public, max-age=21600, stale-while-revalidate=43200", // 6h — retrospective
    "Access-Control-Allow-Origin": "*",
    ...rateLimitHeaders(rl),
  };

  const baseMeta = {
    total: advs.length,
    generatedAt: new Date(now).toISOString(),
    isDemo: true,
    isRetrospective: true,
    cadence: { en: "Daily (advisories lag activity by days)", uk: "Щоденно (оповіщення відстають на дні)" },
  };

  if (view === "layer") {
    return NextResponse.json({ data: buildLayer(advs, now), meta: baseMeta }, { headers });
  }

  if (view === "widget") {
    const items = advs.slice(0, limit).map((a) => ({
      advisoryId: a.advisoryId,
      source: a.source,
      title: { en: a.titleEn, uk: a.titleUk },
      severity: a.severity,
      sectors: a.sectors.map((s) => ({ key: s, label: SECTOR_LABELS[s] })),
      actor: a.actor,
      iocCount: a.iocCount,
      cveCount: a.cveIds.length,
      publishedAt: a.publishedAt,
      url: a.url,
    }));
    return NextResponse.json(
      {
        data: { title: { en: "Latest cyber advisories", uk: "Останні кіберсповіщення" }, items },
        meta: baseMeta,
      },
      { headers },
    );
  }

  if (view === "sectors") {
    const sectors = new Map<Sector, Advisory[]>();
    for (const a of advs) for (const s of a.sectors) {
      if (!sectors.has(s)) sectors.set(s, []);
      sectors.get(s)!.push(a);
    }
    const data = [...sectors.entries()].map(([s, list]) => ({
      sector: s,
      label: SECTOR_LABELS[s],
      advisoryCount: list.length,
      criticalCount: list.filter((a) => a.severity === "critical").length,
      actors: [...new Set(list.flatMap((a) => (a.actor ? a.actor.split(/[,/]/).map((x) => x.trim()).filter(Boolean) : [])))],
      recent: list.slice(0, 5).map((a) => ({ advisoryId: a.advisoryId, title: { en: a.titleEn, uk: a.titleUk }, url: a.url })),
    }));
    return NextResponse.json({ data, meta: baseMeta }, { headers });
  }

  // default: advisories
  const data = advs.slice(0, limit).map((a) => ({
    ...a,
    sectorLabels: a.sectors.map((s) => SECTOR_LABELS[s]),
    location: a.regions.find((r) => REGION_CENTER[r]) ? REGION_CENTER[a.regions.find((r) => REGION_CENTER[r])!] : undefined,
  }));
  return NextResponse.json({ data, meta: baseMeta }, { headers });
}
