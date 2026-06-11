/**
 * Web Push (VAPID) delivery — typed subscription + payload model + send interface.
 *
 * Task: "Push / web-push delivery" (TODO_civilian_alerts.md).
 *
 * Scope: this module defines the *contract* for delivering civilian alerts via
 * the browser Push API. It carries NO secrets — VAPID keys are injected at the
 * edge by the caller (e.g. a worker reading `process.env.VAPID_PRIVATE_KEY`).
 * The actual signing/encryption (RFC 8291 / RFC 8030) is delegated to a
 * `WebPushTransport` the host wires in (e.g. the `web-push` npm lib or a
 * Cloudflare Worker). Keeping it abstract avoids a new dependency here.
 *
 * Civilian-safety invariants (see brief):
 *   - Payloads carry `requireInteraction` for severe alerts so the OS does not
 *     auto-dismiss them.
 *   - `silent: true` by default for push (sound is opt-in and owned by the
 *     client — see sound-policy.ts). Push MUST NOT force audio.
 */

import type { AlertType, OblastCode } from "./types";
import type { CivilianAlertEvent } from "./adapter";

/** Browser PushSubscription as serialized for storage/transport (RFC 8030). */
export interface WebPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    /** Client public key (base64url). */
    p256dh: string;
    /** Shared auth secret (base64url). */
    auth: string;
  };
}

/** A stored subscription bound to a user and their scoping preferences. */
export interface StoredPushSubscription {
  subscriptionId: string;
  userId: string;
  subscription: WebPushSubscription;
  /** Oblasts the user wants push for (empty = none; see watchlist.ts). */
  oblasts: OblastCode[];
  /** Preferred locale for the notification copy. */
  locale: "uk" | "ru" | "en";
  createdAt: string;
  /** User agent / platform hint for debugging delivery failures. */
  ua?: string;
  /** Disabled subscriptions are kept for audit but never delivered to. */
  disabled?: boolean;
}

/** Notification action button (maps to NotificationOptions.actions). */
export interface PushAction {
  action: string;
  title: string;
}

/** The payload encrypted and pushed to the browser service worker. */
export interface WebPushPayload {
  /** Stable key so repeated pushes for one oblast collapse (NotificationOptions.tag). */
  tag: string;
  title: string;
  body: string;
  /** Locale the title/body are written in. */
  locale: "uk" | "ru" | "en";
  oblastCode: OblastCode;
  alertType: AlertType;
  kind: "alert_start" | "alert_end";
  /** Severity 0..5 (mirrors CivilianAlertEvent.severity). */
  severity: 0 | 1 | 2 | 3 | 4 | 5;
  /** Deep link the SW opens on click. */
  url: string;
  /**
   * Keep the notification on screen until the user acts. True for severe
   * (>=4) alert_start so people do not miss an air-raid warning.
   */
  requireInteraction: boolean;
  /**
   * Push is silent by default — audio is the client's opt-in choice
   * (sound-policy.ts). NEVER set false here without an explicit user opt-in.
   */
  silent: boolean;
  /** Epoch ms the alert occurred — lets SW drop stale pushes. */
  timestamp: number;
  actions: PushAction[];
}

const PUSH_TITLE: Record<"alert_start" | "alert_end", { uk: string; ru: string; en: string }> = {
  alert_start: {
    uk: "Повітряна тривога",
    ru: "Воздушная тревога",
    en: "Air raid alert",
  },
  alert_end: {
    uk: "Відбій тривоги",
    ru: "Отбой тревоги",
    en: "All clear",
  },
};

/** Build the user-facing push payload from a civilian alert event. */
export function buildPushPayload(
  event: CivilianAlertEvent,
  locale: "uk" | "ru" | "en" = "uk",
  baseUrl = "https://aegis-lens.app",
): WebPushPayload {
  const isStart = event.type === "alert_start";
  const title = PUSH_TITLE[event.type][locale];
  const body =
    locale === "en"
      ? event.summary.en
      : event.summary.uk; // ru falls back to uk copy until ru summaries land

  return {
    tag: `civil-${event.oblastCode}-${event.alertType}`,
    title,
    body,
    locale,
    oblastCode: event.oblastCode,
    alertType: event.alertType,
    kind: event.type,
    severity: event.severity,
    url: `${baseUrl}/safety/${event.oblastCode}`,
    requireInteraction: isStart && event.severity >= 4,
    silent: true,
    timestamp: Date.parse(event.occurredAt) || Date.now(),
    actions: isStart
      ? [{ action: "shelter", title: locale === "en" ? "Find shelter" : "Знайти укриття" }]
      : [],
  };
}

/** Result of a single push attempt. */
export interface PushSendResult {
  subscriptionId: string;
  ok: boolean;
  /** HTTP status from the push service (e.g. 201 ok, 404/410 = gone). */
  statusCode?: number;
  /** True when the endpoint is gone (404/410) and should be pruned. */
  expired?: boolean;
  error?: string;
}

/**
 * Transport abstraction. Host injects a concrete signer (VAPID) — secrets stay
 * out of this package. A typical impl wraps the `web-push` library or a Worker.
 */
export interface WebPushTransport {
  send(
    subscription: WebPushSubscription,
    payload: WebPushPayload,
  ): Promise<{ statusCode: number }>;
}

/**
 * Fan an alert event out to every matching subscription. Filters by the
 * subscriber's oblast watchlist, renders per-locale copy, and reports
 * per-subscription results (so callers can prune expired endpoints).
 */
export async function deliverAlert(
  event: CivilianAlertEvent,
  subscriptions: StoredPushSubscription[],
  transport: WebPushTransport,
  baseUrl?: string,
): Promise<PushSendResult[]> {
  const targets = subscriptions.filter(
    (s) => !s.disabled && s.oblasts.includes(event.oblastCode),
  );

  const results = await Promise.all(
    targets.map(async (s): Promise<PushSendResult> => {
      const payload = buildPushPayload(event, s.locale, baseUrl);
      try {
        const { statusCode } = await transport.send(s.subscription, payload);
        const expired = statusCode === 404 || statusCode === 410;
        return {
          subscriptionId: s.subscriptionId,
          ok: statusCode >= 200 && statusCode < 300,
          statusCode,
          expired,
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

  return results;
}
