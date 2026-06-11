/**
 * DSNS daily nationwide operational summary ("оперативна інформація").
 *
 * Each day DSNS publishes an aggregate of the previous 24h: total emergencies,
 * fires extinguished, explosive ordnance defused, people rescued, etc. This
 * module parses that prose into a structured DsnsDailySummary and can also
 * derive a same-day summary by aggregating individual emergency events (useful
 * when the official roll-up has not yet been published).
 *
 * Numbers are extracted heuristically from Ukrainian prose; absent figures are
 * left undefined rather than guessed.
 */

import type {
  DsnsDailySummary,
  DsnsEmergencyEvent,
  EmergencyType,
} from "./types";

/** Pull the first integer following any of the given uk keywords. */
function numberNear(text: string, keywords: string[]): number | undefined {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw);
    if (idx === -1) continue;
    // Look in a window around the keyword for a number.
    const window = lower.slice(Math.max(0, idx - 30), idx + 40);
    const m = /(\d[\d\s]{0,6})/.exec(window);
    if (m) {
      const n = parseInt(m[1].replace(/\s/g, ""), 10);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

/** Parse a DSNS daily-summary article into structured fields. */
export function parseDailySummary(
  text: string,
  opts: { date?: string; url?: string } = {},
): DsnsDailySummary {
  const date = opts.date ?? new Date().toISOString().slice(0, 10);

  const firesExtinguished = numberNear(text, ["ліквідовано пожеж", "пожеж", "загорянь"]);
  const ordnanceDefused = numberNear(text, ["знешкоджено", "вибухонебезпечн", "боєприпас"]);
  const peopleRescued = numberNear(text, ["врятовано", "евакуйовано", "людей"]);
  const totalIncidents = numberNear(text, ["надзвичайн", "виклик", "подій"]);

  const byType: Partial<Record<EmergencyType, number>> = {};
  if (firesExtinguished !== undefined) byType.fire = firesExtinguished;
  if (ordnanceDefused !== undefined) byType.demining = ordnanceDefused;

  return {
    date,
    url: opts.url,
    totalIncidents,
    firesExtinguished,
    ordnanceDefused,
    peopleRescued,
    byType,
    summary: {
      uk:
        `Оперативна зведена ДСНС за ${date}: ` +
        [
          totalIncidents !== undefined ? `${totalIncidents} НС` : null,
          firesExtinguished !== undefined ? `${firesExtinguished} пожеж ліквідовано` : null,
          ordnanceDefused !== undefined ? `${ordnanceDefused} боєприпасів знешкоджено` : null,
          peopleRescued !== undefined ? `${peopleRescued} осіб врятовано` : null,
        ]
          .filter(Boolean)
          .join(", ") + ".",
      en:
        `DSNS daily operational summary for ${date}: ` +
        [
          totalIncidents !== undefined ? `${totalIncidents} emergencies` : null,
          firesExtinguished !== undefined ? `${firesExtinguished} fires extinguished` : null,
          ordnanceDefused !== undefined ? `${ordnanceDefused} ordnance defused` : null,
          peopleRescued !== undefined ? `${peopleRescued} people rescued` : null,
        ]
          .filter(Boolean)
          .join(", ") + ".",
    },
  };
}

/** Aggregate a set of emergency events into a same-day operational summary. */
export function summariseEvents(
  events: DsnsEmergencyEvent[],
  date = new Date().toISOString().slice(0, 10),
): DsnsDailySummary {
  const byType: Partial<Record<EmergencyType, number>> = {};
  for (const ev of events) {
    byType[ev.type] = (byType[ev.type] ?? 0) + 1;
  }
  return {
    date,
    totalIncidents: events.length,
    firesExtinguished: byType.fire,
    ordnanceDefused: byType.demining,
    byType,
    summary: {
      uk: `За ${date} зафіксовано ${events.length} подій ДСНС.`,
      en: `${events.length} DSNS events recorded on ${date}.`,
    },
  };
}
