/**
 * WebSocket / polling feed adapter (task 5).
 *
 * Orchestrates the three sources with a single change-detecting loop:
 *   - primary: alerts.in.ua API (enterprise tier may stream via websocket;
 *     free/commercial poll at the tier's polite cadence);
 *   - fallbacks: @air_alert_ua bot + OVA channels (polled).
 *
 * Emits ONLY change events (raise / clear) per (oblast, type) after running the
 * multi-source quorum (cross-validate.ts), so duplicates are collapsed. The host
 * drives it by calling `tick()` on a timer, or by feeding websocket frames into
 * `ingestApiAlerts()` directly.
 */

import type { AlertRecord, AlertStatus, OblastCode, AlertType } from "./types";
import { AlertsInUaClient } from "./client";
import { TelegramFallbackSource } from "./telegram-fallback";
import { OvaFallbackSource } from "./ova-fallback";
import { crossValidate, type QuorumResult } from "./cross-validate";

export type FeedMode = "websocket" | "polling";

export interface FeedChangeEvent {
  oblastCode: OblastCode;
  type: AlertType;
  kind: "raise" | "clear";
  status: AlertStatus;
  confidence: number;
  conflict: boolean;
  at: string;
  quorum: QuorumResult;
}

export interface FeedAdapterConfig {
  apiToken?: string;
  tier?: "free" | "commercial" | "enterprise";
  botToken?: string;
}

export class AlertsFeedAdapter {
  private readonly api: AlertsInUaClient;
  private readonly bot: TelegramFallbackSource;
  private readonly ova: OvaFallbackSource;
  /** Last decided status per (oblast:type) so we emit only on change. */
  private decided = new Map<string, AlertStatus>();
  /** Most-recent records per source, kept for the quorum across ticks. */
  private buffer: AlertRecord[] = [];

  constructor(config: FeedAdapterConfig = {}) {
    this.api = new AlertsInUaClient({ token: config.apiToken, tier: config.tier });
    this.bot = new TelegramFallbackSource({ botToken: config.botToken });
    this.ova = new OvaFallbackSource({ botToken: config.botToken });
  }

  get mode(): FeedMode {
    return this.api.tier.websocket ? "websocket" : "polling";
  }

  /** Feed raw API records straight in (e.g. from a websocket frame). */
  ingestApiAlerts(records: AlertRecord[]): FeedChangeEvent[] {
    this.replaceSource(records, ["alerts_in_ua_api", "demo"]);
    return this.reconcile();
  }

  /** One polling cycle across all available sources. */
  async tick(): Promise<FeedChangeEvent[]> {
    const snapshot = await this.api.getActiveAlerts();
    this.replaceSource(snapshot.active, ["alerts_in_ua_api", "demo"]);

    if (this.bot.enabled) {
      const botRecs = await this.bot.poll();
      if (botRecs.length) this.replaceSource(botRecs, ["air_alert_ua_bot"]);
    }
    if (this.ova.enabled) {
      const ovaRecs = await this.ova.poll();
      if (ovaRecs.length) this.replaceSource(ovaRecs, ["ova_telegram"]);
    }

    return this.reconcile();
  }

  /** Replace all buffered records belonging to the given source(s). */
  private replaceSource(records: AlertRecord[], sources: AlertRecord["source"][]): void {
    const drop = new Set(sources);
    this.buffer = this.buffer.filter((r) => !drop.has(r.source)).concat(records);
  }

  /** Run quorum and emit change events. */
  private reconcile(): FeedChangeEvent[] {
    const results = crossValidate(this.buffer);
    const events: FeedChangeEvent[] = [];
    const seen = new Set<string>();

    for (const q of results) {
      const key = `${q.oblastCode}:${q.type}`;
      seen.add(key);
      const prev = this.decided.get(key);
      if (prev !== q.status) {
        this.decided.set(key, q.status);
        if (q.status === "active") {
          events.push(this.toEvent(q, "raise"));
        } else if (prev === "active") {
          events.push(this.toEvent(q, "clear"));
        }
      }
    }

    // Keys that vanished entirely from all sources ⇒ implicit clear.
    for (const [key, status] of this.decided) {
      if (!seen.has(key) && status === "active") {
        const [oblastCode, type] = key.split(":") as [OblastCode, AlertType];
        this.decided.set(key, "all_clear");
        events.push({
          oblastCode, type, kind: "clear", status: "all_clear",
          confidence: 0.6, conflict: false, at: new Date().toISOString(),
          quorum: { oblastCode, type, status: "all_clear", confidence: 0.6, votes: [], conflict: false },
        });
      }
    }

    return events;
  }

  private toEvent(q: QuorumResult, kind: "raise" | "clear"): FeedChangeEvent {
    return {
      oblastCode: q.oblastCode,
      type: q.type,
      kind,
      status: q.status,
      confidence: q.confidence,
      conflict: q.conflict,
      at: new Date().toISOString(),
      quorum: q,
    };
  }
}
