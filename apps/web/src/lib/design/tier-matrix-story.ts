/**
 * Tier Matrix — Storybook story configuration.
 *
 * Provides structured data for rendering the 10-tier × 12-axis matrix
 * in Storybook. Import TIER_MATRIX_ROWS for the data table and
 * TIER_MATRIX_STORY_CONFIG for the story metadata.
 *
 * Конфігурація Storybook для матриці тарифів: 10 рядків × 12 осей.
 */

// ── Axis labels ────────────────────────────────────────────────────────────────

export type TierMatrixAxis =
  | "data-freshness"
  | "history-depth"
  | "watchlists"
  | "aoi-count"
  | "alerts-per-day"
  | "copilot-msgs-per-day"
  | "export-rows"
  | "api-calls-per-day"
  | "collaboration"
  | "analytics-depth"
  | "support-level"
  | "compliance";

export const TIER_MATRIX_AXIS_LABELS: Record<TierMatrixAxis, string> = {
  "data-freshness": "Data freshness",
  "history-depth": "History depth",
  "watchlists": "Watchlists",
  "aoi-count": "AOIs",
  "alerts-per-day": "Alerts / day",
  "copilot-msgs-per-day": "AI Copilot msgs / day",
  "export-rows": "Export rows",
  "api-calls-per-day": "API calls / day",
  "collaboration": "Collaboration",
  "analytics-depth": "Analytics depth",
  "support-level": "Support",
  "compliance": "Compliance / security",
};

// ── Row interface ──────────────────────────────────────────────────────────────

export interface TierMatrixRow {
  /** Internal tier identifier */
  tierId: string;
  /** Display name shown in table header */
  tierName: string;
  /** Target audience description */
  audience: string;
  /** Price string shown to user, e.g. "$39–59 / mo" */
  priceLabel: string;
  /** Billing model: "self-serve" | "sales" | "application" | "free" */
  billing: "self-serve" | "sales" | "application" | "free";
  /** Whether this tier is currently highlighted (e.g. "Most popular") */
  highlighted: boolean;
  /** Cell values for each axis */
  cells: Record<TierMatrixAxis, string>;
}

// ── Matrix rows (10 tiers × 12 axes) ──────────────────────────────────────────

/**
 * Canonical 10-tier × 12-axis matrix data.
 * Update cells here — all consuming components (pricing page, Storybook, sales deck) derive from this.
 *
 * Канонічні дані матриці. Всі споживачі (сторінка цін, Storybook, pitch-deck) читають звідси.
 */
