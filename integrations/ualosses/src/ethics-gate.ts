/**
 * Ethical content-policy gate for casualty data — HIGHEST-PRIORITY INVARIANT.
 *
 * Tasks 4, 9, 11 are enforced HERE, in code, fail-closed — not merely documented.
 *
 * Casualty records can carry deeply personal information about the dead and the
 * bereaved. Re-publishing a single person's name, photo, date of death, unit,
 * burial place, or home town WITHOUT family consent causes real harm and is
 * forbidden. Mirroring `integrations/un-ocha/src/pii-redaction.ts`, this gate is
 * **fail-closed**:
 *
 *   - We publish AGGREGATE figures only (counts by region / period / source).
 *   - If a record carries ANY per-person signal we cannot prove is aggregate,
 *     we BLOCK the WHOLE record (it is dropped, never emitted).
 *   - No imagery and no per-person data is ever emitted without explicit consent
 *     (`consent: true` flag), and even then it must pass review (task 11).
 *   - High recall: a false positive (blocking a safe record) is acceptable; a
 *     false negative (leaking a person) is NOT.
 *
 * Aggregate counts (numbers of people in a region/period) are NOT personal data
 * and pass through.
 */

export type EthicsViolation =
  | "person_name"
  | "call_sign"
  | "date_of_death"
  | "date_of_birth"
  | "photo_or_imagery"
  | "unit_designation"
  | "burial_place"
  | "home_town"
  | "exact_coords"
  | "free_text_obituary"
  | "sensitive_named_field";

export interface EthicsFinding {
  violation: EthicsViolation;
  field?: string;
  /** Truncated sample for safe logging. */
  sample: string;
}

export interface EthicsResult<T> {
  /** true = safe to emit publicly (aggregate-only, no per-person data). */
  ok: boolean;
  /** Value when ok; null when blocked fail-closed. */
  value: T | null;
  findings: EthicsFinding[];
  blockReason?: string;
}

/**
 * Field names that, by their NAME, denote per-person data. Any non-empty value
 * under one of these blocks the whole record fail-closed (unless explicit,
 * reviewed consent is attached — see `assertAggregateSafe` options).
 */
const PERSON_FIELD_NAMES = new Set<string>([
  // identity
  "fullname", "full_name", "name", "firstname", "first_name", "lastname",
  "last_name", "surname", "patronymic", "callsign", "call_sign", "nickname",
  // life dates
  "dateofbirth", "date_of_birth", "dob", "birthdate", "dateofdeath",
  "date_of_death", "dod", "deathdate", "killedon", "killed_on",
  // affiliation / place
  "unit", "brigade", "regiment", "burialplace", "burial_place", "grave",
  "cemetery", "hometown", "home_town", "birthplace", "residence", "address",
  // media
  "photo", "photourl", "photo_url", "image", "imageurl", "image_url", "portrait",
  "avatar", "media", "obituary", "biography", "bio", "epitaph", "lastwords",
  // precise location
  "exactcoords", "exact_coords", "gps", "coordinates",
  // contact of bereaved
  "phone", "email", "contact",
  // Ukrainian labels
  "ім'я", "прізвище", "позивний", "підрозділ", "поховання", "фото",
]);

