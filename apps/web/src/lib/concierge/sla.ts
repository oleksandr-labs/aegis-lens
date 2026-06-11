/**
 * Managed AOI Concierge Service — SLA configs, analyst tracking, escalation.
 *
 * Canonical SLA configurations per tier, analyst hour tracking policy,
 * escalation matrix field list, and pause/resume policy.
 *
 * Конфігурації SLA для кожного тарифу, відстеження годин аналітика,
 * поля матриці ескалації та політика паузи/відновлення.
 */

import type { ConciergeSla } from "./types";

// ── SLA configurations ────────────────────────────────────────────────────────

/**
 * Canonical SLA config for each concierge tier, in tier order.
 * These mirror the sla objects embedded in CONCIERGE_TIERS but are exported
 * independently for use by SLA-enforcement and alerting subsystems.
 *
 * Канонічні SLA-конфігурації для кожного тарифу (light → standard → 247).
 */
export const CONCIERGE_SLA_CONFIGS: ConciergeSla[] = [
  {
    tier: "light",
    responseSla_hours: 72,
    escalationContacts: 1,
    humanCoverage: "weekly",
  },
  {
    tier: "standard",
    responseSla_hours: 12,
    escalationContacts: 2,
    humanCoverage: "daily",
  },
  {
    tier: "247",
    responseSla_hours: 1,
    escalationContacts: 3,
    humanCoverage: "24-7",
  },
];

// ── Analyst hour tracking ─────────────────────────────────────────────────────

/**
 * Policy governing analyst hour tracking and cost ceiling enforcement.
 *
 * - tracked:                 all analyst hours are logged per customer/AOI.
 * - costCeilingEnforced:     hours are capped at the contracted ceiling per month.
 * - overtimeRequiresApproval: any work beyond the ceiling requires explicit sign-off.
 *
 * Політика відстеження годин аналітика та контролю витрат.
 */
export const ANALYST_HOUR_TRACKING = {
  /** All analyst hours are logged and attributed per customer AOI */
  tracked: true,
  /** Monthly analyst hour spend is hard-capped at the contracted ceiling */
  costCeilingEnforced: true,
  /** Work beyond the cost ceiling requires manager approval before proceeding */
  overtimeRequiresApproval: true,
} as const;

// ── Escalation matrix fields ──────────────────────────────────────────────────

/**
 * Field names used in a customer's escalation matrix record.
 * The matrix is collected during onboarding and stored per-contract.
 *
 * Поля матриці ескалації, зібрані під час onboarding-у клієнта.
 */
export const ESCALATION_MATRIX_FIELDS: string[] = [
  "primaryContact",
  "secondaryContact",
  "emergencyHotline",
  "escalationThreshold_en",
  "escalationThreshold_uk",
];

// ── Pause / resume policy ─────────────────────────────────────────────────────

/**
 * Policy for pausing and resuming a managed AOI subscription — English.
 * Configuration, alert rules, and history are preserved during the pause.
 */
export const PAUSE_RESUME_POLICY_EN =
  "Managed AOI can be paused and resumed without losing configuration.";

/**
 * Policy for pausing and resuming a managed AOI subscription — Ukrainian.
 * Конфігурація, правила сповіщень та історія зберігаються під час паузи.
 */
export const PAUSE_RESUME_POLICY_UK =
  "Кероване AOI можна призупинити та відновити без втрати конфігурації.";
