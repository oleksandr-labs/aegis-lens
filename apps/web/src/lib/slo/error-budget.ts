// Error-budget policy for the Aegis Lens platform.
//
// An error budget is the amount of unreliability an SLO permits over its
// trailing window: budget = (1 - target) * window. This module turns the
// SLO targets in ./slo-definitions.ts into concrete budgets, burn-rate alert
// thresholds, a deploy-freeze policy, a per-incident deduction model, the
// monthly review process, and a per-team accountability mapping.

import {
  SERVICE_SLOS,
  type ServiceId,
  type ServiceSLO,
} from "./slo-definitions";

const MINUTES_PER_DAY = 24 * 60;

/**
 * Per-SLO error budget derived from the availability target and window.
 * Latency/freshness SLOs use a budget of "fraction of valid events allowed to
 * breach the threshold", which mirrors the availability formula (1 - target).
 */
export interface ServiceErrorBudget {
  service: ServiceId;
  /** Window the budget is measured over, in days. */
  windowDays: number;
  /** Unreliability allowance as a fraction, i.e. (1 - target). */
  budgetFraction: number;
  /**
   * Allowed bad-minutes per window for availability SLOs (budgetFraction *
   * window-minutes). For latency/freshness SLOs this is the equivalent
   * allowed-breach-minutes, treating threshold violations as "bad" time.
   */
  allowedBadMinutesPerWindow: number;
  /** Same allowance expressed per 30-day month for human reporting. */
  allowedBadMinutesPerMonth: number;
  /** What "spending" the budget means for this specific service. */
  spendDefinition: string;
}

/**
 * Resolve the (1 - target) fraction for any SLO kind. Availability SLOs use
 * their explicit target; latency/freshness/staged SLOs default to a 99.9%
 * compliance target (≤0.1% of valid events may breach the threshold) unless a
 * tighter availability target is also present on the service.
 */
function budgetFractionFor(slo: ServiceSLO): number {
  if (slo.availability) return 1 - slo.availability.target;
  // Threshold-compliance default: ≤0.1% of valid events may breach.
  return 0.001;
}

function computeBudget(slo: ServiceSLO): ServiceErrorBudget {
  const fraction = budgetFractionFor(slo);
  const windowMinutes = slo.windowDays * MINUTES_PER_DAY;
  const allowedPerWindow = fraction * windowMinutes;
  return {
    service: slo.service,
    windowDays: slo.windowDays,
    budgetFraction: fraction,
    allowedBadMinutesPerWindow: Math.round(allowedPerWindow * 100) / 100,
    allowedBadMinutesPerMonth:
      Math.round(fraction * 30 * MINUTES_PER_DAY * 100) / 100,
    spendDefinition: slo.availability
      ? "Each minute the success-ratio SLI is below target consumes budget proportional to the failing-request fraction."
      : "Each valid event whose latency/freshness exceeds the threshold consumes one unit of budget; budget is the allowed-breach fraction of total valid events.",
  };
}

export const SERVICE_ERROR_BUDGETS: Record<ServiceId, ServiceErrorBudget> = {
  "api-gateway": computeBudget(SERVICE_SLOS["api-gateway"]),
  "map-workspace": computeBudget(SERVICE_SLOS["map-workspace"]),
  ingest: computeBudget(SERVICE_SLOS.ingest),
  verify: computeBudget(SERVICE_SLOS.verify),
  alert: computeBudget(SERVICE_SLOS.alert),
  "ai-copilot": computeBudget(SERVICE_SLOS["ai-copilot"]),
  "tile-serving": computeBudget(SERVICE_SLOS["tile-serving"]),
  search: computeBudget(SERVICE_SLOS.search),
};

/**
 * Multiwindow, multi-burn-rate alerting (Google SRE workbook style). A
 * "burn rate" of N means budget is being consumed N× faster than the window
 * would tolerate at steady state. Fast burn pages; slow burn tickets.
 */
export interface BurnRateAlert {
  severity: "fast" | "slow";
  /** Budget-consumption multiple that triggers the alert. */
  burnRate: number;
  /** Long lookback window for the alert condition. */
  longWindow: string;
  /** Short window that must also be burning, to avoid alerting on a healed dip. */
  shortWindow: string;
  /**
   * Fraction of the 28-day budget consumed within the long window at this burn
   * rate — the human-friendly trigger ("alert when X% of budget burns in Y").
   */
  budgetConsumedAtTrigger: string;
  routing: "page-on-call" | "ticket-owning-team";
  description_en: string;
  description_uk: string;
}

