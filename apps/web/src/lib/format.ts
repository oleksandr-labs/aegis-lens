import type { Locale } from "@aegis/i18n-config";

/**
 * Locale-aware "time ago" via Intl.RelativeTimeFormat.
 * Works server-side (no React state needed).
 */
export function timeAgo(when: string | Date, locale: Locale): string {
  const t = typeof when === "string" ? Date.parse(when) : when.getTime();
  if (!Number.isFinite(t)) return "—";
  const diffMs = t - Date.now();
  const absSec = Math.abs(diffMs / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const fmt = new Intl.RelativeTimeFormat(locale === "uk" ? "uk" : locale, {
    numeric: "auto",
    style: "short",
  });

  for (const [unit, secs] of units) {
    if (absSec >= secs || unit === "second") {
      const value = Math.round(diffMs / 1000 / secs);
      return fmt.format(value, unit);
    }
  }
  return "—";
}

export function formatDateTime(when: string | Date, locale: Locale): string {
  const d = typeof when === "string" ? new Date(when) : when;
  return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}