export const TIER_MATRIX_ROWS: TierMatrixRow[] = [
  {
    tierId: "free",
    tierName: "Free / Public",
    audience: "Civilians, students, casual readers",
    priceLabel: "$0",
    billing: "free",
    highlighted: false,
    cells: {
      "data-freshness": "15-min delay",
      "history-depth": "7 days",
      "watchlists": "1",
      "aoi-count": "1 (≤100 km²)",
      "alerts-per-day": "5 (email only)",
      "copilot-msgs-per-day": "5",
      "export-rows": "—",
      "api-calls-per-day": "—",
      "collaboration": "—",
      "analytics-depth": "Basic",
      "support-level": "Community / docs",
      "compliance": "Standard",
    },
  },
  {
    tierId: "observer",
    tierName: "Observer",
    audience: "Journalists, NGOs (light), researchers",
    priceLabel: "$9–14 / mo",
    billing: "self-serve",
    highlighted: false,
    cells: {
      "data-freshness": "5-min delay",
      "history-depth": "30 days",
      "watchlists": "5",
      "aoi-count": "5",
      "alerts-per-day": "50 (+ Telegram)",
      "copilot-msgs-per-day": "50",
      "export-rows": "1,000",
      "api-calls-per-day": "1,000 (read-only)",
      "collaboration": "—",
      "analytics-depth": "Standard",
      "support-level": "Email (best-effort)",
      "compliance": "Standard",
    },
  },
  {
    tierId: "pro",
    tierName: "Pro",
    audience: "OSINT analysts, investigators",
    priceLabel: "$39–59 / mo",
    billing: "self-serve",
    highlighted: true,
    cells: {
      "data-freshness": "Real-time (≤30 s)",
      "history-depth": "1 year",
      "watchlists": "25",
      "aoi-count": "25 (≤1,000 km²)",
      "alerts-per-day": "500 (+ Slack / Discord)",
      "copilot-msgs-per-day": "500",
      "export-rows": "100,000",
      "api-calls-per-day": "50,000",
      "collaboration": "Solo case files",
      "analytics-depth": "Advanced",
      "support-level": "Email (best-effort)",
      "compliance": "Standard SOC2",
    },
  },
  {
    tierId: "pro_plus",
    tierName: "Pro+",
    audience: "Heavy analysts, freelance intel",
    priceLabel: "$99–149 / mo",
    billing: "self-serve",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time + WS push",
      "history-depth": "3 years",
      "watchlists": "100",
      "aoi-count": "100",
      "alerts-per-day": "5,000 (+ webhooks)",
      "copilot-msgs-per-day": "2,000 + agents",
      "export-rows": "Unlimited",
      "api-calls-per-day": "500,000",
      "collaboration": "Share view-only",
      "analytics-depth": "Full",
      "support-level": "Chat (1 biz day)",
      "compliance": "Standard SOC2",
    },
  },
  {
    tierId: "team",
    tierName: "Team",
    audience: "Newsroom desks, NGO cells, small intel firms",
    priceLabel: "$299–499 / mo (5 seats)",
    billing: "self-serve",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time + webhooks + SLA",
      "history-depth": "Full history",
      "watchlists": "500 (shared)",
      "aoi-count": "500 (shared)",
      "alerts-per-day": "50,000 (shared rules)",
      "copilot-msgs-per-day": "Shared pool",
      "export-rows": "1,000,000 + S3 push",
      "api-calls-per-day": "2,000,000",
      "collaboration": "Full collab, comments",
      "analytics-depth": "Full",
      "support-level": "Chat (1 biz day)",
      "compliance": "Standard SOC2",
    },
  },
  {
    tierId: "business",
    tierName: "Business",
    audience: "Intel firms, finance desks, security vendors",
    priceLabel: "$1.5k–3k / mo",
    billing: "sales",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time + dedicated edge",
      "history-depth": "Full + raw archive",
      "watchlists": "2,000",
      "aoi-count": "2,000",
      "alerts-per-day": "Unlimited",
      "copilot-msgs-per-day": "Priority queue",
      "export-rows": "Unlimited + raw archive",
      "api-calls-per-day": "20,000,000",
      "collaboration": "Approvals, RBAC, audit log",
      "analytics-depth": "Full + custom models",
      "support-level": "Priority (4 h biz hours)",
      "compliance": "SOC2 + SSO (SAML) + SCIM",
    },
  },
  {
    tierId: "enterprise",
    tierName: "Enterprise",
    audience: "Defense primes, large corporates, gov-adjacent",
    priceLabel: "$25k+ / yr",
    billing: "sales",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time + custom SLA",
      "history-depth": "Unlimited",
      "watchlists": "Unlimited",
      "aoi-count": "Unlimited",
      "alerts-per-day": "Unlimited",
      "copilot-msgs-per-day": "Unlimited",
      "export-rows": "Unlimited",
      "api-calls-per-day": "Contract / dedicated",
      "collaboration": "Full + DPA",
      "analytics-depth": "Full + RAG over own data",
      "support-level": "Dedicated CSM, 24/7 + SLA",
      "compliance": "Audit log export, DPA, BAA, regional hosting",
    },
  },
  {
    tierId: "government",
    tierName: "Government / Defense",
    audience: "MoDs, MoIs, intel agencies",
    priceLabel: "$100k+ bespoke",
    billing: "sales",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time + on-prem option",
      "history-depth": "Unlimited",
      "watchlists": "Unlimited",
      "aoi-count": "Unlimited",
      "alerts-per-day": "Unlimited",
      "copilot-msgs-per-day": "Unlimited",
      "export-rows": "Unlimited",
      "api-calls-per-day": "Dedicated capacity",
      "collaboration": "Air-gapped option",
      "analytics-depth": "Full + classified pipelines",
      "support-level": "24/7 + procurement SLA",
      "compliance": "ITAR/EAR, on-prem / air-gapped",
    },
  },
  {
    tierId: "ngo_journalist",
    tierName: "NGO / Journalist (Granted)",
    audience: "Eligible by application",
    priceLabel: "Free or 90% off",
    billing: "application",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time (≤30 s)",
      "history-depth": "1 year",
      "watchlists": "25",
      "aoi-count": "25",
      "alerts-per-day": "500",
      "copilot-msgs-per-day": "500",
      "export-rows": "100,000",
      "api-calls-per-day": "50,000",
      "collaboration": "Solo case files",
      "analytics-depth": "Advanced",
      "support-level": "Email (best-effort)",
      "compliance": "Standard SOC2",
    },
  },
  {
    tierId: "academic",
    tierName: "Academic",
    audience: "Universities, research labs",
    priceLabel: "Free or per-seat granted",
    billing: "application",
    highlighted: false,
    cells: {
      "data-freshness": "Real-time (≤30 s)",
      "history-depth": "Full history",
      "watchlists": "25",
      "aoi-count": "25",
      "alerts-per-day": "500",
      "copilot-msgs-per-day": "500",
      "export-rows": "100,000",
      "api-calls-per-day": "50,000",
      "collaboration": "Team-level (per-lab)",
      "analytics-depth": "Full",
      "support-level": "Email + academic liaison",
      "compliance": "Standard SOC2",
    },
  },
];

