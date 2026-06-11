/**
 * POST /api/integrations/discord — Discord Interactions endpoint
 *
 * Handles:
 *   - PING (type=1) → PONG (for endpoint verification)
 *   - APPLICATION_COMMAND (type=2) → deferred or immediate response
 *
 * Ed25519 signature verification is required by Discord before any interaction
 * is processed. Uses Web Crypto API (available in Next.js edge + Node 18+).
 *
 * Commands: /search /region /event /ask /subscribe /help
 */

export const dynamic = "force-dynamic";

async function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string,
  publicKey: string,
): Promise<boolean> {
  try {
    const message = new TextEncoder().encode(timestamp + rawBody);
    const sigBytes = hexToUint8(signature);
    const keyBytes = hexToUint8(publicKey);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify("Ed25519", cryptoKey, sigBytes, message);
  } catch {
    return false;
  }
}

function hexToUint8(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

const MOCK_DEPS = {
  async searchEvents(query: string) {
    return [
      { eventId: "01HXDEMO001", summary: `[demo] "${query}" — synthetic`, class: "military_action", occurredAt: new Date(Date.now() - 3600_000).toISOString(), danger: 65 },
    ];
  },
  async getRegionBrief(region: string) {
    return `${region}: Situation is evolving. No verified events in last 6h. (Demo)`;
  },
  async getEvent(id: string) {
    return id ? { eventId: id, summary: "[demo] Synthetic event", class: "military_action", occurredAt: new Date().toISOString(), danger: 55 } : null;
  },
  async askCopilot(q: string) {
    return `[Demo AI] "${q}" — production connects to Claude.`;
  },
  async subscribe(channelId: string, filter: string) {
    return `Subscribed <#${channelId}> to filter: "${filter}".`;
  },
};

function getOpt(interaction: Record<string, unknown>, name: string): string {
  const opts = (interaction.data as Record<string, unknown>)?.options as Array<Record<string, unknown>> | undefined;
  return String(opts?.find((o) => o.name === name)?.value ?? "");
}

function embedReply(title: string, description: string, color = 0x5865f2) {
  return { type: 4, data: { embeds: [{ title, description, color }] } };
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-ed25519") ?? "";
  const timestamp = req.headers.get("x-signature-timestamp") ?? "";
  const publicKey = process.env.DISCORD_PUBLIC_KEY ?? "";

  if (process.env.NODE_ENV === "production" && publicKey) {
    const valid = await verifyDiscordRequest(rawBody, signature, timestamp, publicKey);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // PING
  if (body.type === 1) {
    return Response.json({ type: 1 });
  }

  // APPLICATION_COMMAND
  if (body.type === 2) {
    const commandName = (body.data as Record<string, unknown>)?.name as string;
    const locale = (body.locale as string ?? "en").startsWith("uk") ? "uk" : "en";

    try {
      switch (commandName) {
        case "help":
          return Response.json(embedReply(
            locale === "uk" ? "Команди AegisLens" : "AegisLens Commands",
            locale === "uk"
              ? "`/search` `/region` `/event` `/ask` `/subscribe`"
              : "`/search` `/region` `/event` `/ask` `/subscribe`",
          ));

        case "search": {
          const query = getOpt(body, "query");
          if (!query) return Response.json({ type: 4, data: { content: "Provide a query", flags: 64 } });
          const results = await MOCK_DEPS.searchEvents(query);
          return Response.json(embedReply(
            `Search: ${query}`,
            results.map((e) => `**[${e.class}]** ${e.summary.slice(0, 80)} · Danger: ${e.danger}/100`).join("\n"),
          ));
        }

        case "region": {
          const name = getOpt(body, "name");
          const brief = await MOCK_DEPS.getRegionBrief(name || "Ukraine");
          return Response.json(embedReply(name || "Ukraine", brief));
        }

        case "event": {
          const id = getOpt(body, "id");
          const ev = await MOCK_DEPS.getEvent(id);
          if (!ev) return Response.json({ type: 4, data: { content: "Event not found", flags: 64 } });
          return Response.json(embedReply(
            `[${ev.class}] ${ev.occurredAt.slice(0, 10)}`,
            `${ev.summary}\nDanger: **${ev.danger}/100** · ID: \`${ev.eventId}\``,
            ev.danger >= 70 ? 0xed4245 : ev.danger >= 40 ? 0xfaa61a : 0x57f287,
          ));
        }

        case "ask": {
          const question = getOpt(body, "question");
          const answer = await MOCK_DEPS.askCopilot(question);
          return Response.json(embedReply(
            locale === "uk" ? "ШІ-відповідь" : "AI Answer",
            answer,
          ));
        }

        case "subscribe": {
          const filter = getOpt(body, "filter");
          const channelId = body.channel_id as string ?? "";
          const confirmation = await MOCK_DEPS.subscribe(channelId, filter);
          return Response.json({ type: 4, data: { content: confirmation } });
        }

        default:
          return Response.json({ type: 4, data: { content: "Unknown command. Try `/help`.", flags: 64 } });
      }
    } catch {
      return Response.json({ type: 4, data: { content: "An error occurred. Please try again.", flags: 64 } });
    }
  }

  return Response.json({ type: 1 });
}
