/**
 * Strict PII redactor for humanitarian data — HIGHEST-PRIORITY INVARIANT.
 *
 * Humanitarian datasets can contain personally identifiable information about
 * vulnerable people (IDPs, beneficiaries, survivors). Re-publishing such PII can
 * cause real-world harm. Per IASC / OCHA Data Responsibility Guidelines and the
 * "do no harm" principle, this redactor is **fail-closed**:
 *
 *   - If we DETECT PII we cannot confidently strip, we BLOCK the whole record.
 *   - We never "best-effort" partial-redact and pass through; an undetectable
 *     leak is treated as a hard failure (the record is dropped, not emitted).
 *   - Exact coordinates of individuals are forbidden; only admin-area centroids
 *     (coarsened) are allowed through.
 *
 * This module is intentionally conservative (high recall, accepts false positives).
 * Aggregate figures (counts of people in an area) are NOT PII and pass through.
 */

export type PiiCategory =
  | "person_name"
  | "phone"
  | "email"
  | "national_id"
  | "exact_coords"
  | "street_address"
  | "date_of_birth"
  | "case_id";

export interface PiiFinding {
  category: PiiCategory;
  /** The matched text (already truncated for safety in logs). */
  sample: string;
  field?: string;
}

export interface RedactionResult<T> {
  /** true = safe to emit (either no PII, or all PII fully redacted). */
  ok: boolean;
  /** Redacted value when ok; null when fail-closed (blocked). */
  value: T | null;
  findings: PiiFinding[];
  /** Why the record was blocked, if ok === false. */
  blockReason?: string;
}

const REDACTION_TOKEN = "[REDACTED]";

// ── Detectors ─────────────────────────────────────────────────────────────────

// Email — RFC-ish, conservative.
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Phone — international + national groupings (incl. Ukrainian +380 forms).
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;

// National ID / passport-like long digit runs (10+ digits) and UA RNTRC (10 digits).
const NATIONAL_ID_RE = /\b\d{8,}\b/g;

