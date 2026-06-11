/**
 * POST /api/integrations/webhooks/playground
 *
 * Send a test event to a webhook endpoint — useful for verifying
 * that the customer's endpoint is configured correctly.
 *
 * Body:
 *   { endpointId: string; eventType: string; customPayload?: object }
 *
 * Returns:
 *   { ok: boolean; httpStatus: number; latencyMs: number; responseBody?: string; error?: string }
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { problemBadRequest, problemNotFound, problemRateLimit } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

const SUPPORTED_EVENT_TYPES = [
  "event.created",
  "event.updated",
  "event.verified",
  "event.retracted",
  "alert.triggered",
  "aoi.entered",
  "case.created",
  "case.updated",
] as const;

type PlaygroundEventType = (typeof SUPPORTED_EVENT_TYPES)[number];

function buildSamplePayload(eventType: PlaygroundEventType, endpointId: string): object {
  const base = {
    id: `whev_playground_${Date.now()}`,
    type: eventType,
    created: Math.floor(Date.now() / 1000),
    endpoint_id: endpointId,
    is_test: true,
  };

  const eventData: Record<string, object> = {
    "event.created": {
      event_id: "evt_playground_001",
      class: "drone",
      severity: 4,
      confidence: 0.82,
      occurred_at: new Date().toISOString(),
      country: "UA",
      region_code: "UA-63",
      title: { en: "Playground: Drone sighting (test)", uk: "Тест: виявлення дрону" },
    },
    "alert.triggered": {
      alert_id: "alert_playground_001",
      name: "Playground Alert",
      triggered_by_event: "evt_playground_001",
      triggered_at: new Date().toISOString(),
    },
    "aoi.entered": {
      aoi_id: "aoi_playground_001",
      event_id: "evt_playground_001",
      entered_at: new Date().toISOString(),
    },
    "case.created": {
      case_id: "case_playground_001",
      title: "Playground Case",
      created_at: new Date().toISOString(),
    },
  };

  return {
    ...base,
    data: eventData[eventType] ?? { message: "Playground test delivery", event_type: eventType },
  };
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:playground:${ip}`, 10, 60_000);
  if (!rl.ok) return problemRateLimit(undefined, rl.resetSeconds, rateLimitHeaders(rl));

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return problemBadRequest("Request body must be valid JSON.");
  }

  const { endpointId, eventType, customPayload } = body as {
    endpointId?: string;
    eventType?: string;
    customPayload?: object;
  };

  if (!endpointId) return problemBadRequest("endpointId is required.");
  if (!eventType || !SUPPORTED_EVENT_TYPES.includes(eventType as PlaygroundEventType)) {
    return problemBadRequest(
      `eventType must be one of: ${SUPPORTED_EVENT_TYPES.join(", ")}`,
      { supportedTypes: SUPPORTED_EVENT_TYPES },
    );
  }

  // In production: look up endpoint URL from DB, verify ownership
  // For demo: use a hardcoded test URL
  const DEMO_ENDPOINT_URL = "https://httpbin.org/post";
  const url = DEMO_ENDPOINT_URL;

  const payload = customPayload ?? buildSamplePayload(eventType as PlaygroundEventType, endpointId);
  const payloadStr = JSON.stringify(payload);

  // Sign the payload (HMAC-SHA256)
  const DEMO_SECRET = "playground-secret";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(DEMO_SECRET);
  const messageData = encoder.encode(payloadStr);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, messageData);
  const sig = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const t0 = Date.now();
  let httpStatus = 0;
  let responseBody: string | undefined;
  let error: string | undefined;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aegis-Signature": `sha256=${sig}`,
        "X-Aegis-Delivery-Id": `play_${Date.now()}`,
        "X-Aegis-Event": eventType,
        "User-Agent": "Aegis-Webhook/1.0 (playground)",
      },
      body: payloadStr,
      signal: AbortSignal.timeout(8000),
    });
    httpStatus = resp.status;
    responseBody = await resp.text().then((t) => t.slice(0, 500));
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Request failed";
  }

  const latencyMs = Date.now() - t0;

  return NextResponse.json(
    {
      ok: !error && httpStatus >= 200 && httpStatus < 300,
      httpStatus,
      latencyMs,
      responseBody,
      error,
      payload,
      signatureHeader: `sha256=${sig}`,
    },
    { headers: rateLimitHeaders(rl) },
  );
}
