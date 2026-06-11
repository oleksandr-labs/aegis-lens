import type { Locale } from "@aegis/i18n-config";

/**
 * Admin-1 regions for UA (oblasts), PL (voivodeships), DE (Bundesländer).
 * Coordinates = administrative center.
 * Per-country `kindLabel` distinguishes the local term in UI.
 */
export type OblastSeed = {
  iso2: "ua" | "pl" | "de";
  slug: string;
  name: Partial<Record<Locale, string>> & { en: string };
  capital: string;
  /** Label for the admin-1 kind in this country ("Oblast" / "Voivodeship" / "Bundesland"). */
  kindLabel: string;
  /** [lon, lat] */
  center: [number, number];
  /** Cheap bbox for filtering: [minLon, minLat, maxLon, maxLat] */
  bbox: [number, number, number, number];
};

export const OBLASTS: OblastSeed[] = [
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "kyiv-city",
    name: { en: "Kyiv (city)", uk: "Київ" },
    capital: "Kyiv",
    center: [30.52, 50.45],
    bbox: [30.2, 50.2, 30.8, 50.7],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "kyiv-oblast",
    name: { en: "Kyiv Oblast", uk: "Київська область" },
    capital: "Kyiv",
    center: [30.5, 50.0],
    bbox: [28.8, 49.2, 32.2, 51.5],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "kharkiv-oblast",
    name: { en: "Kharkiv Oblast", uk: "Харківська область" },
    capital: "Kharkiv",
    center: [36.23, 49.99],
    bbox: [34.8, 48.8, 38.2, 51.0],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "lviv-oblast",
    name: { en: "Lviv Oblast", uk: "Львівська область" },
    capital: "Lviv",
    center: [24.03, 49.84],
    bbox: [22.6, 48.9, 25.3, 50.6],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "odesa-oblast",
    name: { en: "Odesa Oblast", uk: "Одеська область" },
    capital: "Odesa",
    center: [30.72, 46.48],
    bbox: [28.4, 45.2, 31.7, 47.9],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "dnipropetrovsk-oblast",
    name: { en: "Dnipropetrovsk Oblast", uk: "Дніпропетровська область" },
    capital: "Dnipro",
    center: [35.05, 48.46],
    bbox: [33.5, 47.6, 36.6, 49.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "donetsk-oblast",
    name: { en: "Donetsk Oblast", uk: "Донецька область" },
    capital: "Kramatorsk (de jure: Donetsk)",
    center: [37.8, 48.0],
    bbox: [36.4, 46.6, 39.0, 49.2],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "luhansk-oblast",
    name: { en: "Luhansk Oblast", uk: "Луганська область" },
    capital: "Sievierodonetsk (de jure: Luhansk)",
    center: [38.8, 48.95],
    bbox: [37.9, 47.9, 40.3, 50.0],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "zaporizhzhia-oblast",
    name: { en: "Zaporizhzhia Oblast", uk: "Запорізька область" },
    capital: "Zaporizhzhia",
    center: [35.14, 47.84],
    bbox: [33.8, 46.5, 37.0, 48.5],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "kherson-oblast",
    name: { en: "Kherson Oblast", uk: "Херсонська область" },
    capital: "Kherson",
    center: [32.62, 46.64],
    bbox: [31.4, 45.9, 34.5, 47.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "mykolaiv-oblast",
    name: { en: "Mykolaiv Oblast", uk: "Миколаївська область" },
    capital: "Mykolaiv",
    center: [31.99, 46.98],
    bbox: [30.5, 46.1, 33.0, 48.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "poltava-oblast",
    name: { en: "Poltava Oblast", uk: "Полтавська область" },
    capital: "Poltava",
    center: [34.55, 49.59],
    bbox: [32.8, 48.6, 35.7, 50.7],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "sumy-oblast",
    name: { en: "Sumy Oblast", uk: "Сумська область" },
    capital: "Sumy",
    center: [34.8, 50.91],
    bbox: [33.0, 50.0, 35.7, 52.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "chernihiv-oblast",
    name: { en: "Chernihiv Oblast", uk: "Чернігівська область" },
    capital: "Chernihiv",
    center: [31.29, 51.5],
    bbox: [30.0, 50.7, 33.3, 52.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "cherkasy-oblast",
    name: { en: "Cherkasy Oblast", uk: "Черкаська область" },
    capital: "Cherkasy",
    center: [32.06, 49.44],
    bbox: [30.8, 48.7, 33.5, 50.2],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "kirovohrad-oblast",
    name: { en: "Kirovohrad Oblast", uk: "Кіровоградська область" },
    capital: "Kropyvnytskyi",
    center: [32.27, 48.51],
    bbox: [30.6, 47.7, 34.0, 49.6],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "vinnytsia-oblast",
    name: { en: "Vinnytsia Oblast", uk: "Вінницька область" },
    capital: "Vinnytsia",
    center: [28.48, 49.23],
    bbox: [27.4, 48.0, 30.5, 50.0],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "khmelnytskyi-oblast",
    name: { en: "Khmelnytskyi Oblast", uk: "Хмельницька область" },
    capital: "Khmelnytskyi",
    center: [27.0, 49.42],
    bbox: [26.0, 48.4, 28.3, 50.6],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "ternopil-oblast",
    name: { en: "Ternopil Oblast", uk: "Тернопільська область" },
    capital: "Ternopil",
    center: [25.6, 49.55],
    bbox: [24.9, 48.5, 26.7, 50.4],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "ivano-frankivsk-oblast",
    name: { en: "Ivano-Frankivsk Oblast", uk: "Івано-Франківська область" },
    capital: "Ivano-Frankivsk",
    center: [24.71, 48.92],
    bbox: [23.5, 47.7, 25.6, 49.5],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "zakarpattia-oblast",
    name: { en: "Zakarpattia Oblast", uk: "Закарпатська область" },
    capital: "Uzhhorod",
    center: [22.3, 48.62],
    bbox: [22.1, 47.8, 24.6, 49.1],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "chernivtsi-oblast",
    name: { en: "Chernivtsi Oblast", uk: "Чернівецька область" },
    capital: "Chernivtsi",
    center: [25.94, 48.29],
    bbox: [24.9, 47.7, 27.6, 48.6],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "volyn-oblast",
    name: { en: "Volyn Oblast", uk: "Волинська область" },
    capital: "Lutsk",
    center: [25.34, 50.75],
    bbox: [23.6, 49.9, 26.2, 51.9],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "rivne-oblast",
    name: { en: "Rivne Oblast", uk: "Рівненська область" },
    capital: "Rivne",
    center: [26.25, 50.62],
    bbox: [24.9, 49.5, 27.7, 51.9],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "zhytomyr-oblast",
    name: { en: "Zhytomyr Oblast", uk: "Житомирська область" },
    capital: "Zhytomyr",
    center: [28.66, 50.25],
    bbox: [27.3, 49.3, 30.0, 51.6],
  },
  {
    iso2: "ua",
    kindLabel: "Oblast",
    slug: "crimea",
    name: { en: "Crimea (illegally occupied)", uk: "Крим (тимчасово окупований)" },
    capital: "Simferopol",
    center: [34.1, 45.0],
    bbox: [32.4, 44.3, 36.7, 46.2],
  },

  // ---------- Poland — 16 voivodeships ----------
  { iso2: "pl", kindLabel: "Voivodeship", slug: "mazowieckie",       name: { en: "Mazowieckie",       pl: "Mazowieckie" },       capital: "Warsaw",          center: [21.0, 52.3], bbox: [19.3, 51.0, 23.1, 53.5] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "slaskie",           name: { en: "Śląskie",          pl: "Śląskie" },           capital: "Katowice",        center: [19.0, 50.27], bbox: [17.8, 49.3, 19.9, 51.1] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "malopolskie",       name: { en: "Małopolskie",      pl: "Małopolskie" },       capital: "Kraków",          center: [20.0, 49.85], bbox: [19.0, 49.2, 21.5, 50.5] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "wielkopolskie",     name: { en: "Wielkopolskie",    pl: "Wielkopolskie" },     capital: "Poznań",          center: [17.0, 52.4], bbox: [15.7, 51.3, 18.6, 53.7] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "lodzkie",           name: { en: "Łódzkie",          pl: "Łódzkie" },           capital: "Łódź",            center: [19.45, 51.77], bbox: [18.0, 51.0, 20.7, 52.6] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "dolnoslaskie",      name: { en: "Dolnośląskie",     pl: "Dolnośląskie" },      capital: "Wrocław",         center: [16.5, 51.2], bbox: [14.8, 50.1, 17.7, 52.0] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "lubelskie",         name: { en: "Lubelskie",        pl: "Lubelskie" },         capital: "Lublin",          center: [22.6, 51.25], bbox: [21.5, 50.2, 24.2, 52.4] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "podkarpackie",      name: { en: "Podkarpackie",     pl: "Podkarpackie" },      capital: "Rzeszów",         center: [22.0, 50.04], bbox: [21.0, 49.0, 23.6, 50.8] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "pomorskie",         name: { en: "Pomorskie",        pl: "Pomorskie" },         capital: "Gdańsk",          center: [18.0, 54.2], bbox: [16.7, 53.4, 19.7, 54.85] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "kujawsko-pomorskie", name: { en: "Kujawsko-Pomorskie", pl: "Kujawsko-Pomorskie" }, capital: "Bydgoszcz / Toruń", center: [18.5, 53.0], bbox: [17.2, 52.3, 19.8, 53.8] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "warminsko-mazurskie", name: { en: "Warmińsko-Mazurskie", pl: "Warmińsko-Mazurskie" }, capital: "Olsztyn",     center: [20.5, 53.8], bbox: [19.1, 53.0, 22.85, 54.45] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "podlaskie",         name: { en: "Podlaskie",        pl: "Podlaskie" },         capital: "Białystok",       center: [23.16, 53.13], bbox: [21.6, 52.1, 23.9, 54.4] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "zachodniopomorskie", name: { en: "Zachodniopomorskie", pl: "Zachodniopomorskie" }, capital: "Szczecin",     center: [15.7, 53.6], bbox: [14.1, 52.6, 17.1, 54.7] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "swietokrzyskie",    name: { en: "Świętokrzyskie",   pl: "Świętokrzyskie" },    capital: "Kielce",          center: [20.62, 50.87], bbox: [19.7, 50.1, 21.7, 51.4] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "lubuskie",          name: { en: "Lubuskie",         pl: "Lubuskie" },          capital: "Gorzów / Zielona Góra", center: [15.3, 52.2], bbox: [14.4, 51.4, 16.4, 53.1] },
  { iso2: "pl", kindLabel: "Voivodeship", slug: "opolskie",          name: { en: "Opolskie",         pl: "Opolskie" },          capital: "Opole",           center: [17.9, 50.7], bbox: [17.0, 49.8, 18.9, 51.3] },

  // ---------- Germany — 16 Bundesländer ----------
  { iso2: "de", kindLabel: "Bundesland", slug: "berlin",                name: { en: "Berlin",                de: "Berlin" },                capital: "Berlin",       center: [13.405, 52.52], bbox: [13.1, 52.3, 13.8, 52.7] },
  { iso2: "de", kindLabel: "Bundesland", slug: "hamburg",               name: { en: "Hamburg",               de: "Hamburg" },               capital: "Hamburg",      center: [10.0, 53.55], bbox: [9.7, 53.4, 10.3, 53.75] },
  { iso2: "de", kindLabel: "Bundesland", slug: "bremen",                name: { en: "Bremen",                de: "Bremen" },                capital: "Bremen",       center: [8.81, 53.08], bbox: [8.5, 53.0, 8.95, 53.6] },
  { iso2: "de", kindLabel: "Bundesland", slug: "bayern",                name: { en: "Bavaria",               de: "Bayern" },                capital: "Munich",       center: [11.5, 48.95], bbox: [8.97, 47.27, 13.84, 50.57] },
  { iso2: "de", kindLabel: "Bundesland", slug: "baden-wuerttemberg",    name: { en: "Baden-Württemberg",     de: "Baden-Württemberg" },     capital: "Stuttgart",    center: [9.0, 48.65], bbox: [7.51, 47.53, 10.5, 49.79] },
  { iso2: "de", kindLabel: "Bundesland", slug: "nordrhein-westfalen",   name: { en: "North Rhine-Westphalia", de: "Nordrhein-Westfalen" },  capital: "Düsseldorf",   center: [7.55, 51.5], bbox: [5.87, 50.32, 9.46, 52.53] },
  { iso2: "de", kindLabel: "Bundesland", slug: "niedersachsen",         name: { en: "Lower Saxony",          de: "Niedersachsen" },         capital: "Hanover",      center: [9.5, 52.85], bbox: [6.65, 51.3, 11.6, 53.9] },
  { iso2: "de", kindLabel: "Bundesland", slug: "hessen",                name: { en: "Hesse",                 de: "Hessen" },                capital: "Wiesbaden",    center: [9.0, 50.55], bbox: [7.77, 49.39, 10.24, 51.65] },
  { iso2: "de", kindLabel: "Bundesland", slug: "rheinland-pfalz",       name: { en: "Rhineland-Palatinate",  de: "Rheinland-Pfalz" },       capital: "Mainz",        center: [7.5, 49.85], bbox: [6.11, 48.97, 8.51, 50.94] },
  { iso2: "de", kindLabel: "Bundesland", slug: "saarland",              name: { en: "Saarland",              de: "Saarland" },              capital: "Saarbrücken",  center: [6.95, 49.4], bbox: [6.36, 49.11, 7.41, 49.64] },
  { iso2: "de", kindLabel: "Bundesland", slug: "schleswig-holstein",    name: { en: "Schleswig-Holstein",    de: "Schleswig-Holstein" },    capital: "Kiel",         center: [9.7, 54.2], bbox: [7.87, 53.36, 11.31, 55.06] },
  { iso2: "de", kindLabel: "Bundesland", slug: "mecklenburg-vorpommern", name: { en: "Mecklenburg-Vorpommern", de: "Mecklenburg-Vorpommern" }, capital: "Schwerin",    center: [12.7, 53.7], bbox: [10.59, 53.11, 14.41, 54.69] },
  { iso2: "de", kindLabel: "Bundesland", slug: "brandenburg",           name: { en: "Brandenburg",           de: "Brandenburg" },           capital: "Potsdam",      center: [13.4, 52.4], bbox: [11.27, 51.36, 14.77, 53.56] },
  { iso2: "de", kindLabel: "Bundesland", slug: "sachsen",               name: { en: "Saxony",                de: "Sachsen" },               capital: "Dresden",      center: [13.5, 51.0], bbox: [11.87, 50.17, 15.04, 51.69] },
  { iso2: "de", kindLabel: "Bundesland", slug: "sachsen-anhalt",        name: { en: "Saxony-Anhalt",         de: "Sachsen-Anhalt" },        capital: "Magdeburg",    center: [11.7, 51.95], bbox: [10.56, 50.93, 13.19, 53.04] },
  { iso2: "de", kindLabel: "Bundesland", slug: "thueringen",            name: { en: "Thuringia",             de: "Thüringen" },             capital: "Erfurt",       center: [11.0, 50.9], bbox: [9.88, 50.2, 12.65, 51.65] },
];

export function listOblasts(iso2: string = "ua"): OblastSeed[] {
  return OBLASTS.filter((o) => o.iso2 === iso2.toLowerCase());
}

export function getOblast(iso2: string, slug: string): OblastSeed | null {
  return OBLASTS.find((o) => o.iso2 === iso2.toLowerCase() && o.slug === slug) ?? null;
}
