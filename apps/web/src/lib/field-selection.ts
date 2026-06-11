/**
 * Field selection utility — `?fields=id,title,region`
 *
 * Parses the `fields` query parameter and applies a field mask to response
 * objects so clients receive only what they need.
 *
 * Valid field name characters: alphanumeric, underscore, dot (for nested paths).
 * Invalid field names are silently dropped.
 *
 * Usage:
 *   const fields = parseFieldsParam(url.searchParams.get('fields'));
 *   return NextResponse.json({ data: applyFieldSelection(event, fields) });
 */

// ── Field name validation ─────────────────────────────────────────────────────

const FIELD_NAME_RE = /^[a-zA-Z0-9_.]+$/;

function isValidFieldName(name: string): boolean {
  return FIELD_NAME_RE.test(name) && name.length > 0 && name.length <= 128;
}

// ── parseFieldsParam ──────────────────────────────────────────────────────────

/**
 * Parse `?fields=id,title,region.name` into `['id', 'title', 'region.name']`.
 *
 * Returns `null` when:
 *   - the parameter is absent / null / empty string
 *   - all provided names are invalid
 *
 * A `null` return means "no field selection — return all fields".
 */
export function parseFieldsParam(fields: string | null): string[] | null {
  if (!fields || fields.trim() === "") return null;

  const parsed = fields
    .split(",")
    .map((f) => f.trim())
    .filter(isValidFieldName);

  return parsed.length > 0 ? parsed : null;
}

// ── applyFieldSelection ───────────────────────────────────────────────────────

/**
 * Return a shallow copy of `obj` containing only the requested top-level keys.
 *
 * Dot-notation fields (e.g. `"region.name"`) select the top-level key
 * `"region"` — deep selection is not destructured here, so the full nested
 * object is included. Deep projection should be done at the DB query layer.
 *
 * If `fields` is `null`, returns the object unchanged.
 */
export function applyFieldSelection<T extends Record<string, unknown>>(
  obj: T,
  fields: string[] | null,
): Partial<T> {
  if (!fields) return obj;

  // For dot-notation, take only the root key from the field path
  const rootKeys = new Set(fields.map((f) => f.split(".")[0] as string));

  const result: Partial<T> = {};
  for (const key of rootKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key as keyof T] = obj[key as keyof T];
    }
  }
  return result;
}

/**
 * Apply field selection to every item in an array.
 * If `fields` is `null`, returns the array unchanged.
 */
export function applyFieldSelectionToArray<T extends Record<string, unknown>>(
  arr: T[],
  fields: string[] | null,
): Partial<T>[] {
  if (!fields) return arr;
  return arr.map((item) => applyFieldSelection(item, fields));
}
