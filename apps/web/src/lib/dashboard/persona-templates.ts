/**
 * Per-persona dashboard templates — seeded on signup for each user persona.
 * Шаблони дашбордів для кожної персони — засіваються при реєстрації для кожної персони користувача.
 *
 * NOTE (EN): Templates are read-only seeds; users can save customised copies via SavedDashboardStore.
 * NOTE (UK): Шаблони — незмінні сіди; користувачі можуть зберігати власні копії через SavedDashboardStore.
 *
 * NOTE (EN): defaultTimeWindow follows ISO 8601 duration: "PT24H" = 24 hours, "P7D" = 7 days.
 * NOTE (UK): defaultTimeWindow використовує тривалість ISO 8601: "PT24H" = 24 год, "P7D" = 7 днів.
 *
 * NOTE (EN): Widgets in templates use widgetId="" — assign real IDs at seed time using crypto.randomUUID().
 * NOTE (UK): Віджети в шаблонах мають widgetId="" — призначайте реальні ID при засіванні через crypto.randomUUID().
 */

import type { BaseWidgetConfig } from "../widgets/config-schema";

// ---------------------------------------------------------------------------
// PersonaDashboardTemplate
// ---------------------------------------------------------------------------

export interface PersonaDashboardTemplate {
  personaId: string;
  personaName: string;
  personaNameUk: string;
  widgets: BaseWidgetConfig[];
  defaultTimeWindow: string;
  defaultRegion?: string;
}

// ---------------------------------------------------------------------------
// Widget shorthand builders
// ---------------------------------------------------------------------------

function w(
  type: BaseWidgetConfig["type"],
  title: string,
  titleUk: string,
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
  size: BaseWidgetConfig["size"] = "medium",
): BaseWidgetConfig {
  return {
    widgetId: "",
    type,
    title,
    titleUk,
    size,
    position: { col, row, colSpan, rowSpan },
    visible: true,
  };
}

// ---------------------------------------------------------------------------
// PERSONA_DASHBOARD_TEMPLATES
// ---------------------------------------------------------------------------

