/**
 * Data Quality SLOs — dimensions, targets, and scoring.
 * Якість даних — SLO: виміри, цілі та оцінювання.
 */

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

/**
 * Supported data-quality dimensions tracked per source and pipeline stage.
 * Підтримувані виміри якості даних, що відстежуються по кожному джерелу та стадії конвеєра.
 */
export type DataQualityDimension =
  | "freshness"
  | "completeness"
  | "accuracy"
  | "schema-conformance"
  | "uniqueness"
  | "timeliness";

// ---------------------------------------------------------------------------
// SLO target
// ---------------------------------------------------------------------------

/** A single SLO target for one data-quality dimension. */
export interface SloTarget {
  /** Quality dimension this SLO covers. */
  dimension: DataQualityDimension;
  /** Human-readable target threshold (e.g. "≤5min", "≥99%"). */
  target: string;
  /** How this SLO is measured — English. */
  measurement_en: string;
  /** How this SLO is measured — Ukrainian. */
  measurement_uk: string;
  /** Action to take when the SLO is breached — English. */
  actionOnBreachEn: string;
  /** Action to take when the SLO is breached — Ukrainian. */
  actionOnBreachUk: string;
}

// ---------------------------------------------------------------------------
// Source SLO profile
// ---------------------------------------------------------------------------

/** Complete SLO profile for one ingestion source. */
export interface SourceSloProfile {
  /** Unique source identifier. */
  sourceId: string;
  /** Human-readable source name — English. */
  sourceName_en: string;
  /** Human-readable source name — Ukrainian. */
  sourceName_uk: string;
  /** SLO targets that apply to this source. */
  slos: SloTarget[];
  /** Business criticality of this source. */
  criticalityLevel: "high" | "medium" | "low";
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Default SLOs
// ---------------------------------------------------------------------------

/** Platform-wide default SLO targets applied to every source unless overridden. */
export const DATA_QUALITY_SLOS: SloTarget[] = [
  {
    dimension: "freshness",
    target: "≤5min",
    measurement_en:
      "Median time between the source publishing an event and it appearing in the platform index.",
    measurement_uk:
      "Медіанний час між публікацією події джерелом та її появою в індексі платформи.",
    actionOnBreachEn:
      "Page on-call engineer; halt dependent pipelines; open P1 incident.",
    actionOnBreachUk:
      "Сповістити чергового інженера; зупинити залежні конвеєри; відкрити інцидент P1.",
  },
  {
    dimension: "completeness",
    target: "≥99%",
    measurement_en:
      "Percentage of known feed items received vs expected daily volume.",
    measurement_uk:
      "Відсоток отриманих елементів фіду від очікуваного добового обсягу.",
    actionOnBreachEn:
      "Alert data-eng; investigate source feed for gaps; backfill if feasible.",
    actionOnBreachUk:
      "Сповістити команду даних; перевірити фід джерела на прогалини; виконати дозаповнення за можливості.",
  },
  {
    dimension: "schema-conformance",
    target: "≥99.9%",
    measurement_en:
      "Percentage of ingested records that pass schema validation without errors.",
    measurement_uk:
      "Відсоток прийнятих записів, що пройшли валідацію схеми без помилок.",
    actionOnBreachEn:
      "Quarantine non-conforming records; alert schema-registry owner; investigate upstream change.",
    actionOnBreachUk:
      "Карантин записів, що не відповідають схемі; сповістити власника реєстру схем; розслідувати зміни у верхньому потоці.",
  },
  {
    dimension: "uniqueness",
    target: "≥99.99%",
    measurement_en:
      "Percentage of records that are not duplicates (by dedup fingerprint).",
    measurement_uk:
      "Відсоток записів, що не є дублікатами (за відбитком дедуплікації).",
    actionOnBreachEn:
      "Run dedup pipeline; audit source for repeated emission; add idempotency key.",
    actionOnBreachUk:
      "Запустити конвеєр дедуплікації; перевірити джерело на повторне надсилання; додати ключ ідемпотентності.",
  },
  {
    dimension: "accuracy",
    target: "≥95% (HITL sample)",
    measurement_en:
      "Percentage of sampled records rated accurate by human reviewers (weekly HITL spot-check).",
    measurement_uk:
      "Відсоток відібраних записів, визнаних точними рецензентами-людьми (щотижнева HITL-перевірка).",
    actionOnBreachEn:
      "Escalate to editorial team; suspend source if accuracy < 85%; conduct root-cause review.",
    actionOnBreachUk:
      "Ескалувати до редакційної команди; призупинити джерело, якщо точність < 85%; провести аналіз першопричин.",
  },
];

// ---------------------------------------------------------------------------
// Monitoring & reporting notes
// ---------------------------------------------------------------------------

export const DATA_QUALITY_MONITORING_NOTE_EN =
  "Automated SLO monitoring runs every 5 minutes via the data-quality service. " +
  "Metrics are emitted to Prometheus and visualised in Grafana. " +
  "PagerDuty alert fires on any P0/P1 SLO breach; P2 creates a Jira ticket automatically.";

export const DATA_QUALITY_MONITORING_NOTE_UK =
  "Автоматичний моніторинг SLO виконується кожні 5 хвилин через сервіс якості даних. " +
  "Метрики передаються до Prometheus і візуалізуються у Grafana. " +
  "При будь-якому порушенні SLO класу P0/P1 спрацьовує сповіщення PagerDuty; P2 автоматично створює тікет у Jira.";

export const DATA_QUALITY_REPORTING_NOTE_EN =
  "Weekly data-quality report generated every Monday 08:00 UTC. " +
  "Report covers: per-source SLO compliance, top schema violations, duplicate rates, and accuracy samples. " +
  "Distributed to the editorial team and data-engineering lead via email and Slack.";

export const DATA_QUALITY_REPORTING_NOTE_UK =
  "Щотижневий звіт про якість даних генерується щопонеділка о 08:00 UTC. " +
  "Звіт охоплює: відповідність SLO по кожному джерелу, топ порушень схеми, показники дублікатів та вибіркову перевірку точності. " +
  "Надсилається редакційній команді та керівнику команди даних електронною поштою і в Slack.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute a simple 0–100 quality score from SLO breach count.
 * Обчислює просту оцінку якості від 0 до 100 за кількістю порушень SLO.
 *
 * @param sloBreachCount - number of SLOs currently in breach
 * @param totalSlos      - total number of SLOs tracked
 * @returns integer score 0-100 (100 = all SLOs met)
 */
export function computeQualityScore(
  sloBreachCount: number,
  totalSlos: number,
): number {
  if (totalSlos <= 0) return 100;
  const breachRate = Math.min(sloBreachCount, totalSlos) / totalSlos;
  return Math.round((1 - breachRate) * 100);
}
