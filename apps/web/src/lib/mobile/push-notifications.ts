/**
 * Push notification templates and permission policy for Aegis Lens.
 * Covers both APNs (iOS) and FCM (Android) notification schemas.
 */

export type PushNotificationType =
  | "alert-triggered"
  | "event-near-aoi"
  | "copilot-response"
  | "report-ready"
  | "breaking-event"
  | "system";

export interface PushConfig {
  type: PushNotificationType;
  title_en: string;
  title_uk: string;
  body_en: string;
  body_uk: string;
  priority: "high" | "normal";
  soundEnabled: boolean;
  badgeUpdate: boolean;
  deepLinkPath: string;
}

export const PUSH_NOTIFICATION_TEMPLATES: PushConfig[] = [
  {
    type: "alert-triggered",
    title_en: "Alert triggered: {{alertName}}",
    title_uk: "Тривога спрацювала: {{alertName}}",
    body_en: "{{eventCount}} new event(s) in {{regionName}} matching your alert criteria.",
    body_uk: "{{eventCount}} нових подій у {{regionName}} відповідають вашим критеріям.",
    priority: "high",
    soundEnabled: true,
    badgeUpdate: true,
    deepLinkPath: "/alerts/{{alertId}}",
  },
  {
    type: "event-near-aoi",
    title_en: "New event near your area of interest",
    title_uk: "Нова подія поблизу вашого регіону",
    body_en: "{{eventTitle}} — {{distanceKm}}km from {{aoiName}} ({{severity}} severity)",
    body_uk: "{{eventTitle}} — {{distanceKm}} км від {{aoiName}} (рівень: {{severity}})",
    priority: "high",
    soundEnabled: true,
    badgeUpdate: true,
    deepLinkPath: "/events/{{eventId}}",
  },
  {
    type: "copilot-response",
    title_en: "Aegis Copilot has responded",
    title_uk: "Aegis Copilot відповів",
    body_en: "Your query «{{querySnippet}}» has a new response.",
    body_uk: "Ваш запит «{{querySnippet}}» отримав відповідь.",
    priority: "normal",
    soundEnabled: false,
    badgeUpdate: false,
    deepLinkPath: "/copilot",
  },
  {
    type: "report-ready",
    title_en: "Your report is ready",
    title_uk: "Ваш звіт готовий",
    body_en: "«{{reportName}}» has been generated and is ready to download.",
    body_uk: "«{{reportName}}» згенеровано і готовий до завантаження.",
    priority: "normal",
    soundEnabled: false,
    badgeUpdate: true,
    deepLinkPath: "/reports/{{reportId}}",
  },
  {
    type: "breaking-event",
    title_en: "Significant event: {{regionName}}",
    title_uk: "Значна подія: {{regionName}}",
    body_en: "{{eventTitle}} — verified by {{sourceCount}} sources. Tap for details.",
    body_uk: "{{eventTitle}} — підтверджено {{sourceCount}} джерелами. Натисніть для деталей.",
    priority: "high",
    soundEnabled: true,
    badgeUpdate: true,
    deepLinkPath: "/events/{{eventId}}",
  },
  {
    type: "system",
    title_en: "Aegis Lens",
    title_uk: "Aegis Lens",
    body_en: "{{message}}",
    body_uk: "{{message_uk}}",
    priority: "normal",
    soundEnabled: false,
    badgeUpdate: false,
    deepLinkPath: "/settings",
  },
];

export const NOTIFICATION_PERMISSIONS_POLICY: {
  requestTiming: "after-first-value" | "on-install" | "never-auto";
  optOutGraceful: boolean;
  perTypeGranular: boolean;
} = {
  // Request permission only after the user has experienced first value (e.g. first alert fires)
  requestTiming: "after-first-value",
  // User can opt out of any notification type at any time without feature loss
  optOutGraceful: true,
  // Each notification type can be individually enabled/disabled in settings
  perTypeGranular: true,
};
