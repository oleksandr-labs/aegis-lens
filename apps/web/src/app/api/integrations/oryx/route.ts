/**
 * GET /api/integrations/oryx — Oryx visually-confirmed equipment losses.
 *
 * Powers the equipment-loss map layer (`equipment_losses`), the per-equipment
 * "verified losses" widget, and loss-trend charts. Every response carries an
 * Oryx attribution block — Oryx is a volunteer-run OSINT project and MUST be
 * cited wherever its data is shown (see integrations/oryx/COMPLIANCE.md).
 *
 * Query params:
 *   side        — ukraine | russia
 *   status      — destroyed | damaged | abandoned | captured
 *   category    — Oryx category id (e.g. "tanks")
 *   model       — model slug (e.g. "t-72b3")
 *   region      — ISO 3166-2 oblast code
 *   from / to   — ISO-8601 date range (on entry date)
 *   bucket      — day | week | month (trend/aggregation bucket; default month)
 *   view        — "entries" (default) | "trends" | "regions"
 *
 * Data here is the bundled demo fixture (isDemo: true). In production this
 * route reads the daily Oryx sync snapshot. Cache: 1h (Oryx updates ~daily).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Side = "ukraine" | "russia";
type LossStatus = "destroyed" | "damaged" | "abandoned" | "captured";

interface OryxLossEntry {
  entryId: string;
  side: Side;
  category: string;
  model: { en: string; uk: string };
  modelSlug: string;
  status: LossStatus;
  date: string;
  regionCode?: string;
  locationText?: { en: string; uk: string };
  evidenceUrl: string;
  oryxPostUrl: string;
}

const RU_POST = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html";
const UA_POST = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html";

const ORYX_ATTRIBUTION = {
  short: {
    en: "Source: Oryx (visually-confirmed losses)",
    uk: "Джерело: Oryx (візуально підтверджені втрати)",
  },
  full: {
    en: "Equipment-loss data from Oryx, a volunteer-run OSINT project cataloging only visually-confirmed losses (each entry backed by photo/video). Counts are a documented minimum, not a total.",
    uk: "Дані про втрати техніки з Oryx — волонтерського OSINT-проєкту, що фіксує лише візуально підтверджені втрати (кожен запис підкріплений фото/відео). Підрахунки є мінімумом, а не повним числом.",
  },
  homepage: "https://www.oryxspioenkop.com",
};

const DEMO_ENTRIES: OryxLossEntry[] = [
  { entryId: "oryx-russia-t-72b3-1", side: "russia", category: "tanks", model: { en: "T-72B3", uk: "Т-72Б3" }, modelSlug: "t-72b3", status: "destroyed", date: "2024-03-12", regionCode: "UA-14", locationText: { en: "near Avdiivka, Donetsk Oblast", uk: "поблизу Авдіївки, Донецька область" }, evidenceUrl: "https://i.postimg.cc/oryx/t72b3-1.jpg", oryxPostUrl: RU_POST },
  { entryId: "oryx-russia-t-72b3-2", side: "russia", category: "tanks", model: { en: "T-72B3", uk: "Т-72Б3" }, modelSlug: "t-72b3", status: "captured", date: "2024-03-01", regionCode: "UA-63", locationText: { en: "Kharkiv Oblast", uk: "Харківська область" }, evidenceUrl: "https://i.postimg.cc/oryx/t72b3-2.jpg", oryxPostUrl: RU_POST },
  { entryId: "oryx-russia-t-90m-proryv-1", side: "russia", category: "tanks", model: { en: "T-90M Proryv", uk: "Т-90М «Прорив»" }, modelSlug: "t-90m-proryv", status: "abandoned", date: "2024-04-02", regionCode: "UA-23", locationText: { en: "near Robotyne, Zaporizhzhia Oblast", uk: "поблизу Роботиного, Запорізька область" }, evidenceUrl: "https://i.postimg.cc/oryx/t90m-1.jpg", oryxPostUrl: RU_POST },
  { entryId: "oryx-russia-bmp-2-1", side: "russia", category: "infantry_fighting_vehicles", model: { en: "BMP-2", uk: "БМП-2" }, modelSlug: "bmp-2", status: "destroyed", date: "2024-02-20", regionCode: "UA-14", locationText: { en: "Bakhmut, Donetsk Oblast", uk: "Бахмут, Донецька область" }, evidenceUrl: "https://i.postimg.cc/oryx/bmp2-1.jpg", oryxPostUrl: RU_POST },
  { entryId: "oryx-russia-su-34-1", side: "russia", category: "aircraft", model: { en: "Su-34", uk: "Су-34" }, modelSlug: "su-34", status: "destroyed", date: "2024-02-17", regionCode: "UA-14", locationText: { en: "near front line, Donetsk Oblast", uk: "поблизу лінії фронту, Донецька область" }, evidenceUrl: "https://i.postimg.cc/oryx/su34-1.jpg", oryxPostUrl: RU_POST },
  { entryId: "oryx-ukraine-t-64bv-1", side: "ukraine", category: "tanks", model: { en: "T-64BV", uk: "Т-64БВ" }, modelSlug: "t-64bv", status: "destroyed", date: "2024-03-05", regionCode: "UA-14", locationText: { en: "Donetsk Oblast", uk: "Донецька область" }, evidenceUrl: "https://i.postimg.cc/oryx/t64bv-1.jpg", oryxPostUrl: UA_POST },
  { entryId: "oryx-ukraine-leopard-2a6-1", side: "ukraine", category: "tanks", model: { en: "Leopard 2A6", uk: "Leopard 2A6" }, modelSlug: "leopard-2a6", status: "abandoned", date: "2023-06-08", regionCode: "UA-23", locationText: { en: "near Robotyne, Zaporizhzhia Oblast", uk: "поблизу Роботиного, Запорізька область" }, evidenceUrl: "https://i.postimg.cc/oryx/leo2a6-1.jpg", oryxPostUrl: UA_POST },
  { entryId: "oryx-ukraine-m2a2-bradley-1", side: "ukraine", category: "infantry_fighting_vehicles", model: { en: "M2A2 Bradley", uk: "M2A2 Bradley" }, modelSlug: "m2a2-bradley", status: "damaged", date: "2024-02-12", regionCode: "UA-14", locationText: { en: "near Avdiivka, Donetsk Oblast", uk: "поблизу Авдіївки, Донецька область" }, evidenceUrl: "https://i.postimg.cc/oryx/bradley-1.jpg", oryxPostUrl: UA_POST },
];

const STATUSES: LossStatus[] = ["destroyed", "damaged", "abandoned", "captured"];

function bucketKey(isoDate: string, bucket: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  if (bucket === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
  if (bucket === "week") {
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
  }
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:oryx:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const sideFilter = url.searchParams.get("side") as Side | null;
  const statusFilter = url.searchParams.get("status") as LossStatus | null;
  const categoryFilter = url.searchParams.get("category");
  const modelFilter = url.searchParams.get("model");
  const regionFilter = url.searchParams.get("region");
  const bucket = url.searchParams.get("bucket") ?? "month";
  const view = url.searchParams.get("view") ?? "entries";
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;

  let entries = DEMO_ENTRIES.filter((e) => {
    const t = new Date(`${e.date}T00:00:00Z`).getTime();
    return t >= fromMs && t <= toMs;
  });
  if (sideFilter) entries = entries.filter((e) => e.side === sideFilter);
  if (statusFilter) entries = entries.filter((e) => e.status === statusFilter);
  if (categoryFilter) entries = entries.filter((e) => e.category === categoryFilter);
  if (modelFilter) entries = entries.filter((e) => e.modelSlug === modelFilter);
  if (regionFilter) entries = entries.filter((e) => e.regionCode === regionFilter);

  let data: unknown = entries;

  if (view === "trends") {
    const sides: Side[] = ["ukraine", "russia"];
    data = sides.map((side) => {
      const buckets = new Map<string, { date: string; count: number }>();
      for (const e of entries.filter((x) => x.side === side)) {
        const key = bucketKey(e.date, bucket);
        const p = buckets.get(key) ?? { date: key, count: 0 };
        p.count++;
        buckets.set(key, p);
      }
      const points = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
      return { side, bucket, points, total: points.reduce((s, p) => s + p.count, 0) };
    });
  } else if (view === "regions") {
    const cells = new Map<string, { regionCode: string; side: Side; count: number }>();
    for (const e of entries) {
      const region = e.regionCode ?? "UNK";
      const key = `${region}|${e.side}`;
      const c = cells.get(key) ?? { regionCode: region, side: e.side, count: 0 };
      c.count++;
      cells.set(key, c);
    }
    data = [...cells.values()];
  }

  const meta = {
    total: entries.length,
    byStatus: Object.fromEntries(STATUSES.map((s) => [s, entries.filter((e) => e.status === s).length])),
    bySide: {
      ukraine: entries.filter((e) => e.side === "ukraine").length,
      russia: entries.filter((e) => e.side === "russia").length,
    },
    layer: "equipment_losses",
    attribution: ORYX_ATTRIBUTION,
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
