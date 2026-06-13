/**
 * Per-locale rollout policy for production.
 *
 * Prevents half-translated locales from reaching production.
 *
 * Rules:
 *  1. A locale is "production-ready" when its translation completeness ≥ `minCompleteness`
 *     AND all CI quality gates pass (no missing keys, no placeholder errors, no overflow errors).
 *  2. An explicit `blocked` flag can hold a locale even when all metrics pass.
 *  3. The fallback chain defines what locale(s) to use when a key is missing.
 *
 * Usage in CI:
 *   const report = evaluateLocaleRollout(sourceTranslations, targetLocales, results);
 *   if (report.some(r => r.blockedFromProduction)) process.exit(1);
 */

import type { KeyCheckResult } from "./missing-key-check";
import type { LengthOverflow } from "./length-check";
import type { PluralizationCheckResult } from "./pluralization";

// ── Fallback chain ────────────────────────────────────────────────────────────

/**
 * Explicit fallback chain for each locale.
 *
 * When a translation key is missing in `locale`, the system falls through to
 * each entry in the chain in order, stopping at the first that has the key.
 * All chains eventually fall back to "en".
 *
 * Convention: always end with "en".
 */
export const LOCALE_FALLBACK_CHAIN: Record<string, string[]> = {
  uk: ["en"],
  pl: ["en"],
  cy: ["en"],
  ro: ["en"],
  pt: ["pt", "en"],       // pt-PT → pt → en (if we split variants later)
  pa: ["en"],
  gu: ["en"],
  bn: ["en"],
  ur: ["en"],
  ar: ["en"],
  en: [],                  // English has no fallback — it IS the source
};

/**
 * Resolve the first locale in the fallback chain that has a value for `key`.
 *
 * @param key          The translation key to look up.
 * @param preferredLocale  The locale the user requested.
 * @param allTranslations  Map of locale → translations record.
 * @returns { locale, value } — the locale that provided the value.
 */
export function resolveWithFallback(
  key: string,
  preferredLocale: string,
  allTranslations: Map<string, Record<string, string>>,
): { locale: string; value: string } | null {
  const chain = [preferredLocale, ...(LOCALE_FALLBACK_CHAIN[preferredLocale] ?? ["en"])];

  for (const locale of chain) {
    const translations = allTranslations.get(locale);
    if (translations && translations[key] !== undefined) {
      return { locale, value: translations[key] };
    }
  }

  return null; // key not found anywhere in the chain
}

// ── Per-locale rollout policy ─────────────────────────────────────────────────

export interface LocaleRolloutPolicy {
  locale: string;
  /**
   * Minimum translation completeness (0–1) required for production.
   * Default: 0.95 (95% of keys translated).
   */
  minCompleteness: number;
  /**
   * Hard block: locale is never released to production even if all metrics pass.
   * Use during initial bootstrapping or when native review is outstanding.
   */
  blocked: boolean;
  /** Human-readable reason for the block. */
  blockedReason?: string;
  /**
   * Whether native-reviewer sign-off is required before production release.
   * For marketing / landing-page copy this should always be true.
   */
  requiresNativeReview: boolean;
  /** Set to true once a native reviewer has signed off. */
  nativeReviewApproved: boolean;
}

