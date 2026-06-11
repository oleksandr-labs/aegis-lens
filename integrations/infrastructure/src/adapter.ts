import {
  InfrastructureDamageEvent,
  InfrastructureCategory,
  DamageSeverity,
  InfrastructureStatus,
  InfrastructureAsset,
} from "./types";

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; category: InfrastructureCategory }> = [
  { keywords: ["power", "energy", "substation", "підстанція", "електро", "теплова", "тпс", "трансформатор"], category: "power" },
  { keywords: ["bridge", "міст", "railway", "залізниця", "вокзал", "road", "автодорога", "highway"], category: "transport" },
  { keywords: ["telecom", "cellular", "tower", "вишка", "зв'язок", "fiber", "internet"], category: "telecom" },
  { keywords: ["water", "водоканал", "waterworks", "pumping station", "насосна"], category: "water" },
  { keywords: ["hospital", "лікарня", "clinic", "поліклініка", "healthcare"], category: "healthcare" },
  { keywords: ["school", "школа", "university", "університет", "education", "навчальний"], category: "education" },
  { keywords: ["residential", "apartment", "будинок", "квартира", "житловий"], category: "residential" },
  { keywords: ["factory", "завод", "warehouse", "склад", "industrial"], category: "industrial" },
  { keywords: ["government", "адміністрація", "мерія", "ратуша", "держ"], category: "government" },
  { keywords: ["museum", "museum", "heritage", "monument", "пам'ятка", "культурна"], category: "cultural" },
];

const SEVERITY_KEYWORDS: Array<{ keywords: string[]; severity: DamageSeverity; status: InfrastructureStatus }> = [
  { keywords: ["destroyed", "зруйновано", "complete destruction", "повністю знищено", "rubble", "повністю"], severity: "destroyed", status: "destroyed" },
  { keywords: ["major", "significant", "серйозно", "важке пошкодження", "major damage"], severity: "major", status: "damaged" },
  { keywords: ["minor", "partial", "часткове", "minor damage", "пошкоджено"], severity: "minor", status: "damaged" },
  { keywords: ["repair", "restored", "відновлено", "відремонтовано", "working again"], severity: "minor", status: "restored" },
];

export function classifyCategory(text: string): InfrastructureCategory {
  const lower = text.toLowerCase();
  for (const { keywords, category } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "residential";
}

export function classifySeverity(text: string): { severity: DamageSeverity; status: InfrastructureStatus } {
  const lower = text.toLowerCase();
  for (const { keywords, severity, status } of SEVERITY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return { severity, status };
  }
  return { severity: "minor", status: "damaged" };
}

export function severityToScore(s: DamageSeverity): 1 | 2 | 3 | 4 | 5 {
  if (s === "destroyed") return 5;
  if (s === "major") return 4;
  return 2;
}

export interface RawDamageReport {
  id: string;
  text: string;
  lat?: number;
  lon?: number;
  timestamp: string;
  sourceId: string;
  sourceUrls?: string[];
  mediaUrls?: string[];
  linkedMissileEventId?: string;
  linkedDroneEventId?: string;
}

export function normaliseReport(raw: RawDamageReport): InfrastructureDamageEvent {
  const category = classifyCategory(raw.text);
  const { severity, status } = classifySeverity(raw.text);
  const severityScore = severityToScore(severity);

  return {
    eventId: raw.id,
    category,
    severity,
    status,
    lat: raw.lat,
    lon: raw.lon,
    occurredAt: raw.timestamp,
    ingestedAt: new Date().toISOString(),
    country: "UA",
    linkedMissileEventId: raw.linkedMissileEventId,
    linkedDroneEventId: raw.linkedDroneEventId,
    titleEn: `Infrastructure damage (${category}): ${severity}`,
    titleUk: `Пошкодження інфраструктури (${category}): ${severity}`,
    summaryEn: raw.text.slice(0, 500),
    mediaUrls: raw.mediaUrls,
    sourceUrls: raw.sourceUrls,
    sourceId: raw.sourceId,
    rawPayload: raw,
    verificationState: "unverified",
    isPublic: false,
    severityScore,
    confidence: 0.5,
  };
}

/** Demo assets. */
export const DEMO_ASSETS: InfrastructureAsset[] = [
  {
    assetId: "asset-kharkiv-power-1",
    name: "Kharkiv TPP (Thermal Power Plant)",
    nameUk: "Харківська ТЕС",
    category: "power",
    lat: 49.95,
    lon: 36.35,
    country: "UA",
    regionCode: "UA-63",
    owner: "state",
    currentStatus: "damaged",
    populationAffected: 450000,
    damageEventIds: ["infra-demo-001"],
    firstDamagedAt: "2022-03-15T06:00:00Z",
    lastUpdatedAt: new Date().toISOString(),
  },
  {
    assetId: "asset-kyiv-bridge-1",
    name: "Irpin River Bridge",
    nameUk: "Міст через р. Ірпінь",
    category: "transport",
    lat: 50.52,
    lon: 30.24,
    country: "UA",
    regionCode: "UA-30",
    owner: "municipal",
    currentStatus: "restored",
    damageEventIds: ["infra-demo-002"],
    firstDamagedAt: "2022-03-28T10:00:00Z",
    lastUpdatedAt: new Date().toISOString(),
  },
];

/** Demo damage events. */
export const DEMO_DAMAGE_EVENTS: InfrastructureDamageEvent[] = [
  {
    eventId: "infra-demo-001",
    assetId: "asset-kharkiv-power-1",
    category: "power",
    severity: "major",
    status: "damaged",
    lat: 49.95,
    lon: 36.35,
    occurredAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    country: "UA",
    regionCode: "UA-63",
    titleEn: "Kharkiv thermal power plant damaged by missile strike",
    titleUk: "Харківська ТЕС пошкоджена внаслідок ракетного удару",
    summaryEn: "A missile strike caused major damage to the Kharkiv thermal power plant, affecting power supply for ~450,000 residents.",
    summaryUk: "Внаслідок ракетного удару Харківська ТЕС отримала значні пошкодження, близько 450 000 мешканців залишилися без електроенергії.",
    linkedMissileEventId: "missile-demo-001",
    sourceId: "telegram_ukraine_energy",
    sourceUrls: ["https://t.me/dtek"],
    verificationState: "verified",
    isPublic: true,
    severityScore: 4,
    confidence: 0.9,
  },
];
