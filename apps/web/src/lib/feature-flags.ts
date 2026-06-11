export type FlagId =
  | "ai_copilot_v2"
  | "dashboard_widgets"
  | "embed_builder"
  | "mapbox_swap"
  | "ai_reports"
  | "browser_extension_link"
  | "compare_mode_copilot"
  | "heatmap_layer"
  | "mobile_bottom_sheet"
  | "workspace_presets"
  | "travel_risk_pages"
  | "units_directory"
  | "vs_pages"
  | "onboarding_tour"
  | "custom_markers";

export type Flag = {
  id: FlagId;
  label: string;
  description: string;
  defaultEnabled: boolean;
  audience: "all" | "beta" | "enterprise" | "team+" | "analyst+";
};

export const FLAG_DEFINITIONS: Flag[] = [
  {
    id: "ai_copilot_v2",
    label: "AI Copilot v2 (streaming)",
    description: "Streaming SSE copilot with citations",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "dashboard_widgets",
    label: "Drag-and-drop dashboard widgets",
    description: "HTML5 drag-and-drop layout",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "embed_builder",
    label: "Embed Builder page",
    description: "Self-serve embed snippet generator",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "mapbox_swap",
    label: "Mapbox GL swap",
    description: "Premium Mapbox styles when token set",
    defaultEnabled: false,
    audience: "enterprise",
  },
  {
    id: "ai_reports",
    label: "AI Report Generation",
    description: "Team plan report generation wizard",
    defaultEnabled: true,
    audience: "team+",
  },
  {
    id: "browser_extension_link",
    label: "Browser extension deep-link",
    description: "Link from app surfaces to extension",
    defaultEnabled: false,
    audience: "beta",
  },
  {
    id: "compare_mode_copilot",
    label: "Copilot compare mode",
    description: "Compare two countries in AI copilot",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "heatmap_layer",
    label: "Activity Heatmap layer",
    description: "Canvas heatmap on map",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "mobile_bottom_sheet",
    label: "Mobile bottom-sheet inspector",
    description: "Touch-draggable event detail",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "workspace_presets",
    label: "Workspace presets gallery",
    description: "Community preset library",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "travel_risk_pages",
    label: "Travel risk city pages",
    description: "City safety index (/travel)",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "units_directory",
    label: "Military units directory",
    description: "Open-source OOB directory (/units)",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "vs_pages",
    label: "VS comparison pages",
    description: "Country/entity comparison pages (/vs)",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "onboarding_tour",
    label: "Onboarding product tour",
    description: "6-step guided tour for new users",
    defaultEnabled: true,
    audience: "all",
  },
  {
    id: "custom_markers",
    label: "Custom SVG map markers",
    description: "Per-class custom marker shapes",
    defaultEnabled: true,
    audience: "all",
  },
];

/**
 * Server-side: check if a flag is enabled for the current context.
 * In production: check user/org from session + flag state from DB/edge config.
 * For now: returns the defaultEnabled value.
 */
export function isFlagEnabled(id: FlagId): boolean {
  const flag = FLAG_DEFINITIONS.find((f) => f.id === id);
  if (!flag) return false;
  // In production: check LaunchDarkly / Unleash / DB
  return flag.defaultEnabled;
}

/**
 * Client-side hook: check a flag with localStorage override support.
 * In production: subscribe to real-time flag updates.
 */
export function useFlagEnabled(id: FlagId): boolean {
  // In production: subscribe to real-time flag updates
  if (typeof window === "undefined") return isFlagEnabled(id);
  const override = localStorage.getItem(`aegis_flag_${id}`);
  if (override !== null) return override === "true";
  return isFlagEnabled(id);
}
