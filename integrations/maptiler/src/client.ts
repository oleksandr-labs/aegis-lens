import 'server-only';

export interface MapTilerConfig {
  apiKey: string;
  tier: 'free' | 'paid';
  baseUrl: string;
}

/** Maps style name → MapTiler style URL template (requires API key substitution). */
export const MAPTILER_STYLE_URLS: Record<string, string> = {
  streets: 'https://api.maptiler.com/maps/streets/style.json?key={apiKey}',
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key={apiKey}',
  hybrid: 'https://api.maptiler.com/maps/hybrid/style.json?key={apiKey}',
  topo: 'https://api.maptiler.com/maps/topo/style.json?key={apiKey}',
  dataviz: 'https://api.maptiler.com/maps/dataviz/style.json?key={apiKey}',
  dark: 'https://api.maptiler.com/maps/dataviz-dark/style.json?key={apiKey}',
  terrain: 'https://api.maptiler.com/maps/outdoor/style.json?key={apiKey}',
};

/**
 * OSM raster tile fallback — CC-BY-SA, attribution mandatory.
 * Use when MAPTILER_API_KEY is absent or quota exhausted.
 */
export const OSM_FALLBACK_URL =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export class MapTilerClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.MAPTILER_API_KEY ?? '';
  }

  /** Returns true when a MapTiler API key is present in the environment. */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Returns the MapTiler style URL for the given style name.
   * Falls back to OSM raster tiles when no API key is configured.
   */
  getStyleUrl(style: string): string {
    if (!this.isConfigured()) {
      // Caller must render OSM attribution: "© OpenStreetMap contributors"
      return OSM_FALLBACK_URL;
    }
    const template = MAPTILER_STYLE_URLS[style] ?? MAPTILER_STYLE_URLS['streets'];
    return template.replace('{apiKey}', this.apiKey);
  }

  /**
   * Returns the raster tile URL for the given zoom / x / y.
   * Falls back to OSM when no API key is present.
   */
  getTileUrl(z: number, x: number, y: number): string {
    if (!this.isConfigured()) {
      return OSM_FALLBACK_URL
        .replace('{z}', String(z))
        .replace('{x}', String(x))
        .replace('{y}', String(y));
    }
    return `https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${this.apiKey}`
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y));
  }
}

export const mapTilerClient = new MapTilerClient();
