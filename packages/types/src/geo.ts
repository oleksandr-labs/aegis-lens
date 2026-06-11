import type { Locale } from "./locales";

export type Coordinate = {
  lat: number;
  lon: number;
};

export type GeoPoint = Coordinate & {
  /** Precision radius in meters; null if unknown. */
  precisionM: number | null;
};

export type AdminLevel = 0 | 1 | 2 | 3 | 4;

export type Region = {
  id: string;
  countryIso2: string;
  adminLevel: AdminLevel;
  /** Slug per locale; canonical key. */
  slug: string;
  /** Localized display names. */
  name: Partial<Record<Locale, string>> & { en: string };
  /** Parent region id (null for country). */
  parentId: string | null;
};
