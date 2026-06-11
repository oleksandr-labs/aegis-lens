import { MissileEvent } from "./types";
import { classifyModel, classifySubtype, classifyTarget, classifySubstatus, deriveSeverity } from "./classifier";

export interface RawMissileReport {
  id: string;
  text: string;
  lat?: number;
  lon?: number;
  launchLat?: number;
  launchLon?: number;
  timestamp: string;
  sourceId: string;
  sourceUrls?: string[];
  mediaUrls?: string[];
  salvoId?: string;
}

export function normaliseReport(raw: RawMissileReport): MissileEvent {
  const model = classifyModel(raw.text);
  const subtype = classifySubtype(raw.text);
  const substatus = classifySubstatus(raw.text);
  const targetType = classifyTarget(raw.text);
  const severity = deriveSeverity(subtype, substatus, model?.value);

  return {
    eventId: raw.id,
    subtype,
    substatus,
    model,
    lat: raw.lat,
    lon: raw.lon,
    launchLat: raw.launchLat,
    launchLon: raw.launchLon,
    targetType,
    occurredAt: raw.timestamp,
    ingestedAt: new Date().toISOString(),
    country: "UA",
    severity,
    confidence: 0.5,
    titleEn: `Missile ${substatus}: ${model?.value ?? "unknown"} (${subtype})`,
    titleUk: `Ракета ${substatus}: ${model?.value ?? "невідома"} (${subtype})`,
    summaryEn: raw.text.slice(0, 500),
    mediaUrls: raw.mediaUrls,
    sourceUrls: raw.sourceUrls,
    sourceId: raw.sourceId,
    rawPayload: raw,
    salvoId: raw.salvoId,
    verificationState: "unverified",
    isPublic: false,
  };
}

/** Demo events for development. */
export const DEMO_MISSILE_EVENTS: MissileEvent[] = [
  {
    eventId: "missile-demo-001",
    subtype: "cruise",
    substatus: "impact",
    model: { value: "kh_101", confidence: 0.88, sourceCount: 4 },
    lat: 49.84,
    lon: 24.02,
    targetType: { value: "energy_infrastructure", confidence: 0.85 },
    occurredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    country: "UA",
    regionCode: "UA-46",
    severity: 5,
    confidence: 0.88,
    titleEn: "Kh-101 cruise missile impact on energy infrastructure, Lviv Oblast",
    titleUk: "Удар крилатою ракетою Kh-101 по об'єкту енергетичної інфраструктури, Львівська область",
    summaryEn: "A Kh-101 cruise missile struck an energy substation in Lviv Oblast, causing regional power outages.",
    summaryUk: "Крилата ракета Kh-101 вразила енергопідстанцію в Львівській області, спричинивши відключення електроенергії.",
    sourceId: "telegram_ukraine_air_force",
    sourceUrls: ["https://t.me/kpszsu"],
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "missile-demo-002",
    subtype: "hypersonic",
    substatus: "impact",
    model: { value: "kh_47_kinzhal", confidence: 0.95, sourceCount: 6 },
    lat: 50.45,
    lon: 30.52,
    targetType: { value: "military_base", confidence: 0.8 },
    occurredAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    country: "UA",
    regionCode: "UA-30",
    severity: 5,
    confidence: 0.92,
    titleEn: "Kinzhal hypersonic missile strike on Kyiv",
    titleUk: "Удар гіперзвуковою ракетою «Кинджал» по Києву",
    summaryEn: "Kh-47 Kinzhal hypersonic missile struck infrastructure in Kyiv. Air defence was unable to intercept.",
    summaryUk: "Гіперзвукова ракета Х-47 «Кинджал» вразила інфраструктуру Києва. Перехопити не вдалося.",
    sourceId: "telegram_ukraine_air_force",
    verificationState: "verified",
    isPublic: true,
    salvoId: "salvo-demo-01",
  },
  {
    eventId: "missile-demo-003",
    subtype: "ballistic",
    substatus: "intercepted",
    model: { value: "iskander_m", confidence: 0.87, sourceCount: 3 },
    lat: 49.99,
    lon: 36.23,
    intercepted: true,
    interceptSystem: "patriot",
    occurredAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    ingestedAt: new Date().toISOString(),
    country: "UA",
    regionCode: "UA-63",
    severity: 2,
    confidence: 0.85,
    titleEn: "Iskander-M ballistic missile intercepted over Kharkiv",
    titleUk: "Балістична ракета «Іскандер-М» збита над Харковом",
    summaryEn: "Ukrainian Patriot battery intercepted an Iskander-M ballistic missile heading toward Kharkiv.",
    summaryUk: "Українська батарея Patriot збила балістичну ракету «Іскандер-М», що летіла у бік Харкова.",
    sourceId: "telegram_ukraine_air_force",
    verificationState: "verified",
    isPublic: true,
  },
];
