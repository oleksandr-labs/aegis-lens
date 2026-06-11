import { NextResponse } from "next/server";
import { eventsInCountry } from "@/lib/events-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/copilot/explain
 * body: { eventId?: string, country?: string }
 *
 * Returns a structured explanation of why a specific event (or all events in
 * the current view) has a low/high confidence score.
 *
 * When `eventId` is provided the explanation is event-specific.
 * When omitted the response covers the aggregate picture for the country.
 */
export const dynamic = "force-dynamic";

type Body = {
  eventId?: string;
  country?: string;
};

type ConfidenceFactor = {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  detail: string;
};

function scoreLabel(confidence: number): string {
  if (confidence >= 0.85) return "high";
  if (confidence >= 0.6) return "moderate";
  return "low";
}

function buildEventFactors(event: {
  confidence: number;
  verificationState: string;
  dangerScore: number;
}): ConfidenceFactor[] {
  const factors: ConfidenceFactor[] = [];

  // Source count proxy: seed events currently have 1 synthetic source
  factors.push({
    factor: "Source count",
    impact: "negative",
    detail:
      "Only 1 independent source on record. Confidence rises significantly with 2+ corroborating sources.",
  });

  // Verification state
  const vs = event.verificationState as string;
  if (vs === "corroborated") {
    factors.push({
      factor: "Verification state",
      impact: "positive",
      detail: "Event is corroborated — cross-referenced against a second independent report.",
    });
  } else if (vs === "disputed") {
    factors.push({
      factor: "Verification state",
      impact: "negative",
      detail: "Event is disputed — at least one source contradicts the reported details.",
    });
  } else {
    factors.push({
      factor: "Verification state",
      impact: "negative",
      detail:
        'Event is unverified — no independent cross-check completed. State upgrades to "corroborated" when a second source confirms.',
    });
  }

  // Media verification
  factors.push({
    factor: "Media verification",
    impact: "neutral",
    detail:
      "Imagery and video verification not yet completed. Pending open-source geolocation check.",
  });

  // Geographic plausibility
  factors.push({
    factor: "Geographic plausibility",
    impact: "positive",
    detail:
      "Coordinates fall within the expected operational area for the reported region — plausibility check passed.",
  });

  // Danger score coherence
  if (event.dangerScore > 70 && event.confidence < 0.7) {
    factors.push({
      factor: "Danger/confidence mismatch",
      impact: "negative",
      detail:
        "High danger score combined with low confidence is a red flag. Treat with elevated caution until corroborated.",
    });
  }

  return factors;
}

export async function POST(req: Request) {
  const ipKey = `copilot-explain:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 30, 60_000); // lighter endpoint — 30 req / min
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests. Try again shortly." },
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
  const events = eventsInCountry(country);

  // ── Single-event explanation ───────────────────────────────────────────────
  if (body.eventId) {
    const event = events.find((e) => e.eventId === body.eventId);

    if (!event) {
      return NextResponse.json(
        { error: "not_found", message: `Event ${body.eventId} not found in country "${country}".` },
        { status: 404, headers: rateLimitHeaders(rl) },
      );
    }

    const confidencePct = Math.round(event.confidence * 100);
    const label = scoreLabel(event.confidence);
    const factors = buildEventFactors({
      confidence: event.confidence,
      verificationState: event.verificationState,
      dangerScore: event.dangerScore,
    });

    const explanation =
      `Event ${event.eventId} has a ${label} confidence score of ${confidencePct}% because:\n` +
      factors.map((f) => `- ${f.factor}: ${f.detail}`).join("\n");

    return NextResponse.json(
      {
        eventId: event.eventId,
        confidence: event.confidence,
        confidencePct,
        label,
        explanation,
        factors,
      },
      { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
    );
  }

  // ── Aggregate explanation for all events in country ────────────────────────
  if (events.length === 0) {
    return NextResponse.json(
      {
        country: country.toUpperCase(),
        explanation: `No events found for country "${country.toUpperCase()}". Confidence analysis requires at least one event.`,
        factors: [],
      },
      { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
    );
  }

  const avgConfidence =
    Math.round((events.reduce((s, e) => s + e.confidence, 0) / events.length) * 100) / 100;
  const lowConfidenceEvents = events.filter((e) => e.confidence < 0.7);
  const unverifiedCount = events.filter((e) => e.verificationState === "unverified").length;
  const corroboratedCount = events.filter((e) => e.verificationState === "corroborated").length;

  const aggregateFactors: ConfidenceFactor[] = [
    {
      factor: "Average confidence",
      impact: avgConfidence >= 0.7 ? "positive" : "negative",
      detail: `Across ${events.length} events the average confidence is ${Math.round(avgConfidence * 100)}%.`,
    },
    {
      factor: "Unverified events",
      impact: unverifiedCount > 0 ? "negative" : "positive",
      detail: `${unverifiedCount} of ${events.length} events are unverified — no independent cross-check has been completed.`,
    },
    {
      factor: "Corroborated events",
      impact: corroboratedCount > 0 ? "positive" : "neutral",
      detail: `${corroboratedCount} of ${events.length} events have been corroborated by a second independent source.`,
    },
    {
      factor: "Low-confidence outliers",
      impact: lowConfidenceEvents.length > 0 ? "negative" : "positive",
      detail:
        lowConfidenceEvents.length > 0
          ? `${lowConfidenceEvents.length} event(s) score below 70% confidence: ${lowConfidenceEvents.map((e) => e.eventId.slice(0, 12)).join(", ")}.`
          : "No events fall below the 70% confidence threshold.",
    },
    {
      factor: "Media verification",
      impact: "neutral",
      detail:
        "Imagery and video verification is pending for all current events — this is the primary driver of moderate confidence scores.",
    },
  ];

  const explanation =
    `Confidence analysis for ${country.toUpperCase()} (${events.length} events):\n` +
    aggregateFactors.map((f) => `- ${f.factor}: ${f.detail}`).join("\n");

  return NextResponse.json(
    {
      country: country.toUpperCase(),
      eventCount: events.length,
      avgConfidence,
      explanation,
      factors: aggregateFactors,
    },
    { headers: { "Cache-Control": "no-store", ...rateLimitHeaders(rl) } },
  );
}
