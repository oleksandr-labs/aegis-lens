/**
 * GET  /api/webhooks — list webhook endpoints
 * POST /api/webhooks — register a new endpoint
 *
 * The raw signing secret is only returned at creation time.
 * All subsequent reads return the secretHash (SHA-256 prefix) for verification.
 */

import { NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  webhookEndpointStore,
  hashSecret,
  VALID_EVENT_FILTERS,
  type WebhookEndpoint,
} from "@/lib/webhooks-store";

export const dynamic = "force-dynamic";

function sanitizeEndpoint(ep: WebhookEndpoint): Omit<WebhookEndpoint, "secretHash"> & { secretPrefix: string } {
  const { secretHash, ...rest } = ep;
  return { ...rest, secretPrefix: secretHash.slice(0, 8) + "..." };
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:list:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const enabledOnly = url.searchParams.get("enabled") === "true";

  let endpoints = Array.from(webhookEndpointStore.values());
  if (enabledOnly) endpoints = endpoints.filter((e) => e.enabled);
  endpoints.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(
    { data: endpoints.map(sanitizeEndpoint), meta: { count: endpoints.length } },
    { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
  );
}

export async function POST(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`webhooks:create:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.url !== "string" || !body.url.startsWith("https://")) {
    return NextResponse.json(
      { error: "validation", message: "url must be an https:// URL" },
      { status: 422 },
    );
  }

  const filters = Array.isArray(body.eventFilters) ? body.eventFilters as string[] : [];
  const validFilters = filters.filter((f) => (VALID_EVENT_FILTERS as readonly string[]).includes(f));
  if (validFilters.length === 0) {
    return NextResponse.json(
      { error: "validation", message: `eventFilters must include at least one of: ${VALID_EVENT_FILTERS.join(", ")}` },
      { status: 422 },
    );
  }

  // Generate a secure signing secret
  const rawSecret = "whsec_" + randomBytes(24).toString("base64url");
  const now = new Date().toISOString();
  const endpointId = `ep_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const endpoint: WebhookEndpoint = {
    endpointId,
    url: body.url,
    secretHash: hashSecret(rawSecret),
    description: typeof body.description === "string" ? body.description.slice(0, 500) : undefined,
    eventFilters: validFilters,
    enabled: true,
    consecutiveFailures: 0,
    createdAt: now,
    updatedAt: now,
  };

  webhookEndpointStore.set(endpointId, endpoint);

  // Return the raw secret only at creation time
  return NextResponse.json(
    {
      data: sanitizeEndpoint(endpoint),
      secret: rawSecret,
      warning: "Store this secret securely. It will not be shown again.",
    },
    { status: 201 },
  );
}
