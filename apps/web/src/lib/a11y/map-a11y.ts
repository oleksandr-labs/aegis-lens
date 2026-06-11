/**
 * Map accessibility utilities for Aegis Lens.
 *
 * WCAG 2.2 AA requires non-visual alternatives for map-based content.
 * This module provides:
 *   - Dynamic ARIA labels that describe the current map state
 *   - An HTML tabular fallback view of visible events
 *   - Keyboard shortcut registry for map navigation
 */

export interface MapAccessibilityState {
  visibleEventCount: number;
  selectedEventId?: string;
  currentRegion?: string;
  layersActive: string[];
  lastUpdated: string; // ISO 8601
}

/**
 * Generate descriptive ARIA labels for the map container in both locales.
 * The returned object should be spread onto the map wrapper element:
 *   <div {...buildMapAriaLabel(state)} />
 */
export function buildMapAriaLabel(state: MapAccessibilityState): {
  "aria-label": string;
  "aria-description": string;
  lang?: string;
} {
  const updated = new Date(state.lastUpdated).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const region = state.currentRegion ?? "Ukraine";
  const layers = state.layersActive.length > 0
    ? state.layersActive.join(", ")
    : "all layers";

  const label_en =
    `Interactive conflict map — ${region}. ` +
    `${state.visibleEventCount} event${state.visibleEventCount !== 1 ? "s" : ""} visible. ` +
    `Last updated ${updated} UTC.`;

  const description_en =
    `Active layers: ${layers}. ` +
    (state.selectedEventId
      ? `Selected event ID: ${state.selectedEventId}. `
      : "") +
    `Use arrow keys to pan, + / - to zoom. Press T for tabular view.`;

  return {
    "aria-label": label_en,
    "aria-description": description_en,
  };
}

/**
 * Render an accessible HTML table listing the currently visible map events.
 *
 * This table is the primary fallback for:
 *   - Screen-reader users who cannot interpret the visual map
 *   - Users who have disabled canvas / WebGL
 *   - Print stylesheets
 *
 * The returned HTML string can be injected into a visually-hidden (but
 * screen-reader-visible) region, or shown as a toggle panel.
 */
export function buildTabularFallback(
  events: {
    id: string;
    type: string;
    location: string;
    time: string;
    severity: number; // 1 (low) – 5 (critical)
  }[],
): string {
  if (events.length === 0) {
    return `<p role="status">No events currently visible in this map view.</p>`;
  }

  const severityLabel = (n: number): string => {
    const labels: Record<number, string> = {
      1: "Low",
      2: "Moderate",
      3: "High",
      4: "Severe",
      5: "Critical",
    };
    return labels[n] ?? "Unknown";
  };

  const rows = events
    .map(
      (ev) =>
        `<tr>
          <td>${ev.id}</td>
          <td>${ev.type}</td>
          <td>${ev.location}</td>
          <td><time datetime="${ev.time}">${new Date(ev.time).toLocaleString("en-GB")}</time></td>
          <td aria-label="Severity: ${severityLabel(ev.severity)}">${severityLabel(ev.severity)}</td>
        </tr>`,
    )
    .join("\n");

  return `
<table>
  <caption>Current map events (${events.length} visible)</caption>
  <thead>
    <tr>
      <th scope="col">Event ID</th>
      <th scope="col">Type</th>
      <th scope="col">Location</th>
      <th scope="col">Time (UTC)</th>
      <th scope="col">Severity</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`.trim();
}

/** Keyboard shortcuts for map navigation. */
export const MAP_KEYBOARD_SHORTCUTS: {
  key: string;
  description_en: string;
  description_uk: string;
}[] = [
  {
    key: "ArrowUp",
    description_en: "Pan map north",
    description_uk: "Перемістити карту на північ",
  },
  {
    key: "ArrowDown",
    description_en: "Pan map south",
    description_uk: "Перемістити карту на південь",
  },
  {
    key: "ArrowLeft",
    description_en: "Pan map west",
    description_uk: "Перемістити карту на захід",
  },
  {
    key: "ArrowRight",
    description_en: "Pan map east",
    description_uk: "Перемістити карту на схід",
  },
  {
    key: "+",
    description_en: "Zoom in",
    description_uk: "Збільшити масштаб",
  },
  {
    key: "-",
    description_en: "Zoom out",
    description_uk: "Зменшити масштаб",
  },
  {
    key: "Home",
    description_en: "Reset map to default view",
    description_uk: "Повернути карту до стандартного вигляду",
  },
  {
    key: "T",
    description_en: "Toggle tabular fallback view",
    description_uk: "Перемкнути табличний резервний вигляд",
  },
  {
    key: "F",
    description_en: "Filter events panel",
    description_uk: "Панель фільтрів подій",
  },
  {
    key: "Escape",
    description_en: "Deselect event / close panel",
    description_uk: "Зняти вибір події / закрити панель",
  },
];
