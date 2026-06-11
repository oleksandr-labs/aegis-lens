export type RiskLevel = "critical" | "high" | "moderate" | "low" | "minimal";

export type CityRisk = {
  slug: string;
  name: string;
  ukrainianName: string;
  oblast: string;
  lat: number;
  lon: number;
  riskLevel: RiskLevel;
  dangerScore: number; // 0-100
  alertsLast24h: number;
  population: number;
  recommendation: string;
  keyRisks: string[];
  shelterCount: number;
  evacuationStatus: "not_recommended" | "voluntary" | "mandatory" | "completed";
  emergencyContacts: { name: string; number: string }[];
  lastUpdated: string;
};

export const CITY_RISK_DATA: CityRisk[] = [
  {
    slug: "kharkiv",
    name: "Kharkiv",
    ukrainianName: "Харків",
    oblast: "Kharkiv Oblast",
    lat: 49.9935,
    lon: 36.2304,
    riskLevel: "critical",
    dangerScore: 89,
    alertsLast24h: 18,
    population: 1_400_000,
    recommendation:
      "Do not travel. Ongoing missile and drone strikes. If in the city, stay in shelters during alerts.",
    keyRisks: [
      "Frequent air raids",
      "Drone attacks",
      "Artillery within range",
      "Infrastructure outages",
    ],
    shelterCount: 847,
    evacuationStatus: "voluntary",
    emergencyContacts: [
      { name: "Emergency (ДСНС)", number: "101" },
      { name: "Police", number: "102" },
      { name: "City hotline", number: "1559" },
    ],
    lastUpdated: "2026-06-03",
  },
  {
    slug: "kyiv",
    name: "Kyiv",
    ukrainianName: "Київ",
    oblast: "Kyiv",
    lat: 50.4501,
    lon: 30.5234,
    riskLevel: "moderate",
    dangerScore: 52,
    alertsLast24h: 4,
    population: 2_900_000,
    recommendation:
      "Travel with caution. Air raid alerts occur. Have a shelter plan and follow official guidance.",
    keyRisks: ["Drone interceptions", "Periodic missile alerts", "Power outages"],
    shelterCount: 5847,
    evacuationStatus: "not_recommended",
    emergencyContacts: [
      { name: "Emergency", number: "101" },
      { name: "Police", number: "102" },
    ],
    lastUpdated: "2026-06-03",
  },
  {
    slug: "lviv",
    name: "Lviv",
    ukrainianName: "Львів",
    oblast: "Lviv Oblast",
    lat: 49.8397,
    lon: 24.0297,
    riskLevel: "low",
    dangerScore: 22,
    alertsLast24h: 1,
    population: 717_000,
    recommendation:
      "Exercise normal caution. Occasional air raid alerts. Major infrastructure intact.",
    keyRisks: ["Occasional air alerts", "Refugee pressure on services"],
    shelterCount: 1240,
    evacuationStatus: "not_recommended",
    emergencyContacts: [{ name: "Emergency", number: "101" }],
    lastUpdated: "2026-06-03",
  },
  {
    slug: "odesa",
    name: "Odesa",
    ukrainianName: "Одеса",
    oblast: "Odesa Oblast",
    lat: 46.4825,
    lon: 30.7233,
    riskLevel: "high",
    dangerScore: 71,
    alertsLast24h: 7,
    population: 1_017_000,
    recommendation:
      "Non-essential travel strongly discouraged. Port area particularly risky. Drone and missile attacks occur.",
    keyRisks: ["Drone attacks on port", "Missile strikes", "Maritime risk"],
    shelterCount: 1089,
    evacuationStatus: "voluntary",
    emergencyContacts: [
      { name: "Emergency", number: "101" },
      { name: "City hall", number: "048-777-7777" },
    ],
    lastUpdated: "2026-06-03",
  },
  {
    slug: "dnipro",
    name: "Dnipro",
    ukrainianName: "Дніпро",
    oblast: "Dnipropetrovsk Oblast",
    lat: 48.4647,
    lon: 35.0462,
    riskLevel: "high",
    dangerScore: 68,
    alertsLast24h: 6,
    population: 1_002_000,
    recommendation:
      "Non-essential travel not recommended. Regular missile and drone alerts. Industrial areas at higher risk.",
    keyRisks: ["Missile strikes", "Drone attacks", "Industrial targeting"],
    shelterCount: 1432,
    evacuationStatus: "not_recommended",
    emergencyContacts: [{ name: "Emergency", number: "101" }],
    lastUpdated: "2026-06-03",
  },
];

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  moderate: "#eab308",
  low: "#22c55e",
  minimal: "#6b7280",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: "Critical — Do not travel",
  high: "High — Non-essential travel discouraged",
  moderate: "Moderate — Travel with caution",
  low: "Low — Normal precautions",
  minimal: "Minimal",
};

/** Tailwind class sets keyed by risk level, matching the pattern in safety/[region]/page.tsx */
export const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; bg: string; border: string; label: string }
> = {
  critical: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    label: "Critical",
  },
  high: {
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    label: "High",
  },
  moderate: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    label: "Moderate",
  },
  low: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    label: "Low",
  },
  minimal: {
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    label: "Minimal",
  },
};

export const EVACUATION_LABELS: Record<CityRisk["evacuationStatus"], string> = {
  not_recommended: "No evacuation order",
  voluntary: "Voluntary evacuation",
  mandatory: "Mandatory evacuation",
  completed: "Evacuation completed",
};
