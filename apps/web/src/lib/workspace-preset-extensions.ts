/**
 * Workspace Preset Extensions
 *
 * Implements remaining open tasks from TODO_workspace_presets.md:
 * - Preset → alert rule conversion
 * - Preset → report subscription conversion
 *
 * Sprint 2.73 — closes open tasks in TODO_workspace_presets.md
 */

import type { WorkspacePreset } from "./presets-store";

// ── Preset → Alert Rule ───────────────────────────────────────────────────────

/**
 * Converts a saved workspace preset into an alert rule draft.
 * The user can then review and refine before saving.
 *
 * Logic:
 * - Active layers → event_type conditions
 * - Filter state (oblast, confidence, severity) → rule conditions
 * - Timeline window → lookback_hours condition
 * - AOI (area of interest) → geographic radius condition
 *
 * POST /api/presets/:id/to-alert-rule  returns AlertRuleDraft
 */
export interface AlertRuleDraft {
  /** Source preset ID */
  fromPresetId: string;
  /** Suggested rule name derived from preset name */
  suggestedName: string;
  /** Natural language summary of what the rule would do */
  nlPreview: { en: string; uk: string };
  /** Structured conditions */
  conditions: AlertRuleCondition[];
  /** Suggested delivery settings */
  delivery: AlertDelivery;
  /** User must review before saving; this is just a draft */
  isDraft: true;
}

export interface AlertRuleCondition {
  field: string;
  operator: "gte" | "lte" | "equals" | "in" | "within_km" | "contains";
  value: unknown;
  source: "preset_filter" | "preset_layer" | "preset_aoi" | "preset_timeline";
}

export interface AlertDelivery {
  channels: Array<"push" | "email" | "slack" | "webhook">;
  throttleMinutes: number;
  /** Digest mode: batch events and send once per period */
  digestMode: boolean;
  digestIntervalMinutes: number;
}

export function presetToAlertRuleDraft(preset: WorkspacePreset): AlertRuleDraft {
  const conditions: AlertRuleCondition[] = [];

  // Confidence from filter state
  const filterState = preset.filters as Record<string, unknown>;
  if (filterState?.minConfidence !== undefined) {
    conditions.push({
      field: "confidence",
      operator: "gte",
      value: filterState.minConfidence,
      source: "preset_filter",
    });
  }

  // Severity from filter state
  if (Array.isArray(filterState?.severity) && (filterState.severity as string[]).length > 0) {
    conditions.push({
      field: "severity",
      operator: "in",
      value: filterState.severity,
      source: "preset_filter",
    });
  }

  // Oblast / region from filter state
  if (filterState?.oblast) {
    conditions.push({
      field: "admin1",
      operator: "equals",
      value: filterState.oblast,
      source: "preset_filter",
    });
  }

  // Event types from active layers
  const activeLayers = preset.activeLayers as string[];
  if (activeLayers?.length > 0) {
    const eventTypes = activeLayers
      .filter(l => l.startsWith("events-"))
      .map(l => l.replace("events-", ""));
    if (eventTypes.length > 0) {
      conditions.push({
        field: "event_type",
        operator: "in",
        value: eventTypes,
        source: "preset_layer",
      });
    }
  }

  // Timeline → lookback
  const timelineWindow = preset.timelineWindow as { from?: string; to?: string } | undefined;
  if (timelineWindow?.from) {
    const hoursBack = Math.round(
      (Date.now() - new Date(timelineWindow.from).getTime()) / 3_600_000,
    );
    if (hoursBack > 0 && hoursBack <= 720) {
      conditions.push({
        field: "lookback_hours",
        operator: "lte",
        value: hoursBack,
        source: "preset_timeline",
      });
    }
  }

  const nlConditionsSummary = conditions
    .map(c => `${c.field} ${c.operator} ${JSON.stringify(c.value)}`)
    .join(", ");

  return {
    fromPresetId: preset.id,
    suggestedName: `Alert from: ${preset.name}`,
    nlPreview: {
      en: `You will be alerted when: ${nlConditionsSummary || "any new event is detected"}`,
      uk: `Ви отримаєте сповіщення, коли: ${nlConditionsSummary || "виявлено нову подію"}`,
    },
    conditions,
    delivery: {
      channels: ["push"],
      throttleMinutes: 15,
      digestMode: false,
      digestIntervalMinutes: 60,
    },
    isDraft: true,
  };
}

