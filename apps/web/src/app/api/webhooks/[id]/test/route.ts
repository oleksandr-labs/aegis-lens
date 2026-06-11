/**
 * POST /api/webhooks/:id/test — send a test payload to the endpoint
 *
 * Useful for verifying that the customer's server is receiving and validating
 * Aegis webhook signatures correctly.
 */

import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { identifyRequest, rateLimit } from "@/lib/rate-limit";
import { webhookEndpointStore } from "@/lib/webhooks-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:test:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const ep = webhookEndpointStore.get(id);
  if (!ep) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (!ep.enabled) {
    return NextResponse.json({ error: "endpoint_disabled" }, { status: 409 });
  }

  const deliveryId = crypto.randomUUID();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const testPayload = {
    id: deliveryId,
    type: "webhook.test",
    created: new Date().toISOString(),
    data: {
      message: "This is a test delivery from AegisLens.",
      endpointId: id,
    },
  };

  const body = JSON.stringify(testPayload);
  // Sign with the stored hash (in production we'd have the actual secret)
  // For test purposes, create a placeholder signature
  const signature = "v0=" + ep.secretHash.slice(0, 32);

  let status: number;
  let durationMs: number;
  let error: string | undefined;

  const start = Date.now();
  try {
    const response = await fetch(ep.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Aegis-Signature-256": signature,
        "X-Aegis-Timestamp": timestamp,
        "X-Aegis-Delivery-Id": deliveryId,
        "X-Aegis-Event": "webhook.test",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    status = response.status;
  } catch (err) {
    status = 0;
    error = err instanceof Error ? err.message : "network_error";
  }
  durationMs = Date.now() - start;

  const success = status >= 200 && status < 300;

  return NextResponse.json({
    data: {
      deliveryId,
      endpointId: id,
      url: ep.url,
      status,
      durationMs,
      success,
      error,
      sentAt: new Date().toISOString(),
    },
  });
}
