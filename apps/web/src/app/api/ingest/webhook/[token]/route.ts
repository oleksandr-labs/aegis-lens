/**
 * POST /api/ingest/webhook/:token
 *
 * Generic push-source webhook receiver.
 * Each registered source has a unique :token + HMAC secret.
 *
 * Handles: Telegram Bot updates, generic JSON webhooks.
 * Twitter CRC challenge: GET /api/ingest/webhook/:token?crc_token=...
 */

import { NextResponse } from "next/server";
import { problemBadRequest, problemNotFound, problemForbidden } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// We inline the logic here since importing services/* in Next.js routes
// can cause transpile issues. In production wire to the ingest service via RPC.

interface PushSourceConfig {
  sourceId: string;
  token: string;
  secret: string;
  type: "generic" | "telegram" | "twitter_crc" | "github";
  isActive: boolean;
}

// Demo receivers (production: load from DB)
const DEMO_RECEIVERS: PushSourceConfig[] = [
  {
    sourceId: "push-demo-generic",
    token: "demo-generic-token-001",
    secret: process.env.WEBHOOK_RECEIVER_SECRET ?? "dev-secret",
    type: "generic",
    isActive: true,
  },
];

function findReceiver(token: string): PushSourceConfig | undefined {
  return DEMO_RECEIVERS.find((r) => r.token === token && r.isActive);
}

async function verifyHmac(payload: Buffer, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, payload);
  const computed = "sha256=" + Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  try {
    return computed === signature;
  } catch {
    return false;
  }
}

// Twitter CRC challenge response
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const receiver = findReceiver(params.token);
  if (!receiver) return problemNotFound("Webhook receiver");

  const url = new URL(req.url);
  const crcToken = url.searchParams.get("crc_token");
  if (!crcToken) return problemBadRequest("Missing crc_token");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(receiver.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(crcToken));
  const responseToken = "sha256=" + btoa(String.fromCharCode(...new Uint8Array(sig)));

  return NextResponse.json({ response_token: responseToken });
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const receiver = findReceiver(params.token);
  if (!receiver) return problemNotFound("Webhook receiver");

  const rawBody = await req.arrayBuffer();
  const payload = Buffer.from(rawBody);

  // Verify signature if provided
  const sig = req.headers.get("x-hub-signature-256") ??
               req.headers.get("x-aegis-signature") ??
               req.headers.get("x-telegram-bot-api-secret-token");

  if (sig) {
    const valid = await verifyHmac(payload, sig, receiver.secret);
    if (!valid) return problemForbidden("Invalid webhook signature");
  }

  let body: unknown;
  try {
    body = JSON.parse(payload.toString("utf-8"));
  } catch {
    return problemBadRequest("Webhook body must be valid JSON");
  }

  // In production: publish to Kafka events.raw topic
  // For now: log receipt
  console.log(`[webhook-receiver] Received from ${receiver.sourceId}:`, JSON.stringify(body).slice(0, 200));

  return NextResponse.json({
    ok: true,
    sourceId: receiver.sourceId,
    receivedAt: new Date().toISOString(),
  });
}
