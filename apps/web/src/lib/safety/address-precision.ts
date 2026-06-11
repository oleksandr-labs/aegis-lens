/**
 * Address Precision Policy — enforce maximum allowed geographic granularity.
 *
 * Household-level addresses (e.g. exact door numbers) enable doxxing and are
 * blocked platform-wide. The finest permitted level is 'street'.
 *
 * Обмеження точності адрес: рівень "будинок" заборонено на всій платформі.
 * Максимально дозволений рівень — "вулиця".
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const ADDRESS_PRECISION_NOTE_EN =
  "Never allow household-level addresses. Street-level is the maximum permitted precision.";

export const ADDRESS_PRECISION_NOTE_UK =
  "Рівень будинку заборонений. Максимальна дозволена точність — рівень вулиці.";

// ── AddressPrecisionLevel ─────────────────────────────────────────────────────

/**
 * Ordered from coarsest (country) to finest (household).
 * The numeric order mirrors the level index used in assertAddressPrecision.
 *
 * Рівні точності адреси від найгрубішого (країна) до найточнішого (будинок).
 */
export type AddressPrecisionLevel =
  | "country"
  | "region"
  | "city"
  | "district"
  | "street"
  | "household";

const PRECISION_ORDER: AddressPrecisionLevel[] = [
  "country",
  "region",
  "city",
  "district",
  "street",
  "household",
];

// ── Policy constant ───────────────────────────────────────────────────────────

/**
 * The finest address precision level the platform allows.
 * Any level finer than this will be rejected by assertAddressPrecision.
 *
 * Найвищий дозволений рівень точності адрес на платформі.
 */
export const MAX_ALLOWED_PRECISION: AddressPrecisionLevel = "street";

// ── assertAddressPrecision ────────────────────────────────────────────────────

/**
 * Throw a descriptive error if `level` is finer than MAX_ALLOWED_PRECISION.
 * Call this before storing or publishing any geo-annotated event.
 *
 * Кидає помилку якщо рівень точності перевищує допустимий максимум.
 */
export function assertAddressPrecision(level: AddressPrecisionLevel): void {
  const maxIdx = PRECISION_ORDER.indexOf(MAX_ALLOWED_PRECISION);
  const givenIdx = PRECISION_ORDER.indexOf(level);

  if (givenIdx > maxIdx) {
    throw new Error(
      `[address-precision] Level "${level}" exceeds maximum allowed precision "${MAX_ALLOWED_PRECISION}". ` +
        `Household-level addresses are prohibited to prevent doxxing. ` +
        `Рівень "${level}" перевищує допустимий максимум "${MAX_ALLOWED_PRECISION}".`,
    );
  }
}

// ── isPrecisionAllowed ────────────────────────────────────────────────────────

/**
 * Non-throwing check — returns true if `level` is within the allowed range.
 *
 * Безпечна перевірка без виключення.
 */
export function isPrecisionAllowed(level: AddressPrecisionLevel): boolean {
  try {
    assertAddressPrecision(level);
    return true;
  } catch {
    return false;
  }
}
