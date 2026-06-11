export type SanctionsList = {
  slug: string;
  jurisdiction: "us" | "eu" | "uk" | "ca" | "au" | "ua" | "international";
  name: string;
  /** Acronym or canonical short name. */
  shortName: string;
  /** Public source / authority URL. */
  authorityUrl: string;
  /** What this list covers, plain English. */
  description: string;
  /** Update cadence as stated by the issuing authority. */
  updateCadence: string;
  /** Common use-cases / who consults this list. */
  useCases: string[];
  /** Slugs of related entities (knowledge-graph entries). */
  relatedEntitySlugs?: string[];
  /** Tags for /tags cross-linking. */
  tags: string[];
};

export const SANCTIONS_LISTS: SanctionsList[] = [
  {
    slug: "us-ofac-sdn",
    jurisdiction: "us",
    name: "OFAC Specially Designated Nationals (SDN) List",
    shortName: "OFAC SDN",
    authorityUrl: "https://ofac.treasury.gov/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists",
    description:
      "The US Treasury's primary blocking list. Persons, entities, vessels, and aircraft whose assets are blocked and with whom US persons are generally prohibited from dealing.",
    updateCadence: "Continuous — published daily; secondary feeds intra-day.",
    useCases: [
      "Counterparty screening before any new commercial relationship",
      "Vessel + aircraft tail-number screening",
      "Sanctions-evasion network mapping",
    ],
    relatedEntitySlugs: ["wagner-group", "rosenergoatom"],
    tags: ["us", "ofac", "sanctions", "treasury"],
  },
  {
    slug: "us-bis-entity-list",
    jurisdiction: "us",
    name: "BIS Entity List",
    shortName: "Entity List",
    authorityUrl: "https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list",
    description:
      "US Commerce Department list restricting exports of controlled items to listed parties (foreign persons, governments, research institutions).",
    updateCadence: "Federal Register publication; cadence weeks-to-months.",
    useCases: [
      "Export-control screening on controlled technology",
      "Academic / research collaboration vetting",
      "Semiconductor and dual-use technology trade",
    ],
    tags: ["us", "bis", "export-control", "commerce"],
  },
  {
    slug: "eu-consolidated",
    jurisdiction: "eu",
    name: "EU Consolidated Financial Sanctions List",
    shortName: "EU consolidated",
    authorityUrl: "https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions",
    description:
      "EU's consolidated financial sanctions list: persons, groups, and entities subject to asset freezes and other restrictive measures under EU CFSP decisions.",
    updateCadence: "Updated on each new restrictive-measures regulation (typically weeks).",
    useCases: [
      "EU-area financial counterparty screening",
      "Russia / Belarus restrictive-measures compliance",
      "Cross-border payments due diligence",
    ],
    relatedEntitySlugs: ["wagner-group", "rosenergoatom"],
    tags: ["eu", "sanctions", "financial", "cfsp"],
  },
  {
    slug: "uk-ofsi-consolidated",
    jurisdiction: "uk",
    name: "UK OFSI Consolidated List",
    shortName: "OFSI consolidated",
    authorityUrl: "https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets",
    description:
      "UK Office of Financial Sanctions Implementation consolidated list of asset-freeze targets. Post-Brexit divergence from the EU list is now meaningful.",
    updateCadence: "Daily working-day publication.",
    useCases: [
      "UK-area financial counterparty screening",
      "Russia-related restrictive-measures compliance",
      "Maritime-sector compliance (oil price cap, dark fleet)",
    ],
    tags: ["uk", "ofsi", "sanctions", "financial"],
  },
  {
    slug: "ca-sema",
    jurisdiction: "ca",
    name: "Canada SEMA Regulations",
    shortName: "SEMA",
    authorityUrl: "https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/index.aspx",
    description:
      "Canada's Special Economic Measures Act listings — country-specific and thematic, with significant Russia / Belarus / Iran content.",
    updateCadence: "Each new regulatory order; cadence variable.",
    useCases: [
      "Canadian counterparty screening",
      "Cross-border North-American risk decisions",
    ],
    tags: ["ca", "sema", "sanctions"],
  },
  {
    slug: "au-consolidated",
    jurisdiction: "au",
    name: "Australia Consolidated List",
    shortName: "AU consolidated",
    authorityUrl: "https://www.dfat.gov.au/international-relations/security/sanctions/consolidated-list",
    description:
      "DFAT consolidated list of persons + entities subject to Australian autonomous + UN-mandated sanctions.",
    updateCadence: "Regulatory-instrument cadence; updated as needed.",
    useCases: [
      "Indo-Pacific counterparty screening",
      "UN-mandated sanctions implementation",
    ],
    tags: ["au", "dfat", "sanctions"],
  },
  {
    slug: "ua-nszsr",
    jurisdiction: "ua",
    name: "Ukraine NSDC Sanctions Decisions",
    shortName: "NSDC sanctions",
    authorityUrl: "https://www.rnbo.gov.ua",
    description:
      "Decisions of the National Security and Defence Council of Ukraine imposing personal special economic and other restrictive measures.",
    updateCadence: "Per NSDC decision; cadence variable, often clustered.",
    useCases: [
      "Compliance for Ukrainian counterparties",
      "Asset-freeze cross-reference for war-related actors",
    ],
    tags: ["ua", "nsdc", "sanctions"],
  },
  {
    slug: "un-1267",
    jurisdiction: "international",
    name: "UN 1267 (ISIL/Da'esh & Al-Qaida) Sanctions List",
    shortName: "UN 1267",
    authorityUrl: "https://www.un.org/securitycouncil/sanctions/1267",
    description:
      "UN Security Council consolidated sanctions list against ISIL/Da'esh, Al-Qaida, and associated individuals, groups, undertakings and entities.",
    updateCadence: "Per Committee decision; cadence weeks-to-months.",
    useCases: [
      "UN-mandated baseline compliance (binding on all member states)",
      "Counter-terror finance due diligence",
    ],
    tags: ["un", "1267", "counter-terror"],
  },
];

export function listSanctionsLists(): SanctionsList[] {
  return SANCTIONS_LISTS.slice().sort((a, b) =>
    a.jurisdiction === b.jurisdiction
      ? a.shortName.localeCompare(b.shortName)
      : a.jurisdiction.localeCompare(b.jurisdiction),
  );
}

export function getSanctionsList(slug: string): SanctionsList | null {
  return SANCTIONS_LISTS.find((l) => l.slug === slug) ?? null;
}

export function sanctionsByJurisdiction(j: SanctionsList["jurisdiction"]): SanctionsList[] {
  return SANCTIONS_LISTS.filter((l) => l.jurisdiction === j);
}

export const JURISDICTION_LABEL: Record<SanctionsList["jurisdiction"], string> = {
  us: "United States",
  eu: "European Union",
  uk: "United Kingdom",
  ca: "Canada",
  au: "Australia",
  ua: "Ukraine",
  international: "International (UN)",
};
