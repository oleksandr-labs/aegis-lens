/**
 * Hierarchical breadcrumb resolver.
 *
 * Sprint 0 shipped a per-page breadcrumb *nav* (a back-button-style trail that
 * pages hand-rolled inline) plus an inline `BreadcrumbList` JSON-LD. This module
 * promotes that to a real **hierarchy**: given a route template + its params it
 * resolves the full ancestor chain (Home -> section -> ... -> current) as a
 * locale-aware, typed list. Pages (and the schema generator) consume the same
 * source of truth instead of re-deriving crumbs by hand.
 *
 * Pure + dependency-light: only the canonical `urls`/`localePath` builders and
 * the i18n locale list. No React, no network — unit-testable.
 *
 * Locale awareness: every crumb URL is produced through `urls.*`/`localePath`,
 * so the locale prefix (`/uk/...`; EN at root) is preserved end-to-end and no
 * crumb ever links across locales.
 */

import { urls, localePath } from "@aegis/url-builder";
import type { Locale } from "@aegis/i18n-config";

/** A bilingual label. EN is always present; `uk` is the Ukrainian variant. */
export interface CrumbLabel {
  en: string;
  uk: string;
}

/**
 * One resolved breadcrumb.
 * `href` is a root-relative, locale-prefixed path (or `undefined` for the
 * current page — see {@link render-rules}). `label` carries both locales so the
 * caller picks the active one; rendering never re-localizes.
 */
export interface Crumb {
  label: CrumbLabel;
  /** Root-relative locale-aware path, or undefined for the current (last) crumb. */
  href?: string;
  /** Stable key for React lists / dedupe. */
  key: string;
}

/** Pick the active-locale string from a bilingual label (uk falls back to en). */
export function labelFor(label: CrumbLabel, locale: Locale): string {
  return locale === "uk" ? label.uk || label.en : label.en;
}

/**
 * The Home crumb. Always the root of every chain. Localized label, locale-aware
 * URL (EN at `/`, others at `/<lc>`).
 */
export function homeCrumb(locale: Locale): Crumb {
  return {
    key: "home",
    label: { en: "Home", uk: "Головна" },
    href: urls.home(locale),
  };
}

/**
 * A section index crumb built from a `urls` builder. Pass the builder fn and
 * its label; the URL is resolved for the active locale.
 *
 * @example sectionCrumb(locale, "industries", { en: "Industries", uk: "Галузі" }, urls.industries)
 */
export function sectionCrumb(
  locale: Locale,
  key: string,
  label: CrumbLabel,
  urlFor: (lc: Locale) => string,
): Crumb {
  return { key, label, href: urlFor(locale) };
}

/**
 * A leaf/current crumb (no href — it IS the current page). Use a dynamic label
 * (entity name, slug-derived title). See {@link render-rules} for why the last
 * crumb is unlinked.
 */
export function currentCrumb(key: string, label: CrumbLabel): Crumb {
  return { key, label };
}

/**
 * Generic ancestor resolver for an arbitrary locale-aware path.
 *
 * Splits a root-relative path into cumulative segments and produces a crumb per
 * segment using a `labelers` lookup (segment -> bilingual label). Unknown
 * segments fall back to a title-cased version of the slug. The final segment is
 * left hrefless (current page). Home is always prepended.
 *
 * This is the catch-all used by routes that don't have a bespoke template in
 * {@link patterns}. Bespoke templates produce nicer labels and skip noise
 * segments; this guarantees *something* sensible everywhere.
 */
export function resolveFromPath(
  locale: Locale,
  /** Root-relative path WITHOUT locale prefix, e.g. "/industries/osint-tools". */
  path: string,
  labelers: Record<string, CrumbLabel> = {},
): Crumb[] {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const segments = clean.length ? clean.split("/") : [];
  const crumbs: Crumb[] = [homeCrumb(locale)];

  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = labelers[seg] ?? slugLabel(seg);
    crumbs.push({
      key: acc,
      label,
      href: isLast ? undefined : localePath(locale, acc),
    });
  });

  return crumbs;
}

/** Title-case a URL slug into a (best-effort, EN==UK) bilingual label. */
export function slugLabel(slug: string): CrumbLabel {
  const text = slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return { en: text, uk: text };
}

/**
 * Assemble a full chain from explicit ancestor crumbs + a current crumb.
 * Home is prepended automatically. This is what the per-template patterns
 * (see {@link patterns}) call.
 */
export function chain(locale: Locale, ancestors: Crumb[], current: Crumb): Crumb[] {
  return [homeCrumb(locale), ...ancestors, current];
}
