/**
 * GET    /api/webhooks/:id — get endpoint details
 * PATCH  /api/webhooks/:id — update endpoint (url, filters, description, enabled)
 * DELETE /api/webhooks/:id — remove endpoint
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  webhookEndpointStore,
  VALID_EVENT_FILTERS,
  type WebhookEndpoint,
} from "@/lib/webhooks-store";

export const dynamic = "force-dynamic";

function sanitize(ep: WebhookEndpoint) {
  const { secretHash, ...rest } = ep;
  return { ...rest, secretPrefix: secretHash.slice(0, 8) + "..." };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:get:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const ep = webhookEndpointStore.get(id);
  if (!ep) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ data: sanitize(ep) }, { headers: rateLimitHeaders(rl) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:update:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const ep = webhookEndpointStore.get(id);
  if (!ep) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updated = { ...ep, updatedAt: new Date().toISOString() };

  if (typeof body.url === "string") {
    if (!body.url.startsWith("https://")) {
      return NextResponse.json({ error: "validation", message: "url must be https" }, { status: 422 });
    }
    updated.url = body.url;
  }
  if (typeof body.description === "string") {
    updated.description = body.description.slice(0, 500);
  }
  if (typeof body.enabled === "boolean") {
    updated.enabled = body.enabled;
    if (body.enabled) updated.consecutiveFailures = 0; // reset on re-enable
  }
  if (Array.isArray(body.eventFilters)) {
    const valid = (body.eventFilters as string[]).filter(
      (f) => (VALID_EVENT_FILTERS as readonly string[]).includes(f),
    );
    if (valid.length > 0) updated.eventFilters = valid;
  }

  webhookEndpointStore.set(id, updated);
  return NextResponse.json({ data: sanitize(updated) });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:delete:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!webhookEndpointStore.has(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  webhookEndpointStore.delete(id);
  return new Response(null, { status: 204 });
}
