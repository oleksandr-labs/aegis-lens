/**
 * Bulk import / export for the redirect registry.
 *
 * CSV is the canonical authoring format (diffable in PRs, editable by
 * non-engineers). This module parses the CSV in `apps/web/src/data/redirects.csv`
 * and serializes a registry back to CSV for round-tripping / export.
 *
 * Header: from,to,status,created_at,reason
 *  - empty `to` => 410 (Gone)
 *  - `created_at` is ISO-8601 (YYYY-MM-DD)
 *  - `reason` may contain commas if quoted ("...")
 *
 * The parser is dependency-free and handles double-quoted fields with escaped
 * quotes (`""`) so reasons can contain commas.
 */

import {
  buildRegistry,
  type RedirectRegistry,
  type RedirectRule,
  type RedirectStatus,
  RedirectRegistryError,
} from "./registry";

const HEADER = ["from", "to", "status", "created_at", "reason"] as const;

/** Parse a single CSV line into fields, honouring quoted values. */
function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Parse CSV text into validated registry. Throws `RedirectRegistryError` on a
 * malformed header or any invalid row.
 */
export function parseRedirectsCsv(csv: string): RedirectRegistry {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return buildRegistry([]);

  const header = parseLine(lines[0]).map((h) => h.trim());
  if (header.length !== HEADER.length || HEADER.some((h, i) => header[i] !== h)) {
    throw new RedirectRegistryError(
      `Unexpected CSV header: expected "${HEADER.join(",")}", got "${header.join(",")}"`,
    );
  }

  const rows: RedirectRule[] = lines.slice(1).map((line, idx) => {
    const f = parseLine(line);
    if (f.length < HEADER.length) {
      throw new RedirectRegistryError(`Row ${idx + 2} has too few columns: ${line}`);
    }
    const [from, to, statusRaw, createdAt, ...rest] = f;
    const reason = rest.join(","); // tolerate stray commas if reason was unquoted
    const status = Number(statusRaw.trim()) as RedirectStatus;
    return {
      from: from.trim(),
      to: to.trim() === "" ? null : to.trim(),
      status,
      createdAt: createdAt.trim(),
      reason: reason.trim(),
    };
  });

  return buildRegistry(rows);
}

function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Serialize a registry back to canonical CSV text (export). */
export function exportRedirectsCsv(registry: RedirectRegistry): string {
  const lines = [HEADER.join(",")];
  for (const r of registry.rules) {
    lines.push(
      [
        csvField(r.from),
        csvField(r.to ?? ""),
        String(r.status),
        csvField(r.createdAt),
        csvField(r.reason),
      ].join(","),
    );
  }
  return lines.join("\n") + "\n";
}

/**
 * Synchronous loader for build/edge contexts that can `readFileSync` the CSV.
 * Kept separate from parsing so the parser stays pure/testable.
 *
 * @example
 *   import { readFileSync } from "node:fs";
 *   const reg = loadRegistryFromFile(readFileSync(path, "utf8"));
 */
export function loadRegistryFromFile(csvContents: string): RedirectRegistry {
  return parseRedirectsCsv(csvContents);
}
