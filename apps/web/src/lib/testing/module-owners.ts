/**
 * Module ownership and required test coverage for Aegis Lens critical modules.
 * Used by CI to enforce coverage floors per module.
 */

export interface ModuleOwner {
  module: string;
  path: string;
  owner: string;
  requiredTestCoverage: number;
  testFiles: string[];
}

export const MODULE_OWNERS: ModuleOwner[] = [
  {
    module: "auth",
    path: "apps/web/src/lib/auth",
    owner: "Platform team",
    requiredTestCoverage: 80,
    testFiles: [
      "apps/web/src/lib/auth/__tests__/session.test.ts",
      "apps/web/src/lib/auth/__tests__/pkce.test.ts",
      "apps/web/src/lib/auth/__tests__/token-rotation.test.ts",
    ],
  },
  {
    module: "billing",
    path: "apps/web/src/lib/billing",
    owner: "Billing team",
    requiredTestCoverage: 90,
    testFiles: [
      "apps/web/src/lib/billing/__tests__/stripe-webhook.test.ts",
      "apps/web/src/lib/billing/__tests__/subscription-lifecycle.test.ts",
      "apps/web/src/lib/billing/__tests__/invoice.test.ts",
    ],
  },
  {
    module: "tier-enforcement",
    path: "apps/web/src/lib/tiers",
    owner: "Billing team",
    requiredTestCoverage: 95,
    testFiles: [
      "apps/web/src/lib/tiers/__tests__/gate.test.ts",
      "apps/web/src/lib/tiers/__tests__/entitlements.test.ts",
      "apps/web/src/lib/tiers/__tests__/addon-check.test.ts",
    ],
  },
  {
    module: "risk-score-api",
    path: "apps/api/src/risk",
    owner: "Data science team",
    requiredTestCoverage: 85,
    testFiles: [
      "apps/api/src/risk/__tests__/score-calculation.test.ts",
      "apps/api/src/risk/__tests__/location-lookup.test.ts",
    ],
  },
  {
    module: "event-schema",
    path: "packages/event-schema/src",
    owner: "Platform team",
    requiredTestCoverage: 90,
    testFiles: [
      "packages/event-schema/src/__tests__/validate.test.ts",
      "packages/event-schema/src/__tests__/transform.test.ts",
    ],
  },
  {
    module: "search",
    path: "apps/api/src/search",
    owner: "Backend team",
    requiredTestCoverage: 80,
    testFiles: [
      "apps/api/src/search/__tests__/query-builder.test.ts",
      "apps/api/src/search/__tests__/ranking.test.ts",
    ],
  },
  {
    module: "analytics-gate",
    path: "apps/web/src/lib/analytics",
    owner: "Frontend team",
    requiredTestCoverage: 90,
    testFiles: [
      "apps/web/src/lib/analytics/__tests__/consent-gate.test.ts",
      "apps/web/src/lib/analytics/__tests__/track.test.ts",
    ],
  },
  {
    module: "anti-spam",
    path: "apps/api/src/anti-spam",
    owner: "Security team",
    requiredTestCoverage: 85,
    testFiles: [
      "apps/api/src/anti-spam/__tests__/rate-limit.test.ts",
      "apps/api/src/anti-spam/__tests__/fingerprint.test.ts",
    ],
  },
  {
    module: "filters",
    path: "apps/web/src/lib/filters",
    owner: "Frontend team",
    requiredTestCoverage: 80,
    testFiles: [
      "apps/web/src/lib/filters/__tests__/filter-state.test.ts",
      "apps/web/src/lib/filters/__tests__/url-serialisation.test.ts",
    ],
  },
  {
    module: "recommendations",
    path: "apps/api/src/recommendations",
    owner: "Data science team",
    requiredTestCoverage: 75,
    testFiles: [
      "apps/api/src/recommendations/__tests__/collaborative-filter.test.ts",
    ],
  },
  {
    module: "audit-log",
    path: "apps/api/src/audit",
    owner: "Security team",
    requiredTestCoverage: 95,
    testFiles: [
      "apps/api/src/audit/__tests__/write.test.ts",
      "apps/api/src/audit/__tests__/immutability.test.ts",
      "apps/api/src/audit/__tests__/retention.test.ts",
    ],
  },
  {
    module: "pricing",
    path: "apps/web/src/lib/pricing",
    owner: "Billing team",
    requiredTestCoverage: 90,
    testFiles: [
      "apps/web/src/lib/pricing/__tests__/tier-config.test.ts",
      "apps/web/src/lib/pricing/__tests__/proration.test.ts",
    ],
  },
];
