// Capacity planning for the Aegis Lens platform.
//
// Capacity planning ensures each service has enough provisioned headroom to
// meet its SLO (./slo-definitions.ts) under forecast growth, traffic spikes,
// and single-AZ failure — while tracking unit cost. Forecasts and headroom
// targets here feed the quarterly capacity review and the deploy/scaling plan.

import { type ServiceId } from "./slo-definitions";

/** Unit a service's traffic/capacity is naturally measured in. */
export type CapacityUnit =
  | "requests-per-second"
  | "events-per-second"
  | "verifications-per-minute"
  | "notifications-per-second"
  | "tokens-per-second"
  | "tiles-per-second";

/**
 * A 12-month rolling forecast for one service. Forecast is a monthly series
 * (12 entries, index 0 = current month) of expected peak load in the service's
 * CapacityUnit, with the assumptions behind the growth curve recorded.
 */
export interface TrafficForecast {
  unit: CapacityUnit;
  /** Current measured peak load in `unit`. */
  currentPeak: number;
  /** Assumed compounding monthly growth rate as a fraction, e.g. 0.06 = 6%. */
  monthlyGrowthRate: number;
  /** 12-month rolling projected peak (index 0 = now, 11 = +11 months). */
  projectedPeak12mo: number[];
  growthAssumptions: string;
}

export interface ServiceCapacityPlan {
  service: ServiceId;
  forecast: TrafficForecast;
  /** Provisioned-headroom target above forecast peak, as a fraction. */
  headroomTarget: 0.3;
  /** Cost to serve 1,000 requests/events for this service, in USD. */
  costPer1kRequestsUsd: number;
  /**
   * Whether a single-AZ failure still leaves enough capacity to meet the SLO
   * (i.e. the service is provisioned N+1 across AZs at the headroom target).
   */
  singleAzFailureSloCompliant: boolean;
  /** Notes on the AZ failure posture. */
  azFailureNote: string;
  description_en: string;
  description_uk: string;
}

/** Project a 12-month rolling peak from current peak and monthly growth. */
function project12mo(currentPeak: number, monthlyGrowthRate: number): number[] {
  const series: number[] = [];
  for (let m = 0; m < 12; m++) {
    const v = currentPeak * Math.pow(1 + monthlyGrowthRate, m);
    series.push(Math.round(v * 100) / 100);
  }
  return series;
}

