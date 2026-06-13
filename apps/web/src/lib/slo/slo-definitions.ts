// Service-Level Objectives (SLOs) for the Aegis Lens platform.
//
// This module is the machine-readable, single-source-of-truth contract for what
// "healthy" means per service. Targets here are authoritative: error-budget
// math (./error-budget.ts), burn-rate alerting, and capacity planning
// (./capacity-planning.ts) all derive from these numbers. Customer-facing SLAs
// (./sla-tiers.ts) are intentionally looser than these internal SLOs.

export type ServiceId =
  | "api-gateway"
  | "map-workspace"
  | "ingest"
  | "verify"
  | "alert"
  | "ai-copilot"
  | "tile-serving"
  | "search";

/**
 * The kind of objective an SLO measures.
 * - "availability": fraction of valid requests served successfully.
 * - "latency": a request-response latency percentile bound.
 * - "freshness": end-to-end pipeline lag (event-time → availability).
 * - "latency-staged": multi-phase latency (e.g. time-to-first-token + full).
 */
export type SloKind = "availability" | "latency" | "freshness" | "latency-staged";

export interface AvailabilityObjective {
  /** Success-ratio target as a fraction, e.g. 0.9995 for 99.95%. */
  target: number;
  /** Human-readable target, e.g. "99.95%". */
  targetLabel: string;
  /** What counts as a "good" event for the SLI numerator. */
  goodEventDefinition: string;
}

export interface LatencyObjective {
  /** Percentile this bound applies to, e.g. 95 for p95. */
  percentile: 50 | 90 | 95 | 99;
  /** Upper-bound threshold in milliseconds. */
  thresholdMs: number;
  /** Human-readable threshold, e.g. "p95 < 200ms". */
  thresholdLabel: string;
  /** What the latency measurement spans (start → stop boundary). */
  measuredSpan: string;
}

export interface FreshnessObjective {
  /** Percentile this lag bound applies to. */
  percentile: 50 | 90 | 95 | 99;
  /** Max acceptable end-to-end lag in milliseconds. */
  maxLagMs: number;
  /** Human-readable lag, e.g. "< 60s lag". */
  maxLagLabel: string;
  /** Pipeline boundary measured (from → to). */
  pipelineSpan: string;
}

export interface StagedLatencyObjective {
  /** Time-to-first-token / first-byte upper bound in ms. */
  firstResponseMs: number;
  /** Full / complete response upper bound in ms. */
  fullResponseMs: number;
  /** Percentile the bounds apply to. */
  percentile: 50 | 90 | 95 | 99;
  /** Human-readable summary, e.g. "TTFT < 1s, full < 8s". */
  label: string;
  /** What each stage measures. */
  stagesDescription: string;
}

export interface ServiceSLO {
  service: ServiceId;
  displayName: string;
  kind: SloKind;
  /** Trailing window over which the SLO is evaluated. */
  windowDays: 28;
  /** Present when kind === "availability". */
  availability?: AvailabilityObjective;
  /** Present when kind === "latency". */
  latency?: LatencyObjective;
  /** Present when kind === "freshness". */
  freshness?: FreshnessObjective;
  /** Present when kind === "latency-staged". */
  staged?: StagedLatencyObjective;
  /** Owning team — must match an entry in error-budget accountability. */
  owningTeam: string;
  description_en: string;
  description_uk: string;
}

