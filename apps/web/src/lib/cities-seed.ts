import type { Locale } from "@aegis/i18n-config";

/**
 * Admin-2 (cities) seed — hierarchical under admin-1 oblasts.
 * URL: /regions/<iso2>/<oblast-slug>/<city-slug>
 */
export type CitySeed = {
  iso2: "ua" | "pl" | "de";
  /** Slug of the parent admin-1 (oblast / voivodeship / Bundesland). */
  oblastSlug: string;
  slug: string;
  name: Partial<Record<Locale, string>> & { en: string };
  /** [lon, lat] */
  center: [number, number];
  /** Population — used for SEO ranking + display. */
  population?: number;
  /** True if this is the oblast capital. */
  capital?: boolean;
};

export const CITIES: CitySeed[] = [
  // ---------- UA ----------
  { iso2: "ua", oblastSlug: "kyiv-city",            slug: "kyiv",         name: { en: "Kyiv",         uk: "Київ" },         center: [30.52, 50.45], population: 2952301, capital: true },
  { iso2: "ua", oblastSlug: "kharkiv-oblast",       slug: "kharkiv",      name: { en: "Kharkiv",      uk: "Харків" },       center: [36.23, 49.99], population: 1421125, capital: true },
  { iso2: "ua", oblastSlug: "odesa-oblast",         slug: "odesa",        name: { en: "Odesa",        uk: "Одеса" },        center: [30.72, 46.48], population: 1010537, capital: true },
  { iso2: "ua", oblastSlug: "dnipropetrovsk-oblast", slug: "dnipro",      name: { en: "Dnipro",       uk: "Дніпро" },       center: [35.05, 48.46], population: 968502,  capital: true },
  { iso2: "ua", oblastSlug: "lviv-oblast",          slug: "lviv",         name: { en: "Lviv",         uk: "Львів" },        center: [24.03, 49.84], population: 717273,  capital: true },
  { iso2: "ua", oblastSlug: "zaporizhzhia-oblast",  slug: "zaporizhzhia", name: { en: "Zaporizhzhia", uk: "Запоріжжя" },    center: [35.14, 47.84], population: 710052,  capital: true },
  { iso2: "ua", oblastSlug: "mykolaiv-oblast",      slug: "mykolaiv",     name: { en: "Mykolaiv",     uk: "Миколаїв" },     center: [31.99, 46.98], population: 470000,  capital: true },
  { iso2: "ua", oblastSlug: "kherson-oblast",       slug: "kherson",      name: { en: "Kherson",      uk: "Херсон" },       center: [32.62, 46.64], population: 283649,  capital: true },
  { iso2: "ua", oblastSlug: "sumy-oblast",          slug: "sumy",         name: { en: "Sumy",         uk: "Суми" },         center: [34.80, 50.91], population: 256804,  capital: true },
  { iso2: "ua", oblastSlug: "chernihiv-oblast",     slug: "chernihiv",    name: { en: "Chernihiv",    uk: "Чернігів" },     center: [31.29, 51.50], population: 285234,  capital: true },

  // ---------- PL ----------
  { iso2: "pl", oblastSlug: "mazowieckie",   slug: "warsaw",  name: { en: "Warsaw",  pl: "Warszawa" }, center: [21.01, 52.23], population: 1860281, capital: true },
  { iso2: "pl", oblastSlug: "malopolskie",   slug: "krakow",  name: { en: "Kraków",  pl: "Kraków" },   center: [19.94, 50.06], population: 779966,  capital: true },
  { iso2: "pl", oblastSlug: "lodzkie",       slug: "lodz",    name: { en: "Łódź",    pl: "Łódź" },     center: [19.45, 51.77], population: 664000,  capital: true },
  { iso2: "pl", oblastSlug: "wielkopolskie", slug: "poznan",  name: { en: "Poznań",  pl: "Poznań" },   center: [16.93, 52.41], population: 540635,  capital: true },
  { iso2: "pl", oblastSlug: "pomorskie",     slug: "gdansk",  name: { en: "Gdańsk",  pl: "Gdańsk" },   center: [18.65, 54.35], population: 470907,  capital: true },

  // ---------- DE ----------
  { iso2: "de", oblastSlug: "berlin",              slug: "berlin",  name: { en: "Berlin",  de: "Berlin" },  center: [13.405, 52.52], population: 3850000, capital: true },
  { iso2: "de", oblastSlug: "bayern",              slug: "munich",  name: { en: "Munich",  de: "München" }, center: [11.575, 48.137], population: 1488000, capital: true },
  { iso2: "de", oblastSlug: "hamburg",             slug: "hamburg", name: { en: "Hamburg", de: "Hamburg" }, center: [10.0, 53.55],   population: 1899000, capital: true },
  { iso2: "de", oblastSlug: "nordrhein-westfalen", slug: "cologne", name: { en: "Cologne", de: "Köln" },    center: [6.96, 50.94],   population: 1086000 },
  { iso2: "de", oblastSlug: "hessen",              slug: "frankfurt", name: { en: "Frankfurt", de: "Frankfurt am Main" }, center: [8.682, 50.111], population: 753000 },

  // ---------- UA ----------
  { iso2: "ua", oblastSlug: "donetsk-oblast",         slug: "mariupol",         name: { en: "Mariupol",         uk: "Маріуполь" },        center: [37.55, 47.10], population: 431859 },
  { iso2: "ua", oblastSlug: "dnipropetrovsk-oblast",  slug: "kryvyi-rih",       name: { en: "Kryvyi Rih",       uk: "Кривий Ріг" },       center: [33.39, 47.91], population: 612750 },
  { iso2: "ua", oblastSlug: "vinnytsia-oblast",       slug: "vinnytsia",        name: { en: "Vinnytsia",        uk: "Вінниця" },          center: [28.48, 49.23], population: 369839, capital: true },
  { iso2: "ua", oblastSlug: "poltava-oblast",         slug: "poltava",          name: { en: "Poltava",          uk: "Полтава" },          center: [34.55, 49.59], population: 282318, capital: true },
  { iso2: "ua", oblastSlug: "ivano-frankivsk-oblast", slug: "ivano-frankivsk",  name: { en: "Ivano-Frankivsk",  uk: "Івано-Франківськ" }, center: [24.71, 48.92], population: 238196, capital: true },

  // ---------- PL ----------
  { iso2: "pl", oblastSlug: "dolnoslaskie",       slug: "wroclaw",   name: { en: "Wrocław",   pl: "Wrocław" },   center: [17.04, 51.11], population: 674312, capital: true },
  { iso2: "pl", oblastSlug: "slaskie",            slug: "katowice",  name: { en: "Katowice",  pl: "Katowice" },  center: [19.02, 50.26], population: 286960, capital: true },
  { iso2: "pl", oblastSlug: "lubelskie",          slug: "lublin",    name: { en: "Lublin",    pl: "Lublin" },    center: [22.57, 51.25], population: 334681, capital: true },
  { iso2: "pl", oblastSlug: "podlaskie",          slug: "bialystok", name: { en: "Białystok", pl: "Białystok" }, center: [23.16, 53.13], population: 294143, capital: true },
  { iso2: "pl", oblastSlug: "zachodniopomorskie", slug: "szczecin",  name: { en: "Szczecin",  pl: "Szczecin" },  center: [14.55, 53.43], population: 396168, capital: true },

  // ---------- DE ----------
  { iso2: "de", oblastSlug: "baden-wuerttemberg",  slug: "stuttgart",  name: { en: "Stuttgart",  de: "Stuttgart" },  center: [9.182, 48.775],  population: 626275, capital: true },
  { iso2: "de", oblastSlug: "nordrhein-westfalen", slug: "duesseldorf", name: { en: "Düsseldorf", de: "Düsseldorf" }, center: [6.776, 51.227], population: 619294, capital: true },
  { iso2: "de", oblastSlug: "sachsen",             slug: "leipzig",    name: { en: "Leipzig",    de: "Leipzig" },    center: [12.374, 51.340], population: 601866 },
  { iso2: "de", oblastSlug: "sachsen",             slug: "dresden",    name: { en: "Dresden",    de: "Dresden" },    center: [13.738, 51.050], population: 556780, capital: true },
  { iso2: "de", oblastSlug: "niedersachsen",       slug: "hanover",    name: { en: "Hanover",    de: "Hannover" },   center: [9.732, 52.375],  population: 535932, capital: true },
];

export function listCities(iso2?: string, oblastSlug?: string): CitySeed[] {
  return CITIES.filter(
    (c) =>
      (!iso2 || c.iso2 === iso2.toLowerCase()) &&
      (!oblastSlug || c.oblastSlug === oblastSlug),
  );
}

export function getCity(iso2: string, oblastSlug: string, slug: string): CitySeed | null {
  return (
    CITIES.find(
      (c) => c.iso2 === iso2.toLowerCase() && c.oblastSlug === oblastSlug && c.slug === slug,
    ) ?? null
  );
}
