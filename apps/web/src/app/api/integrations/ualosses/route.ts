/**
 * GET /api/integrations/ualosses — AGGREGATE-ONLY casualty statistics.
 *
 * THE MOST ETHICALLY SENSITIVE FEED. This route emits ONLY de-identified
 * aggregate figures (counts by region / period / source). It NEVER returns a
 * name, photo, unit, birth/death date, or exact coordinate. Per-person data is
 * blocked fail-closed by the ethics gate mirrored below (same posture as the
 * @ua-map/ualosses package; types + demo fixtures mirrored here, no @ua-map path
 * alias in apps/web — same pattern as the un-ocha route).
 *
 * Dignity over engagement. Honor the fallen; respect the bereaved.
 *
 * Query params:
 *   view    — "widget" (default) | "by-region" | "by-period"
 *   locale  — "uk" (default) | "en"
 *
 * Access tier: registered. Cache 1h (memorial figures update slowly).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Aggregate-only demo fixtures (mirror @ua-map/ualosses; NO per-person data) ──

type Source = "ualosses" | "killed_in_ukraine" | "mediazona";
type Side = "ua_military" | "ua_civilian" | "ru_military";

interface Aggregate {
  id: string;
  source: Source;
  side: Side;
  regionCode?: string;
  regionName?: { en: string; uk: string };
  period: string;
  count: number;
  verification: "community_verified" | "source_verified" | "estimate";
  asOf: string;
}

const AGGREGATES: Aggregate[] = [
  { id: "ualosses:ua_military:UA-14:2026-Q1", source: "ualosses", side: "ua_military", regionCode: "UA-14", regionName: { en: "Donetsk oblast", uk: "Донецька область" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-01" },
  { id: "ualosses:ua_military:UA-63:2026-Q1", source: "ualosses", side: "ua_military", regionCode: "UA-63", regionName: { en: "Kharkiv oblast", uk: "Харківська область" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-01" },
  { id: "kiu:ua_civilian:UA-65:2026-Q1", source: "killed_in_ukraine", side: "ua_civilian", regionCode: "UA-65", regionName: { en: "Kherson oblast", uk: "Херсонська область" }, period: "2026-Q1", count: 0, verification: "community_verified", asOf: "2026-04-05" },
  { id: "mediazona:ru_military:all:2026-Q1", source: "mediazona", side: "ru_military", regionName: { en: "All theatres (confirmed)", uk: "Усі напрямки (підтверджено)" }, period: "2026-Q1", count: 0, verification: "source_verified", asOf: "2026-04-03" },
];

const ATTRIBUTION: Record<Source, { en: string; uk: string; url: string; community: boolean }> = {
  ualosses: { en: "UALosses memorial", uk: "Меморіал UALosses", url: "https://ualosses.org/", community: true },
  killed_in_ukraine: { en: "Killed in Ukraine (community)", uk: "Killed in Ukraine (спільнота)", url: "https://killedinukraine.com/", community: true },
  mediazona: { en: "Mediazona / BBC Russian Service", uk: "Mediazona / Російська служба BBC", url: "https://en.zona.media/", community: false },
};

const FRAMING = {
  uk: {
    dignity: "Вічна памʼять полеглим. Ці дані наведено з повагою до загиблих та їхніх родин.",
    aggregateOnly: "Публікуються лише знеособлені зведені показники за регіонами та періодами. Жодних персональних даних.",
    verify: "Цифри походять із верифікованих джерел памʼяті; вони можуть бути неповними та оновлюються.",
  },
  en: {
    dignity: "In memory of the fallen. This data is presented with respect for the dead and their families.",
    aggregateOnly: "Only de-identified aggregate figures by region and period are published. No personal data.",
    verify: "Figures come from verified memorial sources; they may be incomplete and are updated over time.",
  },
};

// ── Fail-closed ethics gate (mirror of package ethics-gate; aggregate-only) ─────

const PERSON_FIELD_NAMES = new Set([
  "fullname", "full_name", "name", "firstname", "lastname", "surname", "patronymic",
  "callsign", "call_sign", "nickname", "dateofbirth", "date_of_birth", "dob",
  "dateofdeath", "date_of_death", "unit", "burialplace", "burial_place", "hometown",
  "home_town", "photo", "photourl", "photo_url", "image", "obituary", "bio",
  "exactcoords", "exact_coords", "gps", "coordinates", "phone", "email", "contact",
]);

/** Returns true if a record carries any per-person signal (then it is dropped). */
function hasPerPersonData(rec: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(rec)) {
    if (PERSON_FIELD_NAMES.has(k.toLowerCase()) && v != null && v !== "") return true;
  }
  return false;
}

function gate(records: Aggregate[]): { safe: Aggregate[]; blocked: number } {
  const safe: Aggregate[] = [];
  let blocked = 0;
  for (const r of records) {
    if (hasPerPersonData(r as unknown as Record<string, unknown>)) { blocked++; continue; }
    // Allow-list projection — extra keys never carried over.
    safe.push({
      id: r.id, source: r.source, side: r.side, regionCode: r.regionCode,
      regionName: r.regionName, period: r.period, count: r.count,
      verification: r.verification, asOf: r.asOf,
    });
  }
  return { safe, blocked };
}

function rollup<K extends string>(aggs: Aggregate[], keyOf: (a: Aggregate) => K) {
  const m = new Map<K, { key: K; total: number; bySide: Record<string, number>; regionName?: { en: string; uk: string } }>();
  for (const a of aggs) {
    const k = keyOf(a);
    let row = m.get(k);
    if (!row) { row = { key: k, total: 0, bySide: {} }; m.set(k, row); }
    row.total += a.count;
    row.bySide[a.side] = (row.bySide[a.side] ?? 0) + a.count;
    if (!row.regionName && a.regionName) row.regionName = a.regionName;
  }
  return [...m.values()].sort((x, y) => y.total - x.total);
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:ualosses:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "widget";
  const locale = (url.searchParams.get("locale") === "en" ? "en" : "uk") as "uk" | "en";

  const { safe, blocked } = gate(AGGREGATES);
  const usedSources = [...new Set(safe.map((a) => a.source))] as Source[];
  const grandTotal = safe.reduce((s, a) => s + a.count, 0);

  let data: unknown;
  if (view === "by-region") {
    data = rollup(safe, (a) => (a.regionCode ?? "__all__")).map((r) => ({
      regionCode: r.key === "__all__" ? undefined : r.key, regionName: r.regionName, total: r.total, bySide: r.bySide,
    }));
  } else if (view === "by-period") {
    data = rollup(safe, (a) => a.period).map((r) => ({ period: r.key, total: r.total, bySide: r.bySide }));
  } else {
    data = {
      framing: FRAMING[locale],
      grandTotal,
      byRegion: rollup(safe, (a) => (a.regionCode ?? "__all__")).map((r) => ({ regionCode: r.key === "__all__" ? undefined : r.key, regionName: r.regionName, total: r.total })),
      byPeriod: rollup(safe, (a) => a.period).map((r) => ({ period: r.key, total: r.total })),
    };
  }

  return NextResponse.json(
    {
      view,
      locale,
      data,
      attribution: usedSources.map((s) => ({ source: s, ...ATTRIBUTION[s] })),
      meta: {
        layer: null, // no map layer — aggregate widget only
        aggregateOnly: true,
        perPersonPublication: false,
        piiPosture: "fail-closed (per-person records dropped, not partially redacted)",
        droppedPerPerson: blocked,
        sources: "UALosses / Killed in Ukraine / Mediazona",
        takedownPolicy: "honored on family request",
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
