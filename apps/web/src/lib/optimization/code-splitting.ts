/**
 * Route-level code splitting + RSC configuration
 *
 * Use `dynamic(() => import(...), { ssr: false })` for map components.
 * Use `loading.tsx` files for route-level suspense boundaries.
 *
 * Heavy routes should never be part of the initial JS bundle.
 * Target: initial JS ≤ 250 KB (CODE_SPLIT_BUDGET_KB).
 */

/** Routes that should be dynamically imported to avoid bloating the initial bundle. */
export const HEAVY_ROUTE_PATTERNS: string[] = [
  "/map",
  "/map/viewer",
  "/map/heatmap",
  "/analytics",
  "/analytics/dashboard",
  "/analytics/charts",
  "/reports",
  "/reports/generate",
  "/reports/[id]",
  "/copilot",
  "/copilot/chat",
  "/investigations/[id]/map",
  "/admin/analytics",
];

/** Maximum initial JavaScript bundle size in kilobytes. */
export const CODE_SPLIT_BUDGET_KB = 250;

/** Per-route dynamic import configuration. */
export interface RouteImportConfig {
  /** Whether to render on the server side. Map components must be ssr:false (WebGL). */
  ssr: boolean;
  /** Path to the loading skeleton component (relative to app/ directory). */
  loading: string;
}

export const DYNAMIC_IMPORT_CONFIGS: Record<string, RouteImportConfig> = {
  "/map": {
    ssr: false,
    loading: "app/map/loading.tsx",
  },
  "/map/viewer": {
    ssr: false,
    loading: "app/map/viewer/loading.tsx",
  },
  "/map/heatmap": {
    ssr: false,
    loading: "app/map/heatmap/loading.tsx",
  },
  "/analytics": {
    ssr: true,
    loading: "app/analytics/loading.tsx",
  },
  "/analytics/dashboard": {
    ssr: true,
    loading: "app/analytics/dashboard/loading.tsx",
  },
  "/reports/generate": {
    ssr: false,
    loading: "app/reports/generate/loading.tsx",
  },
  "/copilot": {
    ssr: false,
    loading: "app/copilot/loading.tsx",
  },
  "/investigations/[id]/map": {
    ssr: false,
    loading: "app/investigations/[id]/map/loading.tsx",
  },
};

export interface CodeSplittingAssessment {
  recommendation: string;
  heavyRoutes: string[];
}

/**
 * Returns actionable code-splitting guidance for the build pipeline.
 * Identifies routes that exceed the budget and should be split.
 */
export function assessCodeSplitting(): CodeSplittingAssessment {
  const heavyRoutes = HEAVY_ROUTE_PATTERNS.filter(
    (route) => route in DYNAMIC_IMPORT_CONFIGS && !DYNAMIC_IMPORT_CONFIGS[route].ssr
  );

  return {
    recommendation: [
      `Keep initial JS under ${CODE_SPLIT_BUDGET_KB} KB.`,
      "Apply `next/dynamic` with `{ ssr: false }` to all map/WebGL components.",
      "Add `loading.tsx` to every dynamically-imported route segment for Suspense.",
      "Use React Server Components (RSC) for analytics and report shells; stream heavy data.",
      "Run `next build --profile` and inspect `/_next/static/chunks/` to verify splits.",
    ].join(" "),
    heavyRoutes,
  };
}
