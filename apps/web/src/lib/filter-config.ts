import type { EventClass } from "@aegis/types";

export const FILTER_DEFAULTS = {
  country: "ua",
  hours: 24,
  classes: [] as EventClass[],
  minSeverity: 0,
  minConfidence: 0,
  minDanger: 0,
} as const;

export const VERIFICATION_STATES = [
  { id: "unverified",   label: "Unverified" },
  { id: "corroborated", label: "Corroborated" },
  { id: "disputed",     label: "Disputed" },
  { id: "retracted",    label: "Retracted" },
] as const;

export const TIME_WINDOWS: { label: string; hours: number | null }[] = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
  { label: "All", hours: null },
];

export const COUNTRIES = ["ua", "pl", "de"] as const;
export type CountryCode = (typeof COUNTRIES)[number];

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  ua: "Ukraine",
  pl: "Poland",
  de: "Germany",
};

export const ALL_CLASSES: { id: EventClass; label: string }[] = [
  { id: "military_action", label: "Military action" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "civilian_alert", label: "Civilian alerts" },
  { id: "humanitarian", label: "Humanitarian" },
  { id: "cyber", label: "Cyber" },
  { id: "maritime", label: "Maritime" },
  { id: "aviation", label: "Aviation" },
  { id: "environmental", label: "Environmental" },
  { id: "political", label: "Political" },
  { id: "economic", label: "Economic" },
];

export const CLASS_COLOR: Record<EventClass, string> = {
  military_action: "#ef4444",
  infrastructure: "#f59e0b",
  civilian_alert: "#4ea1ff",
  humanitarian: "#22c55e",
  cyber: "#a855f7",
  maritime: "#06b6d4",
  aviation: "#eab308",
  environmental: "#f97316",
  political: "#94a3b8",
  economic: "#94a3b8",
};