/** Conservative defaults. Override per locale as quality improves. */
export const DEFAULT_LOCALE_ROLLOUT_POLICIES: Record<string, LocaleRolloutPolicy> = {
  uk: {
    locale: "uk",
    minCompleteness: 0.95,
    blocked: false,
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  pl: {
    locale: "pl",
    minCompleteness: 0.95,
    blocked: false,
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  cy: {
    locale: "cy",
    minCompleteness: 0.90,
    blocked: false,
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  ro: {
    locale: "ro",
    minCompleteness: 0.95,
    blocked: false,
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  pt: {
    locale: "pt",
    minCompleteness: 0.95,
    blocked: false,
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  pa: {
    locale: "pa",
    minCompleteness: 0.90,
    blocked: true,
    blockedReason: "Native review pending for Punjabi",
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  gu: {
    locale: "gu",
    minCompleteness: 0.90,
    blocked: true,
    blockedReason: "Native review pending for Gujarati",
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  bn: {
    locale: "bn",
    minCompleteness: 0.90,
    blocked: true,
    blockedReason: "Native review pending for Bengali",
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  ur: {
    locale: "ur",
    minCompleteness: 0.90,
    blocked: true,
    blockedReason: "Native review pending for Urdu",
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
  ar: {
    locale: "ar",
    minCompleteness: 0.95,
    blocked: true,
    blockedReason: "RTL layout QA outstanding",
    requiresNativeReview: true,
    nativeReviewApproved: false,
  },
};

// ── Rollout evaluation ────────────────────────────────────────────────────────

export interface LocaleRolloutReport {
  locale: string;
  /** Fraction of source keys that are translated in this locale (0–1). */
  completeness: number;
  keyCheckPassed: boolean;
  pluralizationPassed: boolean;
  lengthOverflowErrors: number;
  /** Whether native review is required and not yet approved. */
  pendingNativeReview: boolean;
  /** Whether the explicit block flag is set. */
  hardBlocked: boolean;
  hardBlockedReason?: string;
  /** Aggregate gate: locale must NOT go to production. */
  blockedFromProduction: boolean;
  /** Human-readable list of reasons why the locale is blocked. */
  blockReasons: string[];
}

export interface LocaleRolloutEvaluationInput {
  locale: string;
  keyCheckResult: KeyCheckResult;
  lengthOverflows: LengthOverflow[];
  pluralizationResult: PluralizationCheckResult;
  totalSourceKeys: number;
}

/**
 * Evaluate whether a locale is ready for production release.
 *
 * @param inputs      QA results for each locale.
 * @param policies    Per-locale rollout policies (defaults used if not found).
 */
export function evaluateLocaleRollout(
  inputs: LocaleRolloutEvaluationInput[],
  policies: Record<string, LocaleRolloutPolicy> = DEFAULT_LOCALE_ROLLOUT_POLICIES,
): LocaleRolloutReport[] {
  return inputs.map((input) => {
    const policy = policies[input.locale] ?? {
      locale: input.locale,
      minCompleteness: 0.95,
      blocked: false,
      requiresNativeReview: false,
      nativeReviewApproved: true,
    };

    const translatedKeys =
      input.totalSourceKeys -
      input.keyCheckResult.missingKeys.length -
      input.keyCheckResult.untranslated.length;
    const completeness =
      input.totalSourceKeys > 0 ? translatedKeys / input.totalSourceKeys : 0;

    const keyCheckPassed = input.keyCheckResult.passed;
    const pluralizationPassed = input.pluralizationResult.passed;
    const lengthOverflowErrors = input.lengthOverflows.filter(
      (o) => o.severity === "error",
    ).length;
    const pendingNativeReview =
      policy.requiresNativeReview && !policy.nativeReviewApproved;
    const hardBlocked = policy.blocked;

    const blockReasons: string[] = [];

    if (completeness < policy.minCompleteness) {
      blockReasons.push(
        `Completeness ${(completeness * 100).toFixed(1)}% < required ${(policy.minCompleteness * 100).toFixed(0)}%`,
      );
    }
    if (!keyCheckPassed) {
      blockReasons.push(
        `Key check failed: ${input.keyCheckResult.missingKeys.length} missing keys, ${input.keyCheckResult.placeholderErrors.length} placeholder errors`,
      );
    }
    if (!pluralizationPassed) {
      blockReasons.push(
        `Pluralization check failed: ${input.pluralizationResult.errors.length} plural key groups with missing CLDR forms`,
      );
    }
    if (lengthOverflowErrors > 0) {
      blockReasons.push(
        `${lengthOverflowErrors} length overflow error(s) — strings too long for UI layout`,
      );
    }
    if (pendingNativeReview) {
      blockReasons.push("Native reviewer sign-off required before production release");
    }
    if (hardBlocked) {
      blockReasons.push(policy.blockedReason ?? "Manually blocked from production");
    }

    const blockedFromProduction = blockReasons.length > 0;

    return {
      locale: input.locale,
      completeness,
      keyCheckPassed,
      pluralizationPassed,
      lengthOverflowErrors,
      pendingNativeReview,
      hardBlocked,
      hardBlockedReason: policy.blockedReason,
      blockedFromProduction,
      blockReasons,
    };
  });
}

/**
 * Format rollout evaluation results for CI output.
 */
export function formatRolloutReport(reports: LocaleRolloutReport[]): {
  output: string;
  exitCode: 0 | 1;
} {
  const lines: string[] = [];
  let hasBlocked = false;

  for (const r of reports) {
    const pct = (r.completeness * 100).toFixed(1);
    if (!r.blockedFromProduction) {
      lines.push(`✓ ${r.locale} — ready for production (completeness: ${pct}%)`);
    } else {
      hasBlocked = true;
      lines.push(`✗ ${r.locale} — BLOCKED from production (completeness: ${pct}%)`);
      for (const reason of r.blockReasons) {
        lines.push(`  • ${reason}`);
      }
    }
  }

  return { output: lines.join("\n"), exitCode: hasBlocked ? 1 : 0 };
}
