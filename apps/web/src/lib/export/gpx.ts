/**
 * GPX 1.1 export utilities — waypoints, track generation, and event mapping.
 * Утиліти експорту GPX 1.1 — точки маршруту, генерація треків та маппінг подій.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GpxWaypoint {
  lat: number;
  lng: number;
  name: string;
  description?: string;
  timestamp: string;
  elevation?: number;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** GPX 1.1 standard — follows the official GPX schema at topografix.com/GPX/1/1 */
export const GPX_NOTE_STANDARD_EN =
  "GPX 1.1 standard — follows the official schema at topografix.com/GPX/1/1; includes required namespace declarations and optional elevation data.";
export const GPX_NOTE_STANDARD_UK =
  "Стандарт GPX 1.1 — відповідає офіційній схемі topografix.com/GPX/1/1; включає обов'язкові декларації простору імен та опціональні дані висоти.";

/** Compatible with Google Maps, Garmin devices, and major GIS platforms */
export const GPX_NOTE_COMPAT_EN =
  "Compatible with Google Maps, Garmin GPS devices, QGIS, and all major GIS platforms that support the GPX 1.1 specification.";
export const GPX_NOTE_COMPAT_UK =
  "Сумісний з Google Maps, GPS-пристроями Garmin, QGIS та всіма основними ГІС-платформами, що підтримують специфікацію GPX 1.1.";

// ── Core builder ──────────────────────────────────────────────────────────────

/**
 * Build a valid GPX 1.1 XML string from an array of waypoints.
 * Побудова валідного XML-рядка GPX 1.1 з масиву точок маршруту.
 */
export function buildGpxXml(waypoints: GpxWaypoint[], trackName: string): string {
  const escapeXml = (s: string): string =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const wptElements = waypoints
    .map((wpt) => {
      const elevEl =
        wpt.elevation !== undefined ? `\n      <ele>${wpt.elevation}</ele>` : "";
      const descEl = wpt.description
        ? `\n      <desc>${escapeXml(wpt.description)}</desc>`
        : "";
      return (
        `  <wpt lat="${wpt.lat}" lon="${wpt.lng}">` +
        `\n      <name>${escapeXml(wpt.name)}</name>` +
        `\n      <time>${wpt.timestamp}</time>` +
        elevEl +
        descEl +
        `\n  </wpt>`
      );
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<gpx version="1.1"\n` +
    `     creator="Aegis Lens"\n` +
    `     xmlns="http://www.topografix.com/GPX/1/1"\n` +
    `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n` +
    `     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n` +
    `  <metadata>\n` +
    `    <name>${escapeXml(trackName)}</name>\n` +
    `    <time>${new Date().toISOString()}</time>\n` +
    `  </metadata>\n` +
    wptElements +
    `\n</gpx>`
  );
}

// ── Event mapper ──────────────────────────────────────────────────────────────

/**
 * Map raw event objects to GpxWaypoint records.
 * Маппінг сирих об'єктів подій у записи GpxWaypoint.
 */
export function eventsToGpxWaypoints(events: any[]): GpxWaypoint[] {
  return events
    .filter(
      (e) =>
        typeof e.lat === "number" &&
        typeof e.lng === "number",
    )
    .map((e) => ({
      lat: e.lat as number,
      lng: e.lng as number,
      name: (e.title ?? e.name ?? e.eventId ?? "Event") as string,
      description: e.description ?? e.summary ?? undefined,
      timestamp: e.occurredAt ?? e.createdAt ?? new Date().toISOString(),
      elevation: typeof e.elevation === "number" ? e.elevation : undefined,
    }));
}
