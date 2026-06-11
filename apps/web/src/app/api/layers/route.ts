import { NextResponse } from "next/server";
import { LAYER_REGISTRY, LayerRegistry } from "@ua-map/layers";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import type { LayerCategory } from "@ua-map/layers";

export const dynamic = "force-dynamic";

const registry = new LayerRegistry(LAYER_REGISTRY);

/**
 * GET /api/layers
 *
 * Query params:
 *   category  — filter by LayerCategory (repeatable)
 *   tier      — max access tier: public | registered | pro | enterprise
 *   visible   — "true" → only default-visible layers
 *   id        — fetch single layer by id
 */
export async function GET(req: Request) {
  const ipKey = `layers:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  const categories = url.searchParams.getAll("category") as LayerCategory[];
  const tier = url.searchParams.get("tier") as "public" | "registered" | "pro" | "enterprise" | null;
  const visibleOnly = url.searchParams.get("visible") === "true";

  const baseHeaders = {
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
    ...rateLimitHeaders(rl),
  };

  // Single layer lookup
  if (idParam) {
    const layer = registry.get(idParam);
    if (!layer) {
      return NextResponse.json(
        { error: "not_found", message: `Layer '${idParam}' not found.` },
        { status: 404, headers: { ...baseHeaders, "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json({ data: layer }, { headers: baseHeaders });
  }

  // List with optional filters
  let layers = tier ? registry.byTier(tier) : registry.all();

  if (categories.length > 0) {
    layers = layers.filter((l) => categories.includes(l.category));
  }

  if (visibleOnly) {
    layers = layers.filter((l) => l.default_visible);
  }

  return NextResponse.json(
    { data: layers, meta: { count: layers.length } },
    { headers: baseHeaders },
  );
}
