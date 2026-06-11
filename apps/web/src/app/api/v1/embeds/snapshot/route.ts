'use server';
/**
 * GET /api/v1/embeds/snapshot?type=<embedType>&w=<width>&h=<height>&<params>
 *
 * Returns a pre-rendered OG image for an embed so that link-preview
 * crawlers (Twitter, Facebook, LinkedIn) see a real image rather than a
 * blank iframe placeholder.
 *
 * Повертає URL попередньо згенерованого OG-зображення для crawlers.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  snapshotStore,
  buildSnapshotUrl,
  SnapshotEmbedType,
  SNAPSHOT_CACHE_TTL_MINUTES,
} from '@/lib/embeds/embed-snapshot';

// ── Supported embed types ──────────────────────────────────────────────────────

const VALID_TYPES: ReadonlySet<string> = new Set<SnapshotEmbedType>([
  'map',
  'event-card',
  'timeline',
  'heatmap',
  'region-brief',
]);

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const type = searchParams.get('type') ?? '';
  const w = parseInt(searchParams.get('w') ?? '1200', 10);
  const h = parseInt(searchParams.get('h') ?? '630', 10);

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: `Unknown embed type: ${type}` }, { status: 422 });
  }

  // Collect remaining params as the embed-specific configuration.
  // Збираємо решту параметрів як конфігурацію конкретного embed.
  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'type' && key !== 'w' && key !== 'h') {
      params[key] = value;
    }
  }

  // Check the in-process cache first. Спочатку перевіряємо кеш.
  const embedType = type as SnapshotEmbedType;
  const cached = snapshotStore.get(embedType, params);
  if (cached) {
    return NextResponse.json(
      { url: cached.url, cached: true, expiresAt: cached.expiresAt },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, max-age=${SNAPSHOT_CACHE_TTL_MINUTES * 60}`,
        },
      },
    );
  }

  // Build the canonical snapshot URL and store it.
  // Будуємо URL знімка та кешуємо.
  const url = buildSnapshotUrl(embedType, params, { width: w, height: h });
  const entry = snapshotStore.set(embedType, params, url, { width: w, height: h });

  return NextResponse.json(
    { url: entry.url, cached: false, expiresAt: entry.expiresAt },
    {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${SNAPSHOT_CACHE_TTL_MINUTES * 60}`,
      },
    },
  );
}