export const SERVICE_CAPACITY_PLANS: Record<ServiceId, ServiceCapacityPlan> = {
  "api-gateway": {
    service: "api-gateway",
    forecast: {
      unit: "requests-per-second",
      currentPeak: 4_200,
      monthlyGrowthRate: 0.06,
      projectedPeak12mo: project12mo(4_200, 0.06),
      growthAssumptions:
        "6%/mo compounding from organic seat growth plus two enterprise onboardings/quarter.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.018,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Stateless; provisioned N+1 across 3 AZs at 30% headroom, so one AZ loss leaves ≥ forecast peak.",
    description_en:
      "Gateway is stateless and horizontally scaled. Plan holds 30% headroom over the 12-month rolling peak forecast and is provisioned to absorb a single-AZ failure while still meeting the 99.95% / p95<200ms SLO.",
    description_uk:
      "Шлюз без стану та горизонтально масштабований. План тримає 30% запасу над 12-місячним прогнозом піку та забезпечений для поглинання відмови однієї AZ із дотриманням SLO 99.95% / p95<200мс.",
  },
  "map-workspace": {
    service: "map-workspace",
    forecast: {
      unit: "requests-per-second",
      currentPeak: 1_100,
      monthlyGrowthRate: 0.05,
      projectedPeak12mo: project12mo(1_100, 0.05),
      growthAssumptions:
        "5%/mo from active-analyst growth; workspace loads correlate with seat count.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.012,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "SSR/edge tier stateless and multi-AZ; session state in replicated store. One AZ loss within headroom.",
    description_en:
      "Workspace shell serving is stateless behind the edge. 30% headroom over forecast; single-AZ failure stays within the 99.9% availability SLO.",
    description_uk:
      "Обслуговування оболонки робочого простору без стану за межами краю. 30% запасу над прогнозом; відмова однієї AZ залишається в межах SLO доступності 99.9%.",
  },
  ingest: {
    service: "ingest",
    forecast: {
      unit: "events-per-second",
      currentPeak: 9_500,
      monthlyGrowthRate: 0.08,
      projectedPeak12mo: project12mo(9_500, 0.08),
      growthAssumptions:
        "8%/mo from added source connectors; event volume grows faster than seats.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.004,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Consumers partitioned across AZs with N+1 worker capacity; one AZ loss keeps the <60s freshness SLO via repartition.",
    description_en:
      "Ingest is the highest-volume service. 30% headroom over the 8%/mo growth forecast protects the <60s source→normalized freshness SLO; partition layout tolerates a single-AZ loss without breaching lag.",
    description_uk:
      "Прийом — сервіс найбільшого обсягу. 30% запасу над прогнозом росту 8%/міс захищає SLO свіжості <60с джерело→нормалізація; розкладка партицій витримує втрату однієї AZ без порушення затримки.",
  },
  verify: {
    service: "verify",
    forecast: {
      unit: "verifications-per-minute",
      currentPeak: 2_300,
      monthlyGrowthRate: 0.07,
      projectedPeak12mo: project12mo(2_300, 0.07),
      growthAssumptions:
        "7%/mo tracking ingest growth, dampened by human-review throughput limits.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.09,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Automated checks multi-AZ; human-review queue is region-resilient. One AZ loss keeps the 5min P95 SLO for the automated stage.",
    description_en:
      "Verification blends automated checks with human-in-the-loop review. 30% compute headroom protects the automated stage's contribution to the <5min P95 SLO; human-review capacity is planned separately by staffing.",
    description_uk:
      "Верифікація поєднує автоматичні перевірки з людським оглядом. 30% запасу обчислень захищає внесок автоматичного етапу в SLO <5хв P95; потужність людського огляду планується окремо штатно.",
  },
  alert: {
    service: "alert",
    forecast: {
      unit: "notifications-per-second",
      currentPeak: 3_400,
      monthlyGrowthRate: 0.06,
      projectedPeak12mo: project12mo(3_400, 0.06),
      growthAssumptions:
        "6%/mo from saved-query growth; spikes correlate with breaking-news matches.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.006,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Match evaluators and fan-out workers multi-AZ N+1; one AZ loss keeps the <5s P95 delivery SLO.",
    description_en:
      "Alert delivery is bursty and most exposed to breaking-news spikes. 30% steady-state headroom plus burst autoscaling protect the <5s P95 match→notification SLO; single-AZ loss stays compliant.",
    description_uk:
      "Доставка сповіщень сплескова і найбільш вразлива до сплесків термінових новин. 30% запасу в стійкому стані плюс автомасштабування сплесків захищають SLO <5с P95 збіг→сповіщення; втрата однієї AZ залишається в нормі.",
  },
  "ai-copilot": {
    service: "ai-copilot",
    forecast: {
      unit: "tokens-per-second",
      currentPeak: 85_000,
      monthlyGrowthRate: 0.1,
      projectedPeak12mo: project12mo(85_000, 0.1),
      growthAssumptions:
        "10%/mo — fastest-growing service as copilot adoption rises; token volume, not RPS, is the binding constraint.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 1.4,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Inference served via multi-region model endpoints with reserved throughput; one AZ/endpoint loss falls back within reserved capacity to keep TTFT<1s.",
    description_en:
      "Copilot capacity is bound by LLM token throughput and reserved inference capacity, not raw RPS. 30% token headroom over a 10%/mo forecast; cost/1k reflects inference cost. See LLM_TOKEN_BUDGETS for the per-service token allocation.",
    description_uk:
      "Потужність копілота обмежена пропускною здатністю токенів LLM та зарезервованою потужністю інференсу, а не сирим RPS. 30% запасу токенів над прогнозом 10%/міс; вартість/1к відображає вартість інференсу. Див. LLM_TOKEN_BUDGETS для розподілу токенів по сервісах.",
  },
  "tile-serving": {
    service: "tile-serving",
    forecast: {
      unit: "tiles-per-second",
      currentPeak: 18_000,
      monthlyGrowthRate: 0.05,
      projectedPeak12mo: project12mo(18_000, 0.05),
      growthAssumptions:
        "5%/mo; predominantly CDN-cache-served so origin load grows slower than edge requests.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.002,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Edge-cached with multi-AZ origin; origin provisioned for cache-miss storm with one AZ down while holding p95<100ms.",
    description_en:
      "Tile serving is cheap per request and CDN-dominated. 30% origin headroom protects against cache-miss storms; single-AZ loss keeps the 99.95% / p95<100ms SLO.",
    description_uk:
      "Обслуговування тайлів дешеве на запит і домінується CDN. 30% запасу джерела захищає від штормів промахів кешу; втрата однієї AZ зберігає SLO 99.95% / p95<100мс.",
  },
  search: {
    service: "search",
    forecast: {
      unit: "requests-per-second",
      currentPeak: 2_600,
      monthlyGrowthRate: 0.06,
      projectedPeak12mo: project12mo(2_600, 0.06),
      growthAssumptions:
        "6%/mo; index size grows with ingest, raising per-query cost over time.",
    },
    headroomTarget: 0.3,
    costPer1kRequestsUsd: 0.022,
    singleAzFailureSloCompliant: true,
    azFailureNote:
      "Index replicated across AZs (replica factor ≥2); one AZ loss serves from replicas while holding p95<250ms.",
    description_en:
      "Search capacity scales with both query rate and growing index size. 30% headroom over forecast; replicated index keeps the p95<250ms SLO through a single-AZ failure.",
    description_uk:
      "Потужність пошуку масштабується як з частотою запитів, так і зі зростанням індексу. 30% запасу над прогнозом; реплікований індекс зберігає SLO p95<250мс при відмові однієї AZ.",
  },
};

/**
 * Breaking-news spike scenario: a 10x surge over baseline peak triggered by a
 * major event. Defines which services are most exposed and the response plan.
 */
export interface SpikeScenario {
  name: string;
  /** Multiplier over baseline peak the scenario must absorb. */
  spikeMultiplier: 10;
  /** Services that experience the largest relative surge. */
  mostExposedServices: ServiceId[];
  /** How the spike is absorbed beyond steady-state headroom. */
  absorptionStrategy: string;
  /** Services intentionally shed/degraded first to protect the rest. */
  loadSheddingOrder: string;
  description_en: string;
  description_uk: string;
}

export const BREAKING_NEWS_SPIKE_SCENARIO: SpikeScenario = {
  name: "Breaking-news 10x spike",
  spikeMultiplier: 10,
  mostExposedServices: ["ingest", "alert", "search", "api-gateway"],
  absorptionStrategy:
    "Steady-state 30% headroom covers ~1.3x; the remaining surge to 10x is absorbed by burst autoscaling (pre-warmed pools), aggressive CDN/tile caching, queue-based backpressure on ingest, and reserved LLM throughput for copilot. Pre-warmed pools target full scale-out within 90s of spike detection.",
  loadSheddingOrder:
    "1) throttle anonymous/free-tier API traffic, 2) defer non-urgent copilot completions, 3) widen alert batching windows — never shed verification or paid-tier ingest, which protect SLO-critical paths.",
  description_en:
    "A major breaking event can drive a 10x surge concentrated on ingest, alerting, search, and the gateway. The plan absorbs it via pre-warmed burst autoscaling, caching, and backpressure, with a defined load-shedding order that protects paid SLAs and verification integrity.",
  description_uk:
    "Велика термінова подія може спричинити сплеск у 10 разів, зосереджений на прийомі, сповіщеннях, пошуку та шлюзі. План поглинає його через попередньо прогріте автомасштабування сплесків, кешування та зворотний тиск, із визначеним порядком скидання навантаження, що захищає платні SLA та цілісність верифікації.",
};

/**
 * Per-service LLM token budgets. Caps monthly token spend and enforces the
 * copilot SLO under cost control; the binding constraint for ai-copilot.
 */
export interface LlmTokenBudget {
  service: ServiceId;
  /** Whether this service consumes LLM tokens at all. */
  usesLlm: boolean;
  /** Soft monthly token budget (input+output), null when N/A. */
  monthlyTokenBudget: number | null;
  /** Reserved tokens-per-second throughput to protect latency SLOs. */
  reservedTokensPerSecond: number | null;
  /** Action when the soft budget is exceeded. */
  overBudgetAction: string;
  note: string;
}

export const LLM_TOKEN_BUDGETS: Partial<Record<ServiceId, LlmTokenBudget>> = {
  "ai-copilot": {
    service: "ai-copilot",
    usesLlm: true,
    monthlyTokenBudget: 9_000_000_000,
    reservedTokensPerSecond: 110_000,
    overBudgetAction:
      "Soft cap: above budget, free-tier copilot is rate-limited and switched to a smaller model; paid tiers retain reserved throughput. Hard cap escalates to the quarterly capacity review.",
    note: "Reserved TPS sized above the 12-month forecast peak so TTFT<1s holds; reservation is the single largest LLM cost line.",
  },
  verify: {
    service: "verify",
    usesLlm: true,
    monthlyTokenBudget: 1_200_000_000,
    reservedTokensPerSecond: 12_000,
    overBudgetAction:
      "LLM-assisted classification falls back to non-LLM heuristics for low-severity items when over budget; human review unaffected.",
    note: "Tokens used for automated triage/classification, not generation; bounded by ingest volume.",
  },
  search: {
    service: "search",
    usesLlm: true,
    monthlyTokenBudget: 300_000_000,
    reservedTokensPerSecond: 4_000,
    overBudgetAction:
      "Semantic-rerank LLM pass is skipped when over budget, degrading to lexical ranking while keeping p95<250ms.",
    note: "Tokens used only for optional semantic reranking of top results.",
  },
};

/** Quarterly capacity review descriptor. */
export interface CapacityReview {
  cadence: "quarterly";
  inputs: string[];
  outputs: string[];
  description_en: string;
  description_uk: string;
}

export const QUARTERLY_CAPACITY_REVIEW: CapacityReview = {
  cadence: "quarterly",
  inputs: [
    "actual peak vs forecast per service (forecast accuracy)",
    "headroom consumed and any breaches of the 30% target",
    "LLM token-budget utilization vs caps",
    "cost-per-1k trend per service",
    "any spike or single-AZ events and how capacity held",
    "output of the quarterly SLO review (SLO_OPS_REFERENCES)",
  ],
  outputs: [
    "re-baselined 12-month rolling forecasts and growth assumptions",
    "scaling/reservation purchase decisions for the next quarter",
    "updated LLM token budgets and reserved-throughput levels",
    "cost-optimization actions for high cost-per-1k services",
  ],
  description_en:
    "Quarterly review that re-baselines forecasts against actuals, validates the 30% headroom and single-AZ posture, reconciles LLM token budgets and unit cost, and sets the next quarter's scaling and reservation plan. Coupled with the quarterly SLO review so capacity and reliability targets stay aligned.",
  description_uk:
    "Щоквартальний огляд, що повторно базує прогнози відносно фактичних даних, валідує 30% запасу та позицію щодо однієї AZ, звіряє бюджети токенів LLM та одиничну вартість і встановлює план масштабування та резервування на наступний квартал. Поєднаний зі щоквартальним оглядом SLO, щоб цілі потужності та надійності залишалися узгодженими.",
};