export const PERSONA_DASHBOARD_TEMPLATES: PersonaDashboardTemplate[] = [
  // ── Civilian ────────────────────────────────────────────────────────────
  {
    personaId: "civilian",
    personaName: "Civilian",
    personaNameUk: "Цивільний",
    defaultTimeWindow: "PT24H",
    defaultRegion: "Ukraine",
    widgets: [
      w("event-feed",     "Latest Events",    "Останні події",       0, 0, 4, 6),
      w("mini-map",       "Situation Map",    "Карта ситуації",      4, 0, 4, 6),
      w("severity-gauge", "Threat Level",     "Рівень загрози",      8, 0, 2, 3, "small"),
      w("ai-brief",       "AI Summary",       "AI-зведення",         8, 3, 2, 3, "small"),
    ],
  },

  // ── Journalist ──────────────────────────────────────────────────────────
  {
    personaId: "journalist",
    personaName: "Journalist",
    personaNameUk: "Журналіст",
    defaultTimeWindow: "P7D",
    widgets: [
      w("event-feed",     "Incident Feed",    "Стрічка інцидентів",  0, 0, 4, 6),
      w("timeseries",     "Trend Over Time",  "Тренд у часі",        4, 0, 4, 4, "large"),
      w("source-health",  "Source Monitor",   "Моніторинг джерел",   4, 4, 4, 2, "small"),
      w("ai-brief",       "AI Brief",         "AI-зведення",         8, 0, 2, 4),
    ],
  },

  // ── Analyst ─────────────────────────────────────────────────────────────
  {
    personaId: "analyst",
    personaName: "Analyst",
    personaNameUk: "Аналітик",
    defaultTimeWindow: "P30D",
    widgets: [
      w("heatmap",        "Density Heatmap",  "Теплова карта щільності", 0, 0, 6, 5, "large"),
      w("timeseries",     "Historical Trend", "Історичний тренд",        6, 0, 4, 5, "large"),
      w("sankey",         "Flow Diagram",     "Діаграма потоків",        0, 5, 6, 5, "large"),
      w("kpi-counter",    "Key Metrics",      "Ключові метрики",         6, 5, 2, 3, "small"),
      w("anomaly",        "Anomalies",        "Аномалії",                8, 5, 2, 3, "small"),
    ],
  },

  // ── NGO ─────────────────────────────────────────────────────────────────
  {
    personaId: "ngo",
    personaName: "NGO Worker",
    personaNameUk: "Працівник НГО",
    defaultTimeWindow: "PT24H",
    defaultRegion: "Ukraine",
    widgets: [
      w("mini-map",       "Field Map",        "Польова карта",       0, 0, 5, 6, "large"),
      w("event-feed",     "Incident Feed",    "Стрічка інцидентів",  5, 0, 3, 6),
      w("severity-gauge", "Threat Level",     "Рівень загрози",      8, 0, 2, 3, "small"),
      w("travel-risk",    "Travel Risk",      "Ризики подорожей",    8, 3, 2, 3, "small"),
    ],
  },

  // ── Government / Defense ────────────────────────────────────────────────
  {
    personaId: "gov_defense",
    personaName: "Government / Defense",
    personaNameUk: "Уряд / Оборона",
    defaultTimeWindow: "P7D",
    widgets: [
      w("heatmap",        "Threat Heatmap",   "Теплова карта загроз", 0, 0, 5, 5, "large"),
      w("sankey",         "Supply Flows",     "Потоки постачання",    5, 0, 5, 5, "large"),
      w("anomaly",        "Anomaly Signals",  "Сигнали аномалій",     0, 5, 4, 4),
      w("kpi-counter",    "Operational KPIs", "Операційні KPI",       4, 5, 3, 2, "small"),
      w("alert-feed",     "Priority Alerts",  "Пріоритетні сповіщення", 7, 5, 3, 4),
    ],
  },

  // ── Security Firm ───────────────────────────────────────────────────────
  {
    personaId: "security_firm",
    personaName: "Security Firm",
    personaNameUk: "Охоронна компанія",
    defaultTimeWindow: "PT24H",
    widgets: [
      w("mini-map",       "Ops Map",          "Оперативна карта",    0, 0, 4, 5, "large"),
      w("event-feed",     "Live Feed",        "Стрічка подій",       4, 0, 3, 5),
      w("travel-risk",    "Travel Risk",      "Ризики подорожей",    7, 0, 3, 3),
      w("alert-feed",     "Alerts",           "Сповіщення",          7, 3, 3, 2),
      w("timeseries",     "Incident Trend",   "Тренд інцидентів",    0, 5, 7, 4, "large"),
    ],
  },

  // ── Trader ──────────────────────────────────────────────────────────────
  {
    personaId: "trader",
    personaName: "Trader / Investor",
    personaNameUk: "Трейдер / Інвестор",
    defaultTimeWindow: "P30D",
    widgets: [
      w("timeseries",     "Risk Index Trend", "Тренд індексу ризику", 0, 0, 6, 5, "large"),
      w("kpi-counter",    "Risk Score",       "Оцінка ризику",        6, 0, 2, 3, "small"),
      w("severity-gauge", "Severity Level",   "Рівень небезпеки",     8, 0, 2, 3, "small"),
      w("ai-brief",       "Market Brief",     "Ринкове зведення",     0, 5, 5, 4),
    ],
  },

  // ── Researcher ──────────────────────────────────────────────────────────
  {
    personaId: "researcher",
    personaName: "Researcher",
    personaNameUk: "Дослідник",
    defaultTimeWindow: "P90D",
    widgets: [
      w("notebook-cell",  "Analysis Notebook", "Аналітичний блокнот", 0, 0, 6, 6, "large"),
      w("timeseries",     "Longitudinal Data", "Лонгітюдні дані",     6, 0, 4, 4, "large"),
      w("source-health",  "Data Sources",      "Джерела даних",       6, 4, 2, 2, "small"),
      w("event-feed",     "Raw Events",        "Необроблені події",   0, 6, 6, 4),
    ],
  },

  // ── Developer ───────────────────────────────────────────────────────────
  {
    personaId: "developer",
    personaName: "Developer",
    personaNameUk: "Розробник",
    defaultTimeWindow: "PT24H",
    widgets: [
      w("source-health",  "API Health",       "Стан API",            0, 0, 4, 4),
      w("kpi-counter",    "Request Volume",   "Обсяг запитів",       4, 0, 3, 2, "small"),
      w("event-feed",     "Event Stream",     "Потік подій",         4, 2, 6, 4),
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Get a persona dashboard template by personaId.
 * Повертає шаблон дашборду для персони за personaId.
 */
export function getPersonaTemplate(personaId: string): PersonaDashboardTemplate | undefined {
  return PERSONA_DASHBOARD_TEMPLATES.find((t) => t.personaId === personaId);
}
