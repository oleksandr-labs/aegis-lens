/**
 * Audience definitions for `/best-tools-for/<audience>` ranking pages.
 * Each audience scores tools differently — same catalogue, different ranking.
 */

export type AudienceKey =
  | "analysts"
  | "journalists"
  | "ngos"
  | "defense"
  | "finance"
  | "government"
  | "researchers";

export type Audience = {
  slug: AudienceKey;
  label: string;
  /** Short "who you are" framing for the SEO description. */
  persona: string;
  /** Tool categories that score well for this audience (most-relevant first). */
  preferredCategories: string[];
  /** Free-form considerations rendered into the methodology block. */
  considerations: string[];
};

export const AUDIENCES: Audience[] = [
  {
    slug: "analysts",
    label: "Analysts",
    persona:
      "OSINT analysts moving fast across collection, verification, geolocation, and publication.",
    preferredCategories: [
      "OSINT",
      "Verification",
      "Geospatial",
      "Threat Intelligence",
      "Satellite Imagery",
      "Street-level Imagery",
      "Mapping",
      "Collection",
      "Archive",
    ],
    considerations: [
      "Tool fluency matters more than tool count — pick a small set and master them.",
      "Anything that produces a stable archive link beats anything that doesn't.",
      "Free tier strong enough for a working analyst's daily volume.",
    ],
  },
  {
    slug: "journalists",
    label: "Journalists",
    persona:
      "Investigative and breaking-news journalists who need verifiable, citable findings under deadline.",
    preferredCategories: [
      "Verification",
      "OSINT",
      "Satellite Imagery",
      "Street-level Imagery",
      "Archive",
      "Mapping",
      "Geospatial",
    ],
    considerations: [
      "Source provenance must survive a fact-check; pick tools whose outputs are independently re-verifiable.",
      "Cost matters — most outlets won't pay enterprise prices for a single investigation.",
      "Watermarking / attribution policies matter for republication.",
    ],
  },
  {
    slug: "ngos",
    label: "NGOs",
    persona:
      "Humanitarian, human-rights, and accountability NGOs documenting events for legal, advocacy, or planning use.",
    preferredCategories: [
      "OSINT",
      "Verification",
      "Archive",
      "Mapping",
      "Geospatial",
      "Satellite Imagery",
    ],
    considerations: [
      "Chain-of-custody preservation is the differentiator (audit logs, deterministic IDs).",
      "Tooling must be exportable in formats that legal teams accept.",
      "Pricing should not punish small organizations.",
    ],
  },
  {
    slug: "defense",
    label: "Defense",
    persona:
      "Defense and military intelligence consumers using open-source as one input among many.",
    preferredCategories: [
      "Geospatial",
      "Satellite Imagery",
      "Mapping",
      "Threat Intelligence",
      "Defense Tech",
      "Aviation",
      "Maritime",
      "OSINT",
    ],
    considerations: [
      "Coverage cadence and revisit time of imagery sources are decisive.",
      "Data export to existing analyst stacks is a hard requirement.",
      "Vendor jurisdiction is part of the buying criteria.",
    ],
  },
  {
    slug: "finance",
    label: "Finance",
    persona:
      "Financial-services analysts modeling sanctions, supply chain, and counterparty risk.",
    preferredCategories: [
      "Corporate Data",
      "Maritime",
      "Satellite Imagery",
      "OSINT",
      "Threat Intelligence",
      "Verification",
      "Mapping",
    ],
    considerations: [
      "Counterparty resolution quality (true entity matching) is the primary buying criterion.",
      "API and bulk-download access matter more than UI polish.",
      "Compliance teams need clear data-source provenance.",
    ],
  },
  {
    slug: "government",
    label: "Government",
    persona:
      "Government policy, foreign affairs, and crisis-response teams using open-source intelligence.",
    preferredCategories: [
      "OSINT",
      "Geospatial",
      "Threat Intelligence",
      "Mapping",
      "Satellite Imagery",
      "Verification",
      "Corporate Data",
      "Maritime",
    ],
    considerations: [
      "Procurement requires written methodology and data-policy disclosure.",
      "Multi-tenant data isolation is often non-negotiable.",
      "Tools that bridge analyst output to executive-briefing format save the most time.",
    ],
  },
  {
    slug: "researchers",
    label: "Researchers",
    persona:
      "Academic and think-tank researchers producing peer-reviewed or policy-quality work.",
    preferredCategories: [
      "Datasets",
      "OSINT",
      "Verification",
      "Mapping",
      "Geospatial",
      "Archive",
      "Research",
      "Satellite Imagery",
    ],
    considerations: [
      "Reproducibility of data extraction beats current-state UX.",
      "Citation-ready exports (JSON, GeoJSON, CSV) with stable IDs are essential.",
      "Free / academic licensing terms decide adoption.",
    ],
  },
];

export function getAudience(slug: string): Audience | null {
  return AUDIENCES.find((a) => a.slug === slug) ?? null;
}

export function listAudiences(): Audience[] {
  return AUDIENCES.slice();
}
