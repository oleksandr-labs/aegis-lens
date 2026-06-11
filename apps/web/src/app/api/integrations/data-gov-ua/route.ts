/**
 * GET /api/integrations/data-gov-ua — open-data / civic-tech entity enrichment.
 *
 * Backs entity pages + the companies directory with registry facts (ЄДРПОУ →
 * company/institution), Prozorro procurement footprint, and Texty investigation
 * cross-links. Sources: data.gov.ua (EDR catalog), OpenDataBot, YouControl,
 * Prozorro, Texty.org.ua.
 *
 * Query params:
 *   view    — "entity" (default) | "directory" | "catalog"
 *   edrpou  — ЄДРПОУ code (required for view=entity)
 *
 * Backed by the @ua-map/data-gov-ua package; its demo fixtures + enrichment logic
 * are mirrored here (no secrets, no @ua-map path alias in apps/web — same pattern
 * as the un-ocha / cert-ua routes). All payloads are PUBLIC-REGISTRY facts about
 * LEGAL ENTITIES (not natural-person PII). Proprietary providers (OpenDataBot /
 * YouControl) are LINK-OUT only — their analytics are not re-hosted.
 * Access tier: registered. Cache 1h (registry data refreshes daily, not live).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Demo registry (mirror @ua-map/data-gov-ua fixtures — legal-entity facts) ───

interface Loc { en: string; uk?: string }

interface DemoCompany {
  edrpou: string;
  name: Loc;
  status: "active" | "terminating" | "terminated" | "bankrupt" | "unknown";
  type: "company" | "institution" | "ngo";
  address: Loc;
  primaryActivity?: { code: string; name: Loc };
  flaggedRisk?: boolean;
}

const COMPANIES: DemoCompany[] = [
  {
    edrpou: "12345678",
    name: { en: "Demo Enterprise LLC", uk: "ТОВ «Демо Підприємство»" },
    status: "active",
    type: "company",
    address: { en: "Kyiv, Ukraine", uk: "м. Київ, Україна" },
    primaryActivity: { code: "62.01", name: { en: "Computer programming", uk: "Комп'ютерне програмування" } },
  },
  {
    edrpou: "00131305",
    name: { en: "Kyiv City State Administration", uk: "Київська міська державна адміністрація" },
    status: "active",
    type: "institution",
    address: { en: "Kyiv, Ukraine", uk: "м. Київ, Україна" },
    primaryActivity: { code: "84.11", name: { en: "General public administration", uk: "Державне управління загального характеру" } },
  },
  {
    edrpou: "00031101",
    name: { en: "Ministry of Digital Transformation", uk: "Міністерство цифрової трансформації" },
    status: "active",
    type: "institution",
    address: { en: "Kyiv, Ukraine", uk: "м. Київ, Україна" },
    primaryActivity: { code: "84.11", name: { en: "General public administration", uk: "Державне управління загального характеру" } },
  },
  {
    edrpou: "87654321",
    name: { en: "Opaque Trading LLC", uk: "ТОВ «Опак Трейдинг»" },
    status: "terminating",
    type: "company",
    address: { en: "Odesa, Ukraine", uk: "м. Одеса, Україна" },
    primaryActivity: { code: "46.90", name: { en: "Non-specialised wholesale trade", uk: "Неспеціалізована оптова торгівля" } },
    flaggedRisk: true,
  },
];

interface DemoTender {
  tenderId: string;
  title: Loc;
  status: "complete" | "active.awarded";
  buyerEdrpou: string;
  buyerName: Loc;
  supplierEdrpou: string;
  supplierName: Loc;
  amountUah: number;
  date: string;
  url: string;
}

const TENDERS: DemoTender[] = [
  {
    tenderId: "UA-2026-01-15-000123-a",
    title: { en: "Repair of municipal power-grid substations", uk: "Ремонт підстанцій муніципальної електромережі" },
    status: "complete",
    buyerEdrpou: "00131305",
    buyerName: { en: "Kyiv City State Administration", uk: "Київська міська державна адміністрація" },
    supplierEdrpou: "12345678",
    supplierName: { en: "Demo Enterprise LLC", uk: "ТОВ «Демо Підприємство»" },
    amountUah: 4_850_000,
    date: "2026-01-20T10:00:00Z",
    url: "https://prozorro.gov.ua/tender/UA-2026-01-15-000123-a",
  },
  {
    tenderId: "UA-2026-02-03-000456-b",
    title: { en: "Supply of IT services for e-government portal", uk: "Постачання ІТ-послуг для порталу е-урядування" },
    status: "active.awarded",
    buyerEdrpou: "00031101",
    buyerName: { en: "Ministry of Digital Transformation", uk: "Міністерство цифрової трансформації" },
    supplierEdrpou: "12345678",
    supplierName: { en: "Demo Enterprise LLC", uk: "ТОВ «Демо Підприємство»" },
    amountUah: 2_100_000,
    date: "2026-02-10T09:30:00Z",
    url: "https://prozorro.gov.ua/tender/UA-2026-02-03-000456-b",
  },
];

interface DemoInvestigation {
  id: string;
  title: Loc;
  url: string;
  relatedEdrpou: string[];
}

const INVESTIGATIONS: DemoInvestigation[] = [
  {
    id: "texty-procurement-risk",
    title: { en: "Risky public procurement: a map of suspicious tenders", uk: "Ризикові держзакупівлі: карта підозрілих тендерів" },
    url: "https://texty.org.ua/projects/risky-procurement/",
    relatedEdrpou: ["00131305", "12345678"],
  },
  {
    id: "texty-sanctions-network",
    title: { en: "Sanctions-evasion networks: linked Ukrainian shell companies", uk: "Мережі обходу санкцій: пов'язані українські фірми-прокладки" },
    url: "https://texty.org.ua/projects/sanctions-network/",
    relatedEdrpou: ["87654321"],
  },
];

const CATALOG = [
  { name: "edr-uo", title: "Unified State Register (ЄДР)", topic: "edr", license: "ogl-ua", url: "https://data.gov.ua/dataset/edr-uo" },
  { name: "address-registry", title: "State Address Register", topic: "addresses", license: "ogl-ua", url: "https://data.gov.ua/dataset/address-registry" },
  { name: "critical-infrastructure-objects", title: "Critical-infrastructure objects (aggregated)", topic: "infrastructure", license: "ogl-ua", url: "https://data.gov.ua/dataset/critical-infrastructure-objects" },
];

// ── Builders (mirror package enrichment logic) ────────────────────────────────

function normalizeEdrpou(code: string): string {
  const d = (code ?? "").replace(/\D/g, "");
  return d.length < 8 ? d.padStart(8, "0") : d;
}

function tendersFor(edrpou: string): DemoTender[] {
  return TENDERS.filter((t) => t.buyerEdrpou === edrpou || t.supplierEdrpou === edrpou);
}

function footprint(edrpou: string) {
  const ts = tendersFor(edrpou);
  let asBuyer = 0, asSupplier = 0, total = 0;
  for (const t of ts) {
    if (t.buyerEdrpou === edrpou) asBuyer++;
    if (t.supplierEdrpou === edrpou) { asSupplier++; total += t.amountUah; }
  }
  return asBuyer || asSupplier
    ? { tendersAsBuyer: asBuyer, tendersAsSupplier: asSupplier, totalAwardedUah: total }
    : undefined;
}

function investigationsFor(edrpou: string) {
  const links = INVESTIGATIONS.filter((d) => d.relatedEdrpou.includes(edrpou)).map((d) => ({
    investigationId: d.id,
    title: d.title,
    url: d.url,
    relation: { en: "named in dataset", uk: "згаданий у наборі даних" },
    source: "texty" as const,
  }));
  return links;
}

const ATTRIBUTION = [
  { provider: "data-gov-ua", license: "ogl-ua", note: "Open data — data.gov.ua (CMU 835 reuse terms)." },
  { provider: "prozorro", license: "cc-by", note: "Open procurement data — Prozorro (attribution required)." },
  { provider: "texty", license: "cc-by", note: "Texty.org.ua datasets (CC BY); article text is link-out only." },
  { provider: "opendatabot", license: "proprietary", note: "OpenDataBot analytics — link-out only, not re-hosted." },
  { provider: "youcontrol", license: "proprietary", note: "YouControl analytics — link-out only, not re-hosted." },
];

function buildEntity(edrpou: string) {
  const c = COMPANIES.find((x) => x.edrpou === edrpou);
  if (!c) return null;
  return {
    edrpou,
    entity: {
      entityId: `${c.type}:${edrpou}`,
      slug: `edrpou-${edrpou}`,
      entityType: c.type,
      edrpou,
      name: c.name,
      status: c.status,
      address: c.address,
      primaryActivity: c.primaryActivity,
      procurement: footprint(edrpou),
      investigationLinks: investigationsFor(edrpou),
      flaggedRisk: Boolean(c.flaggedRisk),
    },
    procurement: tendersFor(edrpou),
    investigations: investigationsFor(edrpou),
    attribution: ATTRIBUTION,
  };
}

function buildDirectory() {
  const rows = COMPANIES.map((c) => ({
    slug: `edrpou-${c.edrpou}`,
    edrpou: c.edrpou,
    entityType: c.type,
    name: c.name,
    status: c.status,
    flaggedRisk: Boolean(c.flaggedRisk),
    procurementVolumeUah: footprint(c.edrpou)?.totalAwardedUah ?? 0,
    investigationCount: investigationsFor(c.edrpou).length,
  }));
  rows.sort((a, b) => b.procurementVolumeUah - a.procurementVolumeUah);
  const byType = { company: 0, institution: 0, ngo: 0 };
  let flagged = 0;
  for (const c of COMPANIES) { byType[c.type]++; if (c.flaggedRisk) flagged++; }
  return { rows, facets: { total: COMPANIES.length, byType, flaggedRisk: flagged }, attribution: ATTRIBUTION };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:data-gov-ua:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "entity";

  let data: unknown;
  let status = 200;
  if (view === "directory") {
    data = buildDirectory();
  } else if (view === "catalog") {
    data = { datasets: CATALOG, attribution: ATTRIBUTION };
  } else {
    const raw = url.searchParams.get("edrpou");
    if (!raw) {
      return NextResponse.json(
        { error: "missing_edrpou", message: "view=entity requires ?edrpou=<code>" },
        { status: 400, headers: rateLimitHeaders(rl) },
      );
    }
    const edrpou = normalizeEdrpou(raw);
    const entity = buildEntity(edrpou);
    if (!entity) {
      data = { error: "not_found", edrpou };
      status = 404;
    } else {
      data = entity;
    }
  }

  return NextResponse.json(
    {
      view,
      data,
      meta: {
        source: "data.gov.ua / OpenDataBot / YouControl / Texty.org.ua / Prozorro",
        note: "Public legal-entity registry facts; proprietary providers are link-out only.",
        generatedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
