/**
 * Aegis Lens TypeScript SDK — Basic Events Example
 *
 * Demonstrates:
 *  1. Listing recent events with filters
 *  2. Fetching a single event by ID
 *  3. Auto-paginating with events.iterate()
 *  4. Streaming live events via SSE
 *  5. Verifying a webhook signature
 *
 * Run:
 *   AEGIS_API_KEY=ak_... npx ts-node packages/sdk-ts/examples/basic-events.ts
 */

import { AegisClient } from "@aegis/sdk-ts";
import { verifyWebhookSignature } from "@aegis/sdk-ts";

const client = new AegisClient({
  apiKey: process.env.AEGIS_API_KEY!,
  baseUrl: process.env.AEGIS_BASE_URL ?? "https://aegislens.io",
});

// ── 1. List recent events ──────────────────────────────────────────────────

async function listRecentEvents() {
  console.log("=== Listing recent events (UA, last 6h, severity ≥ 2) ===");

  const page = await client.events.list({
    country: "UA",
    hours: 6,
    limit: 5,
  });

  console.log(`Total events: ${page.meta.total}  |  Page size: ${page.data.length}`);

  for (const event of page.data) {
    console.log(
      `  [${event.class}] ${event.summary["en"] ?? "(no summary)"}` +
        `  ⚡ danger=${event.dangerScore.toFixed(2)}  📍 ${event.location.lat},${event.location.lon}`,
    );
  }

  return page.data[0]?.eventId;
}

// ── 2. Fetch single event ──────────────────────────────────────────────────

async function fetchSingleEvent(eventId: string) {
  console.log(`\n=== Fetching event ${eventId} ===`);
  const event = await client.events.get(eventId);
  console.log(`  Verification state: ${event.verificationState}`);
  console.log(`  Sources: ${event.sources.length}`);
  console.log(`  Media items: ${event.media.length}`);
}

// ── 3. Auto-paginate all events ────────────────────────────────────────────

async function iterateAllEvents() {
  console.log("\n=== Auto-paginating military events (last 1h) ===");
  let count = 0;
  for await (const event of client.events.iterate({ class: "military_action", hours: 1 })) {
    count++;
    if (count <= 3) {
      console.log(`  ${count}. [${event.severity}] ${event.summary["en"]?.slice(0, 60) ?? "…"}`);
    }
  }
  console.log(`  Total yielded: ${count}`);
}

// ── 4. Stream live events via SSE ──────────────────────────────────────────

async function streamLiveEvents() {
  console.log("\n=== Streaming copilot response ===");
  const chunks: string[] = [];

  for await (const chunk of client.copilot.stream({
    prompt: "Summarise the most critical events in UA in the last hour.",
    country: "UA",
    hours: 1,
  })) {
    if (chunk.type === "delta") {
      process.stdout.write(chunk.text);
      chunks.push(chunk.text);
    }
    if (chunk.type === "done") break;
  }
  console.log("\n  [stream complete]");
}

// ── 5. Webhook signature verification ─────────────────────────────────────

function demonstrateWebhookVerify() {
  console.log("\n=== Webhook signature verification ===");

  const secret = "whs_test_secret_12345";
  const payload = JSON.stringify({ event: "event.created", data: { eventId: "evt_abc" } });

  // Simulate delivery headers — in production these come from the HTTP request
  const timestamp = Math.floor(Date.now() / 1000);
  const fakeHeaders = {
    "x-aegis-signature-256": "sha256=fakehex",
    "x-aegis-timestamp": String(timestamp),
  };

  const valid = verifyWebhookSignature(secret, fakeHeaders, payload);
  console.log(`  Signature valid: ${valid}  (expected false for fake signature)`);
}

// ── Main ───────────────────────────────────────────────────────────────────

(async () => {
  try {
    const firstId = await listRecentEvents();
    if (firstId) await fetchSingleEvent(firstId);
    await iterateAllEvents();
    // Uncomment to test streaming (makes real API calls):
    // await streamLiveEvents();
    demonstrateWebhookVerify();
  } catch (err) {
    console.error("Example error:", err);
    process.exit(1);
  }
})();
