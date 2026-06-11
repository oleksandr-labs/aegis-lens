import { eventsInCountry } from "@/lib/events-seed";
import { generate } from "@/lib/llm";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/copilot/stream
 * Same body as /api/copilot: { prompt, country?, hours?, compareCountry? }.
 *
 * Streams the response as Server-Sent Events. Event types:
 *   - "stats"   — initial deterministic statistics block (both countries when comparing)
 *   - "delta"   — text chunk (word-boundary, ~6 chars/sec by default)
 *   - "citation"— at end, the cited event IDs
 *   - "done"    — terminator event
 *
 * Compare mode: when prompt starts with "Compare" the route automatically
 * pulls events from both `country` and `compareCountry` (default "pl") and
 * surfaces side-by-side stats for each.
 *
 * Implementation note: the underlying `generate()` returns the full string
 * (provider doesn't expose token streaming in this codepath); we chunk on
 * word boundaries so consumers get incremental output.
 */
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Aegis Lens — an OSINT intelligence analyst assistant.
Answer concisely, in plain English, with citations to event IDs in brackets.
NEVER invent events. Reason ONLY about events in the context block.
If asked something outside that context, say so plainly.`;

type Body = {
  prompt?: string;
  country?: string;
  hours?: number;
  compareCountry?: string;
};

function chunkText(s: string, chunkSize = 24): string[] {
  // Split into word groups so SSE consumers can render token-by-token.
  const words = s.split(/(\s+)/); // keep separators
  const out: string[] = [];
  let buf = "";
  for (const w of words) {
    buf += w;
    if (buf.length >= chunkSize) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf.length > 0) out.push(buf);
  return out;
}

/** Build a stats object for a given set of recent events + metadata. */
function buildStats(
  countryCode: string,
  hours: number,
  recent: ReturnType<typeof eventsInCountry>,
) {
  const byClass = recent.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClass = Object.entries(byClass).sort((a, b) => b[1] - a[1])[0];
  const avgDanger = recent.length
    ? Math.round(recent.reduce((s, e) => s + e.dangerScore, 0) / recent.length)
    : 0;

  return {
    country: countryCode.toUpperCase(),
    hours,
    eventCount: recent.length,
    topClass: topClass ? { id: topClass[0], count: topClass[1] } : null,
    avgDanger,
  };
}

/** Filter events to the time window. */
function filterRecent(
  events: ReturnType<typeof eventsInCountry>,
  hours: number,
) {
  if (hours <= 0) return events;
  const cutoffMs = hours * 3600 * 1000;
  return events.filter((e) => Date.now() - Date.parse(e.occurredAt) <= cutoffMs);
}

/** Render a short event list for the LLM context block. */
function renderContext(
  label: string,
  recent: ReturnType<typeof eventsInCountry>,
  hours: number,
): string {
  const rows = recent
    .slice(0, 10)
    .map(
      (e) =>
        `- [${e.eventId}] ${e.class}/${e.subclass ?? "—"} conf=${e.confidence} danger=${e.dangerScore}: ${e.summary.en}`,
    )
    .join("\n");
  return `=== ${label} (last ${hours > 0 ? `${hours}h` : "all"}) ===\n${rows || "(no events)"}`;
}

export async function POST(req: Request) {
  const ipKey = `copilot-stream:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 10, 60_000); // 10 streams / min / IP (heavier than non-stream)
  if (!rl.ok) {
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        message: "Too many stream requests.",
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json; charset=utf-8",
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
        },
      },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const country = (body.country ?? "ua").toLowerCase();
  const hours = body.hours ?? 24;
  const prompt = (body.prompt ?? "").trim();

  // ── Compare mode detection ────────────────────────────────────────────────
  const isCompare =
    prompt.toLowerCase().startsWith("compare") ||
    typeof body.compareCountry === "string";
  const compareCountry = (body.compareCountry ?? "pl").toLowerCase();

  // ── Pull events ───────────────────────────────────────────────────────────
  const mainEvents = filterRecent(eventsInCountry(country), hours);
  const secondaryEvents = isCompare
    ? filterRecent(eventsInCountry(compareCountry), hours)
    : [];

  // ── Stats ─────────────────────────────────────────────────────────────────
  const mainStats = buildStats(country, hours, mainEvents);
  const secondaryStats = isCompare
    ? buildStats(compareCountry, hours, secondaryEvents)
    : null;

  // ── LLM context ───────────────────────────────────────────────────────────
  const contextBlock = isCompare
    ? [
        renderContext(country.toUpperCase(), mainEvents, hours),
        renderContext(compareCountry.toUpperCase(), secondaryEvents, hours),
      ].join("\n\n")
    : renderContext(country.toUpperCase(), mainEvents, hours);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // 1) stats — deterministic, instant
      // For compare mode, emit a combined stats payload so the client can
      // render both side-by-side if desired.
      if (isCompare && secondaryStats) {
        send("stats", {
          ...mainStats,
          compare: secondaryStats,
        });
      } else {
        send("stats", mainStats);
      }

      // 2) call LLM
      const questionLine = prompt || "Summarize the current situation.";
      const llm = await generate({
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Context (verified seed events):\n${contextBlock}\n\nQuestion: ${questionLine}`,
          },
        ],
        maxTokens: 600,
      });

      // 3) stream deltas
      const chunks = chunkText(llm.text);
      for (const c of chunks) {
        send("delta", { text: c });
        // Small artificial gap so consumers can render progressively. This is
        // 6 ms per chunk — effectively "as fast as the network allows" while
        // still giving the client a tick to paint.
        await new Promise((r) => setTimeout(r, 6));
      }

      // 4) citations — from main country (+ secondary when comparing)
      const citationEvents = [
        ...mainEvents.slice(0, isCompare ? 2 : 3),
        ...(isCompare ? secondaryEvents.slice(0, 1) : []),
      ];
      send("citation", {
        events: citationEvents.map((e) => ({
          eventId: e.eventId,
          class: e.class,
          subclass: e.subclass,
        })),
      });

      // 5) done
      send("done", { mode: llm.mode, model: llm.model });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
      "access-control-allow-origin": "*",
      ...rateLimitHeaders(rl),
    },
  });
}
