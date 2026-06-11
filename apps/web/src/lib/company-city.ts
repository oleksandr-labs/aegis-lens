import { COMPANIES, type DirectoryEntry } from "@/lib/directory-seed";

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listCompanyCitySlugs(): string[] {
  const set = new Set<string>();
  for (const c of COMPANIES) {
    if (c.city) set.add(cityToSlug(c.city));
  }
  return [...set];
}

export function companiesInCity(citySlug: string): DirectoryEntry[] {
  return COMPANIES.filter((c) => c.city && cityToSlug(c.city) === citySlug);
}

export function cityDisplay(citySlug: string): string {
  const sample = COMPANIES.find((c) => c.city && cityToSlug(c.city) === citySlug);
  return sample?.city ?? citySlug;
}

/**
 * Industry × city pairs that exist in the directory (both have ≥1 company).
 * Returned as `{industrySlug, citySlug}` for static-params generation.
 */
export function listIndustryCityPairs(): { industrySlug: string; citySlug: string }[] {
  const set = new Set<string>();
  const out: { industrySlug: string; citySlug: string }[] = [];
  for (const c of COMPANIES) {
    if (!c.city) continue;
    const indSlug = c.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cSlug = cityToSlug(c.city);
    const key = `${indSlug}|${cSlug}`;
    if (set.has(key)) continue;
    set.add(key);
    out.push({ industrySlug: indSlug, citySlug: cSlug });
  }
  return out;
}

export function companiesInIndustryAndCity(
  industrySlug: string,
  citySlug: string,
): DirectoryEntry[] {
  return COMPANIES.filter((c) => {
    if (!c.city) return false;
    const indSlug = c.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return indSlug === industrySlug && cityToSlug(c.city) === citySlug;
  });
}

/**
 * Coarse HQ-city coordinates for radius search. Lon/Lat WGS-84.
 * Values are city-center approximations — fine for the directory's
 * grouping use-case (we're not doing logistics routing).
 */
export const CITY_COORDS: Record<string, [number, number]> = {
  // Already-cataloged HQ cities.
  amsterdam: [4.8952, 52.3702],
  arlington: [-77.0911, 38.8799],
  austin: [-97.7431, 30.2672],
  bethesda: [-77.1059, 38.9847],
  boston: [-71.0589, 42.3601],
  "costa-mesa": [-117.9187, 33.6411],
  denver: [-104.9903, 39.7392],
  dusseldorf: [6.7735, 51.2277],
  "falls-church": [-77.1711, 38.8823],
  herndon: [-77.3861, 38.9695],
  kyiv: [30.5234, 50.4501],
  london: [-0.1276, 51.5074],
  munich: [11.582, 48.1351],
  redmond: [-122.1215, 47.674],
  reston: [-77.3411, 38.9586],
  "san-francisco": [-122.4194, 37.7749],
  stockholm: [18.0686, 59.3293],
  washington: [-77.0369, 38.9072],
  westminster: [-105.0372, 39.8367],
  zaporizhzhia: [35.1396, 47.8388],
  // Anticipated HQ cities (common defense / OSINT / cyber hubs). Pre-seeding
  // so future directory additions get distance-aware UX automatically.
  berlin: [13.405, 52.52],
  paris: [2.3522, 48.8566],
  tallinn: [24.7536, 59.437],
  warsaw: [21.0122, 52.2297],
  vilnius: [25.2797, 54.6872],
  prague: [14.4378, 50.0755],
  vienna: [16.3738, 48.2082],
  helsinki: [24.9384, 60.1699],
  oslo: [10.7522, 59.9139],
  copenhagen: [12.5683, 55.6761],
  brussels: [4.3517, 50.8503],
  "the-hague": [4.3007, 52.0705],
  zurich: [8.5417, 47.3769],
  geneva: [6.1432, 46.2044],
  rome: [12.4964, 41.9028],
  milan: [9.19, 45.4642],
  madrid: [-3.7038, 40.4168],
  lisbon: [-9.1393, 38.7223],
  dublin: [-6.2603, 53.3498],
  tel_aviv: [34.7818, 32.0853],
  "tel-aviv": [34.7818, 32.0853],
  ankara: [32.8597, 39.9334],
  istanbul: [28.9784, 41.0082],
  ottawa: [-75.6972, 45.4215],
  toronto: [-79.3832, 43.6532],
  "new-york": [-74.006, 40.7128],
  chicago: [-87.6298, 41.8781],
  seattle: [-122.3321, 47.6062],
  "los-angeles": [-118.2437, 34.0522],
  "san-diego": [-117.1611, 32.7157],
  "palo-alto": [-122.1430, 37.4419],
  "mountain-view": [-122.0838, 37.3861],
  cambridge: [-71.1097, 42.3736],
  "tysons-corner": [-77.2311, 38.9187],
  mclean: [-77.1781, 38.9339],
  tokyo: [139.6917, 35.6895],
  singapore: [103.8198, 1.3521],
  seoul: [126.978, 37.5665],
  canberra: [149.1300, -35.2809],
  sydney: [151.2093, -33.8688],
  lviv: [24.0297, 49.8397],
  kharkiv: [36.2304, 49.9935],
  odesa: [30.7233, 46.4825],
  dnipro: [35.0462, 48.4647],
};

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [aLon, aLat] = a;
  const [bLon, bLat] = b;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function citiesWithinKm(
  centerSlug: string,
  radiusKm: number,
): { citySlug: string; distanceKm: number }[] {
  const center = CITY_COORDS[centerSlug];
  if (!center) return [];
  const out: { citySlug: string; distanceKm: number }[] = [];
  for (const slug of listCompanyCitySlugs()) {
    if (slug === centerSlug) continue;
    const coords = CITY_COORDS[slug];
    if (!coords) continue;
    const d = haversineKm(center, coords);
    if (d <= radiusKm) out.push({ citySlug: slug, distanceKm: d });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}

export function companiesWithinKm(
  centerSlug: string,
  radiusKm: number,
): { company: DirectoryEntry; citySlug: string; distanceKm: number }[] {
  const center = CITY_COORDS[centerSlug];
  if (!center) return [];
  const out: { company: DirectoryEntry; citySlug: string; distanceKm: number }[] = [];
  for (const c of COMPANIES) {
    if (!c.city) continue;
    const slug = cityToSlug(c.city);
    if (slug === centerSlug) continue;
    const coords = CITY_COORDS[slug];
    if (!coords) continue;
    const d = haversineKm(center, coords);
    if (d <= radiusKm) out.push({ company: c, citySlug: slug, distanceKm: d });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}
