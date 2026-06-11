/**
 * Typed event schemas and the central `trackEvent` dispatcher.
 *
 * Client-safe module — no server-only import.
 * Logging side-effects (Plausible, PostHog, etc.) are injected via
 * the optional `onTrack` hook so tests stay pure.
 */

import type {
  AcquisitionChannel,
  LocaleTag,
  PersonaTag,
  SessionContext,
  TrackingEventName,
  TrackingPayload,
} from "./types";

// ── Typed event interfaces ────────────────────────────────────────────────

export interface PageViewEvent {
  locale: LocaleTag;
  persona?: PersonaTag;
  referrerCohort: AcquisitionChannel;
  path: string;
  title: string;
}

export interface MapActivationEvent {
  firstInteraction: boolean;
  layersLoaded: string[];
  userId?: string;
}

export interface FilterEvent {
  filterType: string;
  saved: boolean;
  layerId: string;
}

export interface AlertCreatedEvent {
  aoiCount: number;
  channelType: "email" | "webhook" | "slack";
}

export interface EmbedInstalledEvent {
  referrerHostname: string;
  embedType: string;
}

export interface ApiKeyEvent {
  tier: string;
  firstCall: boolean;
  endpointFamily: string;
}

export interface ConversionEvent {
  fromTier: string;
  toTier: string;
  mrr: number;
  channel: AcquisitionChannel;
  daysToConvert: number;
}

// ── Sink type ─────────────────────────────────────────────────────────────

/**
 * A sink receives the fully-typed event envelope.
 * Register sinks at app initialisation (e.g. Plausible, PostHog, console).
 */
export type TrackingSink = <T extends TrackingEventName>(
  name: T,
  payload: TrackingPayload<T>,
  ctx: SessionContext,
  timestamp: string,
) => void;

const sinks: TrackingSink[] = [];

/** Register an analytics sink (idempotent per reference). */
export function registerSink(sink: TrackingSink): void {
  if (!sinks.includes(sink)) sinks.push(sink);
}

/** Remove a previously registered sink. */
export function deregisterSink(sink: TrackingSink): void {
  const idx = sinks.indexOf(sink);
  if (idx !== -1) sinks.splice(idx, 1);
}

// ── Core trackEvent function ──────────────────────────────────────────────

/**
 * Fire a typed analytics event to all registered sinks.
 *
 * @param name    - The event name (discriminates the payload type).
 * @param payload - Strongly-typed payload for `name`.
 * @param ctx     - Session context (locale, channel, sessionId …).
 */
export function trackEvent<T extends TrackingEventName>(
  name: T,
  payload: TrackingPayload<T>,
  ctx: SessionContext,
): void {
  const timestamp = new Date().toISOString();
  for (const sink of sinks) {
    try {
      sink(name, payload, ctx, timestamp);
    } catch (err) {
      // Tracking must never break the main thread
      if (process.env.NODE_ENV !== "production") {
        console.error("[trackEvent] sink threw:", err);
      }
    }
  }
}
