/**
 * POST /api/presets/:id/share — generate a signed share link
 *
 * Body (optional):
 *   { "expiresInHours": 168 }
 *
 * Returns the share token and the full share URL.
 * The share link resolves at /views/<shareToken>.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getPreset, generateShareToken } from "@/lib/presets-store";

export const dynamic = "force-dynamic";

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ip = identifyRequest(req);
  const rl = rateLimit(`presets:share:${ip}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  if (!getPreset(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let expiresInHours = 168; // 7 days default
  try {
    const body = await req.json() as { expiresInHours?: number };
    if (typeof body.expiresInHours === "number" && body.expiresInHours > 0) {
      expiresInHours = Math.min(body.expiresInHours, 8760); // cap at 1 year
    }
  } catch {
    // body is optional
  }

  const updated = generateShareToken(id, expiresInHours);
  if (!updated || !updated.shareToken) {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const shareUrl = `${origin}/views/${updated.shareToken}`;

  return NextResponse.json(
    {
      data: {
        shareToken: updated.shareToken,
        shareUrl,
        expiresAt: updated.shareExpiresAt,
      },
    },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
    },
  );
}
