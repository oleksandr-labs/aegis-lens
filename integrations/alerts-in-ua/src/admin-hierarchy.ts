/**
 * Map alerts.in.ua location IDs → the UA admin hierarchy (task 9):
 *   oblast → raion → hromada
 *
 * alerts.in.ua identifies locations by a `location_uid` and `location_type`.
 * The platform's canonical geo key is the ISO-3166-2 oblast code (shared with
 * @ua-map/civilian-alerts via OBLASTS) plus KATOTTG codes for finer levels.
 *
 * This module provides:
 *   - a small seed map of known oblast uids → ISO codes (alerts.in.ua uses
 *     stable small integers for oblasts);
 *   - a generic resolver that walks an AlertLocation up to its oblast, returning
 *     a typed AdminPath the adapter can attach as regionCode + hierarchy meta.
 *
 * KATOTTG (Кодифікатор адміністративно-територіальних одиниць) is the official
 * UA codifier; raion/hromada codes are passed through as-is when present.
 */

import type { AlertLocation, OblastCode, LocationKind } from "./types";
import { OBLASTS } from "./types";

/** alerts.in.ua oblast `location_uid` → ISO-3166-2 oblast code. */
export const ALERTS_IN_UA_OBLAST_UID: Record<string, OblastCode> = {
  "1": "UA-71",  // Cherkasy
  "2": "UA-74",  // Chernihiv
  "3": "UA-77",  // Chernivtsi
  "4": "UA-09",  // Luhansk
  "5": "UA-12",  // Dnipropetrovsk
  "8": "UA-26",  // Ivano-Frankivsk
  "9": "UA-12",  // Dnipropetrovsk (alt)
  "10": "UA-32", // Kyiv oblast
  "11": "UA-35", // Kirovohrad
  "12": "UA-46", // Lviv
  "13": "UA-48", // Mykolaiv
  "14": "UA-51", // Odesa
  "15": "UA-53", // Poltava
  "16": "UA-56", // Rivne
  "17": "UA-59", // Sumy
  "18": "UA-61", // Ternopil
  "19": "UA-63", // Kharkiv
  "20": "UA-65", // Kherson
  "21": "UA-68", // Khmelnytskyi
  "22": "UA-71", // Cherkasy (alt)
  "23": "UA-05", // Vinnytsia
  "24": "UA-07", // Volyn
  "25": "UA-21", // Zakarpattia
  "26": "UA-18", // Zhytomyr
  "27": "UA-23", // Zaporizhzhia
  "28": "UA-43", // Crimea
  "29": "UA-14", // Donetsk
  "30": "UA-40", // Sevastopol
  "31": "UA-63", // Kharkiv (alt)
};

export interface AdminPath {
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  raionCode?: string;
  raionNameUk?: string;
  hromadaCode?: string;
  hromadaNameUk?: string;
  /** Deepest resolved level. */
  level: LocationKind;
  /** WGS-84 centroid [lon, lat] if known (oblast-level fallback). */
  center?: [number, number];
}

/** Resolve an oblast code from a raw alerts.in.ua oblast uid. */
export function oblastFromUid(uid: string): OblastCode | null {
  return ALERTS_IN_UA_OBLAST_UID[uid] ?? null;
}

/** Build a typed AdminPath from a normalized AlertLocation. */
export function resolveAdminPath(loc: AlertLocation): AdminPath {
  const info = OBLASTS[loc.oblastCode];
  return {
    oblastCode: loc.oblastCode,
    oblastNameUk: info?.nameUk ?? loc.oblastCode,
    oblastNameEn: info?.nameEn ?? loc.oblastCode,
    raionCode: loc.raionCode,
    raionNameUk: loc.kind === "raion" ? loc.nameUk : undefined,
    hromadaCode: loc.hromadaCode,
    hromadaNameUk: loc.kind === "hromada" ? loc.nameUk : undefined,
    level: loc.kind,
    center: loc.center ?? info?.center,
  };
}
