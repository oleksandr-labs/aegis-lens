/**
 * Web Worker: parse-geojson
 *
 * Parses a raw GeoJSON string off the main thread to avoid UI jank
 * when loading large feature collections (e.g., frontline overlays).
 *
 * Expected message shape: { id: string; geojson: string }
 * Response shape:         { id: string; result: GeoJSON | null; error: string | null }
 */

self.onmessage = (e: MessageEvent<{ id: string; geojson: string }>) => {
  try {
    const parsed = JSON.parse(e.data.geojson);
    self.postMessage({ id: e.data.id, result: parsed, error: null });
  } catch (err) {
    self.postMessage({ id: e.data.id, result: null, error: String(err) });
  }
};
