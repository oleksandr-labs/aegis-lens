/**
 * Bundle budget definitions and checker.
 *
 * Used by `.github/scripts/check-bundle-budget.js` as a CI post-build gate.
 * Budgets are measured in kilobytes (KB = 1024 bytes).
 *
 * To add a new budget: append to BUNDLE_BUDGETS and update the CI script.
 */

export interface BundleTarget {
  /** Human-readable name matching the asset category in build output. */
  name: string;
  /** Hard limit — CI fails if exceeded. */
  maxKb: number;
  /** Soft limit — CI warns but does not fail. */
  warningKb: number;
}

export const BUNDLE_BUDGETS: BundleTarget[] = [
  { name: "initial-js", maxKb: 250, warningKb: 200 },
  { name: "map-chunk", maxKb: 400, warningKb: 350 },
  { name: "total-css", maxKb: 50, warningKb: 40 },
  { name: "largest-image", maxKb: 200, warningKb: 150 },
];

/**
 * Check whether a measured asset size is within budget.
 *
 * @param name      - Asset name matching BundleTarget.name
 * @param actualKb  - Measured size in kilobytes
 * @returns `'ok'` | `'warning'` | `'exceeded'`
 */
export function checkBundleBudget(
  name: string,
  actualKb: number
): "ok" | "warning" | "exceeded" {
  const target = BUNDLE_BUDGETS.find((b) => b.name === name);
  if (!target) {
    // Unknown asset — no budget defined, treat as ok
    return "ok";
  }
  if (actualKb > target.maxKb) return "exceeded";
  if (actualKb > target.warningKb) return "warning";
  return "ok";
}
