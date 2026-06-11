import type { Locale } from "@aegis/i18n-config";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type EntityKind =
  | "organization"
  | "military_unit"
  | "person"
  | "platform"
  | "place";

export type EntitySeed = {
  slug: string;
  kind: EntityKind;
  name: Localized;
  /** Alternative names + transliterations (any language). */
  aliases?: string[];
  /** One-paragraph factual description. */
  description: Localized;
  /** Country of primary association (ISO-2). */
  country: string;
  /** Wikidata QID for `sameAs`. */
  wikidata?: string;
  /** Slugs of related entities (graph edges). */
  relatedSlugs?: string[];
  /** Related equipment slugs. */
  relatedEquipmentSlugs?: string[];
  /** Related event IDs (recent mentions). */
  relatedEventIds?: string[];
  /** Related investigation slugs. */
  relatedInvestigationSlugs?: string[];
  /** Tag slugs for /tags cross-linking. */
  tags: string[];
  /** Pinned to the featured strip on the entities index. */
  featured?: boolean;
};

export const ENTITIES: EntitySeed[] = [
  // --- organizations ---
  {
    slug: "general-staff-ukraine",
    featured: true,
    kind: "organization",
    name: { en: "General Staff of the Armed Forces of Ukraine", uk: "Генеральний штаб ЗСУ" },
    aliases: ["GS UA", "Генштаб", "ZSU General Staff"],
    description: {
      en: "Central command authority of the Armed Forces of Ukraine. Publishes daily operational summaries used widely as primary OSINT sources.",
    },
    country: "UA",
    wikidata: "Q4072900",
    relatedSlugs: ["gur"],
    tags: ["organization", "ukraine", "primary-source"],
  },
  {
    slug: "gur",
    kind: "organization",
    name: { en: "Main Directorate of Intelligence (HUR / GUR)", uk: "Головне управління розвідки (ГУР)" },
    aliases: ["HUR MO", "ГУР МО", "Defence Intelligence of Ukraine"],
    description: {
      en: "Ukrainian military intelligence agency. Public briefings have become a recurring open-source reference point.",
    },
    country: "UA",
    wikidata: "Q4156926",
    relatedSlugs: ["general-staff-ukraine"],
    tags: ["intelligence", "ukraine", "primary-source"],
  },
  {
    slug: "wagner-group",
    featured: true,
    kind: "organization",
    name: { en: "Wagner Group", uk: "Група Вагнера" },
    aliases: ["ChVK Wagner", "Africa Corps"],
    description: {
      en: "Russian private military company active across multiple theatres. Rebranded post-2023 under successor structures, with personnel continuity.",
    },
    country: "RU",
    wikidata: "Q16639590",
    relatedInvestigationSlugs: ["wagner-group-africa-expansion"],
    tags: ["pmc", "russia", "wagner", "africa"],
  },
  {
    slug: "rosenergoatom",
    kind: "organization",
    name: { en: "Rosenergoatom", ru: "Росэнергоатом" },
    aliases: ["Russian state nuclear operator"],
    description: {
      en: "Russian state-owned operator of nuclear power generation. Tracked in connection to the Zaporizhzhia NPP occupation.",
    },
    country: "RU",
    wikidata: "Q1762008",
    tags: ["nuclear", "russia", "energy"],
  },

  // --- military units ---
  {
    slug: "47th-mechanized-brigade",
    kind: "military_unit",
    name: { en: "47th Mechanized Brigade", uk: "47-ма окрема механізована бригада" },
    aliases: ["47 OMBr", "Magura"],
    description: {
      en: "Ukrainian mechanized brigade operating Bradley IFVs and Leopard 2 tanks. Featured heavily in the 2023–2024 southern axis operations.",
    },
    country: "UA",
    wikidata: "Q116859562",
    tags: ["brigade", "ukraine", "mechanized"],
  },
  {
    slug: "azov-brigade",
    kind: "military_unit",
    name: { en: "Azov Brigade", uk: "Бригада «Азов»" },
    aliases: ["3rd Separate Assault Brigade Azov"],
    description: {
      en: "Ukrainian assault brigade. Original Azov Regiment was destroyed at Mariupol in 2022; subsequent formations carry the lineage.",
    },
    country: "UA",
    wikidata: "Q6862028",
    relatedInvestigationSlugs: ["mariupol-theatre-strike-accountability"],
    tags: ["brigade", "ukraine", "assault", "azov"],
  },

  // --- platforms ---
  {
    slug: "shahed-136",
    featured: true,
    kind: "platform",
    name: { en: "Shahed-136", uk: "Шахед-136" },
    aliases: ["Geran-2", "HESA Shahed 136"],
    description: {
      en: "Iranian-origin loitering munition / one-way attack UAV. Used in mass salvos against Ukrainian infrastructure.",
    },
    country: "IR",
    wikidata: "Q113779879",
    relatedEquipmentSlugs: ["shahed-136"],
    tags: ["uav", "shahed", "iran", "russia"],
  },
  {
    slug: "magura-v5",
    kind: "platform",
    name: { en: "MAGURA V5 unmanned surface vessel" },
    aliases: ["Maritime Autonomous Guard USV"],
    description: {
      en: "Ukrainian unmanned surface vessel used against Russian Black Sea Fleet assets. Reconstructed publicly via launch geography and recovered debris.",
    },
    country: "UA",
    relatedInvestigationSlugs: ["black-sea-magura-usv-operations"],
    tags: ["usv", "naval", "ukraine", "black-sea"],
  },

  // --- places ---
  {
    slug: "zaporizhzhia-npp",
    featured: true,
    kind: "place",
    name: { en: "Zaporizhzhia Nuclear Power Plant", uk: "Запорізька АЕС" },
    aliases: ["ZNPP", "Energodar NPP"],
    description: {
      en: "Largest nuclear power plant in Europe by capacity. Under Russian military occupation since 2022 and a recurring IAEA-monitored safety risk.",
    },
    country: "UA",
    wikidata: "Q909749",
    relatedSlugs: ["rosenergoatom"],
    tags: ["nuclear", "infrastructure", "ukraine", "occupied"],
  },
  {
    slug: "kerch-strait-bridge",
    kind: "place",
    name: { en: "Kerch Strait Bridge", ru: "Крымский мост" },
    aliases: ["Crimean Bridge"],
    description: {
      en: "Road-and-rail crossing connecting the Russian mainland to occupied Crimea. Target of repeated strikes; subject of structural reconstruction analysis.",
    },
    country: "RU",
    wikidata: "Q23691918",
    relatedInvestigationSlugs: ["crimea-bridge-infrastructure"],
    tags: ["infrastructure", "crimea", "bridge"],
  },
];

export function listEntities(): EntitySeed[] {
  return ENTITIES.slice().sort((a, b) => a.name.en.localeCompare(b.name.en));
}

export function listFeaturedEntities(): EntitySeed[] {
  return ENTITIES.filter((e) => e.featured);
}

export function getEntity(slug: string): EntitySeed | null {
  return ENTITIES.find((e) => e.slug === slug) ?? null;
}

export function entitiesByKind(kind: EntityKind): EntitySeed[] {
  return ENTITIES.filter((e) => e.kind === kind);
}

export const ENTITY_KIND_LABEL: Record<EntityKind, string> = {
  organization: "Organization",
  military_unit: "Military unit",
  person: "Person",
  platform: "Platform",
  place: "Place",
};

const KIND_TO_SCHEMA: Record<EntityKind, string> = {
  organization: "Organization",
  military_unit: "Organization",
  person: "Person",
  platform: "Product",
  place: "Place",
};

export function entitySchemaType(kind: EntityKind): string {
  return KIND_TO_SCHEMA[kind];
}
