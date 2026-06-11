/**
 * Schema.org library — barrel.
 *
 * Extends the Sprint-0 generator (`lib/seo.ts`: organizationJsonLd /
 * websiteJsonLd + per-page inline `@graph`) with:
 *
 *   generators     — typed pure generators for every template @type
 *   required-props — required/recommended-prop contract + structural validators
 *   audit          — quarterly schema audit (template enumeration + report)
 *
 * The CI test lives at `schema.test.ts` (vitest; runner wired later).
 */

export * from "./required-props";
export * from "./generators";
export * from "./audit";
