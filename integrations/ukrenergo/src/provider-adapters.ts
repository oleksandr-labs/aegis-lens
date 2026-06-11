/**
 * Per-provider adapters: each oblenergo / national / consumer source publishes
 * in a different format. An adapter takes a RawProviderRecord and produces a
 * normalised RegionSchedule (+ a coarse OutageKind). The `ProviderAdapter`
 * interface lets provider-adapters be registered by `format`.
 *
 * Format families handled (selected by RawProviderRecord.format):
 *   - ukrenergo_api / ukrenergo_telegram → national notice, no per-group grid
 *   - yasno_groups_json                  → consumer group → OFF-window map
 *   - dtek_schedule_html                 → DTEK HTML timetable (hour grid)
 *   - oblenergo_html_table               → generic oblenergo hour grid
 *   - oblenergo_telegram                 → prose schedule
 *   - svitlo_json                        → Світло/СвітлоБот group JSON
 */

import type {
  RawProviderRecord,
  RegionSchedule,
  ScheduleGroup,
  OutageKind,
  ProviderFormat,
} from "./types";
import {
  parseYasnoGroups,
  parseHourGrid,
  parseProseSchedule,
} from "./schedule-parser";

export interface ProviderAdapter {
  format: ProviderFormat;
  /** Parse one raw record into a normalised schedule. */
  parse(record: RawProviderRecord): RegionSchedule;
}

function dateOf(record: RawProviderRecord): string {
  const raw = record.raw;
  if (raw && typeof raw === "object" && typeof (raw as Record<string, unknown>).date === "string") {
    return (raw as Record<string, unknown>).date as string;
  }
  return record.publishedAt.slice(0, 10);
}

function asString(raw: RawProviderRecord["raw"]): string {
  if (typeof raw === "string") return raw;
  const notice = (raw as Record<string, unknown>).noticeUk;
  return typeof notice === "string" ? notice : JSON.stringify(raw);
}

/** Detect emergency vs scheduled wording in Ukrainian/Russian prose. */
function kindFromText(text: string): OutageKind {
  const t = text.toLowerCase();
  if (/аварійн|екстрен|аварийн|экстренн|emergency/.test(t)) return "emergency";
  if (/стабілізаційн|стабилизацион|гсв/.test(t)) return "stabilization";
  if (/погодинн|почасов|графік|график|гпв|scheduled/.test(t)) return "scheduled";
  if (/відновлен|восстановлен|restored|повернул/.test(t)) return "restored";
  return "unknown";
}

function build(record: RawProviderRecord, groups: ScheduleGroup[], kind: OutageKind): RegionSchedule {
  return {
    regionCode: record.regionCode,
    provider: record.provider,
    publishedAt: record.publishedAt,
    groups,
    kind,
    sourceUrl: record.sourceUrl,
  };
}

// ── Adapters ───────────────────────────────────────────────────────────────────

const yasnoAdapter: ProviderAdapter = {
  format: "yasno_groups_json",
  parse(record) {
    const raw = record.raw as Record<string, unknown>;
    const groups = (raw.groups ?? {}) as Record<string, string[]>;
    return build(record, parseYasnoGroups(groups, dateOf(record)), "scheduled");
  },
};

const svitloAdapter: ProviderAdapter = {
  format: "svitlo_json",
  parse(record) {
    const raw = record.raw as Record<string, unknown>;
    const groups = (raw.groups ?? {}) as Record<string, string[]>;
    return build(record, parseYasnoGroups(groups, dateOf(record)), "scheduled");
  },
};

const hourGridAdapter = (format: ProviderFormat): ProviderAdapter => ({
  format,
  parse(record) {
    const raw = record.raw as Record<string, unknown>;
    const rows = (raw.rows ?? []) as Array<{ group: string; cells: Array<boolean | string | number> }>;
    const groups = parseHourGrid(rows, dateOf(record));
    // If the table came with no rows, fall back to prose parsing of any text.
    if (groups.length === 0) {
      const text = asString(record.raw);
      return build(record, parseProseSchedule(text, dateOf(record)), kindFromText(text));
    }
    return build(record, groups, "scheduled");
  },
});

const dtekHtmlAdapter = hourGridAdapter("dtek_schedule_html");
const oblenergoTableAdapter = hourGridAdapter("oblenergo_html_table");

const oblenergoTelegramAdapter: ProviderAdapter = {
  format: "oblenergo_telegram",
  parse(record) {
    const text = asString(record.raw);
    return build(record, parseProseSchedule(text, dateOf(record)), kindFromText(text));
  },
};

/** Ukrenergo national notices carry no per-group grid — only a kind flag. */
const ukrenergoAdapter = (format: ProviderFormat): ProviderAdapter => ({
  format,
  parse(record) {
    const raw = record.raw as Record<string, unknown>;
    const text = asString(record.raw);
    let kind = kindFromText(text);
    if (raw.emergencyShutdowns === true) kind = "emergency";
    else if (raw.scheduleType === "gsv") kind = "stabilization";
    else if (raw.scheduleInForce === true) kind = "scheduled";
    return build(record, [], kind);
  },
});

const ADAPTERS: Record<ProviderFormat, ProviderAdapter> = {
  ukrenergo_api: ukrenergoAdapter("ukrenergo_api"),
  ukrenergo_telegram: ukrenergoAdapter("ukrenergo_telegram"),
  yasno_groups_json: yasnoAdapter,
  dtek_schedule_html: dtekHtmlAdapter,
  oblenergo_html_table: oblenergoTableAdapter,
  oblenergo_telegram: oblenergoTelegramAdapter,
  svitlo_json: svitloAdapter,
};

/** Get the adapter registered for a format. */
export function getAdapter(format: ProviderFormat): ProviderAdapter {
  return ADAPTERS[format];
}

/** Parse one raw record using the adapter for its format. */
export function parseRecord(record: RawProviderRecord): RegionSchedule {
  return getAdapter(record.format).parse(record);
}

/** Parse a batch of raw records (one schedule per record). */
export function parseRecords(records: RawProviderRecord[]): RegionSchedule[] {
  return records.map(parseRecord);
}
