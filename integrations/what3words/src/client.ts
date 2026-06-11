import 'server-only';

/** What3words API base URL. */
const W3W_BASE_URL = 'https://api.what3words.com/v3';

/** Demo address → coordinate mapping for 5 Ukrainian test locations. */
const DEMO_ADDRESSES: Record<string, { lat: number; lng: number }> = {
  'filled.count.soap': { lat: 51.5074, lng: -0.1278 }, // placeholder
  'index.home.raft': { lat: 50.4501, lng: 30.5234 },   // Kyiv approx
  'slurs.this.ship': { lat: 49.9935, lng: 36.2304 },   // Kharkiv approx
  'lime.safely.most': { lat: 46.9591, lng: 31.9974 },  // Mykolaiv approx
  'cargo.happy.pilot': { lat: 48.4647, lng: 35.0462 }, // Dnipro approx
};

export class What3wordsClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.W3W_API_KEY ?? '';
  }

  /** Returns true when W3W_API_KEY is present. */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Converts a what3words address (e.g. "filled.count.soap") to lat/lng.
   * Returns null when not configured or the address is unknown.
   * In demo mode, resolves 5 pre-seeded UA test addresses without an API call.
   */
  async convertToCoordinates(
    words: string,
  ): Promise<{ lat: number; lng: number } | null> {
    const normalised = words.trim().toLowerCase().replace(/^\/\/\//, '');

    if (!this.isConfigured()) {
      return DEMO_ADDRESSES[normalised] ?? null;
    }

    try {
      const url = new URL(`${W3W_BASE_URL}/convert-to-coordinates`);
      url.searchParams.set('words', normalised);
      url.searchParams.set('format', 'json');

      const res = await fetch(url.toString(), {
        headers: { 'X-Api-Key': this.apiKey },
        next: { revalidate: 86400 }, // coordinates are stable
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        coordinates?: { lat: number; lng: number };
        error?: { code: string };
      };

      if (data.error || !data.coordinates) return null;
      return data.coordinates;
    } catch {
      return null;
    }
  }

  /**
   * Converts lat/lng to a what3words address.
   * Returns null when not configured.
   */
  async convertFromCoordinates(
    lat: number,
    lng: number,
  ): Promise<string | null> {
    if (!this.isConfigured()) return null;

    try {
      const url = new URL(`${W3W_BASE_URL}/convert-to-3wa`);
      url.searchParams.set('coordinates', `${lat},${lng}`);
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const res = await fetch(url.toString(), {
        headers: { 'X-Api-Key': this.apiKey },
        next: { revalidate: 86400 },
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        words?: string;
        error?: { code: string };
      };

      return data.error || !data.words ? null : data.words;
    } catch {
      return null;
    }
  }
}

export const what3wordsClient = new What3wordsClient();
