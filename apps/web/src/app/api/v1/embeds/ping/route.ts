'use server';
/**
 * POST /api/v1/embeds/ping
 *
 * Receives anonymous embed telemetry pings from third-party publisher pages.
 * No PII is stored. The referrer domain is extracted as an SEO signal.
 *
 * Приймає анонімні пінги телеметрії від сторонніх сайтів.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  embedAnalyticsStore,
  EmbedPing,
  EmbedAnalyticsEvent,
} from '@/lib/embeds/embed-analytics';

// ── Allowed event types ────────────────────────────────────────────────────────

const ALLOWED_EVENTS: ReadonlySet<string> = new Set<EmbedAnalyticsEvent>([
  'embed-load',
  'embed-click',
  'embed-error',
]);

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let raw: Record<string, unknown>;

  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const event = typeof raw['event'] === 'string' ? raw['event'] : 'embed-load';

  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: `Unknown event type: ${event}` }, { status: 422 });
  }

  // Derive referrer domain from the Referer header if not supplied in body.
  // Визначаємо домен-реферер із заголовка, якщо не передано в тілі запиту.
  let referrerDomain = typeof raw['referrerDomain'] === 'string' ? raw['referrerDomain'] : '';
  if (!referrerDomain) {
    try {
      const refHeader = req.headers.get('referer') ?? '';
      referrerDomain = refHeader ? new URL(refHeader).hostname : '';
    } catch {
      referrerDomain = '';
    }
  }

  const ping: EmbedPing = {
    event: event as EmbedAnalyticsEvent,
    embedType: typeof raw['embedType'] === 'string' ? raw['embedType'] : 'unknown',
    region: typeof raw['region'] === 'string' ? raw['region'] : undefined,
    referrerDomain: referrerDomain || undefined,
    ts: typeof raw['ts'] === 'number' ? raw['ts'] : Date.now(),
  };

  embedAnalyticsStore.record(ping);

  return NextResponse.json({ ok: true }, { status: 202 });
}
