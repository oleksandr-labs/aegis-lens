import { NextResponse } from "next/server";
import { eventsInCountry } from "@/lib/events-seed";
import { generate } from "@/lib/llm";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { evaluateGuardrails } from "@ua-map/safety";
import { enforceGrounding } from "@ua-map/copilot";

/**
 * POST /api/copilot
 * body: { prompt: string, country?: string, hours?: number }
 *
 * - Build a structured context block from seed events (cheap retrieval).
 * - Send to `generate()` — Anthropic Claude if `ANTHROPIC_API_KEY` set, else fake-mode.
 * - Always prepend a deterministic stats block (count, top class, avg danger).
 */
export const dynamic = "force-dynamic";

type Body = {
  prompt?: string;
  country?: string;
  hours?: number;
};

const SYSTEM_PROMPT = `You are Aegis Lens — an OSINT intelligence analyst assistant.
Answer concisely, in plain English, with citations to event IDs in brackets.
NEVER invent events. Reason ONLY about events in the context block.
If asked something outside that context, say so plainly.`;

export async function POST(req: Request) {
  // Rate-limit before doing any work.
  const ipKey = `copilot:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 20, 60_000); // 20 req / min / IP
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many copilot requests. Try again in a moment.",
      },
      {
        status: 429,
        headers: {
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

  // Guardrail check before calling LLM
  if (prompt) {
    const guard = evaluateGuardrails(prompt);
    if (guard.blocked) {
      return NextResponse.json(
        {
          error: "guardrail_blocked",
          category: guard.category,
          message: guard.refusalEn,
          messageUk: guard.refusalUk,
        },
        { status: 422, headers: rateLimitHeaders(rl) },
      );
    }
  }

  const events = eventsInCountry(country);
  const cutoffMs = hours * 3600 * 1000;
  const recent =
    hours > 0
      ? events.filter((e) => Date.now() - Date.parse(e.occurredAt) <= cutoffMs)
      : events;

  const byClass = recent.reduce<Record<string, number>>((acc, e) => {
    acc[e.class] = (acc[e.class] ?? 0) + 1;
    return acc;
  }, {});
  const topClass = Object.entries(byClass).sort((a, b) => b[1] - a[1])[0];
  const avgDanger = recent.length
    ? Math.round(recent.reduce((s, e) => s + e.dangerScore, 0) / recent.length)
    : 0;

  const stats = [
    `**Stats**`,
    `- Country: ${country.toUpperCase()}`,
    `- Time window: ${hours > 0 ? `${hours}h` : "all time"}`,
    `- Events: ${recent.length}`,
    topClass ? `- Top class: ${topClass[0]} (${topClass[1]})` : null,
    recent.length > 0 ? `- Avg danger: ${avgDanger}/100` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const context = recent
    .slice(0, 10)
    .map(
      (e) =>
        `- [${e.eventId}] ${e.class}/${e.subclass ?? "—"} conf=${e.confidence} danger=${e.dangerScore}: ${e.summary.en}`,
    )
    .join("\n");

  const llm = await generate({
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Context (verified seed events in ${country.toUpperCase()}, last ${hours}h):\n${context || "(no events)"}\n\nQuestion: ${prompt || "Summarize the current situation."}`,
      },
    ],
    maxTokens: 600,
  });

  // Grounding enforcement: the model's answer may only assert things backed by
  // the events we actually put in context. `enforceGrounding` checks every cited
  // [EVENT_ID] against this allow-list and that substantive claims are cited;
  // if not, it replaces the answer with a localised refusal. (TODO_copilot rule:
  // "Every claim cites at least one event ID with a verifiable source.")
  const locale = (body as { locale?: string }).locale === "uk" ? "uk" : "en";
  const allowedIds = recent.map((e) => e.eventId);
  const grounded = enforceGrounding(llm.text, allowedIds, locale, { minCoverage: 0.5 });

  const text = `${stats}\n\n---\n\n${grounded.text}`;

  return NextResponse.json(
    {
      data: {
        text,
        citations: recent.slice(0, 3).map((e) => ({
          eventId: e.eventId,
          class: e.class,
          subclass: e.subclass,
        })),
      },
      meta: {
        mode: llm.mode,
        model: llm.model,
        grounding: {
          grounded: grounded.report.grounded,
          blocked: grounded.blocked,
          coverage: grounded.report.coverage,
          hallucinatedCitations: grounded.report.hallucinatedIds,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
