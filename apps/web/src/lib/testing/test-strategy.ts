/**
 * Test strategy configuration for Aegis Lens.
 * Defines test levels, suites, gates, and flake budgets.
 */

export type TestLevel =
  | "unit"
  | "component"
  | "contract"
  | "integration"
  | "e2e"
  | "visual-regression"
  | "a11y"
  | "mutation"
  | "performance";

export interface TestSuite {
  level: TestLevel;
  tool: string;
  scope_en: string;
  triggerOn: "pr" | "pre-merge" | "nightly" | "manual";
  failurePolicy: "block" | "warn" | "report";
  owner_en: string;
  coverageTarget?: number;
}

export const TEST_SUITES: TestSuite[] = [
  {
    level: "unit",
    tool: "Vitest",
    scope_en: "Pure functions, utilities, domain logic — no I/O",
    triggerOn: "pr",
    failurePolicy: "block",
    owner_en: "Platform team",
    coverageTarget: 80,
  },
  {
    level: "component",
    tool: "Vitest + Testing Library",
    scope_en: "UI components in isolation with mocked providers",
    triggerOn: "pr",
    failurePolicy: "block",
    owner_en: "Frontend team",
    coverageTarget: 75,
  },
  {
    level: "contract",
    tool: "Pact / OpenAPI schema diff",
    scope_en: "API surface contract between consumer and provider",
    triggerOn: "pre-merge",
    failurePolicy: "block",
    owner_en: "API team",
  },
  {
    level: "integration",
    tool: "Vitest + Docker Compose (real DB + Kafka)",
    scope_en: "Service interactions with real backing stores and message bus",
    triggerOn: "pre-merge",
    failurePolicy: "block",
    owner_en: "Backend team",
  },
  {
    level: "e2e",
    tool: "Playwright",
    scope_en: "Golden user journeys per persona against staging environment",
    triggerOn: "pre-merge",
    failurePolicy: "block",
    owner_en: "QA team",
  },
  {
    level: "visual-regression",
    tool: "Playwright snapshots / Chromatic",
    scope_en: "Screenshot diffs for critical UI surfaces",
    triggerOn: "pre-merge",
    failurePolicy: "warn",
    owner_en: "Frontend team",
  },
  {
    level: "a11y",
    tool: "axe-core (unit + e2e integration)",
    scope_en: "WCAG 2.1 AA compliance; serious violations block",
    triggerOn: "pr",
    failurePolicy: "block",
    owner_en: "Frontend team",
  },
  {
    level: "mutation",
    tool: "Stryker",
    scope_en: "Mutation testing on critical modules to validate test quality",
    triggerOn: "nightly",
    failurePolicy: "report",
    owner_en: "Platform team",
  },
  {
    level: "performance",
    tool: "Lighthouse CI",
    scope_en: "Core Web Vitals and performance budgets on key routes",
    triggerOn: "nightly",
    failurePolicy: "warn",
    owner_en: "Frontend team",
  },
];

/**
 * Flake budget — suites exceeding maxFlakeRatePct are auto-quarantined.
 * Quarantined tests must be fixed or deleted within the review cycle.
 */
export const FLAKE_BUDGET = {
  maxFlakeRatePct: 2,
  autoQuarantineAbove: 2,
  reviewCycle: "1 week",
} as const;

/**
 * Tests that run on every pull-request (must complete in ≤ 5 min).
 */
export const PER_PR_GATE: TestLevel[] = [
  "unit",
  "component",
  "a11y",
];

/**
 * Tests that run before a branch is merged to main.
 */
export const PRE_MERGE_GATE: TestLevel[] = [
  "contract",
  "integration",
  "e2e",
  "visual-regression",
];

/**
 * Tests that run on the nightly CI schedule.
 */
export const NIGHTLY_GATE: TestLevel[] = [
  "integration",
  "mutation",
  "performance",
];
