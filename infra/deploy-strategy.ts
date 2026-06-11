/**
 * Deploy Strategy — canary and blue-green deployment configuration.
 *
 * Each service defines its preferred deploy strategy and traffic weights.
 * Canary deployments start at 5% traffic and step up by 25% per cycle.
 *
 * Конфігурація стратегій деплою: canary та blue-green для кожного сервісу.
 */

// ── DeployStrategy ────────────────────────────────────────────────────────────

/**
 * Available deployment strategy modes.
 *
 * Доступні режими стратегії деплою.
 */
export enum DeployStrategy {
  Canary = "canary",
  BlueGreen = "blue-green",
  Rolling = "rolling",
}

// ── Canary constants ──────────────────────────────────────────────────────────

/**
 * Initial traffic percentage routed to the canary (new version).
 * 5% = low blast radius for initial validation.
 *
 * Початковий відсоток трафіку на canary-версію. 5% — мінімальний ризик.
 */
export const CANARY_INITIAL_WEIGHT = 0.05;

/**
 * Traffic weight step per promotion cycle.
 * Sequence: 5% → 30% → 55% → 80% → 100%.
 *
 * Крок збільшення трафіку на canary за кожен цикл просування.
 */
export const CANARY_STEP_WEIGHT = 0.25;

// ── DeployConfig ──────────────────────────────────────────────────────────────

export interface DeployConfig {
  service: string;
  strategy: DeployStrategy;
  /** Initial traffic weight (0-1). Only used for canary. */
  initialWeight: number;
  /** Step weight per promotion. Only used for canary. */
  stepWeight: number;
  /** Minimum observation time in minutes before each promotion step */
  observationMinutes: number;
  /** Automated rollback if error rate exceeds this threshold (0-1) */
  autoRollbackErrorThreshold: number;
  /** Whether deployment requires manual approval for final promotion */
  requiresManualApproval: boolean;
}

// ── DEPLOY_CONFIGS ────────────────────────────────────────────────────────────

/**
 * Per-service deployment strategy configuration.
 *
 * Конфігурація стратегії деплою для кожного сервісу.
 */
export const DEPLOY_CONFIGS: Record<string, DeployConfig> = {
  web: {
    service: "web",
    strategy: DeployStrategy.Canary,
    initialWeight: CANARY_INITIAL_WEIGHT,
    stepWeight: CANARY_STEP_WEIGHT,
    observationMinutes: 10,
    autoRollbackErrorThreshold: 0.01, // 1% error rate triggers rollback
    requiresManualApproval: false,
  },
  ingest: {
    service: "ingest",
    strategy: DeployStrategy.BlueGreen,
    initialWeight: 0,
    stepWeight: 1.0, // blue-green: instant cut-over
    observationMinutes: 5,
    autoRollbackErrorThreshold: 0.02,
    requiresManualApproval: false,
  },
  normalize: {
    service: "normalize",
    strategy: DeployStrategy.Rolling,
    initialWeight: 0,
    stepWeight: 0,
    observationMinutes: 3,
    autoRollbackErrorThreshold: 0.05,
    requiresManualApproval: false,
  },
  enrich: {
    service: "enrich",
    strategy: DeployStrategy.Canary,
    initialWeight: CANARY_INITIAL_WEIGHT,
    stepWeight: CANARY_STEP_WEIGHT,
    observationMinutes: 15,
    autoRollbackErrorThreshold: 0.01,
    requiresManualApproval: false,
  },
  verify: {
    service: "verify",
    strategy: DeployStrategy.BlueGreen,
    initialWeight: 0,
    stepWeight: 1.0,
    observationMinutes: 20,
    autoRollbackErrorThreshold: 0.005, // verify is safety-critical
    requiresManualApproval: true,
  },
  alerts: {
    service: "alerts",
    strategy: DeployStrategy.Canary,
    initialWeight: CANARY_INITIAL_WEIGHT,
    stepWeight: CANARY_STEP_WEIGHT,
    observationMinutes: 10,
    autoRollbackErrorThreshold: 0.01,
    requiresManualApproval: false,
  },
  aoi: {
    service: "aoi",
    strategy: DeployStrategy.Rolling,
    initialWeight: 0,
    stepWeight: 0,
    observationMinutes: 5,
    autoRollbackErrorThreshold: 0.03,
    requiresManualApproval: false,
  },
  "travel-risk": {
    service: "travel-risk",
    strategy: DeployStrategy.BlueGreen,
    initialWeight: 0,
    stepWeight: 1.0,
    observationMinutes: 10,
    autoRollbackErrorThreshold: 0.02,
    requiresManualApproval: false,
  },
};
