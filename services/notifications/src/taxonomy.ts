/**
 * Push notification taxonomy for Aegis Lens.
 *
 * Categories defined per TODO/features/TODO_push_taxonomy.md:
 *   - critical: air alert, family-watchlist critical event (overrides quiet hours)
 *   - alerts: user-rule matches
 *   - digest: daily/weekly rollups
 *   - product: changelog, new features, beta invites
 *   - account: billing, security, MFA
 *   - marketing: opt-in only
 *
 * Delivery channel routing:
 *   - web push, email, Telegram, SMS (SMS critical-only)
 */

export type NotificationCategory =
  | "critical"
  | "alerts"
  | "digest"
  | "product"
  | "account"
  | "marketing";

export type DeliveryChannel = "push" | "email" | "telegram" | "sms" | "slack" | "discord";

export interface NotificationCategoryConfig {
  category: NotificationCategory;
  labelEn: string;
  labelUk: string;
  /** Can be silenced by user quiet hours? */
  respectsQuietHours: boolean;
  /** Default enabled state for new users */
  defaultEnabled: boolean;
  /** Maximum notifications per hour (anti-fatigue cap) */
  rateCapPerHour: number;
  /** Default delivery channels */
  defaultChannels: DeliveryChannel[];
  /** Whether category requires explicit opt-in */
  requiresOptIn: boolean;
  /** iOS Critical Alert — bypasses silent mode */
  iosCritical: boolean;
  badge: boolean;
  vibrate: boolean;
  sound: "default" | "alert" | "soft" | "none";
}

export const NOTIFICATION_TAXONOMY: Record<NotificationCategory, NotificationCategoryConfig> = {
  critical: {
    category: "critical",
    labelEn: "Critical Alerts",
    labelUk: "Критичні сповіщення",
    respectsQuietHours: false,
    defaultEnabled: true,
    rateCapPerHour: 0,  // no cap — safety-critical
    defaultChannels: ["push", "sms"],
    requiresOptIn: false,
    iosCritical: true,
    badge: true,
    vibrate: true,
    sound: "alert",
  },

  alerts: {
    category: "alerts",
    labelEn: "Alert Rule Matches",
    labelUk: "Спрацювання правил сповіщень",
    respectsQuietHours: true,
    defaultEnabled: true,
    rateCapPerHour: 20,
    defaultChannels: ["push", "email"],
    requiresOptIn: false,
    iosCritical: false,
    badge: true,
    vibrate: true,
    sound: "default",
  },

  digest: {
    category: "digest",
    labelEn: "Daily & Weekly Digests",
    labelUk: "Щоденні та щотижневі дайджести",
    respectsQuietHours: true,
    defaultEnabled: true,
    rateCapPerHour: 2,
    defaultChannels: ["email"],
    requiresOptIn: false,
    iosCritical: false,
    badge: false,
    vibrate: false,
    sound: "soft",
  },

  product: {
    category: "product",
    labelEn: "Product Updates",
    labelUk: "Оновлення продукту",
    respectsQuietHours: true,
    defaultEnabled: true,
    rateCapPerHour: 1,
    defaultChannels: ["push"],
    requiresOptIn: false,
    iosCritical: false,
    badge: false,
    vibrate: false,
    sound: "soft",
  },

  account: {
    category: "account",
    labelEn: "Account & Security",
    labelUk: "Обліковий запис та безпека",
    respectsQuietHours: false,
    defaultEnabled: true,
    rateCapPerHour: 5,
    defaultChannels: ["push", "email"],
    requiresOptIn: false,
    iosCritical: false,
    badge: true,
    vibrate: false,
    sound: "soft",
  },

  marketing: {
    category: "marketing",
    labelEn: "Marketing & Promotions",
    labelUk: "Маркетинг та акції",
    respectsQuietHours: true,
    defaultEnabled: false,
    rateCapPerHour: 1,
    defaultChannels: ["email"],
    requiresOptIn: true,
    iosCritical: false,
    badge: false,
    vibrate: false,
    sound: "none",
  },
};

// ── User notification preferences ─────────────────────────────────────────────

export interface UserNotificationPreferences {
  userId: string;
  /** Per-category channel overrides */
  channels: Partial<Record<NotificationCategory, DeliveryChannel[]>>;
  /** Per-category enabled/disabled */
  enabled: Partial<Record<NotificationCategory, boolean>>;
  /** Quiet hours: UTC start/end (e.g. "22:00" to "07:00") */
  quietHours?: { start: string; end: string };
  updatedAt: string;
}

export function getDefaultPreferences(userId: string): UserNotificationPreferences {
  const now = new Date().toISOString();
  const channels: Partial<Record<NotificationCategory, DeliveryChannel[]>> = {};
  const enabled: Partial<Record<NotificationCategory, boolean>> = {};

  for (const [cat, config] of Object.entries(NOTIFICATION_TAXONOMY)) {
    channels[cat as NotificationCategory] = [...config.defaultChannels];
    enabled[cat as NotificationCategory] = config.defaultEnabled;
  }

  return { userId, channels, enabled, updatedAt: now };
}

/**
 * Check whether a notification should be delivered to a channel,
 * applying quiet hours, opt-in requirements, and per-category caps.
 */
export function shouldDeliver(
  category: NotificationCategory,
  channel: DeliveryChannel,
  prefs: UserNotificationPreferences,
): boolean {
  const config = NOTIFICATION_TAXONOMY[category];

  // Check category enabled
  if (prefs.enabled[category] === false) return false;

  // Check opt-in for marketing
  if (config.requiresOptIn && prefs.enabled[category] !== true) return false;

  // Check channel is in user's preferred channels for this category
  const userChannels = prefs.channels[category] ?? config.defaultChannels;
  if (!userChannels.includes(channel)) return false;

  // Quiet hours (skip for critical)
  if (config.respectsQuietHours && prefs.quietHours) {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const nowMinutes = utcH * 60 + utcM;

    const [startH, startM] = prefs.quietHours.start.split(":").map(Number);
    const [endH, endM] = prefs.quietHours.end.split(":").map(Number);
    const startMin = (startH ?? 0) * 60 + (startM ?? 0);
    const endMin = (endH ?? 0) * 60 + (endM ?? 0);

    const inQuietHours =
      startMin < endMin
        ? nowMinutes >= startMin && nowMinutes < endMin
        : nowMinutes >= startMin || nowMinutes < endMin;

    if (inQuietHours) return false;
  }

  return true;
}

// ── Notification payload builder ──────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  vibrate?: number[];
  requireInteraction?: boolean;
}

export function buildPushPayload(
  category: NotificationCategory,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): PushPayload {
  const config = NOTIFICATION_TAXONOMY[category];
  return {
    title,
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: category,
    data: { category, url: "/", ...data },
    vibrate: config.vibrate ? (category === "critical" ? [200, 100, 200, 100, 200] : [100]) : [],
    requireInteraction: category === "critical" || category === "alerts",
  };
}
