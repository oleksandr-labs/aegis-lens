/**
 * Severe-weather alert push — turn an orange/red UHMC warning (or a danger-mark
 * flood) into a civilian-safe Web Push payload.
 *
 * Mirrors the contract in @ua-map/civilian-alerts/web-push.ts (re-declared here
 * so this package stays self-contained — no cross-package import). Civilian
 * safety invariants:
 *   - push is silent by default (audio is the client's opt-in);
 *   - severe (red / danger) start pushes set requireInteraction so the OS does
 *     not auto-dismiss them;
 *   - only orange+ warnings push (yellow is overlay-only, to avoid alert fatigue).
 */

import type { OblastCode, SevereWarning, RiverGauge, WarningLevel } from "./types";
import { OBLAST_GEO, PHENOMENON_LABELS, FLOOD_RISK_LABELS } from "./types";

export type PushLocale = "uk" | "en";

/** Web Push subscription as serialized for transport (RFC 8030). */
export interface WeatherPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
}

export interface StoredWeatherPushSubscription {
  subscriptionId: string;
  userId: string;
  subscription: WeatherPushSubscription;
  /** Oblasts the user wants weather push for. */
  oblasts: OblastCode[];
  locale: PushLocale;
  /** Minimum level to push (default orange). */
  minLevel?: WarningLevel;
  disabled?: boolean;
}

export interface WeatherPushPayload {
  tag: string;
  title: string;
  body: string;
  locale: PushLocale;
  oblastCode: OblastCode;
  kind: "severe_warning" | "flood";
  severity: 1 | 2 | 3 | 4 | 5;
  url: string;
  requireInteraction: boolean;
  /** Always silent — audio is client opt-in, never forced by weather push. */
  silent: true;
  timestamp: number;
}

const LEVEL_RANK: Record<WarningLevel, number> = { yellow: 1, orange: 2, red: 3 };

/** Only orange+ warnings are eligible to push (yellow = overlay only). */
export function shouldPushWarning(w: SevereWarning, min: WarningLevel = "orange"): boolean {
  return LEVEL_RANK[w.level] >= LEVEL_RANK[min];
}

const TITLE: Record<PushLocale, string> = {
  uk: "Попередження про небезпечну погоду",
  en: "Severe weather warning",
};

const FLOOD_TITLE: Record<PushLocale, string> = {
  uk: "Попередження про паводок",
  en: "Flood warning",
};

export function buildWarningPush(
  w: SevereWarning,
  locale: PushLocale = "uk",
  baseUrl = "https://aegis-lens.app",
): WeatherPushPayload {
  const severity = w.level === "red" ? 5 : w.level === "orange" ? 4 : 2;
  const body = locale === "en" ? w.headline.en : w.headline.uk;
  return {
    tag: `wx-${w.oblast}-${w.phenomenon}`,
    title: TITLE[locale],
    body,
    locale,
    oblastCode: w.oblast,
    kind: "severe_warning",
    severity,
    url: `${baseUrl}/weather/${w.oblast}`,
    requireInteraction: severity >= 5,
    silent: true,
    timestamp: Date.parse(w.onsetAt) || Date.now(),
  };
}

export function buildFloodPush(
  g: RiverGauge,
  locale: PushLocale = "uk",
  baseUrl = "https://aegis-lens.app",
): WeatherPushPayload {
  const band = FLOOD_RISK_LABELS[g.risk];
  const body =
    locale === "en"
      ? `${band.en}: ${g.riverEn} at ${g.stationEn} (${g.levelCm} cm). Avoid low ground and riverbanks.`
      : `${band.uk}: р. ${g.riverUk}, ${g.stationUk} (${g.levelCm} см). Уникайте низин та берегів річок.`;
  return {
    tag: `wx-flood-${g.gaugeId}`,
    title: FLOOD_TITLE[locale],
    body,
    locale,
    oblastCode: g.oblast,
    kind: "flood",
    severity: band.severity,
    url: `${baseUrl}/weather/${g.oblast}`,
    requireInteraction: g.risk === "danger",
    silent: true,
    timestamp: Date.parse(g.measuredAt) || Date.now(),
  };
}

export interface WeatherPushSendResult {
  subscriptionId: string;
  ok: boolean;
  statusCode?: number;
  expired?: boolean;
  error?: string;
}

export interface WeatherPushTransport {
  send(subscription: WeatherPushSubscription, payload: WeatherPushPayload): Promise<{ statusCode: number }>;
}

/**
 * Fan a severe warning out to matching subscriptions (oblast watchlist + min
 * level), render per-locale copy, report per-subscription results.
 */
export async function pushSevereWarning(
  w: SevereWarning,
  subscriptions: StoredWeatherPushSubscription[],
  transport: WeatherPushTransport,
  baseUrl?: string,
): Promise<WeatherPushSendResult[]> {
  const targets = subscriptions.filter(
    (s) => !s.disabled && s.oblasts.includes(w.oblast) && shouldPushWarning(w, s.minLevel ?? "orange"),
  );
  return deliver(targets, (s) => buildWarningPush(w, s.locale, baseUrl), transport);
}

/** Fan a danger/adverse flood gauge out to matching subscriptions. */
export async function pushFloodAlert(
  g: RiverGauge,
  subscriptions: StoredWeatherPushSubscription[],
  transport: WeatherPushTransport,
  baseUrl?: string,
): Promise<WeatherPushSendResult[]> {
  if (g.risk !== "danger" && g.risk !== "adverse") return [];
  const targets = subscriptions.filter((s) => !s.disabled && s.oblasts.includes(g.oblast));
  return deliver(targets, (s) => buildFloodPush(g, s.locale, baseUrl), transport);
}

async function deliver(
  targets: StoredWeatherPushSubscription[],
  build: (s: StoredWeatherPushSubscription) => WeatherPushPayload,
  transport: WeatherPushTransport,
): Promise<WeatherPushSendResult[]> {
  return Promise.all(
    targets.map(async (s): Promise<WeatherPushSendResult> => {
      try {
        const { statusCode } = await transport.send(s.subscription, build(s));
        return {
          subscriptionId: s.subscriptionId,
          ok: statusCode >= 200 && statusCode < 300,
          statusCode,
          expired: statusCode === 404 || statusCode === 410,
        };
      } catch (err) {
        return {
          subscriptionId: s.subscriptionId,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );
}

/** Short bilingual oblast label (used in notification grouping UIs). */
export function oblastLabel(code: OblastCode, locale: PushLocale): string {
  const g = OBLAST_GEO[code];
  return locale === "en" ? `${g.nameEn} Oblast` : `${g.nameUk} область`;
}

/** Bilingual phenomenon label passthrough (used by notification centres). */
export function phenomenonLabel(w: SevereWarning, locale: PushLocale): string {
  const p = PHENOMENON_LABELS[w.phenomenon];
  return locale === "en" ? p.en : p.uk;
}
