/**
 * Typed in-memory `DataSources` implementation.
 *
 * Типова реалізація `DataSources` у пам'яті.
 *
 * This fulfils the same port the production adapters do, so the commands are
 * genuinely runnable during an on-call drill without reaching live infra.
 * Swap this for real clients (pg / ioredis / kafkajs / prom-client / stripe)
 * in `context.ts` when wiring against an environment.
 *
 * Data is shaped to be realistic for Aegis Lens: the ingest/geo/nlp/verify
 * services, OSINT sources, tenants on the metering plans, and the cost lines
 * (Hetzner cloud + LLM tokens + SaaS seats) that show up on the daily bill.
 */

import type {
  AlertRuleDef,
  CostLineItem,
  DataSources,
  EmbedReferrer,
  EnrichmentStageTrace,
  HistoricalEvent,
  RawEvent,
  ServiceProbe,
  SourceHealthSnapshot,
  TenantRecord,
} from "./types";

/** Subtract `min` minutes from `from`, return ISO string. */
function minutesAgo(from: Date, min: number): string {
  return new Date(from.getTime() - min * 60_000).toISOString();
}

export class StubDataSources implements DataSources {
  constructor(private readonly now: Date = new Date()) {}

  async probeServices(): Promise<ServiceProbe[]> {
    return [
      { service: "gateway", dependency: "edge", status: "ok", latencyMs: 12, detail: "200s nominal, p95 41ms" },
      { service: "ingest", dependency: "kafka:usage.events", status: "ok", latencyMs: 28, detail: "lag 1.2k msgs, consuming" },
      { service: "geo", status: "ok", latencyMs: 64, detail: "geocoder warm, cache hit 91%" },
      { service: "nlp", dependency: "llm:claude", status: "warn", latencyMs: 870, detail: "p95 elevated (provider slow)" },
      { service: "verify", status: "ok", latencyMs: 110, detail: "eval suite green" },
      { service: "alerts", dependency: "redis", status: "ok", latencyMs: 7, detail: "throttle keys nominal" },
      { service: "metering", dependency: "postgres:primary", status: "ok", latencyMs: 19, detail: "reconcile lag 4m" },
      { service: "tiles", dependency: "maptiler", status: "fail", latencyMs: 0, detail: "vendor 5xx, breaker OPEN" },
    ];
  }

  async getSourceHealth(name: string): Promise<SourceHealthSnapshot | undefined> {
    const known: Record<string, SourceHealthSnapshot> = {
      "alerts-in-ua": {
        sourceId: "alerts-in-ua", sourceName: "Alerts.in.ua", lastSeenAt: minutesAgo(this.now, 3),
        ingestLatencyP50Ms: 240, ingestLatencyP95Ms: 690, errorRate: 0.004, windowMin: 60,
      },
      deepstatemap: {
        sourceId: "deepstatemap", sourceName: "DeepStateMAP", lastSeenAt: minutesAgo(this.now, 142),
        ingestLatencyP50Ms: 510, ingestLatencyP95Ms: 2100, errorRate: 0.071, windowMin: 60,
      },
      "nasa-firms": {
        sourceId: "nasa-firms", sourceName: "NASA FIRMS", lastSeenAt: minutesAgo(this.now, 18),
        ingestLatencyP50Ms: 320, ingestLatencyP95Ms: 880, errorRate: 0.0, windowMin: 60,
      },
    };
    return known[name];
  }

  async getRawEvent(eventId: string): Promise<RawEvent | undefined> {
    if (!eventId.startsWith("evt_")) return undefined;
    return {
      eventId,
      sourceId: "alerts-in-ua",
      receivedAt: minutesAgo(this.now, 6),
      rawText: "Повітряна тривога в Харківській області. Загроза балістики.",
    };
  }

  async runEnrichmentChain(event: RawEvent): Promise<EnrichmentStageTrace[]> {
    return [
      { stage: "normalize", service: "ingest", status: "ok", latencyMs: 14, note: `parsed source=${event.sourceId}, lang=uk` },
      { stage: "geocode", service: "geo", status: "ok", latencyMs: 73, note: "matched 'Харківська область' -> oblast centroid" },
      { stage: "classify", service: "nlp", status: "ok", latencyMs: 612, note: "class=air_threat subclass=ballistic conf=0.88" },
      { stage: "danger-score", service: "nlp", status: "ok", latencyMs: 31, note: "danger_score=0.74" },
      { stage: "verify", service: "verify", status: "warn", latencyMs: 144, note: "single-source; corroboration pending" },
      { stage: "index", service: "ingest", status: "ok", latencyMs: 22, note: "written to canonical store + search" },
    ];
  }

