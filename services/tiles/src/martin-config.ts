/**
 * Martin vector-tile server configuration generator.
 *
 * Martin (https://maplibre.org/martin/) serves MVT tiles directly from PostGIS
 * via SQL functions. This module generates the YAML config + the SQL tile
 * functions for each Aegis layer, with per-tenant RLS baked in.
 */

import { listLayerConfigs } from "./layer-registry";

export interface MartinConfig {
  listen_addresses: string;
  worker_processes: number;
  pool_size: number;
  postgres: {
    connection_string: string;
    /** SQL functions exposed as tile sources */
    functions: Record<string, MartinFunctionSource>;
  };
}

export interface MartinFunctionSource {
  schema: string;
  function: string;
  minzoom: number;
  maxzoom: number;
  bounds: [number, number, number, number];
}

/** Ukraine bounding box (west, south, east, north). */
const UA_BOUNDS: [number, number, number, number] = [22.14, 44.38, 40.23, 52.38];

/**
 * Generate a Martin config object covering all registered MVT layers.
 */
export function generateMartinConfig(connectionString: string): MartinConfig {
  const functions: Record<string, MartinFunctionSource> = {};

  for (const layer of listLayerConfigs()) {
    if (layer.format !== "mvt") continue;
    functions[`tiles_${layer.layerId}`] = {
      schema: "tiles",
      function: `mvt_${layer.layerId}`,
      minzoom: layer.minZoom,
      maxzoom: layer.maxZoom,
      bounds: UA_BOUNDS,
    };
  }

  return {
    listen_addresses: "0.0.0.0:3000",
    worker_processes: 4,
    pool_size: 20,
    postgres: { connection_string: connectionString, functions },
  };
}

/**
 * Generate the SQL for a tile function for a given layer.
 * The function takes (z, x, y, query_params) and returns MVT bytes.
 * RLS: the `app.current_org_id` session var scopes rows to the tenant.
 */
export function generateTileFunctionSQL(layerId: string, sourceTable: string): string {
  return `
CREATE SCHEMA IF NOT EXISTS tiles;

CREATE OR REPLACE FUNCTION tiles.mvt_${layerId}(
    z integer, x integer, y integer, query_params json
)
RETURNS bytea AS $$
DECLARE
    mvt bytea;
    time_from timestamptz := COALESCE((query_params->>'from')::timestamptz, now() - interval '24 hours');
    time_to   timestamptz := COALESCE((query_params->>'to')::timestamptz, now());
BEGIN
    SELECT INTO mvt ST_AsMVT(tile, '${layerId}', 4096, 'geom')
    FROM (
        SELECT
            ST_AsMVTGeom(
                ST_Transform(e.geom, 3857),
                ST_TileEnvelope(z, x, y),
                4096, 64, true
            ) AS geom,
            e.event_id,
            e.class,
            e.subclass,
            e.severity,
            e.confidence,
            e.danger_score,
            e.occurred_at,
            e.title_en,
            e.title_uk
        FROM ${sourceTable} e
        WHERE e.geom && ST_Transform(ST_TileEnvelope(z, x, y), 4326)
          AND e.occurred_at BETWEEN time_from AND time_to
          AND e.is_retracted = false
          -- RLS: org isolation OR public
          AND (e.org_id = current_setting('app.current_org_id', true) OR e.is_public = true)
    ) AS tile
    WHERE tile.geom IS NOT NULL;

    RETURN mvt;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;
`.trim();
}

/** Render the full Martin config as YAML text. */
export function renderMartinYaml(config: MartinConfig): string {
  const fnLines = Object.entries(config.postgres.functions)
    .map(
      ([name, f]) =>
        `    ${name}:\n      schema: ${f.schema}\n      function: ${f.function}\n      minzoom: ${f.minzoom}\n      maxzoom: ${f.maxzoom}\n      bounds: [${f.bounds.join(", ")}]`,
    )
    .join("\n");

  return `# Auto-generated Martin config — do not edit by hand.
listen_addresses: "${config.listen_addresses}"
worker_processes: ${config.worker_processes}
pool_size: ${config.pool_size}

postgres:
  connection_string: \${DATABASE_URL}
  functions:
${fnLines}
`;
}
