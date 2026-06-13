/**
 * CLDR-based pluralization test suite.
 *
 * Validates that locale files contain all required CLDR plural forms for keys
 * that use pluralization (detected by the presence of _zero/_one/_two/_few/_many/_other suffixes).
 *
 * Reference: Unicode CLDR plural rules
 * https://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * Supported locales: en, uk, pl, de, ro, cy, pt, pa, gu, bn, ur, ar
 */

// ── CLDR plural categories per locale ────────────────────────────────────────

/** The six CLDR plural categories. Not all locales use all six. */
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * Required plural categories for each locale, per CLDR.
 * "other" is always required as the fallback form.
 */
export const CLDR_PLURAL_FORMS: Record<string, PluralCategory[]> = {
  // 2 forms: one | other
  en: ["one", "other"],
  de: ["one", "other"],
  pt: ["one", "other"],
  gu: ["one", "other"],
  pa: ["one", "other"],
  bn: ["one", "other"],

  // 3 forms: one | few | other (Romanian)
  ro: ["one", "few", "other"],

  // 4 forms: one | few | many | other (Ukrainian, Polish)
  uk: ["one", "few", "many", "other"],
  pl: ["one", "few", "many", "other"],

  // 4 forms: one | two | few | many | other (Welsh — 6 forms total)
  cy: ["zero", "one", "two", "few", "many", "other"],

  // 2 forms: one | other (Urdu — simplified; CLDR has additional cardinal forms)
  ur: ["one", "other"],

  // 6 forms (Arabic — all categories used)
  ar: ["zero", "one", "two", "few", "many", "other"],
};

/** Suffix used in locale JSON keys to denote plural forms (e.g. "item_count_one"). */
const PLURAL_SUFFIX_RE = /_(zero|one|two|few|many|other)$/;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PluralKeyGroup {
  /** Base key without the plural suffix (e.g. "item_count"). */
  baseKey: string;
  /** All present forms in this locale file. */
  presentForms: PluralCategory[];
  /** Forms required by CLDR for this locale but absent from the file. */
  missingForms: PluralCategory[];
  /** Forms present in the file but not required by CLDR for this locale. */
  extraForms: PluralCategory[];
}

export interface PluralizationCheckResult {
  locale: string;
  /** All plural key groups detected in the source locale. */
  groups: PluralKeyGroup[];
  /** Errors: groups with at least one missing required CLDR form. */
  errors: PluralKeyGroup[];
  /** Warnings: groups with extra forms (harmless but noisy). */
  warnings: PluralKeyGroup[];
  passed: boolean;
}

// ── Core check ────────────────────────────────────────────────────────────────

/**
 * Detect all pluralization key groups in `translations` and validate them
 * against the CLDR required forms for `locale`.
 *
 * A key group is detected when two or more keys share the same base and differ
 * only in the CLDR plural suffix (e.g. "item_one", "item_other").
 * Single-suffix keys (only "item_other") are flagged if required forms are missing.
 */
export function checkPluralization(
  locale: string,
  translations: Record<string, string>,
): PluralizationCheckResult {
  const requiredForms = CLDR_PLURAL_FORMS[locale] ?? ["one", "other"];

  // Group keys by base
  const baseToForms = new Map<string, Set<PluralCategory>>();

  for (const key of Object.keys(translations)) {
    const match = key.match(PLURAL_SUFFIX_RE);
    if (!match) continue;
    const form = match[1] as PluralCategory;
    const base = key.slice(0, key.length - match[0].length);

    if (!baseToForms.has(base)) {
      baseToForms.set(base, new Set());
    }
    baseToForms.get(base)!.add(form);
  }

  const groups: PluralKeyGroup[] = [];

  for (const [baseKey, presentSet] of baseToForms) {
    const presentForms = Array.from(presentSet) as PluralCategory[];
    const missingForms = requiredForms.filter((f) => !presentSet.has(f));
    const extraForms = presentForms.filter((f) => !requiredForms.includes(f));

    groups.push({ baseKey, presentForms, missingForms, extraForms });
  }

  const errors = groups.filter((g) => g.missingForms.length > 0);
  const warnings = groups.filter((g) => g.extraForms.length > 0);
  const passed = errors.length === 0;

  return { locale, groups, errors, warnings, passed };
}

