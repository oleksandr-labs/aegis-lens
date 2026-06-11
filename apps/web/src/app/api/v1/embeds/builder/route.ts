'use server';
/**
 * POST /api/v1/embeds/builder
 *
 * Accept a partial EmbedBuilderState, validate it, and return the
 * generated iframe snippet.
 *
 * Приймає стан майстра, валідує та повертає готовий iframe-сніпет.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  buildFinalSnippet,
  EmbedBuilderState,
  EMBED_BUILDER_INITIAL_STATE,
  EMBED_TYPES,
} from '@/lib/embeds/embed-builder';

// ── Request body ───────────────────────────────────────────────────────────────

interface BuilderRequestBody {
  /** Partial or complete builder state. Частковий або повний стан майстра. */
  state: Partial<EmbedBuilderState>;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: BuilderRequestBody;

  try {
    body = (await req.json()) as BuilderRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const state: EmbedBuilderState = {
    ...EMBED_BUILDER_INITIAL_STATE,
    ...body.state,
  };

  // Validate embedType. Перевіряємо тип embed.
  const validTypes = EMBED_TYPES.map((t) => t.id);
  if (state.embedType && !validTypes.includes(state.embedType)) {
    return NextResponse.json(
      { error: `Unknown embedType: ${state.embedType}` },
      { status: 422 },
    );
  }

  if (!state.embedType) {
    return NextResponse.json({ error: 'embedType is required.' }, { status: 422 });
  }

  const snippet = buildFinalSnippet(state);

  return NextResponse.json(
    { snippet, embedType: state.embedType },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