export const BURN_RATE_ALERTS: BurnRateAlert[] = [
  {
    severity: "fast",
    burnRate: 14.4,
    longWindow: "1h",
    shortWindow: "5m",
    budgetConsumedAtTrigger: "2% of the 28-day budget in 1h",
    routing: "page-on-call",
    description_en:
      "Fast burn: at this rate the entire window budget is exhausted in ≈2 days. Pages the on-call immediately. The 5m short window must also be burning, so a single recovered spike does not page.",
    description_uk:
      "Швидке вигоряння: за такої швидкості весь бюджет вікна вичерпується за ≈2 дні. Негайно викликає чергового. Коротке вікно 5хв також має вигоряти, тож одиничний відновлений сплеск не викликає сповіщення.",
  },
  {
    severity: "slow",
    burnRate: 6,
    longWindow: "6h",
    shortWindow: "30m",
    budgetConsumedAtTrigger: "5% of the 28-day budget in 6h",
    routing: "ticket-owning-team",
    description_en:
      "Slow burn: a sustained but lower-rate consumption that would exhaust the budget within the window if left unchecked. Opens a ticket for the owning team during business hours rather than paging.",
    description_uk:
      "Повільне вигоряння: стійке, але повільніше споживання, яке вичерпало б бюджет у межах вікна, якщо його не зупинити. Відкриває тікет для відповідальної команди в робочі години, а не викликає чергового.",
  },
];

/**
 * Deploy-freeze policy keyed to remaining budget. Risky deploys are frozen for
 * any service whose remaining 28-day budget drops below 25%.
 */
export interface DeployFreezePolicy {
  /** Remaining-budget fraction below which risky deploys are frozen. */
  freezeBelowRemaining: number;
  freezeBelowRemainingLabel: string;
  /** What counts as "risky" and is therefore frozen. */
  frozenChangeTypes: string[];
  /** Changes always permitted even under freeze. */
  alwaysAllowed: string[];
  /** Who can override a freeze and how. */
  overrideAuthority: string;
  description_en: string;
  description_uk: string;
}

export const DEPLOY_FREEZE_POLICY: DeployFreezePolicy = {
  freezeBelowRemaining: 0.25,
  freezeBelowRemainingLabel: "< 25% budget remaining",
  frozenChangeTypes: [
    "feature releases to the affected service",
    "schema or data-pipeline migrations on the affected path",
    "infrastructure / dependency upgrades touching the affected service",
  ],
  alwaysAllowed: [
    "reliability fixes that demonstrably reduce burn",
    "rollbacks",
    "security patches with documented risk acceptance",
  ],
  overrideAuthority:
    "The service's owning-team lead plus the on-call SRE may jointly override a freeze with a written risk justification recorded in the incident channel.",
  description_en:
    "When a service has spent more than 75% of its trailing-28-day error budget (i.e. < 25% remaining), all non-reliability changes to that service are frozen until budget recovers or the next window rolls. Reliability work, rollbacks, and security patches are exempt. This keeps the budget as a brake on shipping risk, not a punishment.",
  description_uk:
    "Коли сервіс витратив понад 75% свого бюджету помилок за останні 28 днів (тобто залишилось < 25%), усі зміни, не пов'язані з надійністю, заморожуються до відновлення бюджету або зміни вікна. Робота над надійністю, відкати та патчі безпеки звільнені. Це залишає бюджет гальмом для ризику постачання, а не покаранням.",
};

/**
 * Per-incident budget deduction model. Each incident debits the affected
 * service's budget by its measured bad-minutes, scaled by user-impact.
 */
export interface IncidentDeductionModel {
  /** How an incident's budget cost is computed. */
  formula: string;
  /** Severity → impact multiplier applied to measured bad-minutes. */
  impactMultipliers: Record<"sev1" | "sev2" | "sev3", number>;
  /** Whether deductions can be credited back. */
  creditBackPolicy: string;
  description_en: string;
  description_uk: string;
}

