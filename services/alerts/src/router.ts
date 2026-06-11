import type { AlertRule, AlertNotification, AlertDeliveryRecord } from "./types";
import type { ChannelDelivery } from "./channels";
import type { ThrottleStore } from "./throttle";
import { isInQuietHours } from "./throttle";
import { matchesCondition } from "./matcher";
import type { CanonicalEvent } from "@ua-map/schema";
import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

export interface UserChannelDestinations {
  user_id: string;
  destinations: Partial<Record<string, string>>; // channel → destination address
}

export interface AlertStore {
  getRulesForUser(userId: string): Promise<AlertRule[]>;
  saveDelivery(record: AlertDeliveryRecord): Promise<void>;
}

/**
 * Routes a canonical event to all matching rules, applies throttle/dedup/quiet-hours,
 * and delivers via the appropriate channel.
 */
export class AlertRouter {
  constructor(
    private readonly store: AlertStore,
    private readonly throttle: ThrottleStore,
    private readonly channels: Map<string, ChannelDelivery>,
    private readonly getDestinations: (userId: string) => Promise<UserChannelDestinations>,
    private readonly buildUrl: (eventId: string) => string,
  ) {}

  async route(event: CanonicalEvent, affectedUserIds: string[]): Promise<void> {
    await Promise.allSettled(affectedUserIds.map((uid) => this.routeForUser(event, uid)));
  }

  private async routeForUser(event: CanonicalEvent, userId: string): Promise<void> {
    const rules = await this.store.getRulesForUser(userId);
    const dests = await this.getDestinations(userId);

    for (const rule of rules) {
      if (!rule.enabled) continue;
      if (!matchesCondition(event, rule.condition)) continue;

      const isCritical = rule.priority === "critical";
      const inQuiet = isInQuietHours(rule.schedule.quiet_hours);
      if (inQuiet && !isCritical && !rule.schedule.critical_override) {
        await this.recordDelivery(rule.rule_id, event.event_id, rule.channels[0], "suppressed_quiet_hours");
        continue;
      }

      const { send, reason } = await this.throttle.shouldSend(
        rule.rule_id,
        event.event_id,
        rule.dedup_window_s,
        rule.max_per_hour,
      );

      if (!send) {
        await this.recordDelivery(rule.rule_id, event.event_id, rule.channels[0], reason === "dedup" ? "suppressed_dedup" : "suppressed_throttle");
        continue;
      }

      const notification = this.buildNotification(event, rule);

      for (const channelType of rule.channels) {
        const delivery = this.channels.get(channelType);
        const dest = dests.destinations[channelType];
        if (!delivery || !dest) continue;

        try {
          await delivery.send(notification, dest);
          await this.recordDelivery(rule.rule_id, event.event_id, channelType, "sent");
        } catch (err) {
          await this.recordDelivery(rule.rule_id, event.event_id, channelType, "failed", String(err));
        }
      }
    }
  }

  private buildNotification(event: CanonicalEvent, rule: AlertRule): AlertNotification {
    const locale = "en";
    const summary = event.summary[locale] ?? Object.values(event.summary)[0] ?? "";
    return {
      rule_id: rule.rule_id,
      event_id: event.event_id,
      priority: rule.priority,
      title: `${event.class.replace(/_/g, " ")} — Danger ${event.danger_score}/100`,
      body: summary.slice(0, 280),
      url: this.buildUrl(event.event_id),
      event_time: event.occurred_at ?? event.ingested_at,
      danger_score: event.danger_score,
      confidence: event.confidence,
      locale,
    };
  }

  private async recordDelivery(
    ruleId: string,
    eventId: string,
    channel: string,
    status: AlertDeliveryRecord["status"],
    error?: string,
  ): Promise<void> {
    await this.store.saveDelivery({
      delivery_id: ulid(),
      rule_id: ruleId,
      event_id: eventId,
      channel: channel as AlertDeliveryRecord["channel"],
      status,
      attempted_at: new Date().toISOString(),
      delivered_at: status === "sent" ? new Date().toISOString() : undefined,
      error,
      retry_count: 0,
    });
  }
}
