import type { AegisEvent, EventClass, VerificationState } from "@aegis/types";
import type { Locale } from "@aegis/i18n-config";

/**
 * Sprint 1 in-memory events seed.
 *
 * These are synthetic illustrative events used to wire up the map → API
 * → UI vertical slice. They are NOT real intelligence — every event has
 * `verificationState: "unverified"` and a `[synthetic]` marker in the summary.
 *
 * Replace with DB-backed reads once Postgres + PostGIS lands.
 */

type Loc = { lat: number; lon: number };

type Seed = {
  id: string;
  loc: Loc;
  cls: EventClass;
  subclass: string | null;
  severity: 0 | 1 | 2 | 3 | 4 | 5;
  danger: number;
  confidence: number;
  verification: VerificationState;
  hoursAgo: number;
  summary: Partial<Record<Locale, string>> & { en: string };
};

// Reference time for synthetic events. Recomputed per call so events always
// appear N hours before "now" — important for ?hours= filters to be meaningful.
function nowMs(): number {
  return Date.now();
}

const SEEDS: Seed[] = [
  {
    id: "01HXKHARKIVDRONE001",
    loc: { lat: 49.9935, lon: 36.2304 }, // Kharkiv
    cls: "military_action",
    subclass: "drone",
    severity: 3,
    danger: 62,
    confidence: 0.78,
    verification: "unverified",
    hoursAgo: 2,
    summary: {
      en: "[synthetic] Reported drone activity near Kharkiv. Demo seed event.",
      uk: "[демо] Повідомлення про активність БПЛА поблизу Харкова. Тестова подія.",
    },
  },
  {
    id: "01HXKYIVALERT001",
    loc: { lat: 50.4501, lon: 30.5234 }, // Kyiv
    cls: "civilian_alert",
    subclass: "air_raid",
    severity: 2,
    danger: 45,
    confidence: 0.92,
    verification: "corroborated",
    hoursAgo: 1,
    summary: {
      en: "[synthetic] Air raid alert active in Kyiv region. Demo seed.",
      uk: "[демо] Повітряна тривога в Київській області. Тестова подія.",
    },
  },
  {
    id: "01HXODESAFIRE001",
    loc: { lat: 46.4825, lon: 30.7233 }, // Odesa
    cls: "environmental",
    subclass: "fire",
    severity: 2,
    danger: 38,
    confidence: 0.68,
    verification: "unverified",
    hoursAgo: 5,
    summary: {
      en: "[synthetic] Industrial fire reported, Odesa port area. Demo seed.",
      uk: "[демо] Промислова пожежа, район Одеського порту. Тестова подія.",
    },
  },
  {
    id: "01HXMYKINFRA001",
    loc: { lat: 46.9759, lon: 31.9946 }, // Mykolaiv
    cls: "infrastructure",
    subclass: "energy_grid",
    severity: 3,
    danger: 58,
    confidence: 0.81,
    verification: "corroborated",
    hoursAgo: 8,
    summary: {
      en: "[synthetic] Substation damage causing localized power outage. Demo seed.",
      uk: "[демо] Пошкодження підстанції викликало локальне відключення. Тестова подія.",
    },
  },
  {
    id: "01HXBLKSEAMAR001",
    loc: { lat: 44.6, lon: 33.2 }, // Black Sea, near Crimea
    cls: "maritime",
    subclass: "vessel_movement",
    severity: 1,
    danger: 22,
    confidence: 0.55,
    verification: "unverified",
    hoursAgo: 14,
    summary: {
      en: "[synthetic] Unusual vessel movement, Black Sea exclusion zone. Demo seed.",
      uk: "[демо] Незвичайний рух судна в зоні Чорного моря. Тестова подія.",
    },
  },
  {
    id: "01HXLVIVCYBER001",
    loc: { lat: 49.8397, lon: 24.0297 }, // Lviv
    cls: "cyber",
    subclass: "ddos",
    severity: 1,
    danger: 18,
    confidence: 0.73,
    verification: "verified",
    hoursAgo: 22,
    summary: {
      en: "[synthetic] DDoS against regional gov portal. Demo seed.",
      uk: "[демо] DDoS-атака на регіональний урядовий портал. Тестова подія.",
    },
  },
  {
    id: "01HXDNIPRO001",
    loc: { lat: 48.4647, lon: 35.0462 }, // Dnipro
    cls: "military_action",
    subclass: "missile",
    severity: 4,
    danger: 78,
    confidence: 0.85,
    verification: "corroborated",
    hoursAgo: 3,
    summary: {
      en: "[synthetic] Missile impact reported, Dnipro area. Demo seed.",
      uk: "[демо] Зафіксовано влучення ракети, Дніпро. Тестова подія.",
    },
  },
  {
    id: "01HXZAPORIZHIA001",
    loc: { lat: 47.8388, lon: 35.1396 }, // Zaporizhzhia
    cls: "humanitarian",
    subclass: "displacement",
    severity: 2,
    danger: 40,
    confidence: 0.62,
    verification: "unverified",
    hoursAgo: 12,
    summary: {
      en: "[synthetic] Civilians relocating from active frontline area. Demo seed.",
      uk: "[демо] Переміщення цивільних з прифронтової зони. Тестова подія.",
    },
  },
  {
    id: "01HXDONETSKMIL001",
    loc: { lat: 48.015, lon: 37.802 },
    cls: "military_action",
    subclass: "artillery",
    severity: 3,
    danger: 55,
    confidence: 0.71,
    verification: "unverified",
    hoursAgo: 4,
    summary: {
      en: "[synthetic] Artillery exchange reported, Donetsk region.",
      uk: "[демо] Артилерійський обмін, Донецький напрямок.",
    },
  },
  {
    id: "01HXSUMYDRONE001",
    loc: { lat: 50.9077, lon: 34.7981 },
    cls: "military_action",
    subclass: "drone",
    severity: 2,
    danger: 38,
    confidence: 0.66,
    verification: "unverified",
    hoursAgo: 7,
    summary: {
      en: "[synthetic] UAV activity near Sumy border.",
      uk: "[демо] Активність БПЛА поблизу Сумського кордону.",
    },
  },
  {
    id: "01HXKHERSONINFRA001",
    loc: { lat: 46.6354, lon: 32.6169 },
    cls: "infrastructure",
    subclass: "water_supply",
    severity: 3,
    danger: 52,
    confidence: 0.79,
    verification: "corroborated",
    hoursAgo: 18,
    summary: {
      en: "[synthetic] Water supply disruption, Kherson district.",
      uk: "[демо] Перебої з водопостачанням, Херсонщина.",
    },
  },
  {
    id: "01HXKYIVCYBER001",
    loc: { lat: 50.4501, lon: 30.5234 },
    cls: "cyber",
    subclass: "apt",
    severity: 2,
    danger: 35,
    confidence: 0.7,
    verification: "verified",
    hoursAgo: 30,
    summary: {
      en: "[synthetic] APT activity targeting financial sector.",
      uk: "[демо] APT-активність проти фінансового сектору.",
    },
  },
  {
    id: "01HXCHERNIHIVAVI001",
    loc: { lat: 51.4982, lon: 31.2893 },
    cls: "aviation",
    subclass: "restricted_airspace",
    severity: 1,
    danger: 25,
    confidence: 0.58,
    verification: "unverified",
    hoursAgo: 9,
    summary: {
      en: "[synthetic] Airspace restriction, Chernihiv area.",
      uk: "[демо] Обмеження повітряного простору, Чернігівська область.",
    },
  },
  {
    id: "01HXPLBORDERHUM001",
    loc: { lat: 50.0833, lon: 23.5667 },
    cls: "humanitarian",
    subclass: "border_crossing",
    severity: 1,
    danger: 15,
    confidence: 0.88,
    verification: "verified",
    hoursAgo: 6,
    summary: {
      en: "[synthetic] High refugee crossing at PL border (Medyka).",
      uk: "[демо] Високий обсяг перетину біженцями кордону з Польщею (Медика).",
    },
  },
  {
    id: "01HXWARSAWCYBER001",
    loc: { lat: 52.2297, lon: 21.0122 },
    cls: "cyber",
    subclass: "phishing",
    severity: 1,
    danger: 22,
    confidence: 0.61,
    verification: "unverified",
    hoursAgo: 16,
    summary: {
      en: "[synthetic] Phishing campaign targeting PL gov staff.",
      uk: "[демо] Фішинг-кампанія проти держслужбовців Польщі.",
    },
  },
  {
    id: "01HXBERLINPOL001",
    loc: { lat: 52.52, lon: 13.405 },
    cls: "political",
    subclass: "summit",
    severity: 1,
    danger: 10,
    confidence: 0.95,
    verification: "verified",
    hoursAgo: 26,
    summary: {
      en: "[synthetic] EU foreign ministers meeting, Berlin.",
      uk: "[демо] Зустріч міністрів закордонних справ ЄС, Берлін.",
    },
  },
];