export const INCIDENT_DEDUCTION_MODEL: IncidentDeductionModel = {
  formula:
    "deducted_bad_minutes = measured_breach_minutes * affected_traffic_fraction * severity_multiplier",
  impactMultipliers: { sev1: 1.0, sev2: 0.6, sev3: 0.25 },
  creditBackPolicy:
    "Budget is never credited back for confirmed incidents. Deductions for events later attributed to an excluded cause (e.g. third-party CDN outage already carved out of the SLI) are reversed in the monthly review with an audit note.",
  description_en:
    "Every incident attributes a concrete budget cost to the affected service: the breach-minutes measured during the incident, scaled by the fraction of traffic actually impacted and by a severity multiplier. The running total drives the deploy-freeze policy and the monthly review.",
  description_uk:
    "Кожен інцидент відносить конкретну вартість бюджету до ураженого сервісу: хвилини порушення, виміряні під час інциденту, масштабовані часткою фактично ураженого трафіку та множником серйозності. Поточна сума керує політикою заморожування деплоїв та щомісячним оглядом.",
};

/** Monthly error-budget review descriptor. */
export interface MonthlyBudgetReview {
  cadence: "monthly";
  inputs: string[];
  outputs: string[];
  attendees: string[];
  description_en: string;
  description_uk: string;
}

export const MONTHLY_BUDGET_REVIEW: MonthlyBudgetReview = {
  cadence: "monthly",
  inputs: [
    "per-service budget remaining and burn trend",
    "incident deductions logged this month (INCIDENT_DEDUCTION_MODEL)",
    "burn-rate alerts fired and their dispositions",
    "any deploy freezes triggered and their durations",
  ],
  outputs: [
    "list of services on freeze or trending toward freeze",
    "reliability work prioritized for next month per over-budget service",
    "exclusion/credit-back reversals with audit notes",
    "escalations to the quarterly SLO review where targets look mis-set",
  ],
  attendees: [
    "SRE / reliability lead",
    "owning-team leads for any service below 50% remaining",
    "engineering management",
  ],
  description_en:
    "Monthly forum that reconciles each service's budget ledger: confirms deductions, reviews burn-rate alerts, decides freezes, and routes reliability work. Targets that consistently can't be met are escalated to the quarterly SLO review.",
  description_uk:
    "Щомісячний форум, що звіряє реєстр бюджету кожного сервісу: підтверджує відрахування, переглядає сповіщення про вигоряння, вирішує заморожування та спрямовує роботу над надійністю. Цілі, які стабільно недосяжні, ескалуються на щоквартальний огляд SLO.",
};

/**
 * Per-team accountability: which team owns each service's budget. Keys must
 * match the `owningTeam` fields in SERVICE_SLOS so ownership stays consistent.
 */
export interface TeamAccountability {
  team: string;
  services: ServiceId[];
  responsibilities: string;
}

export const TEAM_ACCOUNTABILITY: TeamAccountability[] = [
  {
    team: "platform-edge",
    services: ["api-gateway", "tile-serving"],
    responsibilities:
      "Owns edge availability and latency budgets; responds to fast-burn pages for gateway and tile serving and approves freeze overrides for those services.",
  },
  {
    team: "frontend-map",
    services: ["map-workspace"],
    responsibilities:
      "Owns workspace load reliability and time-to-interactive; accountable for budget spent on client-side errors and slow workspace loads.",
  },
  {
    team: "data-ingest",
    services: ["ingest"],
    responsibilities:
      "Owns source→normalized freshness budget; accountable for ingestion lag breaches and upstream connector reliability.",
  },
  {
    team: "verification",
    services: ["verify"],
    responsibilities:
      "Owns normalized→verified latency budget across automated and human-in-the-loop checks.",
  },
  {
    team: "alerting",
    services: ["alert"],
    responsibilities:
      "Owns match→notification delivery budget; accountable for in-app notification latency breaches.",
  },
  {
    team: "ai-copilot",
    services: ["ai-copilot"],
    responsibilities:
      "Owns copilot TTFT and full-response budgets; coordinates LLM token-budget tradeoffs with capacity planning.",
  },
  {
    team: "search",
    services: ["search"],
    responsibilities:
      "Owns search query-latency budget; accountable for p95 regressions on the first-results path.",
  },
];
