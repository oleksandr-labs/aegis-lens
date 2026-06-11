/**
 * GET /api/layers/infrastructure — damaged infrastructure layer
 *
 * Query params:
 *   region        — ISO 3166-2 oblast code
 *   category      — power | transport | telecom | water | healthcare | education | residential | industrial | government | cultural
 *   severity      — minor | major | destroyed
 *   status        — damaged | under_repair | restored | destroyed
 *   from          — ISO-8601
 *   to            — ISO-8601
 *   verified      — "true" = verified only
 *
 * Cache: 300s (infrastructure changes less frequently than live events)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type InfrastructureCategory =
  | "power" | "transport" | "telecom" | "water" | "healthcare"
  | "education" | "residential" | "industrial" | "government" | "cultural";

type DamageSeverity = "minor" | "major" | "destroyed";
type InfrastructureStatus = "damaged" | "under_repair" | "restored" | "destroyed";

interface InfrastructureDamageEvent {
  eventId: string;
  assetId?: string;
  category: InfrastructureCategory;
  severity: DamageSeverity;
  status: InfrastructureStatus;
  lat?: number;
  lon?: number;
  country: string;
  regionCode?: string;
  occurredAt: string;
  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;
  linkedMissileEventId?: string;
  linkedDroneEventId?: string;
  linkedPowerOutageEventId?: string;
  populationAffected?: number;
  sourceUrls?: string[];
  severityScore: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  verificationState: string;
  isPublic: boolean;
}

const DEMO_EVENTS: InfrastructureDamageEvent[] = [
  {
    eventId: "infra-001",
    assetId: "asset-lviv-substation-1",
    category: "power",
    severity: "major",
    status: "damaged",
    lat: 49.84,
    lon: 24.03,
    country: "UA",
    regionCode: "UA-46",
    occurredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    titleEn: "Lviv power substation damaged by Kh-101 strike",
    titleUk: "Львівська підстанція пошкоджена ударом Kh-101",
    summaryEn: "Energy substation in Lviv Oblast suffered major damage from a cruise missile strike, causing outages for ~300,000 residents.",
    summaryUk: "Підстанція у Львівській області зазнала значних пошкоджень, близько 300 000 жителів без світла.",
    linkedMissileEventId: "missile-001",
    populationAffected: 300000,
    sourceUrls: ["https://t.me/dtek"],
    severityScore: 4,
    confidence: 0.91,
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "infra-002",
    assetId: "asset-kharkiv-tpp",
    category: "power",
    severity: "major",
    status: "under_repair",
    lat: 49.95,
    lon: 36.35,
    country: "UA",
    regionCode: "UA-63",
    occurredAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    titleEn: "Kharkiv thermal power plant damaged",
    titleUk: "Харківська ТЕС пошкоджена",
    summaryEn: "Missile strike caused major damage to Kharkiv TPP. Repair crews on site; partial restoration expected within 48 hours.",
    summaryUk: "Ракетний удар завдав значних пошкоджень Харківській ТЕС. Очікується часткове відновлення протягом 48 годин.",
    populationAffected: 450000,
    severityScore: 4,
    confidence: 0.9,
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "infra-003",
    assetId: "asset-kyiv-hospital",
    category: "healthcare",
    severity: "minor",
    status: "damaged",
    lat: 50.42,
    lon: 30.52,
    country: "UA",
    regionCode: "UA-30",
    occurredAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    titleEn: "Kyiv hospital partially damaged by drone debris",
    titleUk: "Київська лікарня частково пошкоджена уламками дрона",
    summaryEn: "A Kyiv hospital sustained minor damage from drone debris. Medical operations continue at reduced capacity.",
    summaryUk: "Київська лікарня отримала незначні пошкодження від уламків дрона. Медична діяльність продовжується в обмеженому режимі.",
    linkedDroneEventId: "drone-002",
    severityScore: 2,
    confidence: 0.82,
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "infra-004",
    category: "transport",
    severity: "destroyed",
    status: "destroyed",
    lat: 47.88,
    lon: 33.43,
    country: "UA",
    regionCode: "UA-12",
    occurredAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    titleEn: "Rail bridge destroyed in Dnipropetrovsk Oblast",
    titleUk: "Залізничний міст знищено в Дніпропетровській області",
    summaryEn: "A railway bridge was destroyed by a ballistic missile strike, disrupting key supply routes.",
    summaryUk: "Залізничний міст знищено балістичним ударом, порушено ключові маршрути постачання.",
    severityScore: 5,
    confidence: 0.87,
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "infra-005",
    category: "water",
    severity: "minor",
    status: "under_repair",
    lat: 46.97,
    lon: 31.99,
    country: "UA",
    regionCode: "UA-48",
    occurredAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    titleEn: "Water pumping station damaged, Mykolaiv",
    titleUk: "Насосна станція пошкоджена, Миколаїв",
    summaryEn: "A water pumping station in Mykolaiv sustained minor damage. Emergency repairs under way.",
    summaryUk: "Насосна станція в Миколаєві отримала незначні пошкодження. Ведуться аварійні ремонтні роботи.",
    severityScore: 2,
    confidence: 0.79,
    verificationState: "verified",
    isPublic: true,
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:infrastructure:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const categoryFilter = url.searchParams.get("category") as InfrastructureCategory | null;
  const severityFilter = url.searchParams.get("severity") as DamageSeverity | null;
  const statusFilter = url.searchParams.get("status") as InfrastructureStatus | null;
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;
  const verifiedOnly = url.searchParams.get("verified") === "true";

  let events = DEMO_EVENTS.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= fromMs && t <= toMs;
  });

  if (regionFilter) events = events.filter((e) => e.regionCode === regionFilter);
  if (categoryFilter) events = events.filter((e) => e.category === categoryFilter);
  if (severityFilter) events = events.filter((e) => e.severity === severityFilter);
  if (statusFilter) events = events.filter((e) => e.status === statusFilter);
  if (verifiedOnly) events = events.filter((e) => e.verificationState === "verified");

  const categories: InfrastructureCategory[] = ["power","transport","telecom","water","healthcare","education","residential","industrial","government","cultural"];
  const statuses: InfrastructureStatus[] = ["damaged","under_repair","restored","destroyed"];

  const meta = {
    total: events.length,
    byCategory: Object.fromEntries(categories.map((c) => [c, events.filter((e) => e.category === c).length])),
    byStatus: Object.fromEntries(statuses.map((s) => [s, events.filter((e) => e.status === s).length])),
    totalPopulationAffected: events.reduce((sum, e) => sum + (e.populationAffected ?? 0), 0),
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: events, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