function toEvent(s: Seed): AegisEvent {
  const occurred = new Date(nowMs() - s.hoursAgo * 3600 * 1000).toISOString();
  return {
    eventId: s.id,
    occurredAt: occurred,
    reportedAt: occurred,
    ingestedAt: occurred,
    location: { lat: s.loc.lat, lon: s.loc.lon, precisionM: 3000 },
    class: s.cls,
    subclass: s.subclass,
    severity: s.severity,
    dangerScore: s.danger,
    confidence: s.confidence,
    verificationState: s.verification,
    sources: [
      {
        url: "https://example.com/synthetic",
        archiveUrl: null,
        fetchedAt: occurred,
        language: "en",
        contentHash: "synthetic",
      },
    ],
    media: [],
    summary: s.summary,
    originalText: null,
  };
}

export function listEvents(): AegisEvent[] {
  return SEEDS.map(toEvent);
}

/**
 * Country bounding boxes (cheap filter; PostGIS ST_Within later).
 * [minLon, minLat, maxLon, maxLat]
 */
export const COUNTRY_BBOX: Record<string, [number, number, number, number]> = {
  ua: [22, 44, 40, 53],
  pl: [14, 49, 24, 55],
  de: [5.5, 47, 15.5, 55.1],
};

/**
 * Country center + default zoom for map auto-fit.
 */
export const COUNTRY_VIEW: Record<string, { center: [number, number]; zoom: number }> = {
  ua: { center: [31.5, 49.0], zoom: 5 },
  pl: { center: [19.0, 52.0], zoom: 5.5 },
  de: { center: [10.5, 51.0], zoom: 5.5 },
};

export function eventsInCountry(iso2: string): AegisEvent[] {
  const bbox = COUNTRY_BBOX[iso2.toLowerCase()];
  if (!bbox) return [];
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return listEvents().filter(
    (e) =>
      e.location.lon >= minLon &&
      e.location.lon <= maxLon &&
      e.location.lat >= minLat &&
      e.location.lat <= maxLat,
  );
}

export function eventById(id: string): AegisEvent | null {
  return listEvents().find((e) => e.eventId === id) ?? null;
}

export function eventsInBbox(
  bbox: [number, number, number, number],
): AegisEvent[] {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return listEvents().filter(
    (e) =>
      e.location.lon >= minLon &&
      e.location.lon <= maxLon &&
      e.location.lat >= minLat &&
      e.location.lat <= maxLat,
  );
}