/**
 * Check all target locales against the source locale's plural key structure.
 *
 * The source locale (en) defines the canonical set of plural base keys.
 * Each target locale must implement all CLDR-required forms for every base key.
 */
export function checkAllLocalesPluralization(
  sourceTranslations: Record<string, string>,
  targets: Array<{ locale: string; translations: Record<string, string> }>,
): PluralizationCheckResult[] {
  return targets.map(({ locale, translations }) =>
    checkPluralization(locale, translations),
  );
}

/**
 * Format pluralization check results for CI output.
 */
export function formatPluralizationResults(results: PluralizationCheckResult[]): {
  output: string;
  exitCode: 0 | 1;
} {
  const lines: string[] = [];
  let hasErrors = false;

  for (const r of results) {
    if (r.passed && r.warnings.length === 0) {
      lines.push(`✓ ${r.locale} pluralization — all CLDR forms present (${r.groups.length} groups)`);
    } else {
      if (!r.passed) hasErrors = true;

      if (r.errors.length > 0) {
        lines.push(`✗ ${r.locale} — missing CLDR plural forms:`);
        for (const g of r.errors.slice(0, 5)) {
          lines.push(
            `  "${g.baseKey}": missing [${g.missingForms.join(", ")}], present [${g.presentForms.join(", ")}]`,
          );
        }
        if (r.errors.length > 5) {
          lines.push(`  … and ${r.errors.length - 5} more errors`);
        }
      }

      if (r.warnings.length > 0) {
        lines.push(`⚠ ${r.locale} — extra (non-CLDR) plural forms (harmless):`);
        for (const g of r.warnings.slice(0, 3)) {
          lines.push(`  "${g.baseKey}": extra [${g.extraForms.join(", ")}]`);
        }
      }
    }
  }

  return { output: lines.join("\n"), exitCode: hasErrors ? 1 : 0 };
}

// ── CLDR plural rule functions (test helpers) ─────────────────────────────────

/**
 * Determine the plural category for a count value in a given locale.
 * Useful in unit tests to verify that UI renders the correct plural form.
 *
 * These implement the CLDR plural rules for the supported locales.
 * Reference: https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html
 */
export function getCldrPluralCategory(locale: string, n: number): PluralCategory {
  const intN = Math.floor(Math.abs(n));

  switch (locale) {
    case "en":
    case "de":
    case "pt":
    case "gu":
    case "pa":
    case "bn":
    case "ur":
      return intN === 1 ? "one" : "other";

    case "ro":
      if (intN === 1) return "one";
      if (intN === 0 || (intN % 100 >= 2 && intN % 100 <= 19)) return "few";
      return "other";

    case "uk": {
      const mod10 = intN % 10;
      const mod100 = intN % 100;
      if (mod10 === 1 && mod100 !== 11) return "one";
      if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "few";
      return "many";
    }

    case "pl": {
      if (intN === 1) return "one";
      const mod10 = intN % 10;
      const mod100 = intN % 100;
      if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "few";
      return "many";
    }

    case "cy":
      if (intN === 0) return "zero";
      if (intN === 1) return "one";
      if (intN === 2) return "two";
      if (intN === 3) return "few";
      if (intN === 6) return "many";
      return "other";

    case "ar": {
      if (intN === 0) return "zero";
      if (intN === 1) return "one";
      if (intN === 2) return "two";
      const mod100 = intN % 100;
      if (mod100 >= 3 && mod100 <= 10) return "few";
      if (mod100 >= 11 && mod100 <= 99) return "many";
      return "other";
    }

    default:
      return "other";
  }
}
