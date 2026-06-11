import 'server-only';

export type HighResProvider = 'blacksky' | 'capella';

export interface HighResScene {
  id: string;
  provider: HighResProvider;
  date: string;           // ISO-8601
  resolution_m: number;   // spatial resolution in metres (sub-1m possible)
  bbox: number[];         // [west, south, east, north]
  priceUsd?: number;      // per-scene cost if known from search response
  satelliteId?: string;
  collectionMode?: 'spotlight' | 'stripmap' | 'sliding-spotlight';
  polarisation?: 'HH' | 'HV' | 'VV' | 'VH' | 'quad'; // SAR (Capella)
  sensorType?: 'optical' | 'sar';
}

export interface OrderResult {
  orderId: string;
  estimatedDelivery: string; // ISO-8601
  status: 'submitted' | 'processing' | 'ready' | 'failed';
  provider: HighResProvider;
}

/** Thrown when provider is called without Phase-3 activation. */
export class HighResNotAvailableError extends Error {
  constructor(provider: HighResProvider) {
    super(
      `${provider} imagery is a Phase 3 feature requiring a signed commercial agreement. ` +
        `Set ${provider === 'blacksky' ? 'BLACKSKY_API_KEY' : 'CAPELLA_API_KEY'} to activate.`,
    );
    this.name = 'HighResNotAvailableError';
  }
}

// ─── BlackSky ────────────────────────────────────────────────────────────────

async function blackskySearch(
  apiKey: string,
  bbox: number[],
  date: string,
): Promise<HighResScene[]> {
  const [west, south, east, north] = bbox;

  const res = await fetch('https://api.blacksky.com/v1/archive/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aoi: { type: 'Polygon', coordinates: [[[west,south],[east,south],[east,north],[west,north],[west,south]]] },
      date_range: { start: date, end: date },
      resolution: 'high',
    }),
  });

  if (!res.ok) throw new Error(`BlackSky search failed (${res.status})`);

  const data = (await res.json()) as {
    scenes: Array<{
      id: string;
      capture_datetime: string;
      gsd_meters: number;
      bbox: number[];
      cost_usd?: number;
      satellite_id?: string;
    }>;
  };

  return data.scenes.map((s) => ({
    id: s.id,
    provider: 'blacksky' as HighResProvider,
    date: s.capture_datetime,
    resolution_m: s.gsd_meters,
    bbox: s.bbox,
    priceUsd: s.cost_usd,
    satelliteId: s.satellite_id,
    sensorType: 'optical',
  }));
}

// ─── Capella ─────────────────────────────────────────────────────────────────

async function capellaSearch(
  apiKey: string,
  bbox: number[],
  date: string,
): Promise<HighResScene[]> {
  const [west, south, east, north] = bbox;

  const res = await fetch('https://api.capellaspace.com/catalog/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bbox: [west, south, east, north],
      datetime: `${date}T00:00:00Z/${date}T23:59:59Z`,
      collections: ['capella-archive'],
    }),
  });

  if (!res.ok) throw new Error(`Capella search failed (${res.status})`);

  const data = (await res.json()) as {
    features: Array<{
      id: string;
      properties: {
        datetime: string;
        'sar:pixel_spacing_azimuth': number;
        'sar:polarizations': string[];
        'capella:product_type': string;
      };
      bbox: number[];
    }>;
  };

  return data.features.map((f) => ({
    id: f.id,
    provider: 'capella' as HighResProvider,
    date: f.properties.datetime,
    resolution_m: f.properties['sar:pixel_spacing_azimuth'] ?? 0.5,
    bbox: f.bbox,
    polarisation: f.properties['sar:polarizations']?.[0] as HighResScene['polarisation'],
    collectionMode: f.properties['capella:product_type'] as HighResScene['collectionMode'],
    sensorType: 'sar',
  }));
}

// ─── Unified client ───────────────────────────────────────────────────────────

export class HighResClient {
  private readonly blackskyKey: string;
  private readonly capellaKey: string;

  constructor() {
    this.blackskyKey = process.env.BLACKSKY_API_KEY ?? '';
    this.capellaKey = process.env.CAPELLA_API_KEY ?? '';
  }

  isConfigured(provider: HighResProvider): boolean {
    return provider === 'blacksky'
      ? this.blackskyKey.length > 0
      : this.capellaKey.length > 0;
  }

  /**
   * Searches archive imagery for a given bbox and date.
   * If provider is omitted, queries all configured providers and merges results.
   */
  async search(
    bbox: number[],
    date: string,
    provider?: HighResProvider,
  ): Promise<HighResScene[]> {
    const providers: HighResProvider[] = provider
      ? [provider]
      : (['blacksky', 'capella'] as HighResProvider[]).filter((p) =>
          this.isConfigured(p),
        );

    if (providers.length === 0) {
      throw new HighResNotAvailableError('blacksky');
    }

    const results = await Promise.allSettled(
      providers.map((p) => {
        if (p === 'blacksky') {
          if (!this.isConfigured('blacksky'))
            throw new HighResNotAvailableError('blacksky');
          return blackskySearch(this.blackskyKey, bbox, date);
        } else {
          if (!this.isConfigured('capella'))
            throw new HighResNotAvailableError('capella');
          return capellaSearch(this.capellaKey, bbox, date);
        }
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<HighResScene[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Places a commercial order for a scene.
   * Both providers require a signed commercial agreement before orders are processed.
   *
   * For future tasking (new collection requests), extend this with a
   * `task(aoi, windowStart, windowEnd, provider)` method.
   */
  async order(sceneId: string): Promise<OrderResult> {
    // Determine provider from scene ID prefix convention
    const provider: HighResProvider = sceneId.startsWith('CAPELLA')
      ? 'capella'
      : 'blacksky';

    if (!this.isConfigured(provider)) {
      throw new HighResNotAvailableError(provider);
    }

    if (provider === 'blacksky') {
      const res = await fetch('https://api.blacksky.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.blackskyKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scene_id: sceneId }),
      });
      if (!res.ok) throw new Error(`BlackSky order failed (${res.status})`);
      const data = (await res.json()) as { order_id: string; estimated_delivery: string };
      return {
        orderId: data.order_id,
        estimatedDelivery: data.estimated_delivery,
        status: 'submitted',
        provider: 'blacksky',
      };
    } else {
      const res = await fetch('https://api.capellaspace.com/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.capellaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scene_id: sceneId }),
      });
      if (!res.ok) throw new Error(`Capella order failed (${res.status})`);
      const data = (await res.json()) as { orderId: string; estimatedDelivery: string };
      return {
        orderId: data.orderId,
        estimatedDelivery: data.estimatedDelivery,
        status: 'submitted',
        provider: 'capella',
      };
    }
  }
}

export const highResClient = new HighResClient();
