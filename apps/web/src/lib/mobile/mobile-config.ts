/**
 * Mobile platform configuration for Aegis Lens.
 * iOS and Android: Phase 3+. PWA: current.
 */

export type MobilePlatform = "ios" | "android" | "pwa";

export interface MobileFeatureSet {
  platform: MobilePlatform;
  pushNotificationsEnabled: boolean;
  offlineModeEnabled: boolean;
  biometricAuthEnabled: boolean;
  deepLinkScheme: string;
  shareExtension: boolean;
  widgetSupport: boolean;
  watchSupport: boolean;
  minimumOsVersion: string;
}

export const MOBILE_CONFIG: Record<MobilePlatform, MobileFeatureSet> = {
  ios: {
    platform: "ios",
    pushNotificationsEnabled: true,  // APNs + Live Activities
    offlineModeEnabled: true,         // Background fetch for digests
    biometricAuthEnabled: true,       // Face ID / Touch ID via ASWebAuthenticationSession
    deepLinkScheme: "aegislens://",
    shareExtension: true,
    widgetSupport: true,              // Lock-screen widgets: region status, last critical alert
    watchSupport: false,              // Deferred — Phase 4
    minimumOsVersion: "16.0",
  },
  android: {
    platform: "android",
    pushNotificationsEnabled: true,   // FCM (consider Unified Push for sovereignty)
    offlineModeEnabled: true,         // WorkManager background sync
    biometricAuthEnabled: true,       // BiometricPrompt
    deepLinkScheme: "aegislens://",
    shareExtension: true,
    widgetSupport: false,             // Phase 4
    watchSupport: false,              // Deferred
    minimumOsVersion: "8.0",          // API level 26
  },
  pwa: {
    platform: "pwa",
    pushNotificationsEnabled: true,   // Web Push API
    offlineModeEnabled: true,         // Service Worker + Cache API
    biometricAuthEnabled: false,      // Not available in PWA context
    deepLinkScheme: "https://",
    shareExtension: false,
    widgetSupport: false,
    watchSupport: false,
    minimumOsVersion: "n/a",
  },
};

export const DEEP_LINK_ROUTES: {
  path: string;
  screen: string;
  description_en: string;
}[] = [
  {
    path: "/events/:id",
    screen: "EventDetail",
    description_en: "Open a specific event detail view by event ID",
  },
  {
    path: "/map/region/:regionCode",
    screen: "RegionView",
    description_en: "Navigate to a specific region on the live map",
  },
  {
    path: "/alerts",
    screen: "AlertManagement",
    description_en: "Open the alert management list",
  },
  {
    path: "/alerts/:id",
    screen: "AlertDetail",
    description_en: "Open a specific alert configuration",
  },
  {
    path: "/copilot",
    screen: "AiCopilot",
    description_en: "Open the AI copilot query panel",
  },
  {
    path: "/saved-searches",
    screen: "SavedSearches",
    description_en: "Open saved search and filter presets",
  },
  {
    path: "/settings",
    screen: "Settings",
    description_en: "Open user settings",
  },
  {
    path: "/settings/billing",
    screen: "Billing",
    description_en: "Open billing and subscription management",
  },
  {
    path: "/settings/api",
    screen: "ApiKeys",
    description_en: "Open API key management",
  },
  {
    path: "/reports/:id",
    screen: "ReportViewer",
    description_en: "Open a specific generated report",
  },
];

export interface AsoConfig {
  platform: "ios" | "android";
  appName: string;
  subtitle?: string;
  keywords: string[];
  shortDescription_en: string;
  fullDescription_en: string;
  categoryPrimary: string;
  categorySecondary?: string;
  ratingCategory: string;
}

export const ASO_CONFIG: Record<"ios" | "android", AsoConfig> = {
  ios: {
    platform: "ios",
    appName: "Aegis Lens",
    subtitle: "Live OSINT Intelligence Map",
    keywords: [
      "OSINT",
      "intelligence",
      "Ukraine",
      "conflict map",
      "live events",
      "security alerts",
      "news verification",
      "geospatial",
      "analyst",
      "journalist",
    ],
    shortDescription_en:
      "Real-time verified events, conflict mapping, and AI-powered intelligence for analysts and journalists.",
    fullDescription_en: `Aegis Lens is the AI-native OSINT intelligence platform for people who need to know what's happening — before anyone else.

WHAT IT DOES
• Live map of verified events — shelling reports, humanitarian developments, movement patterns
• AI copilot that synthesises open-source intelligence into cited briefings
• Customisable alerts by region, event type, and severity
• Lock-screen widgets showing region status and latest critical alert
• Export data as CSV, GeoJSON, or shareable reports

WHO IT'S FOR
• Conflict analysts and researchers
• Journalists covering Eastern Europe and beyond
• NGOs and humanitarian organisations
• Security consultants and risk officers

VERIFIED & SOURCED
Every event is tagged with source, timestamp, and verification status. We cite our sources.

PRIVACY FIRST
No tracking of your monitoring interests. Your saved searches stay on your device.

Free tier available. Pro and Team plans for power users.`,
    categoryPrimary: "News",
    categorySecondary: "Reference",
    ratingCategory: "17+ (Frequent/Intense Realistic Violence — conflict news content)",
  },
  android: {
    platform: "android",
    appName: "Aegis Lens — OSINT Map",
    keywords: [
      "OSINT",
      "conflict map",
      "Ukraine news",
      "intelligence platform",
      "live events map",
      "security alerts",
      "journalist tool",
      "verified news",
      "geospatial intelligence",
      "analyst app",
    ],
    shortDescription_en:
      "Live verified conflict map with AI intelligence. For analysts, journalists, and NGOs.",
    fullDescription_en: `Aegis Lens delivers real-time verified OSINT intelligence through an interactive map, AI copilot, and customisable alerts.

FEATURES
▸ Live map updated in real time with verified events
▸ AI copilot: ask questions, get cited intelligence summaries
▸ Alerts by region, severity, and event type — including push via FCM
▸ Background sync for offline digest reading
▸ Export CSV / GeoJSON / shareable report links
▸ Material You theming with dark mode default

FOR PROFESSIONALS
Designed for conflict analysts, journalists, humanitarian workers, and security researchers who need accuracy over speed — but also speed.

OPEN SOURCING INTELLIGENCE
We cite every source. Verification tier is shown on each event. Uncertainty is acknowledged, never hidden.

Free tier available. Pro and Team plans unlock full history, bulk exports, and API access.`,
    categoryPrimary: "News & Magazines",
    categorySecondary: "Maps & Navigation",
    ratingCategory: "Mature 17+ (News involving war/conflict)",
  },
};
