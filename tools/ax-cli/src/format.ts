/**
 * Terminal formatting helpers for the `ax` CLI.
 *
 * Допоміжні функції форматування виводу для CLI `ax`.
 *
 * Kept ASCII-only and dependency-free so output is paste-safe into Slack /
 * incident docs and renders identically regardless of terminal.
 */

import type { HealthStatus } from "./types";

/** Status glyph — high-contrast, mono-width, copy-safe. */
export function statusGlyph(status: HealthStatus): string {
  switch (status) {
    case "ok":
      return "[ OK ]";
    case "warn":
      return "[WARN]";
    case "fail":
      return "[FAIL]";
    default:
      return "[ ?? ]";
  }
}

/** Right-pad to width (left-align). */
export function padEnd(s: string, width: number): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

/** Left-pad to width (right-align), for numbers. */
export function padStart(s: string, width: number): string {
  return s.length >= width ? s : " ".repeat(width - s.length) + s;
}

/** Render a simple fixed-width table. Header row + dashes + rows. */
export function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? "").length)),
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => padEnd(c, widths[i])).join("  ").trimEnd();
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  return [fmt(headers), sep, ...rows.map(fmt)].join("\n");
}

/** USD cents → "$1,234.56". */
export function usd(cents: number): string {
  const dollars = cents / 100;
  return "$" + dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Fraction (0..1) → "12.3%". */
export function pct(fraction: number): string {
  return (fraction * 100).toFixed(1) + "%";
}

/** Humanize an ISO timestamp into "Nm ago" / "Nh ago" relative to `now`. */
export function ago(iso: string, now: Date): string {
  const deltaMs = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(deltaMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ${min % 60}m ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ${hr % 24}h ago`;
}
