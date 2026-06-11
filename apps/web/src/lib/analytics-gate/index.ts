/**
 * analytics-gate/index.ts
 * Public surface of the analytics gating module.
 *
 * Import from here in application code:
 *   import { checkAnalyticAccess, ANALYTIC_GATES } from "@/lib/analytics-gate";
 */

// Types
export type {
  AnalyticGate,
  AnalyticId,
  ExportFormat,
  FreshnessLevel,
  GateResult,
  LookbackWindow,
  ResolutionLevel,
  TeaserPolicy,
  Tier,
  TierMap,
} from "./types";
export { TIER_RANK } from "./types";

// Gate configuration
export { ANALYTIC_GATES } from "./gate-config";

// Gate evaluation (server-only)
export {
  checkAnalyticAccess,
  getEffectiveFreshness,
  getEffectiveLookback,
  getEffectiveResolution,
  getExportFormats,
  hasApiAccess,
} from "./check-gate";

// Teaser policy
export type { TeaserData } from "./teaser-policy";
export {
  TEASER_RULES,
  buildTeaserData,
  formatTeaserNumber,
  shouldShowLockIcon,
} from "./teaser-policy";

// Upgrade triggers
export type {
  UpgradePrompt,
  UpgradeTriggerDefinition,
  UpgradeTriggerEvent,
  UpgradeTriggerType,
} from "./upgrade-triggers";
export { UPGRADE_TRIGGERS, checkUpgradeTrigger } from "./upgrade-triggers";
