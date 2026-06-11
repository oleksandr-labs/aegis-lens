"use server";

/**
 * Canonical tier configuration — server-only pricing data.
 *
 * DO NOT import this module on the client. It is marked 'use server' to
 * prevent accidental inclusion in client bundles (especially gov-defense data).
 *
 * Source of truth: /data/pricing/tiers.csv
 * Канонічна конфігурація рівнів — тільки на сервері.
 */

import type {
  TierId,
  TierConfig,
} from "./types";

// ── Canonical tier configs ────────────────────────────────────────────────────

export const TIER_CONFIGS: Record<TierId, TierConfig> = {
  free: {
    tier_id: "free",
    name_en: "Free / Public",
    name_uk: "Безкоштовний / Публічний",
    audience_en: "Civilians, students, casual readers",
    audience_uk: "Цивільні, студенти, звичайні читачі",
    price_usd_mo: 0,
    billing_model: "free",
    freshness_delay_s: 900, // 15 minutes
    history_days: 7,
    max_watchlists: 1,
    max_aois: 1,
    max_aoi_km2: 100,
    alerts_per_day: 5,
    alert_channels: ["email"],
    copilot_msgs_per_day: 5,
    export_formats: ["png"],
    export_max_rows: 0,
    api_req_per_day: 0,
    collaboration: "none",
    support_sla: "community",
    compliance_features: "standard",
    public: true,
  },

  observer: {
    tier_id: "observer",
    name_en: "Observer",
    name_uk: "Спостерігач",
    audience_en: "Journalists, NGOs (light), researchers",
    audience_uk: "Журналісти, НГО (базово), дослідники",
    price_usd_mo: 12,
    billing_model: "self-serve",
    freshness_delay_s: 300, // 5 minutes
    history_days: 30,
    max_watchlists: 5,
    max_aois: 5,
    max_aoi_km2: 500,
    alerts_per_day: 50,
    alert_channels: ["email", "telegram"],
    copilot_msgs_per_day: 50,
    export_formats: ["png", "csv"],
    export_max_rows: 1000,
    api_req_per_day: 1000,
    collaboration: "none",
    support_sla: "email-best-effort",
    compliance_features: "standard",
    public: true,
  },

  pro: {
    tier_id: "pro",
    name_en: "Pro",
    name_uk: "Про",
    audience_en: "OSINT analysts, investigators",
    audience_uk: "OSINT-аналітики, слідчі",
    price_usd_mo: 49,
    billing_model: "self-serve",
    freshness_delay_s: 30, // near real-time
    history_days: 365, // 1 year
    max_watchlists: 25,
    max_aois: 25,
    max_aoi_km2: 1000,
    alerts_per_day: 500,
    alert_channels: ["email", "telegram", "slack", "discord"],
    copilot_msgs_per_day: 500,
    export_formats: ["png", "csv", "json", "geojson", "pdf"],
    export_max_rows: 100000,
    api_req_per_day: 50000,
    collaboration: "solo-case-files",
    support_sla: "email-best-effort",
    compliance_features: "standard",
    public: true,
  },

  "pro-plus": {
    tier_id: "pro-plus",
    name_en: "Pro+",
    name_uk: "Про+",
    audience_en: "Heavy analysts, freelance intel professionals",
    audience_uk: "Активні аналітики, фриланс-інтел спеціалісти",
    price_usd_mo: 119,
    billing_model: "self-serve",
    freshness_delay_s: 30, // real-time + WebSocket push
    history_days: 1095, // 3 years
    max_watchlists: 100,
    max_aois: 100,
    max_aoi_km2: 5000,
    alerts_per_day: 5000,
    alert_channels: ["email", "telegram", "slack", "discord", "webhooks"],
    copilot_msgs_per_day: 2000,
    export_formats: ["png", "csv", "json", "geojson", "pdf", "custom-branding"],
    export_max_rows: -1, // unlimited
    api_req_per_day: 500000,
    collaboration: "share-view-only",
    support_sla: "chat-1-business-day",
    compliance_features: "standard",
    public: true,
  },

  team: {
    tier_id: "team",
    name_en: "Team",
    name_uk: "Команда",
    audience_en: "Newsroom desks, NGO cells, small intel firms (5 seats incl.)",
    audience_uk: "Редакційні команди, осередки НГО, малі інтел-фірми (5 місць)",
    price_usd_mo: 399,
    billing_model: "self-serve",
    freshness_delay_s: 30, // real-time + webhooks + SLA
    history_days: -1, // full history
    max_watchlists: 500,
    max_aois: 500,
    max_aoi_km2: 10000,
    alerts_per_day: 50000,
    alert_channels: ["email", "telegram", "slack", "discord", "webhooks"],
    copilot_msgs_per_day: "shared",
    export_formats: ["png", "csv", "json", "geojson", "pdf", "scheduled", "s3-push"],
    export_max_rows: -1, // unlimited
    api_req_per_day: 2000000,
    collaboration: "full-collab-comments-mentions",
    support_sla: "chat-1-business-day",
    compliance_features: "standard-soc2",
    public: true,
  },

  business: {
    tier_id: "business",
    name_en: "Business",
    name_uk: "Бізнес",
    audience_en: "Intel firms, finance desks, security vendors",
    audience_uk: "Інтел-компанії, фінансові відділи, вендори безпеки",
    price_usd_mo: 2000,
    billing_model: "sales-led",
    freshness_delay_s: 30, // real-time + dedicated alert lane
    history_days: -1, // full history + raw source archive
    max_watchlists: 2000,
    max_aois: 2000,
    max_aoi_km2: 50000,
    alerts_per_day: -1, // unlimited + dedicated lane
    alert_channels: ["email", "telegram", "slack", "discord", "webhooks", "dedicated-lane"],
    copilot_msgs_per_day: "priority-queue",
    export_formats: ["png", "csv", "json", "geojson", "pdf", "scheduled", "s3-push", "raw-archive"],
    export_max_rows: -1, // unlimited
    api_req_per_day: 20000000,
    collaboration: "case-approvals-rbac-audit-log",
    support_sla: "priority-4h-business-hours",
    compliance_features: "sso-saml-scim",
    public: true,
  },

  enterprise: {
    tier_id: "enterprise",
    name_en: "Enterprise",
    name_uk: "Корпоративний",
    audience_en: "Defense primes, large corporates, government-adjacent entities",
    audience_uk: "Оборонні підрядники, великі корпорації, урядово-суміжні організації",
    price_usd_mo: null, // custom / contract ($25k+ /yr)
    billing_model: "sales-led",
    freshness_delay_s: 0, // real-time + dedicated edge
    history_days: -1, // unlimited
    max_watchlists: -1, // unlimited
    max_aois: -1, // unlimited
    max_aoi_km2: -1, // unlimited
    alerts_per_day: -1, // unlimited
    alert_channels: ["email", "telegram", "slack", "discord", "webhooks", "dedicated-lane"],
    copilot_msgs_per_day: "priority-fine-tuned",
    export_formats: ["png", "csv", "json", "geojson", "pdf", "custom-branding", "scheduled", "s3-push", "raw-archive"],
    export_max_rows: -1, // unlimited
    api_req_per_day: -1, // contract / dedicated capacity
    collaboration: "case-approvals-rbac-audit-log",
    support_sla: "dedicated-csm-24x7",
    compliance_features: "sso-saml-scim-audit-export-dpa-baa-regional",
    public: true,
  },

  "gov-defense": {
    tier_id: "gov-defense",
    name_en: "Government / Defense",
    name_uk: "Державний / Оборонний",
    audience_en: "Ministries of Defense, Ministries of Interior, intelligence agencies",
    audience_uk: "Міністерства оборони, МВС, спецслужби",
    price_usd_mo: null, // bespoke, often $100k+
    billing_model: "sales-led",
    freshness_delay_s: 0, // true real-time, dedicated edge
    history_days: -1, // unlimited
    max_watchlists: -1, // unlimited
    max_aois: -1, // unlimited
    max_aoi_km2: -1, // unlimited
    alerts_per_day: -1, // unlimited
    alert_channels: ["email", "telegram", "slack", "discord", "webhooks", "dedicated-lane"],
    copilot_msgs_per_day: "priority-fine-tuned",
    export_formats: ["png", "csv", "json", "geojson", "pdf", "custom-branding", "scheduled", "s3-push", "raw-archive"],
    export_max_rows: -1, // unlimited
    api_req_per_day: -1, // dedicated capacity
    collaboration: "full-enterprise-plus-onprem",
    support_sla: "dedicated-csm-24x7",
    compliance_features: "sso-saml-scim-audit-export-dpa-baa-itar-ear-airgap",
    public: false, // NOT shown on public pricing page / public API
  },

  "ngo-journalist": {
    tier_id: "ngo-journalist",
    name_en: "NGO / Journalist (Granted)",
    name_uk: "НГО / Журналіст (Грант)",
    audience_en: "Eligible journalists and NGOs approved by application",
    audience_uk: "Журналісти та НГО, затверджені за заявкою",
    price_usd_mo: 0, // free or 90% off
    billing_model: "application",
    freshness_delay_s: 300, // 5-min delay (same as Observer)
    history_days: 365, // 1 year
    max_watchlists: 25,
    max_aois: 25,
    max_aoi_km2: 1000,
    alerts_per_day: 500,
    alert_channels: ["email", "telegram", "slack"],
    copilot_msgs_per_day: 500,
    export_formats: ["png", "csv", "json", "geojson", "pdf"],
    export_max_rows: 100000,
    api_req_per_day: 50000,
    collaboration: "share-view-only",
    support_sla: "email-best-effort",
    compliance_features: "standard",
    public: true,
  },

  academic: {
    tier_id: "academic",
    name_en: "Academic",
    name_uk: "Академічний",
    audience_en: "Universities, research labs, approved by application",
    audience_uk: "Університети, дослідницькі лабораторії, за заявкою",
    price_usd_mo: 0, // free or per-seat granted
    billing_model: "application",
    freshness_delay_s: 300, // 5-min delay
    history_days: -1, // full history for research
    max_watchlists: 25,
    max_aois: 25,
    max_aoi_km2: 1000,
    alerts_per_day: 500,
    alert_channels: ["email", "telegram"],
    copilot_msgs_per_day: 500,
    export_formats: ["png", "csv", "json", "geojson"],
    export_max_rows: 100000,
    api_req_per_day: 50000,
    collaboration: "solo-case-files",
    support_sla: "email-best-effort",
    compliance_features: "standard",
    public: true,
  },
};

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Look up a tier's full configuration by its ID.
 * Throws if the ID is not found (should never happen with TierId type).
 *
 * Пошук конфігурації рівня за його ідентифікатором.
 */
export function getTierById(id: TierId): TierConfig {
  const config = TIER_CONFIGS[id];
  if (!config) {
    throw new Error(`Unknown tier ID: ${id}`);
  }
  return config;
}

/**
 * Returns all tiers that are visible on the public pricing page.
 * Excludes gov-defense (requires authenticated sales flow).
 *
 * Повертає всі рівні, доступні на публічній сторінці ціноутворення.
 */
export function getPublicTiers(): TierConfig[] {
  return Object.values(TIER_CONFIGS).filter((t) => t.public);
}

/**
 * Ordered list of all tier IDs from lowest to highest.
 * Matches the conceptual "upgrade path" shown on the pricing page.
 */
export const TIER_ORDER: TierId[] = [
  "free",
  "observer",
  "pro",
  "pro-plus",
  "team",
  "business",
  "enterprise",
  "gov-defense",
  // Mission tiers are parallel tracks, not upgrades
  "ngo-journalist",
  "academic",
];
