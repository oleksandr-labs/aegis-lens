/**
 * Slug experiments — A/B test new slug variants on programmatic pages.
 *
 * To improve CTR (see ctr-analysis.ts) we trial an alternative slug for a page
 * while keeping the original canonical until a winner is chosen. The variant
 * URL 301s to the canonical (so no duplicate-content / link-equity split), and
 * we measure each variant's CTR via the analysis module. When a winner is
 * promoted, this module emits the redirect rule that flips canonical → old.
 *
 * See TODO/seo/TODO_url_seo.md. Deterministic assignment so the same entity
 * always lands in the same arm (stable, testable).
 */

import { ACTIVE_LOCALES, DEFAULT_LOCALE, type Locale } from "@aegis/i18n-config";
import type { RedirectRule } from "../redirects/registry";

export interface SlugExperiment {
  id: string;
  /** Template path with `{slug}` placeholder, EN-shaped. */
  template: string;
  /** The current canonical slug. */
  controlSlug: string;
  /** Candidate variant slug under test. */
  variantSlug: string;
  /** ISO date the experiment started. */
  startedAt: string;
}

export type Arm = "control" | "variant";

/** Stable hash (FNV-1a 32-bit) → used to bucket an entity into an arm. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministically assign an entity to an arm.
 *
 * @param split fraction routed to the variant (0..1). Default 0.5.
 */
export function assignArm(experiment: SlugExperiment, entityKey: string, split = 0.5): Arm {
  const bucket = (hash(`${experiment.id}:${entityKey}`) % 10_000) / 10_000;
  return bucket < split ? "variant" : "control";
}

function applyLocale(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

function fill(template: string, slug: string): string {
  return template.replace("{slug}", slug);
}

/**
 * Redirect rules that route the VARIANT slug to the CONTROL (canonical) while
 * the experiment runs — one per active locale. This keeps canonical stable and
 * avoids duplicate content during measurement.
 */
export function variantRedirectRules(
  experiment: SlugExperiment,
  locales: Locale[] = ACTIVE_LOCALES,
): RedirectRule[] {
  return locales.map((locale) => ({
    from: applyLocale(locale, fill(experiment.template, experiment.variantSlug)),
    to: applyLocale(locale, fill(experiment.template, experiment.controlSlug)),
    status: 301 as const,
    createdAt: experiment.startedAt,
    reason: `Slug experiment ${experiment.id}: variant -> control (canonical stable)`,
  }));
}

/**
 * When the VARIANT wins, promote it: the old control slug now 301s to the
 * variant (which becomes canonical). Emits one rule per locale.
 */
export function promoteVariantRules(
  experiment: SlugExperiment,
  promotedAt: string,
  locales: Locale[] = ACTIVE_LOCALES,
): RedirectRule[] {
  return locales.map((locale) => ({
    from: applyLocale(locale, fill(experiment.template, experiment.controlSlug)),
    to: applyLocale(locale, fill(experiment.template, experiment.variantSlug)),
    status: 301 as const,
    createdAt: promotedAt,
    reason: `Slug experiment ${experiment.id}: variant promoted to canonical`,
  }));
}
