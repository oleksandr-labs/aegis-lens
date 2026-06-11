import type { EventClass } from "@aegis/types";

// SVG path data (24x24 viewBox) per event class — used in markers and legend.
export const CLASS_ICON_PATH: Record<EventClass, string> = {
  military_action: `<path d="M12 2L4 20h16L12 2z" fill="currentColor"/>`,
  civilian_alert: `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2.5"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/>`,
  infrastructure: `<rect x="4" y="10" width="16" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="10" x2="8" y2="4" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="10" x2="12" y2="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="10" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>`,
  humanitarian: `<path d="M12 2a5 5 0 0 1 5 5c0 4-5 11-5 11S7 11 7 7a5 5 0 0 1 5-5z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 7h6M12 4v6" stroke="currentColor" strokeWidth="1.5"/>`,
  cyber: `<rect x="3" y="4" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="2"/><path d="M8 10l2 2-2 2M13 10h3" stroke="currentColor" strokeWidth="1.5"/>`,
  maritime: `<path d="M5 18l1-8h12l1 8z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 18h18" stroke="currentColor" strokeWidth="2"/><path d="M12 10V4M9 7h6" stroke="currentColor" strokeWidth="2"/>`,
  aviation: `<path d="M12 2l2 7h7l-5.5 4 2 7L12 17l-5.5 3 2-7L3 9h7z" fill="none" stroke="currentColor" strokeWidth="1.8"/>`,
  environmental: `<path d="M12 2C8 2 4 5 4 9c0 6 8 13 8 13s8-7 8-13c0-4-4-7-8-7z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M9 9c0-1.7 1.3-3 3-3" stroke="currentColor" strokeWidth="1.5"/>`,
  political: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="currentColor" strokeWidth="1.2"/>`,
  economic: `<path d="M2 12h20M12 2l8 10-8 10-8-10z" fill="none" stroke="currentColor" strokeWidth="2"/>`,
};

/**
 * Returns a marker size (px) proportional to the event's danger score.
 */
export function getMarkerSize(dangerScore: number): number {
  if (dangerScore >= 80) return 28;
  if (dangerScore >= 60) return 24;
  if (dangerScore >= 40) return 20;
  return 16;
}

/**
 * Creates an HTML element for a single-event map marker with a custom SVG icon.
 * The pin shape rotates -45deg; the icon counter-rotates to stay upright.
 */
export function createMarkerElement(
  cls: EventClass,
  color: string,
  size = 20,
  isNew = false,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    width: ${size}px; height: ${size}px;
    cursor: pointer;
  `;

  // Teardrop pin shape
  const pin = document.createElement("div");
  pin.style.cssText = `
    width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: ${color};
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 8px ${color}66, 0 0 0 3px ${color}22;
    display: flex; align-items: center; justify-content: center;
  `;

  // SVG icon — counter-rotated so it renders upright inside the pin
  const iconSize = Math.round(size * 0.5);
  const icon = document.createElement("div");
  icon.style.cssText = `
    transform: rotate(45deg);
    width: ${iconSize}px; height: ${iconSize}px;
    color: rgba(255,255,255,0.95);
    display: flex; align-items: center; justify-content: center;
  `;
  icon.innerHTML = `<svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" fill="none">${CLASS_ICON_PATH[cls]}</svg>`;

  pin.appendChild(icon);
  wrapper.appendChild(pin);

  // Pulse ring for freshly arrived live events
  if (isNew) {
    const ring = document.createElement("div");
    ring.style.cssText = `
      position: absolute; inset: -6px;
      border-radius: 999px;
      border: 2px solid ${color};
      opacity: 0.6;
      animation: pulse-ring 1.5s ease-out infinite;
    `;
    wrapper.appendChild(ring);
  }

  return wrapper;
}

/**
 * Creates a cluster bubble element.
 */
export function createClusterElement(
  count: number,
  size: number,
  color: string,
): HTMLElement {
  const el = document.createElement("button");
  el.setAttribute("aria-label", `Cluster of ${count} events`);
  el.style.cssText = `
    width: ${size}px; height: ${size}px; border-radius: 999px;
    background: ${color}cc;
    border: 2px solid rgba(255,255,255,0.9);
    box-shadow: 0 0 0 6px ${color}22;
    color: white; font-family: monospace; font-size: ${Math.max(10, Math.round(size * 0.4))}px;
    font-weight: 700; cursor: pointer; padding: 0;
    display: inline-flex; align-items: center; justify-content: center;
  `;
  el.textContent = count > 999 ? "999+" : String(count);
  return el;
}
