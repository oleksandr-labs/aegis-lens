export type UnitType = "ground" | "air" | "naval" | "special" | "logistics" | "strategic";
export type UnitCountry = "ru" | "ua" | "by";

export type MilitaryUnit = {
  slug: string;
  name: string;
  shortName: string;
  country: UnitCountry;
  type: UnitType;
  description: string;
  status: "active" | "inactive" | "unknown" | "destroyed";
  theater: string; // geographic area
  commandLevel: "strategic" | "operational" | "tactical";
  sourceConfidence: "high" | "medium" | "low";
  eventCount: number;
  firstDocumented: string;
  wikidata?: string;
};

export const MILITARY_UNITS: MilitaryUnit[] = [
  {
    slug: "ru-58th-combined-arms-army",
    name: "58th Combined Arms Army (Russia)",
    shortName: "58th CAA",
    country: "ru",
    type: "ground",
    description:
      "Russian combined arms formation operating in the southern theater. Headquartered in Vladikavkaz.",
    status: "active",
    theater: "Southern Ukraine",
    commandLevel: "operational",
    sourceConfidence: "high",
    eventCount: 423,
    firstDocumented: "2022-02-24",
    wikidata: "Q12345",
  },
  {
    slug: "ru-1st-guards-tank-army",
    name: "1st Guards Tank Army (Russia)",
    shortName: "1st GTA",
    country: "ru",
    type: "ground",
    description: "Elite Russian armored formation. Involved in northern operations.",
    status: "active",
    theater: "Northern Ukraine / Kharkiv Oblast",
    commandLevel: "operational",
    sourceConfidence: "high",
    eventCount: 289,
    firstDocumented: "2022-02-24",
  },
  {
    slug: "ua-3rd-separate-assault-brigade",
    name: "3rd Separate Assault Brigade (Ukraine)",
    shortName: "3rd SAB",
    country: "ua",
    type: "ground",
    description:
      "Ukrainian elite assault unit. High public profile from Bakhmut operations.",
    status: "active",
    theater: "Eastern Ukraine",
    commandLevel: "tactical",
    sourceConfidence: "high",
    eventCount: 178,
    firstDocumented: "2023-01-01",
  },
  {
    slug: "ua-air-command-center",
    name: "Air Force Command of Ukraine",
    shortName: "UA Air Force",
    country: "ua",
    type: "air",
    description:
      "Ukrainian Air Force command structure. Operates F-16s, MiGs, and air defense.",
    status: "active",
    theater: "All of Ukraine",
    commandLevel: "strategic",
    sourceConfidence: "high",
    eventCount: 891,
    firstDocumented: "2022-02-24",
  },
];

export const COUNTRY_FLAG: Record<UnitCountry, string> = {
  ru: "🇷🇺",
  ua: "🇺🇦",
  by: "🇧🇾",
};

export const COUNTRY_LABEL: Record<UnitCountry, string> = {
  ru: "Russia",
  ua: "Ukraine",
  by: "Belarus",
};

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  ground: "Ground",
  air: "Air",
  naval: "Naval",
  special: "Special",
  logistics: "Logistics",
  strategic: "Strategic",
};

export function getUnit(slug: string): MilitaryUnit | null {
  return MILITARY_UNITS.find((u) => u.slug === slug) ?? null;
}

export function getRelatedUnits(unit: MilitaryUnit): MilitaryUnit[] {
  return MILITARY_UNITS.filter(
    (u) => u.slug !== unit.slug && u.country === unit.country && u.type === unit.type,
  );
}
