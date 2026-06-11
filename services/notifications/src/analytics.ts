import type { NotificationCategory } from "./taxonomy";

export type DeliveryOutcome =
  | "delivered"
  | "bounced"
  | "unsubscribed"
  | "rate_limited"
  | "channel_error";

export type NotificationEvent = "delivered" | "clicked" | "dismissed" | "unsubscribed";

export interface NotificationAnalyticsRecord {
  notificationId: string;
  userId: string;
  category: NotificationCategory;
  channel: string;
  outcome: DeliveryOutcome;
  deliveredAt: string;
  clickedAt?: string;
  dismissedAt?: string;
}

export interface CategoryStats {
  category: NotificationCategory;
  deliveries: number;
  clicks: number;
  dismissals: number;
  unsubscribes: number;
  deliveryRate: number;  // delivered / attempted
  clickThroughRate: number; // clicks / delivered
  /** Estimated unsubscribe pressure 0–1 */
  fatiguePressure: number;
}

class NotificationAnalyticsStore {
  private readonly records = new Map<string, NotificationAnalyticsRecord>();
  /** Attempted counts per category (includes rate_limited, bounced, etc.) */
  private readonly attempted = new Map<NotificationCategory, number>();

  record(record: NotificationAnalyticsRecord): void {
    this.records.set(record.notificationId, record);
    this.attempted.set(record.category, (this.attempted.get(record.category) ?? 0) + 1);
  }

  markClicked(notificationId: string): boolean {
    const r = this.records.get(notificationId);
    if (!r) return false;
    r.clickedAt = new Date().toISOString();
    return true;
  }

  markDismissed(notificationId: string): boolean {
    const r = this.records.get(notificationId);
    if (!r) return false;
    r.dismissedAt = new Date().toISOString();
    return true;
  }

  getStatsForCategory(category: NotificationCategory): CategoryStats {
    const categoryRecords = Array.from(this.records.values()).filter(
      (r) => r.category === category,
    );

    const deliveries = categoryRecords.filter((r) => r.outcome === "delivered").length;
    const clicks = categoryRecords.filter((r) => r.clickedAt != null).length;
    const dismissals = categoryRecords.filter((r) => r.dismissedAt != null).length;
    const unsubscribes = categoryRecords.filter((r) => r.outcome === "unsubscribed").length;
    const attempted = this.attempted.get(category) ?? 0;

    const deliveryRate = attempted > 0 ? deliveries / attempted : 0;
    const clickThroughRate = deliveries > 0 ? clicks / deliveries : 0;
    // High dismissal rate + low CTR → fatigue
    const dismissalRate = deliveries > 0 ? dismissals / deliveries : 0;
    const fatiguePressure = Math.min(1, dismissalRate * 0.7 + (1 - clickThroughRate) * 0.3);

    return {
      category,
      deliveries,
      clicks,
      dismissals,
      unsubscribes,
      deliveryRate: parseFloat(deliveryRate.toFixed(3)),
      clickThroughRate: parseFloat(clickThroughRate.toFixed(3)),
      fatiguePressure: parseFloat(fatiguePressure.toFixed(3)),
    };
  }

  getAllStats(): CategoryStats[] {
    const categories: NotificationCategory[] = [
      "critical", "alerts", "digest", "product", "account", "marketing",
    ];
    return categories.map((c) => this.getStatsForCategory(c));
  }

  /** Return raw records (paginated). */
  getRecords(opts?: { category?: NotificationCategory; limit?: number; offset?: number }): NotificationAnalyticsRecord[] {
    let all = Array.from(this.records.values()).sort((a, b) => b.deliveredAt.localeCompare(a.deliveredAt));
    if (opts?.category) all = all.filter((r) => r.category === opts.category);
    const offset = opts?.offset ?? 0;
    const limit = opts?.limit ?? 50;
    return all.slice(offset, offset + limit);
  }
}

export const notificationAnalytics = new NotificationAnalyticsStore();
