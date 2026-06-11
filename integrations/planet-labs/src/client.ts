import 'server-only';

export interface PlanetLabsConfig {
  apiKey: string;
  baseUrl: string;
}

/** Supported Planet item types for scene search. */
export const PLANET_ITEM_TYPES: string[] = [
  'PSScene',       // PlanetScope 3-5m multispectral
  'SkySatScene',   // SkySat 0.5-0.9m high-res
  'Landsat8L1G',   // Landsat 8 (30m, public archive)
  'Sentinel2L1C',  // Sentinel-2 (accessed via Planet if licensed)
];

export interface PlanetScene {
  id: string;
  date: string;           // ISO-8601 e.g. "2024-03-15T10:23:00Z"
  cloudCover: number;     // 0–1 fraction
  resolution: number;     // metres per pixel
  bbox: number[];         // [west, south, east, north]
  itemType: string;
  downloadPermission: boolean;
}

export interface PlanetDownloadLink {
  url: string;
  expiresAt: string; // ISO-8601
}

/**
 * Thrown when Planet Labs is called without Phase-2 activation.
 * Callers should catch this and surface an appropriate UI gate.
 */
export class PlanetLabsNotAvailableError extends Error {
  constructor() {
    super(
      'Planet Labs imagery is a Phase 2 feature. ' +
        'Set PLANET_API_KEY to activate.',
    );
    this.name = 'PlanetLabsNotAvailableError';
  }
}

export class PlanetLabsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config?: Partial<PlanetLabsConfig>) {
    this.apiKey = config?.apiKey ?? process.env.PLANET_API_KEY ?? '';
    this.baseUrl =
      config?.baseUrl ??
      (process.env.PLANET_BASE_URL || 'https://api.planet.com/data/v1');
  }

  /** Returns true when PLANET_API_KEY is present. Phase 2 gate. */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) throw new PlanetLabsNotAvailableError();
  }

  /**
   * Searches available scenes for a bounding box and date range.
   * Uses Planet's Quick Search endpoint with an AOI + date filter.
   */
  async searchScenes(
    bbox: number[],
    dateRange: { gte: string; lte: string },
  ): Promise<PlanetScene[]> {
    this.assertConfigured();

    const [west, south, east, north] = bbox;

    const body = {
      item_types: PLANET_ITEM_TYPES,
      filter: {
        type: 'AndFilter',
        config: [
          {
            type: 'GeometryFilter',
            field_name: 'geometry',
            config: {
              type: 'Polygon',
              coordinates: [
                [
                  [west, south],
                  [east, south],
                  [east, north],
                  [west, north],
                  [west, south],
                ],
              ],
            },
          },
          {
            type: 'DateRangeFilter',
            field_name: 'acquired',
            config: { gte: dateRange.gte, lte: dateRange.lte },
          },
          {
            type: 'RangeFilter',
            field_name: 'cloud_cover',
            config: { lte: 0.3 }, // max 30% cloud cover
          },
        ],
      },
    };

    const res = await fetch(`${this.baseUrl}/quick-search`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Planet Labs search failed (${res.status}): ${err}`);
    }

    const data = (await res.json()) as {
      features: Array<{
        id: string;
        properties: {
          acquired: string;
          cloud_cover: number;
          pixel_resolution: number;
          item_type: string;
          permissions: string[];
        };
        geometry: { coordinates: number[][][] };
      }>;
    };

    return data.features.map((f) => {
      const coords = f.geometry.coordinates[0];
      const lngs = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      return {
        id: f.id,
        date: f.properties.acquired,
        cloudCover: f.properties.cloud_cover,
        resolution: f.properties.pixel_resolution,
        bbox: [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
        itemType: f.properties.item_type,
        downloadPermission: f.properties.permissions.includes('assets:download'),
      };
    });
  }

  /**
   * Requests a signed download URL for a scene asset.
   * Requires the scene to have download permission under the account's license.
   */
  async downloadScene(sceneId: string): Promise<PlanetDownloadLink> {
    this.assertConfigured();

    // Activate the analytic_sr asset then poll for activation
    const activateRes = await fetch(
      `${this.baseUrl}/item-types/PSScene/items/${sceneId}/assets/ortho_analytic_4b/activate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        },
      },
    );

    if (!activateRes.ok && activateRes.status !== 204) {
      throw new Error(`Scene activation failed (${activateRes.status})`);
    }

    // Fetch asset to get signed URL (may need polling in production)
    const assetRes = await fetch(
      `${this.baseUrl}/item-types/PSScene/items/${sceneId}/assets`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        },
      },
    );

    if (!assetRes.ok) {
      throw new Error(`Asset fetch failed (${assetRes.status})`);
    }

    const assets = (await assetRes.json()) as Record<
      string,
      { location?: string; expires_at?: string; status: string }
    >;

    const asset = assets['ortho_analytic_4b'] ?? assets[Object.keys(assets)[0]];

    if (!asset?.location) {
      throw new Error(
        `Asset not yet ready (status: ${asset?.status ?? 'unknown'}). ` +
          'Poll this endpoint until status === "active".',
      );
    }

    return {
      url: asset.location,
      expiresAt: asset.expires_at ?? new Date(Date.now() + 3600_000).toISOString(),
    };
  }
}

export const planetLabsClient = new PlanetLabsClient();