// ── Story config ───────────────────────────────────────────────────────────────

/**
 * Storybook meta configuration for the TierMatrix component.
 * Import this object into the `*.stories.ts` file for the component.
 *
 * Метадані для Storybook — імпортувати у `*.stories.ts` компоненту.
 */
export const TIER_MATRIX_STORY_CONFIG = {
  title: "Monetization/TierMatrix",
  /** Component path relative to src/ */
  componentPath: "components/pricing/TierMatrix",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Canonical 10-tier × 12-axis pricing matrix. " +
          "Data source: apps/web/src/lib/design/tier-matrix-story.ts — " +
          "edit here, not in the component. " +
          "Канонічна матриця тарифів; джерело даних — цей файл.",
      },
    },
  },
  argTypes: {
    highlightTier: {
      control: { type: "select" },
      options: TIER_MATRIX_ROWS.map((r) => r.tierId),
      description: "Tier to visually highlight (e.g. 'Most popular'). Підсвічений tier.",
    },
    showPrices: {
      control: { type: "boolean" },
      description: "Show price column. Показати колонку цін.",
    },
    compactMode: {
      control: { type: "boolean" },
      description: "Render compact (fewer axes shown). Компактний режим.",
    },
  },
  args: {
    highlightTier: "pro",
    showPrices: true,
    compactMode: false,
  },
} as const;

// ── buildStorybookTierMatrix ───────────────────────────────────────────────────

/**
 * Build the full Storybook tier matrix args object.
 * Call with optional overrides; defaults produce the canonical matrix view.
 *
 * Будує об'єкт args для Storybook з опціональними override-ами.
 */
export function buildStorybookTierMatrix(overrides?: {
  highlightTier?: string;
  showPrices?: boolean;
  compactMode?: boolean;
  axisFilter?: TierMatrixAxis[];
}): {
  rows: TierMatrixRow[];
  axes: TierMatrixAxis[];
  highlightTier: string;
  showPrices: boolean;
  compactMode: boolean;
} {
  const highlightTier = overrides?.highlightTier ?? "pro";
  const showPrices = overrides?.showPrices ?? true;
  const compactMode = overrides?.compactMode ?? false;

  // Компактний режим приховує колонки низького пріоритету
  const defaultAxes = Object.keys(TIER_MATRIX_AXIS_LABELS) as TierMatrixAxis[];
  const compactAxes: TierMatrixAxis[] = [
    "data-freshness",
    "history-depth",
    "aoi-count",
    "copilot-msgs-per-day",
    "api-calls-per-day",
    "support-level",
  ];

  const axes = overrides?.axisFilter ?? (compactMode ? compactAxes : defaultAxes);

  const rows = TIER_MATRIX_ROWS.map((row) => ({
    ...row,
    highlighted: row.tierId === highlightTier,
  }));

  return { rows, axes, highlightTier, showPrices, compactMode };
}
