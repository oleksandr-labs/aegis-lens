export type EntityType =
  | "military_unit"
  | "location"
  | "organization"
  | "equipment"
  | "person"
  | "country";

export type Entity = {
  slug: string;
  name: string;
  aliases: string[];
  type: EntityType;
  description: string;
  country: string;
  tags: string[];
  eventCount: number;
  wikidata?: string;
  active: boolean;
};

export const ENTITIES_DATA: Entity[] = [
  {
    slug: "russian-58th-army",
    name: "58th Combined Arms Army (Russia)",
    aliases: ["58-я армия", "58th Army"],
    type: "military_unit",
    description: "Russian ground forces formation operating in the southern theater.",
    country: "ru",
    tags: ["military", "ground-forces"],
    eventCount: 423,
    wikidata: "Q12345",
    active: true,
  },
  {
    slug: "ukraine-general-staff",
    name: "General Staff of Ukraine",
    aliases: ["ЗСУ Генштаб"],
    type: "organization",
    description: "Supreme command of the Ukrainian Armed Forces.",
    country: "ua",
    tags: ["military", "command"],
    eventCount: 1234,
    wikidata: "Q67890",
    active: true,
  },
  {
    slug: "shahed-136-data",
    name: "Shahed-136 / Geran-2",
    aliases: ["Shahed 136", "Герань-2", "Geran 2"],
    type: "equipment",
    description:
      "Iranian-designed loitering munition operated by Russia in the Ukraine conflict.",
    country: "ir",
    tags: ["drone", "loitering-munition"],
    eventCount: 891,
    active: true,
  },
  {
    slug: "dnipro-city",
    name: "Dnipro",
    aliases: ["Дніпро", "Dniepropetrovsk"],
    type: "location",
    description:
      "Major industrial city in central Ukraine, frequently targeted in the conflict.",
    country: "ua",
    tags: ["city", "industrial"],
    eventCount: 342,
    active: true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getEntityData(slug: string): Entity | undefined {
  return ENTITIES_DATA.find((e) => e.slug === slug);
}

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  military_unit: "Military unit",
  location: "Location",
  organization: "Organization",
  equipment: "Equipment",
  person: "Person",
  country: "Country",
};

export const COUNTRY_NAME: Record<string, string> = {
  ua: "Ukraine",
  ru: "Russia",
  ir: "Iran",
  by: "Belarus",
  pl: "Poland",
  de: "Germany",
  us: "United States",
  gb: "United Kingdom",
};

/** Map EntityType to Schema.org type string. */
export const ENTITY_SCHEMA_TYPE: Record<EntityType, string> = {
  military_unit: "Organization",
  location: "Place",
  organization: "Organization",
  equipment: "Product",
  person: "Person",
  country: "Country",
};
