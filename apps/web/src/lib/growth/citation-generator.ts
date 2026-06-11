/**
 * Citation Generator — structured citations for every verified event.
 *
 * Supports APA, MLA, Chicago, ISO 690, and plain-text formats.
 * Lowers CAC via academic & journalist referencing.
 *
 * Генератор цитат для кожної верифікованої події (APA, MLA, Chicago, ISO 690, plain).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CitationFormat = "APA" | "MLA" | "Chicago" | "ISO690" | "plain";

// ── Event shape expected by the generator ─────────────────────────────────────

export interface CitableEvent {
  id: string;
  title: string;
  /** ISO-8601 timestamp of the event. / Час події. */
  timestamp: string;
  location: string;
  sourceUrls: string[];
  /** Organisation / platform name to cite as author. */
  publisherName: string;
  /** Canonical URL of the event page. / Канонічний URL сторінки події. */
  canonicalUrl: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Citation usage note (English). */
export const CITATION_NOTE_EN =
  "When citing Aegis Lens data, please use the generated citation block " +
  "and include the access date. Data is updated continuously; cite the " +
  "specific snapshot URL for archival purposes.";

/** Citation usage note (Ukrainian). / Примітка про цитування (Українська). */
export const CITATION_NOTE_UK =
  "Цитуючи дані Aegis Lens, використовуйте згенерований блок цитування " +
  "та вказуйте дату доступу. Дані оновлюються постійно; для архіву " +
  "використовуйте URL конкретного знімку.";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): {
  year: string;
  monthFull: string;
  day: string;
  yearMonthDay: string;
} {
  const d = new Date(iso);
  const year = String(d.getUTCFullYear());
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthFull = months[d.getUTCMonth()];
  const day = String(d.getUTCDate());
  const yearMonthDay = iso.slice(0, 10);
  return { year, monthFull, day, yearMonthDay };
}

function accessDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── buildCitation ─────────────────────────────────────────────────────────────

/**
 * Build a formatted citation string for a citable event.
 *
 * Формує рядок цитування для події у заданому форматі.
 */
export function buildCitation(event: CitableEvent, format: CitationFormat): string {
  const { year, monthFull, day, yearMonthDay } = formatDate(event.timestamp);
  const accessed = accessDate();

  switch (format) {
    case "APA":
      return (
        `${event.publisherName}. (${year}, ${monthFull} ${day}). ` +
        `${event.title} [Event record]. Aegis Lens. ` +
        `Retrieved ${accessed}, from ${event.canonicalUrl}`
      );

    case "MLA":
      return (
        `"${event.title}." *Aegis Lens*, ${event.publisherName}, ` +
        `${day} ${monthFull} ${year}, ${event.canonicalUrl}. ` +
        `Accessed ${accessed}.`
      );

    case "Chicago":
      return (
        `${event.publisherName}. "${event.title}." Aegis Lens. ` +
        `${monthFull} ${day}, ${year}. ` +
        `Accessed ${accessed}. ${event.canonicalUrl}.`
      );

    case "ISO690":
      return (
        `${event.publisherName.toUpperCase()}. ${event.title}. ` +
        `*Aegis Lens* [online]. ${yearMonthDay}. ` +
        `[Viewed ${accessed}]. Available from: ${event.canonicalUrl}`
      );

    case "plain":
    default:
      return (
        `${event.title} — Aegis Lens (${event.publisherName}, ${yearMonthDay}). ` +
        `${event.canonicalUrl} [accessed ${accessed}]`
      );
  }
}
