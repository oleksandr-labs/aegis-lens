export type WorkspacePreset = {
  id: string;
  name: string;
  description: string;
  persona: "analyst" | "journalist" | "ngo" | "government" | "trader" | "civilian";
  filters: {
    country: string;
    hours: number;
    classes: string[];
    minDanger?: number;
    minConfidence?: number;
  };
  dashboardWidgets: string[];
  copilotContext?: string;
  alertRules?: { name: string; classes: string[]; channels: string[] }[];
  public: boolean;
  author?: string;
  usageCount?: number;
};

export const PRESETS: WorkspacePreset[] = [
  {
    id: "conflict-analyst-ua",
    name: "Ukraine Conflict Analyst",
    description:
      "Full view of military, infrastructure, and civilian events in Ukraine. High confidence filter.",
    persona: "analyst",
    filters: {
      country: "ua",
      hours: 24,
      classes: ["military_action", "infrastructure", "civilian_alert"],
      minConfidence: 60,
    },
    dashboardWidgets: ["events", "kpi", "anomalies", "watchlist"],
    copilotContext: "Focus on military developments and infrastructure impact.",
    alertRules: [
      {
        name: "Military UA critical",
        classes: ["military_action"],
        channels: ["in_app", "email"],
      },
    ],
    public: true,
    usageCount: 847,
  },
  {
    id: "journalist-breaking",
    name: "Breaking News Journalist",
    description: "High-severity recent events. Focus on verifiable events for publication.",
    persona: "journalist",
    filters: {
      country: "ua",
      hours: 6,
      classes: ["military_action", "civilian_alert"],
      minConfidence: 75,
    },
    dashboardWidgets: ["events", "kpi", "source-health"],
    public: true,
    usageCount: 423,
  },
  {
    id: "ngo-humanitarian",
    name: "NGO Humanitarian Monitor",
    description:
      "Civilian impact: alerts, humanitarian events, infrastructure damage. No military focus.",
    persona: "ngo",
    filters: {
      country: "ua",
      hours: 24,
      classes: ["civilian_alert", "humanitarian", "infrastructure"],
    },
    dashboardWidgets: ["events", "kpi", "watchlist"],
    public: true,
    usageCount: 312,
  },
  {
    id: "maritime-monitor",
    name: "Black Sea Maritime Monitor",
    description: "Maritime and aviation events, Black Sea focus.",
    persona: "analyst",
    filters: {
      country: "ua",
      hours: 48,
      classes: ["maritime", "aviation"],
    },
    dashboardWidgets: ["events", "kpi"],
    public: true,
    usageCount: 156,
  },
  {
    id: "cyber-threat",
    name: "Cyber Threat Tracker",
    description: "Cyber operations, disinformation, and digital infrastructure events.",
    persona: "analyst",
    filters: {
      country: "ua",
      hours: 72,
      classes: ["cyber", "political"],
    },
    dashboardWidgets: ["events", "anomalies", "source-health"],
    public: true,
    usageCount: 201,
  },
];