export const SERVICE_SLOS: Record<ServiceId, ServiceSLO> = {
  "api-gateway": {
    service: "api-gateway",
    displayName: "API Gateway",
    kind: "availability",
    windowDays: 28,
    availability: {
      target: 0.9995,
      targetLabel: "99.95%",
      goodEventDefinition:
        "HTTP responses with status < 500 (excluding 429 throttling), served within the latency objective. 5xx and gateway timeouts count against the budget.",
    },
    latency: {
      percentile: 95,
      thresholdMs: 200,
      thresholdLabel: "p95 < 200ms",
      measuredSpan: "Edge ingress accept → first response byte flushed.",
    },
    owningTeam: "platform-edge",
    description_en:
      "Public API entry point. 99.95% availability (≈21.5 min/month budget) with p95 < 200ms. The gateway is the front door for every authenticated API call; its SLO bounds the worst-case experience for all downstream consumers.",
    description_uk:
      "Публічна точка входу API. Доступність 99.95% (≈21.5 хв/міс бюджету) з p95 < 200мс. Шлюз — це вхідні двері для кожного автентифікованого виклику API; його SLO обмежує найгірший досвід для всіх споживачів нижче за потоком.",
  },
  "map-workspace": {
    service: "map-workspace",
    displayName: "Map Workspace",
    kind: "availability",
    windowDays: 28,
    availability: {
      target: 0.999,
      targetLabel: "99.9%",
      goodEventDefinition:
        "Workspace shell loads and reaches interactive state with live layer data. JS bundle errors, failed layer fetches, and blank-canvas loads count against the budget.",
    },
    latency: {
      percentile: 95,
      thresholdMs: 1000,
      thresholdLabel: "p95 < 1s for typical workspaces",
      measuredSpan:
        "Navigation start → workspace interactive (first usable map frame for a typical layer set).",
    },
    owningTeam: "frontend-map",
    description_en:
      "Interactive analyst map workspace. 99.9% availability (≈43 min/month budget) with p95 time-to-interactive < 1s for a typical layer configuration. Heavy custom workspaces are excluded from the typical-case latency SLI.",
    description_uk:
      "Інтерактивний картографічний робочий простір аналітика. Доступність 99.9% (≈43 хв/міс бюджету) з p95 часу до інтерактивності < 1с для типової конфігурації шарів. Важкі кастомні робочі простори виключені з SLI типового випадку.",
  },
  ingest: {
    service: "ingest",
    displayName: "Ingest Pipeline",
    kind: "freshness",
    windowDays: 28,
    freshness: {
      percentile: 95,
      maxLagMs: 60_000,
      maxLagLabel: "< 60s lag",
      pipelineSpan:
        "Source observation timestamp → record landed in `events.normalized`.",
    },
    owningTeam: "data-ingest",
    description_en:
      "Source-to-normalized ingestion pipeline. P95 lag from the moment an event is observed at the source to its appearance in `events.normalized` must stay under 60s. This freshness SLO bounds how stale the rest of the platform can be.",
    description_uk:
      "Конвеєр прийому від джерела до нормалізації. P95 затримки від моменту спостереження події в джерелі до її появи в `events.normalized` має залишатися під 60с. Цей SLO свіжості обмежує, наскільки застарілою може бути решта платформи.",
  },
  verify: {
    service: "verify",
    displayName: "Verification Pipeline",
    kind: "freshness",
    windowDays: 28,
    freshness: {
      percentile: 95,
      maxLagMs: 300_000,
      maxLagLabel: "< 5min P95",
      pipelineSpan:
        "Record present in `events.normalized` → record reaches `verified` state.",
    },
    owningTeam: "verification",
    description_en:
      "Normalized-to-verified pipeline (automated + human-in-the-loop checks). P95 from `events.normalized` to a `verified` state must stay under 5 minutes. Items pending external corroboration are excluded and tracked separately.",
    description_uk:
      "Конвеєр від нормалізації до верифікації (автоматичні + людські перевірки). P95 від `events.normalized` до стану `verified` має залишатися під 5 хвилин. Елементи, що очікують зовнішнього підтвердження, виключені та відстежуються окремо.",
  },
  alert: {
    service: "alert",
    displayName: "Alert Delivery",
    kind: "freshness",
    windowDays: 28,
    freshness: {
      percentile: 95,
      maxLagMs: 5_000,
      maxLagLabel: "< 5s P95",
      pipelineSpan:
        "Saved-query match evaluated → in-app notification delivered to client.",
    },
    owningTeam: "alerting",
    description_en:
      "Match-to-notification delivery. P95 from a saved-query match firing to the in-app notification reaching the user's client must stay under 5s. External-channel fan-out (email/push) is tracked as a separate downstream SLI.",
    description_uk:
      "Доставка від збігу до сповіщення. P95 від спрацювання збігу збереженого запиту до доставки сповіщення в застосунку до клієнта користувача має залишатися під 5с. Розсилка зовнішніми каналами (email/push) відстежується як окремий SLI нижче за потоком.",
  },
  "ai-copilot": {
    service: "ai-copilot",
    displayName: "AI Copilot",
    kind: "latency-staged",
    windowDays: 28,
    staged: {
      firstResponseMs: 1_000,
      fullResponseMs: 8_000,
      percentile: 95,
      label: "TTFT < 1s, full response < 8s",
      stagesDescription:
        "Time-to-first-token (TTFT) measured from request accept → first streamed token; full-response measured from request accept → final token of a typical analyst query.",
    },
    owningTeam: "ai-copilot",
    description_en:
      "Streaming analyst copilot. P95 time-to-first-token under 1s preserves perceived responsiveness; P95 full response under 8s for a typical query. Tool-augmented multi-step runs are excluded from the typical-case SLI and tracked separately.",
    description_uk:
      "Потоковий копілот-аналітик. P95 часу до першого токена під 1с зберігає відчуття відгукливості; P95 повної відповіді під 8с для типового запиту. Багатокрокові запуски з інструментами виключені з SLI типового випадку та відстежуються окремо.",
  },
  "tile-serving": {
    service: "tile-serving",
    displayName: "Tile Serving",
    kind: "availability",
    windowDays: 28,
    availability: {
      target: 0.9995,
      targetLabel: "99.95%",
      goodEventDefinition:
        "Tile requests returning a valid tile (200 or 204 empty-tile) within the latency objective. 5xx, timeouts, and corrupt tiles count against the budget; cache hits and misses both count as valid traffic.",
    },
    latency: {
      percentile: 95,
      thresholdMs: 100,
      thresholdLabel: "p95 < 100ms",
      measuredSpan: "Tile request accept → tile bytes flushed (CDN edge measured).",
    },
    owningTeam: "platform-edge",
    description_en:
      "Vector/raster tile delivery. 99.95% availability (≈21.5 min/month budget) with p95 < 100ms, predominantly served from CDN edge cache. Tile latency is the dominant factor in perceived map smoothness during pan/zoom.",
    description_uk:
      "Доставка векторних/растрових тайлів. Доступність 99.95% (≈21.5 хв/міс бюджету) з p95 < 100мс, переважно з крайового кешу CDN. Затримка тайлів — домінуючий фактор у відчутті плавності карти під час панорамування/масштабування.",
  },
  search: {
    service: "search",
    displayName: "Search",
    kind: "latency",
    windowDays: 28,
    latency: {
      percentile: 95,
      thresholdMs: 250,
      thresholdLabel: "p95 < 250ms",
      measuredSpan:
        "Search request accept → first results page serialized and flushed.",
    },
    owningTeam: "search",
    description_en:
      "Full-text and structured entity search. P95 query latency under 250ms for the first results page. Deep pagination and aggregation-heavy faceted queries are excluded from the typical-case SLI.",
    description_uk:
      "Повнотекстовий та структурований пошук сутностей. P95 затримки запиту під 250мс для першої сторінки результатів. Глибока пагінація та запити з важкими агрегаціями та фасетами виключені з SLI типового випадку.",
  },
};

