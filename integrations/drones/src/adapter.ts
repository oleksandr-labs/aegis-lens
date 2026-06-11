import { DroneEvent, DroneSubtype, DroneModel } from "./types";
import { classifyModel, classifyOperator, classifySubtype, deriveSeverity } from "./classifier";

export interface RawDroneReport {
  id: string;
  text: string;
  lat?: number;
  lon?: number;
  timestamp: string;
  sourceId: string;
  sourceUrls?: string[];
  mediaUrls?: string[];
  missionId?: string;
}

/** Normalise a raw report (e.g. from Telegram, Twitter, community reports) into a DroneEvent. */
export function normaliseReport(raw: RawDroneReport): DroneEvent {
  const model = classifyModel(raw.text);
  const operator = classifyOperator(raw.text);
  const subtype = classifySubtype(raw.text);
  const severity = deriveSeverity(subtype, model?.value);

  return {
    eventId: raw.id,
    subtype,
    lat: raw.lat,
    lon: raw.lon,
    occurredAt: raw.timestamp,
    ingestedAt: new Date().toISOString(),
    model,
    operator,
    country: "UA",
    severity,
    confidence: 0.5, // Base confidence; updated by verification pipeline
    titleEn: `Drone ${subtype}: ${model?.value ?? "unknown model"}`,
    titleUk: `Дрон ${subtype}: ${model?.value ?? "невідома модель"}`,
    summaryEn: raw.text.slice(0, 500),
    mediaUrls: raw.mediaUrls,
    sourceUrls: raw.sourceUrls,
    sourceId: raw.sourceId,
    rawPayload: raw,
    verificationState: "unverified",
    isPublic: false, // Requires verification before public publish
    missionId: raw.missionId,
  };
}

/** Demo events for development / seeding. */
export const DEMO_DRONE_EVENTS: DroneEvent[] = [
  {
    eventId: "drone-demo-001",
    subtype: "sighting",
    lat: 50.45,
    lon: 30.52,
    occurredAt: new Date(Date.now() - 3600_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    model: { value: "shahed_136", confidence: 0.9, sourceCount: 3 },
    operator: { value: "ru_armed_forces", confidence: 0.8, sourceCount: 2 },
    country: "UA",
    regionCode: "UA-30",
    severity: 5,
    confidence: 0.82,
    titleEn: "Shahed-136 sighting over Kyiv Oblast",
    titleUk: "Помічено Shahed-136 над Київською областю",
    summaryEn: "Multiple Shahed-136 loitering munitions reported heading toward Kyiv. Air defence on alert.",
    summaryUk: "Зафіксовано кілька ударних дронів Shahed-136, що рухаються у бік Києва. Оголошено повітряну тривогу.",
    sourceId: "telegram_ukraine_air_force",
    sourceUrls: ["https://t.me/kpszsu"],
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "drone-demo-002",
    subtype: "intercept",
    lat: 50.41,
    lon: 30.67,
    occurredAt: new Date(Date.now() - 1800_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    model: { value: "shahed_136", confidence: 0.9, sourceCount: 3 },
    operator: { value: "ru_armed_forces", confidence: 0.8, sourceCount: 2 },
    interceptSystem: { value: "gepard_spaa", confidence: 0.75, sourceCount: 1 },
    interceptSuccessful: true,
    country: "UA",
    regionCode: "UA-30",
    severity: 2,
    confidence: 0.88,
    titleEn: "Shahed-136 intercepted east of Kyiv",
    titleUk: "Shahed-136 збитий на схід від Києва",
    summaryEn: "Ukrainian air defence successfully intercepted a Shahed-136 east of Kyiv.",
    summaryUk: "Українська ППО збила Shahed-136 на схід від Києва.",
    sourceId: "telegram_ukraine_air_force",
    sourceUrls: ["https://t.me/kpszsu"],
    verificationState: "verified",
    isPublic: true,
    missionId: "mission_demo_01",
  },
  {
    eventId: "drone-demo-003",
    subtype: "swarm",
    lat: 49.99,
    lon: 36.23,
    occurredAt: new Date(Date.now() - 7200_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    model: { value: "shahed_136", confidence: 0.85, sourceCount: 5 },
    operator: { value: "ru_armed_forces", confidence: 0.82, sourceCount: 4 },
    swarmSize: 14,
    country: "UA",
    regionCode: "UA-63",
    severity: 5,
    confidence: 0.85,
    titleEn: "Drone swarm (14 units) targeting Kharkiv",
    titleUk: "Рій дронів (14 одиниць) у напрямку Харкова",
    summaryEn: "Large wave of 14 Shahed-136 drones detected heading toward Kharkiv Oblast.",
    summaryUk: "Зафіксовано масовий удар 14 дронами Shahed-136 у напрямку Харківської області.",
    sourceId: "telegram_ukraine_air_force",
    verificationState: "verified",
    isPublic: true,
  },
];
