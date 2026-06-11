/**
 * Compatibility shim. The schema is now split across per-table files under
 * `./schema/`. This file re-exports the barrel so existing imports of
 * `@aegis/db/schema` and `./schema` continue to resolve.
 *
 * New code should import from `./schema` (which resolves to `./schema/index.ts`)
 * or directly from a specific table module, e.g. `./schema/events`.
 */
export * from "./schema/index";