  async getTenant(org: string): Promise<TenantRecord | undefined> {
    const known: Record<string, TenantRecord> = {
      "org_kyiv_desk": {
        orgId: "org_kyiv_desk", name: "Kyiv Investigations Desk", plan: "business", seats: 12,
        createdAt: "2025-11-02T09:14:00.000Z",
        usageThisPeriod: { api_calls: 184_220, events_ingested: 2_140_900, ai_tokens: 9_820_000, copilot_queries: 412, exports: 38 },
        recentActivity: [
          { at: minutesAgo(this.now, 4), actor: "n.kovalenko", action: "ran copilot query 'drone strikes Odesa 24h'" },
          { at: minutesAgo(this.now, 51), actor: "system", action: "alert rule 'ballistic-kharkiv' fired -> 3 deliveries" },
          { at: minutesAgo(this.now, 190), actor: "a.bondar", action: "exported AOI report (PDF)" },
        ],
      },
    };
    return known[org];
  }

  async getAlertRule(rule: string): Promise<AlertRuleDef | undefined> {
    const known: Record<string, AlertRuleDef> = {
      "ballistic-kharkiv": {
        ruleId: "rule_8f21", name: "ballistic-kharkiv", orgId: "org_kyiv_desk",
        condition: { eventClass: "air_threat", minDangerScore: 0.6, keyword: "балістик" },
      },
    };
    return known[rule];
  }

  async getHistoricalEvents(windowDays: number): Promise<HistoricalEvent[]> {
    // Deterministic 30-day sample; spread across the window.
    const out: HistoricalEvent[] = [];
    const classes = ["air_threat", "shelling", "infrastructure", "air_threat", "naval"];
    for (let i = 0; i < 120; i++) {
      const at = minutesAgo(this.now, Math.floor((i / 120) * windowDays * 24 * 60));
      const cls = classes[i % classes.length];
      out.push({
        eventId: `evt_h${i}`,
        at,
        eventClass: cls,
        dangerScore: cls === "air_threat" ? 0.55 + ((i % 5) * 0.09) : 0.2 + ((i % 7) * 0.05),
        confidence: 0.6 + ((i % 4) * 0.1),
        summary: cls === "air_threat"
          ? (i % 3 === 0 ? "Загроза балістики, Харків" : "Повітряна тривога, загальна")
          : `${cls} event #${i}`,
      });
    }
    return out;
  }

  async getCostLineItems(_day: string): Promise<CostLineItem[]> {
    return [
      { category: "cloud", vendor: "Hetzner (atlas CX53)", amountCents: 412, unit: "instance-hours", quantity: 24 },
      { category: "cloud", vendor: "Hetzner Storage Box", amountCents: 38, unit: "GB-day", quantity: 980 },
      { category: "cloud", vendor: "Cloudflare", amountCents: 220, unit: "requests-M", quantity: 6.1 },
      { category: "llm", vendor: "Anthropic Claude", amountCents: 7_640, unit: "1K tokens", quantity: 9_820 },
      { category: "llm", vendor: "embeddings (HF inference)", amountCents: 910, unit: "1K tokens", quantity: 14_200 },
      { category: "saas", vendor: "Stripe (fees)", amountCents: 540, unit: "transactions", quantity: 31 },
      { category: "saas", vendor: "PostHog", amountCents: 300, unit: "events-M", quantity: 2.4 },
      { category: "saas", vendor: "Mapbox/MapTiler", amountCents: 1_150, unit: "tile-loads-K", quantity: 88 },
    ];
  }

  async getEmbedReferrers(_windowDays: number): Promise<EmbedReferrer[]> {
    return [
      { domain: "kyivindependent.com", loads: 48_210, uniqueWidgets: 6, errorRate: 0.002 },
      { domain: "pravda.com.ua", loads: 31_905, uniqueWidgets: 4, errorRate: 0.001 },
      { domain: "nv.ua", loads: 22_140, uniqueWidgets: 3, errorRate: 0.0 },
      { domain: "embed-test.localhost", loads: 9_400, uniqueWidgets: 1, errorRate: 0.214 },
      { domain: "suspilne.media", loads: 7_780, uniqueWidgets: 2, errorRate: 0.004 },
    ];
  }
}