/**
 * Operations references. These are pointers, not duplicated logic — the
 * authoritative implementations live in the named sibling modules so the SLO
 * contract stays the single source of the numeric targets.
 */
export interface SloOpsReferences {
  /** Where per-service error budgets are computed from SERVICE_SLOS. */
  errorBudgetModule: string;
  /** Where multiwindow burn-rate alert thresholds are defined. */
  burnRateAlertModule: string;
  /** SLO review cadence and what the review covers. */
  reviewCadence: "quarterly";
  reviewDescription_en: string;
  reviewDescription_uk: string;
}

export const SLO_OPS_REFERENCES: SloOpsReferences = {
  errorBudgetModule:
    "apps/web/src/lib/slo/error-budget.ts (SERVICE_ERROR_BUDGETS)",
  burnRateAlertModule:
    "apps/web/src/lib/slo/error-budget.ts (BURN_RATE_ALERTS)",
  reviewCadence: "quarterly",
  reviewDescription_en:
    "Every quarter, SLO targets are reviewed against actual SLI distributions: targets that are never breached are tightened, chronically-missed targets are either renegotiated with the owning team or escalated for investment. Window length, exclusions, and good-event definitions are re-validated. Output feeds the quarterly capacity review.",
  reviewDescription_uk:
    "Щокварталу цілі SLO переглядаються відносно фактичних розподілів SLI: цілі, які ніколи не порушуються, посилюються, хронічно недосяжні цілі або перепогоджуються з відповідальною командою, або ескалуються для інвестицій. Довжина вікна, винятки та визначення «хороших подій» повторно валідуються. Результат подається на щоквартальний огляд потужностей.",
};