// Case / beneficiary IDs commonly seen in humanitarian datasets.
const CASE_ID_RE = /\b(?:case|benef(?:iciary)?|hh|individual|registration|progres|unhcr)[\s_#:-]*\d{3,}\b/gi;

// Date of birth labels.
const DOB_RE = /\b(?:d\.?o\.?b\.?|date of birth|дата народження)\b[\s:]*[\d./-]{6,10}/gi;

// Exact coordinates with high precision (≥4 decimal places ≈ < 11 m) — forbidden
// for individuals. Admin centroids should be coarse (≤2 dp) and are allowed.
const EXACT_COORDS_RE = /-?\d{1,3}\.\d{4,}\s*[,;]\s*-?\d{1,3}\.\d{4,}/g;

// Person-name heuristic: explicit name labels (we do NOT try to NER free text;
// instead any field LABELED as a person name is treated as PII).
const NAME_LABEL_RE = /\b(?:full name|first name|last name|surname|patronymic|ім'?я|прізвище|по батькові)\b[\s:]*\S+/gi;

// Street-address heuristic (house number + street keyword).
const ADDRESS_RE = /\b\d{1,4}\s+(?:вул\.?|вулиця|street|st\.?|просп\.?|provulok|avenue|ave\.?)\b[^,\n]{0,40}/gi;

interface Detector {
  category: PiiCategory;
  re: RegExp;
  /** If true, presence forces fail-closed (cannot be safely tokenized). */
  hardBlock: boolean;
}

const DETECTORS: Detector[] = [
  { category: "email", re: EMAIL_RE, hardBlock: false },
  { category: "phone", re: PHONE_RE, hardBlock: false },
  { category: "national_id", re: NATIONAL_ID_RE, hardBlock: false },
  { category: "case_id", re: CASE_ID_RE, hardBlock: false },
  { category: "date_of_birth", re: DOB_RE, hardBlock: false },
  { category: "person_name", re: NAME_LABEL_RE, hardBlock: true },
  { category: "exact_coords", re: EXACT_COORDS_RE, hardBlock: true },
  { category: "street_address", re: ADDRESS_RE, hardBlock: true },
];

function truncate(s: string): string {
  return s.length > 24 ? s.slice(0, 21) + "…" : s;
}

/**
 * Scan + redact a single string.
 * Returns redacted text, findings, and whether a hard-block category fired.
 */
export function redactString(input: string): {
  text: string;
  findings: PiiFinding[];
  hardBlocked: boolean;
} {
  let text = input;
  const findings: PiiFinding[] = [];
  let hardBlocked = false;

  for (const det of DETECTORS) {
    // Fresh regex state each pass (global regexes are stateful).
    det.re.lastIndex = 0;
    const matches = input.match(det.re);
    if (!matches) continue;
    for (const m of matches) {
      findings.push({ category: det.category, sample: truncate(m) });
    }
    if (det.hardBlock) {
      hardBlocked = true;
    } else {
      text = text.replace(det.re, REDACTION_TOKEN);
    }
  }

  return { text, findings, hardBlocked };
}

/**
 * Fields whose VALUE is, by name, personal data → always blocked if present
 * with a non-empty value.
 */
const SENSITIVE_FIELD_NAMES = new Set([
  "name", "fullname", "full_name", "firstname", "first_name",
  "lastname", "last_name", "surname", "patronymic",
  "phone", "telephone", "mobile", "email", "e_mail",
  "passport", "national_id", "nationalid", "id_number", "idnumber",
  "address", "street", "dob", "date_of_birth", "birthdate",
  "beneficiary_id", "case_id", "household_id", "gps", "exact_location",
  "ім'я", "прізвище", "телефон", "адреса",
]);

function isSensitiveFieldName(key: string): boolean {
  return SENSITIVE_FIELD_NAMES.has(key.trim().toLowerCase());
}

/**
 * Recursively redact an arbitrary humanitarian record (object/array/string).
 *
 * FAIL-CLOSED: if any hard-block PII (person names, exact individual coords,
 * street addresses, or a sensitive-named field carrying a value) is detected,
 * the WHOLE record is blocked: `ok=false`, `value=null`.
 */
export function redactRecord<T>(record: T): RedactionResult<T> {
  const findings: PiiFinding[] = [];
  let blocked = false;
  let blockReason: string | undefined;

  const walk = (value: unknown, path: string): unknown => {
    if (value == null) return value;

    if (typeof value === "string") {
      const r = redactString(value);
      for (const f of r.findings) findings.push({ ...f, field: path || undefined });
      if (r.hardBlocked) {
        blocked = true;
        blockReason ??= `Hard-block PII detected at "${path || "<root>"}"`;
      }
      return r.text;
    }

    if (typeof value === "number" || typeof value === "boolean") return value;

    if (Array.isArray(value)) {
      return value.map((v, i) => walk(v, `${path}[${i}]`));
    }

    if (typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (isSensitiveFieldName(k)) {
          const hasValue =
            v != null &&
            !(typeof v === "string" && v.trim() === "") &&
            !(Array.isArray(v) && v.length === 0);
          if (hasValue) {
            blocked = true;
            blockReason ??= `Sensitive field "${k}" carries a value at "${path || "<root>"}"`;
            findings.push({ category: "person_name", sample: `<field:${k}>`, field: k });
          }
          out[k] = REDACTION_TOKEN;
          continue;
        }
        out[k] = walk(v, path ? `${path}.${k}` : k);
      }
      return out;
    }

    return value;
  };

  const redacted = walk(record, "");

  if (blocked) {
    return { ok: false, value: null, findings, blockReason };
  }
  return { ok: true, value: redacted as T, findings };
}

/**
 * Coarsen a coordinate to admin-area resolution (default 2 dp ≈ 1.1 km),
 * removing any individual-level precision. Use this for centroids that must
 * remain on the map.
 */
export function coarsenCoord(
  coord: { lat: number; lon: number },
  decimals = 2,
): { lat: number; lon: number } {
  const f = Math.pow(10, decimals);
  return {
    lat: Math.round(coord.lat * f) / f,
    lon: Math.round(coord.lon * f) / f,
  };
}

/**
 * Convenience guard: redact and THROW if blocked. Use at trust boundaries
 * where emitting un-redactable data is never acceptable.
 */
export function assertRedacted<T>(record: T): T {
  const r = redactRecord(record);
  if (!r.ok || r.value == null) {
    throw new PiiBlockedError(r.blockReason ?? "PII redaction failed closed", r.findings);
  }
  return r.value;
}

export class PiiBlockedError extends Error {
  constructor(
    message: string,
    public readonly findings: PiiFinding[],
  ) {
    super(message);
    this.name = "PiiBlockedError";
  }
}
