/**
 * Paywall module — barrel re-export.
 *
 * Import from here in route handlers and server actions:
 *   import { PaywallGateConfig, shouldShowUpgradeModal } from "@/lib/paywall";
 */

export * from "./gate-types";
export * from "./upgrade-flow";