/** Map a person field name to a violation category for reporting. */
function fieldViolation(key: string): EthicsViolation {
  const k = key.trim().toLowerCase();
  if (/(photo|image|portrait|avatar|media|фото)/.test(k)) return "photo_or_imagery";
  if (/(call_?sign|nickname|позивний)/.test(k)) return "call_sign";
  if (/(death|dod|killed|поховання)/.test(k)) return "date_of_death";
  if (/(birth|dob)/.test(k)) return "date_of_birth";
  if (/(unit|brigade|regiment|підрозділ)/.test(k)) return "unit_designation";
  if (/(burial|grave|cemetery)/.test(k)) return "burial_place";
  if (/(hometown|home_town|birthplace|residence|address)/.test(k)) return "home_town";
  if (/(exact_?coords|gps|coordinates)/.test(k)) return "exact_coords";
  if (/(obituary|biograph|bio|epitaph|lastwords)/.test(k)) return "free_text_obituary";
  if (/(name|surname|patronymic|ім'я|прізвище)/.test(k)) return "person_name";
  return "sensitive_named_field";
}

// ── String-level detectors (defence-in-depth against free-text leakage) ────────

/** Photo / imagery URLs (images of individuals are forbidden). */
const IMAGE_URL_RE =
  /https?:\/\/\S+\.(?:jpe?g|png|gif|webp|heic|bmp|tiff?)(?:\?\S*)?/gi;

/** Exact coordinates (>=4 dp ~ <11 m) — an individual's grave/location. */
const EXACT_COORDS_RE =
  /-?\d{1,3}\.\d{4,}\s*[,;]\s*-?\d{1,3}\.\d{4,}/g;

/**
 * Explicit person-name / obituary labels in free text. We do NOT attempt NER on
 * arbitrary prose; instead any text LABELED with these is treated as per-person.
 */
const NAME_LABEL_RE =
  /\b(?:full name|first name|last name|surname|patronymic|call ?sign|загиблий|полеглий|ім'?я|прізвище|позивний)\b[\s:]*\S+/gi;

interface StringDetector {
  violation: EthicsViolation;
  re: RegExp;
}

const STRING_DETECTORS: StringDetector[] = [
  { violation: "photo_or_imagery", re: IMAGE_URL_RE },
  { violation: "exact_coords", re: EXACT_COORDS_RE },
  { violation: "person_name", re: NAME_LABEL_RE },
];

function truncate(s: string): string {
  return s.length > 24 ? s.slice(0, 21) + "…" : s;
}

export interface AggregateGateOptions {
  /**
   * Per-person publication is forbidden by default. It may ONLY be enabled with
   * BOTH an explicit consent flag AND a recorded reviewer decision (task 11).
   * Even then this gate still blocks unless `allowConsented` is true.
   */
  allowConsented?: boolean;
  /** Set true only when verified family consent + ethics review are on file. */
  consented?: boolean;
}

/**
 * Scan an arbitrary casualty record and decide if it is AGGREGATE-SAFE.
 *
 * FAIL-CLOSED: any per-person field with a value, any image URL, any exact
 * coordinate, or any name/obituary label in free text BLOCKS the whole record.
 */
export function gateAggregate<T>(
  record: T,
  opts: AggregateGateOptions = {},
): EthicsResult<T> {
  const findings: EthicsFinding[] = [];
  let blocked = false;
  let blockReason: string | undefined;

  const consentBypass = opts.allowConsented === true && opts.consented === true;

  const walk = (value: unknown, path: string): void => {
    if (value == null) return;

    if (typeof value === "string") {
      for (const det of STRING_DETECTORS) {
        det.re.lastIndex = 0;
        const m = value.match(det.re);
        if (m) {
          for (const hit of m) {
            findings.push({ violation: det.violation, field: path || undefined, sample: truncate(hit) });
          }
          blocked = true;
          blockReason ??= `Per-person signal (${det.violation}) in free text at "${path || "<root>"}"`;
        }
      }
      return;
    }

    if (typeof value === "number" || typeof value === "boolean") return;

    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }

    if (typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const isPersonField = PERSON_FIELD_NAMES.has(k.trim().toLowerCase());
        const hasValue =
          v != null &&
          !(typeof v === "string" && v.trim() === "") &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);
        if (isPersonField && hasValue) {
          const viol = fieldViolation(k);
          findings.push({ violation: viol, field: k, sample: `<field:${k}>` });
          blocked = true;
          blockReason ??= `Per-person field "${k}" carries a value at "${path || "<root>"}"`;
        }
        // Still descend to catch nested free-text leakage.
        walk(v, path ? `${path}.${k}` : k);
      }
      return;
    }
  };

  walk(record, "");

  if (blocked && !consentBypass) {
    return { ok: false, value: null, findings, blockReason };
  }
  return { ok: true, value: record, findings };
}

/**
 * Convenience guard at a trust boundary: returns the record if aggregate-safe,
 * otherwise THROWS. Use before any public emission of casualty data.
 */
export function assertAggregateSafe<T>(record: T, opts?: AggregateGateOptions): T {
  const r = gateAggregate(record, opts);
  if (!r.ok || r.value == null) {
    throw new EthicsBlockedError(r.blockReason ?? "Ethics gate failed closed", r.findings);
  }
  return r.value;
}

export class EthicsBlockedError extends Error {
  constructor(
    message: string,
    public readonly findings: EthicsFinding[],
  ) {
    super(message);
    this.name = "EthicsBlockedError";
  }
}

/** Respectful, locale-aware framing shown around any casualty figure. */
export const RESPECTFUL_FRAMING: Record<"uk" | "en", { dignity: string; aggregateOnly: string; verify: string }> = {
  uk: {
    dignity: "Вічна памʼять полеглим. Ці дані наведено з повагою до загиблих та їхніх родин.",
    aggregateOnly: "Публікуються лише знеособлені зведені показники за регіонами та періодами. Жодних персональних даних.",
    verify: "Цифри походять із верифікованих джерел памʼяті; вони можуть бути неповними та оновлюються.",
  },
  en: {
    dignity: "In memory of the fallen. This data is presented with respect for the dead and their families.",
    aggregateOnly: "Only de-identified aggregate figures by region and period are published. No personal data.",
    verify: "Figures come from verified memorial sources; they may be incomplete and are updated over time.",
  },
};
