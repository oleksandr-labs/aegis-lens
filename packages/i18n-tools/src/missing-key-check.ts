/**
 * Missing key detection tool.
 *
 * Compares a source locale (en) against all target locales and reports:
 *   - Keys in EN but missing in target
 *   - Keys in target but missing in EN (orphans)
 *   - Untranslated strings (value identical to EN)
 *   - Placeholder integrity failures ({count}, {{var}})
 *
 * Usage (CI):
 *   npx ts-node missing-key-check.ts --source en --locales uk,pl,de,ro
 */

export interface LocaleRecord {
  locale: string;
  translations: Record<string, string>;
}

export interface KeyCheckResult {
  locale: string;
  missingKeys: string[];
  orphanKeys: string[];
  untranslated: string[];
  placeholderErrors: PlaceholderError[];
  passed: boolean;
}

export interface PlaceholderError {
  key: string;
  sourcePlaceholders: string[];
  targetPlaceholders: string[];
  missing: string[];
  extra: string[];
}

/** Extract {placeholder} and {{placeholder}} patterns from a string. */
function extractPlaceholders(s: string): string[] {
  const matches = s.match(/\{+[a-zA-Z_][a-zA-Z0-9_]*\}+/g) ?? [];
  return [...new Set(matches)];
}

export function checkMissingKeys(
  source: LocaleRecord,
  target: LocaleRecord,
  opts: { allowUntranslated?: boolean } = {},
): KeyCheckResult {
  const sourceKeys = new Set(Object.keys(source.translations));
  const targetKeys = new Set(Object.keys(target.translations));

  const missingKeys = [...sourceKeys].filter((k) => !targetKeys.has(k));
  const orphanKeys = [...targetKeys].filter((k) => !sourceKeys.has(k));

  const untranslated: string[] = [];
  const placeholderErrors: PlaceholderError[] = [];

  for (const key of sourceKeys) {
    const sourceVal = source.translations[key];
    const targetVal = target.translations[key];

    if (!targetVal) continue;

    // Untranslated: target value identical to source
    if (!opts.allowUntranslated && targetVal === sourceVal) {
      untranslated.push(key);
    }

    // Placeholder integrity
    const sourcePH = extractPlaceholders(sourceVal);
    const targetPH = extractPlaceholders(targetVal);
    const missing = sourcePH.filter((p) => !targetPH.includes(p));
    const extra = targetPH.filter((p) => !sourcePH.includes(p));

    if (missing.length > 0 || extra.length > 0) {
      placeholderErrors.push({ key, sourcePlaceholders: sourcePH, targetPlaceholders: targetPH, missing, extra });
    }
  }

  const passed =
    missingKeys.length === 0 &&
    placeholderErrors.length === 0 &&
    (opts.allowUntranslated || untranslated.length === 0);

  return {
    locale: target.locale,
    missingKeys,
    orphanKeys,
    untranslated,
    placeholderErrors,
    passed,
  };
}

export function checkAllLocales(
  source: LocaleRecord,
  targets: LocaleRecord[],
  opts: { allowUntranslated?: boolean } = {},
): KeyCheckResult[] {
  return targets.map((t) => checkMissingKeys(source, t, opts));
}

/** Summarise results for CI output. */
export function formatCheckResults(results: KeyCheckResult[]): { output: string; exitCode: 0 | 1 } {
  const lines: string[] = [];
  let hasErrors = false;

  for (const r of results) {
    if (r.passed) {
      lines.push(`✓ ${r.locale} — all checks passed`);
    } else {
      hasErrors = true;
      lines.push(`✗ ${r.locale}`);
      if (r.missingKeys.length) lines.push(`  Missing keys (${r.missingKeys.length}): ${r.missingKeys.slice(0, 5).join(", ")}${r.missingKeys.length > 5 ? "…" : ""}`);
      if (r.orphanKeys.length) lines.push(`  Orphan keys (${r.orphanKeys.length}): ${r.orphanKeys.slice(0, 5).join(", ")}${r.orphanKeys.length > 5 ? "…" : ""}`);
      if (r.untranslated.length) lines.push(`  Untranslated (${r.untranslated.length}): ${r.untranslated.slice(0, 5).join(", ")}${r.untranslated.length > 5 ? "…" : ""}`);
      if (r.placeholderErrors.length) {
        for (const pe of r.placeholderErrors.slice(0, 3)) {
          lines.push(`  Placeholder error in "${pe.key}": missing=${pe.missing.join(",")} extra=${pe.extra.join(",")}`);
        }
      }
    }
  }

  return { output: lines.join("\n"), exitCode: hasErrors ? 1 : 0 };
}
