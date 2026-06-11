/**
 * Tiers module — barrel re-export.
 *
 * Import from here in route handlers and server actions:
 *   import { tierIsAtLeast, checkFreeTierLimit, checkAbuseGuards } from "@/lib/tiers";
 *
 * NOTE: free-tier-guard.ts and abuse-guards.ts are server-only.
 * Do not import this barrel from client components.
 */

export * from "./constants";
export * from "./free-tier-guard";
export * from "./abuse-guards";