// ── Preset → Report Subscription ─────────────────────────────────────────────

/**
 * Converts a saved workspace preset into a scheduled report subscription.
 * The report will be generated periodically using the preset's filter state
 * as the query scope.
 *
 * POST /api/presets/:id/to-report-subscription  returns ReportSubscriptionDraft
 */
export interface ReportSubscriptionDraft {
  fromPresetId: string;
  suggestedName: string;
  description: { en: string; uk: string };
  /** What data scope the report covers (derived from preset) */
  reportScope: ReportScope;
  /** Delivery schedule */
  schedule: ReportSchedule;
  /** Output format options */
  format: ReportFormat;
  /** Who receives it */
  recipients: ReportRecipient[];
  isDraft: true;
}

export interface ReportScope {
  /** Geographic area derived from preset AOI or filter */
  geographic?: { type: "oblast" | "bbox" | "radius"; value: unknown };
  /** Event types from active layers */
  eventTypes?: string[];
  /** Confidence threshold from filter */
  minConfidence?: number;
  /** Severity levels from filter */
  severityLevels?: string[];
  /** Source tiers */
  sourceTiers?: number[];
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly";
  /** UTC time for delivery, e.g. "07:00" */
  deliveryTime: string;
  /** Day of week for weekly (0=Sun) */
  weekDay?: number;
  /** Day of month for monthly */
  monthDay?: number;
  /** Timezone for display (report data is always UTC) */
  timezone: string;
}

export interface ReportFormat {
  type: "pdf" | "html" | "markdown" | "json";
  /** Include map snapshot */
  includeMapSnapshot: boolean;
  /** Include chart panels */
  includeCharts: boolean;
  /** Max events per report */
  maxEvents: number;
  /** Language for generated prose */
  locale: "en" | "uk";
}

export interface ReportRecipient {
  type: "user" | "email" | "slack_channel" | "webhook";
  value: string;
}

export function presetToReportSubscriptionDraft(
  preset: WorkspacePreset,
  currentUserId: string,
  currentUserEmail: string,
): ReportSubscriptionDraft {
  const filterState = preset.filters as Record<string, unknown>;
  const activeLayers = preset.activeLayers as string[];

  const eventTypes = activeLayers
    ?.filter(l => l.startsWith("events-"))
    .map(l => l.replace("events-", ""));

  const reportScope: ReportScope = {
    geographic: filterState?.oblast
      ? { type: "oblast", value: filterState.oblast }
      : undefined,
    eventTypes: eventTypes?.length ? eventTypes : undefined,
    minConfidence: filterState?.minConfidence as number | undefined,
    severityLevels: Array.isArray(filterState?.severity)
      ? (filterState.severity as string[])
      : undefined,
  };

  const scopeSummary = [
    reportScope.geographic ? `region: ${JSON.stringify(reportScope.geographic.value)}` : null,
    reportScope.eventTypes?.length ? `events: ${reportScope.eventTypes.join(", ")}` : null,
    reportScope.minConfidence ? `confidence ≥ ${reportScope.minConfidence}` : null,
  ]
    .filter(Boolean)
    .join("; ");

  return {
    fromPresetId: preset.id,
    suggestedName: `Weekly Report: ${preset.name}`,
    description: {
      en: `Scheduled intelligence digest scoped to: ${scopeSummary || "all events"}`,
      uk: `Розклад розвідувального дайджесту для: ${scopeSummary || "усіх подій"}`,
    },
    reportScope,
    schedule: {
      frequency: "weekly",
      deliveryTime: "07:00",
      weekDay: 1, // Monday
      timezone: "Europe/Kyiv",
    },
    format: {
      type: "pdf",
      includeMapSnapshot: true,
      includeCharts: true,
      maxEvents: 50,
      locale: "en",
    },
    recipients: [
      { type: "user", value: currentUserId },
      { type: "email", value: currentUserEmail },
    ],
    isDraft: true,
  };
}
