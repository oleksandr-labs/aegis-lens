/**
 * Per-org Rule Templates
 *
 * Organisations can define their own reusable rule templates.
 * These are discoverable by all org members via the rule builder UI.
 * Unlike persona templates (global), org templates are org-scoped.
 *
 * Sprint 2.73 — closes TODO_ai_rule_builder.md "Per-org rule templates" task
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgRuleTemplate {
  id: string;
  orgId: string;
  /** Template name shown in rule builder */
  name: { en: string; uk: string };
  description: { en: string; uk: string };
  /** Partially-filled rule JSON — user completes the remaining blanks */
  ruleSkeletonJson: RuleSkeleton;
  /** Tags for discoverability within the org */
  tags: string[];
  /** Who created it */
  createdByUserId: string;
  createdAt: string; // ISO 8601
  /** How many rules were created from this template */
  usageCount: number;
  /** Is this template visible to all org members or only admins? */
  visibility: "all_members" | "admins_only";
}

export interface RuleSkeleton {
  /** Partial NL description with {{PLACEHOLDER}} variables */
  naturalLanguage: string;
  /** Pre-filled conditions (some may have null value = "fill in") */
  conditions: Array<{
    field: string;
    operator: string;
    value: unknown | null;
    /** If value is null, show this hint in the UI */
    hint?: string;
  }>;
  /** Delivery config skeleton */
  delivery: {
    channels: Array<"email" | "push" | "slack" | "webhook">;
    throttleMinutes: number;
  };
}

// ── Default org templates (seeded for new orgs) ───────────────────────────────

export const DEFAULT_ORG_TEMPLATES: Omit<OrgRuleTemplate, "orgId" | "createdByUserId" | "createdAt">[] = [
  {
    id: "org-template-critical-infrastructure",
    name: {
      en: "Critical Infrastructure Alert",
      uk: "Сповіщення про критичну інфраструктуру",
    },
    description: {
      en: "Alert when any event occurs within a specified radius of a critical infrastructure site",
      uk: "Сповіщати, коли будь-яка подія відбувається в межах заданого радіуса від об'єкта критичної інфраструктури",
    },
    ruleSkeletonJson: {
      naturalLanguage:
        "Alert me when any event with severity ≥ {{SEVERITY}} occurs within {{RADIUS_KM}}km of {{LOCATION_NAME}}",
      conditions: [
        { field: "severity", operator: "in", value: null, hint: "e.g. high, critical" },
        { field: "radius_km", operator: "lte", value: 30 },
        { field: "location_lat", operator: "near", value: null, hint: "Latitude of the site" },
        { field: "location_lng", operator: "near", value: null, hint: "Longitude of the site" },
      ],
      delivery: { channels: ["push", "email"], throttleMinutes: 5 },
    },
    tags: ["infrastructure", "geographic", "critical"],
    usageCount: 0,
    visibility: "all_members",
  },
  {
    id: "org-template-unit-tracker",
    name: {
      en: "Military Unit Activity Monitor",
      uk: "Монітор активності військових підрозділів",
    },
    description: {
      en: "Alert on any confirmed events involving a specified military unit or equipment type",
      uk: "Сповіщати про підтверджені події з участю зазначеного підрозділу або типу техніки",
    },
    ruleSkeletonJson: {
      naturalLanguage:
        "Alert me when a confirmed event mentions {{UNIT_OR_EQUIPMENT}} with confidence ≥ 0.80",
      conditions: [
        { field: "entity_mention", operator: "contains", value: null, hint: "Unit name or equipment type" },
        { field: "confidence", operator: "gte", value: 0.80 },
        { field: "source_tier", operator: "in", value: [1, 2] },
      ],
      delivery: { channels: ["push", "slack"], throttleMinutes: 15 },
    },
    tags: ["military", "unit", "equipment"],
    usageCount: 0,
    visibility: "all_members",
  },
  {
    id: "org-template-oblast-daily",
    name: {
      en: "Oblast Daily Digest",
      uk: "Щоденний дайджест по області",
    },
    description: {
      en: "Daily summary of all events in a specified oblast, delivered at a scheduled time",
      uk: "Щоденне зведення всіх подій у зазначеній області, що надходить у заданий час",
    },
    ruleSkeletonJson: {
      naturalLanguage:
        "Send me a daily digest of all events in {{OBLAST_NAME}} at {{DELIVERY_TIME}}",
      conditions: [
        { field: "admin1", operator: "equals", value: null, hint: "Oblast name, e.g. Zaporizka" },
        { field: "digest_schedule", operator: "equals", value: "08:00 UTC" },
      ],
      delivery: { channels: ["email"], throttleMinutes: 60 * 24 },
    },
    tags: ["digest", "oblast", "daily"],
    usageCount: 0,
    visibility: "all_members",
  },
  {
    id: "org-template-high-confidence-flash",
    name: {
      en: "High-Confidence Flash Alert",
      uk: "Миттєве сповіщення з високою достовірністю",
    },
    description: {
      en: "Immediate alert for any event with ≥0.90 confidence and critical severity — for duty officers",
      uk: "Негайне сповіщення про будь-яку подію з достовірністю ≥0.90 та критичним рівнем серйозності",
    },
    ruleSkeletonJson: {
      naturalLanguage:
        "Alert me immediately for any event with confidence ≥ 0.90 and severity = critical",
      conditions: [
        { field: "confidence", operator: "gte", value: 0.90 },
        { field: "severity", operator: "equals", value: "critical" },
      ],
      delivery: { channels: ["push", "slack", "email"], throttleMinutes: 0 },
    },
    tags: ["critical", "flash", "duty-officer"],
    usageCount: 0,
    visibility: "admins_only",
  },
];

// ── CRUD helpers (API layer calls these) ──────────────────────────────────────

export interface CreateOrgTemplateInput {
  orgId: string;
  createdByUserId: string;
  name: { en: string; uk: string };
  description: { en: string; uk: string };
  ruleSkeletonJson: RuleSkeleton;
  tags: string[];
  visibility: OrgRuleTemplate["visibility"];
}

export function validateOrgTemplate(input: CreateOrgTemplateInput): string[] {
  const errors: string[] = [];
  if (!input.name.en || input.name.en.trim().length < 3) {
    errors.push("Template name (EN) must be at least 3 characters");
  }
  if (!input.ruleSkeletonJson.conditions || input.ruleSkeletonJson.conditions.length === 0) {
    errors.push("Template must define at least one condition");
  }
  if (input.ruleSkeletonJson.delivery.throttleMinutes < 0) {
    errors.push("Throttle minutes must be ≥ 0");
  }
  return errors;
}

// ── API route shape: GET /api/orgs/:orgId/rule-templates ─────────────────────

export interface OrgTemplateListResponse {
  templates: OrgRuleTemplate[];
  total: number;
}

// ── API route shape: POST /api/orgs/:orgId/rule-templates ────────────────────

export interface CreateOrgTemplateResponse {
  template: OrgRuleTemplate;
}
