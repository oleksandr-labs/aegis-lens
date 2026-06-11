/**
 * Old slug → new slug auto-redirect on rename.
 *
 * When a programmatic entity is renamed, its slug changes and the old URL must
 * 301 to the new one (permalink stability). Rather than hand-authoring CSV rows
 * for thousands of entities, callers record a rename event and this module
 * emits the corresponding `RedirectRule`s — one per active locale — that can be
 * merged into the registry / appended to the CSV.
 *
 * See TODO/seo/TODO_redirects.md and ../urls_slugs/TODO_permalink_stability.md.
 */

import { ACTIVE_LOCALES, DEFAULT_LOCALE, type Locale } from "@aegis/i18n-config";
import type { RedirectRule } from "./registry";

/** A single rename of an entity slug within a URL template. */
export interface SlugRename {
  /**
   * Path template with a `{slug}` placeholder, e.g. `/entities/{slug}` or
   * `/topics/{slug}`. Must be the EN-shaped (prefix-less) form.
   */
  template: string;
  oldSlug: string;
  newSlug: string;
  /** ISO-8601 date of the rename. */
  renamedAt: string;
  /** Locales to emit redirects for (defaults to ACTIVE_LOCALES). */
  locales?: Locale[];
}

function applyLocale(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

function fill(template: string, slug: string): string {
  return template.replace("{slug}", slug);
}

/**
 * Emit the redirect rules for one rename. Produces a 301 per locale, preserving
 * locale prefixes, with a generated reason citing the old/new slug.
 */
export function rulesForRename(rename: SlugRename): RedirectRule[] {
  const locales = rename.locales ?? ACTIVE_LOCALES;
  if (rename.oldSlug === rename.newSlug) return [];
  return locales.map((locale) => {
    const from = applyLocale(locale, fill(rename.template, rename.oldSlug));
    const to = applyLocale(locale, fill(rename.template, rename.newSlug));
    return {
      from,
      to,
      status: 301 as const,
      createdAt: rename.renamedAt,
      reason: `Auto: slug rename ${rename.oldSlug} -> ${rename.newSlug} on ${rename.template}`,
    };
  });
}

/**
 * Collapse a sequence of renames for the SAME slug into single-hop rules,
 * pointing every historical slug directly at the FINAL slug. This guarantees
 * the chain detector stays green (no A->B->C produced by serial renames).
 *
 * @param renames renames for one template, in chronological order.
 */
export function collapseRenameHistory(renames: SlugRename[]): RedirectRule[] {
  if (renames.length === 0) return [];
  const template = renames[0].template;
  const locales = renames[0].locales ?? ACTIVE_LOCALES;
  const finalSlug = renames[renames.length - 1].newSlug;
  const latestDate = renames[renames.length - 1].renamedAt;

  // Every historical (old) slug except the final one redirects to finalSlug.
  const historical = new Set<string>();
  for (const r of renames) {
    historical.add(r.oldSlug);
  }
  historical.delete(finalSlug);

  const out: RedirectRule[] = [];
  for (const oldSlug of historical) {
    for (const locale of locales) {
      out.push({
        from: applyLocale(locale, fill(template, oldSlug)),
        to: applyLocale(locale, fill(template, finalSlug)),
        status: 301,
        createdAt: latestDate,
        reason: `Auto: slug history ${oldSlug} -> ${finalSlug} (collapsed) on ${template}`,
      });
    }
  }
  return out;
}
