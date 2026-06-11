/**
 * ARIA live-region announcer for screen-reader support.
 *
 * Two regions:
 *   - polite:    new events, status changes (waits for SR to finish)
 *   - assertive: critical alerts (air raid, missile) — interrupts
 *
 * Politeness tuning matters: over-announcing every event would flood the
 * user. We debounce polite announcements and batch event-arrival counts.
 */

type Politeness = "polite" | "assertive";

const REGION_IDS: Record<Politeness, string> = {
  polite: "aegis-live-polite",
  assertive: "aegis-live-assertive",
};

let politeQueue: string[] = [];
let politeTimer: ReturnType<typeof setTimeout> | null = null;

/** Ensure the live regions exist in the DOM (idempotent). */
export function ensureLiveRegions(): void {
  if (typeof document === "undefined") return;
  for (const [politeness, id] of Object.entries(REGION_IDS)) {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      el.setAttribute("aria-live", politeness);
      el.setAttribute("aria-atomic", "true");
      el.setAttribute("role", politeness === "assertive" ? "alert" : "status");
      // Visually hidden but available to screen readers
      el.style.cssText =
        "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
      document.body.appendChild(el);
    }
  }
}

function writeRegion(politeness: Politeness, message: string): void {
  if (typeof document === "undefined") return;
  ensureLiveRegions();
  const el = document.getElementById(REGION_IDS[politeness]);
  if (!el) return;
  // Clear then set on next frame so repeated identical messages re-announce
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

/**
 * Announce a critical message immediately (interrupts the screen reader).
 * Use sparingly — air-raid alerts, missile warnings, AOI breaches.
 */
export function announceAssertive(message: string): void {
  writeRegion("assertive", message);
}

/**
 * Queue a polite announcement. Debounced + batched to avoid flooding.
 * Multiple announcements within the debounce window are joined.
 */
export function announcePolite(message: string, debounceMs = 1500): void {
  politeQueue.push(message);
  if (politeTimer) clearTimeout(politeTimer);
  politeTimer = setTimeout(() => {
    const batched = politeQueue.join(". ");
    politeQueue = [];
    politeTimer = null;
    writeRegion("polite", batched);
  }, debounceMs);
}

/**
 * Announce a count of new events instead of each individually.
 * e.g. announceEventBatch(7, "en") → "7 new events on the map"
 */
export function announceEventBatch(count: number, locale: "en" | "uk" = "en"): void {
  if (count <= 0) return;
  const msg = locale === "uk"
    ? `${count} ${count === 1 ? "нова подія" : "нових подій"} на карті`
    : `${count} new ${count === 1 ? "event" : "events"} on the map`;
  announcePolite(msg);
}

/**
 * Announce a toast. info/success → polite; error/critical → assertive.
 */
export function announceToast(
  message: string,
  level: "info" | "success" | "warning" | "error" | "critical",
): void {
  if (level === "error" || level === "critical") {
    announceAssertive(message);
  } else {
    announcePolite(message, 500);
  }
}
