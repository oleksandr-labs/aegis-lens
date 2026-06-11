/**
 * Public API for the tracking module.
 *
 * Re-exports everything from the sub-modules so consumers can import from
 * a single path:
 *
 *   import { trackEvent, stripPii, PERSONA_FUNNELS } from "@/lib/tracking";
 *
 * Server-only modules (attribution, plausible) are also re-exported here;
 * Next.js tree-shaking will exclude them from client bundles as long as
 * they contain `import "server-only"`.
 */

export * from "./types";
export * from "./events";
export * from "./funnels";
export * from "./attribution";
export * from "./privacy";
export * from "./plausible";
