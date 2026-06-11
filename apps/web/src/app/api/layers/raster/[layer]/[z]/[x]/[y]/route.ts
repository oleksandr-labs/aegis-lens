/**
 * GET /api/layers/raster/[layer]/[z]/[x]/[y]
 *
 * Proxies raster satellite tiles from upstream providers (Sentinel Hub, USGS).
 * Validates tile coordinates against layer config and forwards with appropriate
 * Cache-Control headers.
 *
 * Layers: sentinel-2-rgb | sentinel-1-sar | landsat-thermal
 *
 * Cache: per-layer (see RasterTileConfig.cacheControl)
 */

import "server-only";
import { NextResponse } from "next/server";
import {
  getRasterConfig,
  buildRasterTileUrl,
  isValidTileCoord,
} from "@/../../services/tiles/src/raster";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    layer: string;
    z: string;
    x: string;
    y: string;
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { layer, z: zStr, x: xStr, y: yStr } = params;

  // ── Validate layer ────────────────────────────────────────────────────────
  const config = getRasterConfig(layer);
  if (!config) {
    return NextResponse.json(
      {
        error: "unknown_layer",
        message: `Raster layer '${layer}' is not configured. Valid layers: sentinel-2-rgb, sentinel-1-sar, landsat-thermal`,
      },
      { status: 404 },
    );
  }

  // ── Validate tile coords ──────────────────────────────────────────────────
  const z = parseInt(zStr, 10);
  const x = parseInt(xStr, 10);
  const y = parseInt(yStr, 10);

  if (isNaN(z) || isNaN(x) || isNaN(y)) {
    return NextResponse.json(
      { error: "invalid_coords", message: "z, x, y must be integers" },
      { status: 400 },
    );
  }

  if (!isValidTileCoord(config, { z, x, y })) {
    return NextResponse.json(
      {
        error: "coords_out_of_range",
        message: `Zoom ${z} is outside [${config.minZoom}, ${config.maxZoom}] for layer '${layer}', or x/y out of tile range`,
      },
      { status: 400 },
    );
  }

  // ── Build upstream URL ────────────────────────────────────────────────────
  const upstreamUrl = buildRasterTileUrl(config, z, x, y);

  // ── Proxy request ─────────────────────────────────────────────────────────
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: `image/${config.format}`,
        "User-Agent": "AegisLens/1.0 (tile-proxy; +https://aegislens.io)",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream fetch failed";
    return NextResponse.json(
      { error: "upstream_error", message },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "upstream_error",
        message: `Upstream returned ${upstream.status}`,
        upstreamStatus: upstream.status,
      },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  const tileData = await upstream.arrayBuffer();

  return new Response(tileData, {
    status: 200,
    headers: {
      "Content-Type": `image/${config.format}`,
      "Cache-Control": config.cacheControl,
      "X-Tile-Layer": layer,
      "X-Tile-Coord": `${z}/${x}/${y}`,
      "X-Attribution": config.attribution,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
