/**
 * Core types for analytics & attribution tracking.
 *
 * Shared between client and server — no "server-only" import here.
 * Server-side modules (attribution.ts, plausible.ts) add that guard themselves.
 */

// ── Dimensional tags ──────────────────────────────────────────────────────

export type AcquisitionChannel =
  | "organic"
  | "embed_referral"
  | "press"
  | "direct"
  | "paid"
  | "social"
  | "email";

export type PersonaTag =
  | "journalist"
  | "researcher"
  | "ngo"
  | "government"
  | "military"
  | "investor"
  | "developer"
  | "general";

/** Must match the Locale union from @aegis/i18n-config */
export type LocaleTag = "en" | "uk" | "pl" | "de" | "ro" | "fr" | "es";

export type FunnelStage =
  | "awareness"
  | "consideration"
  | "activation"
  | "conversion"
  | "expansion";

// ── Session context ───────────────────────────────────────────────────────

export interface SessionContext {
  userId?: string;
  locale: LocaleTag;
  persona?: PersonaTag;
  channel: AcquisitionChannel;
  referrer?: string;
  sessionId: string;
}

// ── Event names ───────────────────────────────────────────────────────────

export type TrackingEventName =
  | "page_view"
  | "map_workspace_activation"
  | "filter_created"
  | "filter_saved"
  | "alert_created"
  | "embed_installed"
  | "api_key_created"
  | "api_first_call"
  | "trial_to_paid"
  | "pro_to_enterprise";

// ── Per-event payload shapes ──────────────────────────────────────────────

export interface PageViewPayload {
  locale: LocaleTag;
  persona?: PersonaTag;
  referrerCohort: AcquisitionChannel;
  path: string;
  title: string;
}

export interface MapWorkspaceActivationPayload {
  firstInteraction: boolean;
  layersLoaded: string[];
  userId?: string;
}

export interface FilterCreatedPayload {
  filterType: string;
  saved: false;
  layerId: string;
}

export interface FilterSavedPayload {
  filterType: string;
  saved: true;
  layerId: string;
}

export interface AlertCreatedPayload {
  aoiCount: number;
  channelType: "email" | "webhook" | "slack";
}

export interface EmbedInstalledPayload {
  referrerHostname: string;
  embedType: string;
}

export interface ApiKeyCreatedPayload {
  tier: string;
  firstCall: false;
  endpointFamily: string;
}

export interface ApiFirstCallPayload {
  tier: string;
  firstCall: true;
  endpointFamily: string;
}

export interface TrialToPaidPayload {
  fromTier: "free";
  toTier: "pro";
  mrr: number;
  channel: AcquisitionChannel;
  daysToConvert: number;
}

export interface ProToEnterprisePayload {
  fromTier: "pro";
  toTier: "enterprise";
  mrr: number;
  channel: AcquisitionChannel;
  daysToConvert: number;
}

// ── Discriminated union for type-safe payloads ────────────────────────────

export type TrackingPayload<T extends TrackingEventName> =
  T extends "page_view"                  ? PageViewPayload :
  T extends "map_workspace_activation"   ? MapWorkspaceActivationPayload :
  T extends "filter_created"             ? FilterCreatedPayload :
  T extends "filter_saved"              ? FilterSavedPayload :
  T extends "alert_created"             ? AlertCreatedPayload :
  T extends "embed_installed"           ? EmbedInstalledPayload :
  T extends "api_key_created"           ? ApiKeyCreatedPayload :
  T extends "api_first_call"            ? ApiFirstCallPayload :
  T extends "trial_to_paid"             ? TrialToPaidPayload :
  T extends "pro_to_enterprise"         ? ProToEnterprisePayload :
  never;

// ── Generic event envelope ────────────────────────────────────────────────

export interface TrackingEvent<T extends TrackingEventName = TrackingEventName> {
  name: T;
  payload: TrackingPayload<T>;
  ctx: SessionContext;
  timestamp: string; // ISO 8601
}
