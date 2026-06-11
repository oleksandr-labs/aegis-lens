export type DatasetFormat = "csv" | "json" | "geojson" | "parquet" | "shp" | "kml";
export type DatasetLicense = "cc-by-4.0" | "cc-by-nc-4.0" | "proprietary" | "public-domain";
export type DatasetCategory =
  | "events"
  | "entities"
  | "regions"
  | "equipment"
  | "sources"
  | "verification";

export type Dataset = {
  slug: string;
  title: string;
  description: string;
  category: DatasetCategory;
  formats: DatasetFormat[];
  license: DatasetLicense;
  size: string; // human readable
  recordCount: number;
  lastUpdated: string;
  updateFrequency: "hourly" | "daily" | "weekly" | "monthly" | "static";
  requiresAuth: boolean; // does it need an API key?
  tags: string[];
};

export const DATASETS_DATA: Dataset[] = [
  {
    slug: "verified-events-ukraine-2024-2026",
    title: "Verified Events — Ukraine 2024-2026",
    description:
      "All verified events in Ukraine from January 2024 to present. Includes event class, severity, confidence, geolocation, sources, and verification state.",
    category: "events",
    formats: ["csv", "json", "geojson"],
    license: "cc-by-4.0",
    size: "847 MB",
    recordCount: 847234,
    lastUpdated: "2026-06-03",
    updateFrequency: "daily",
    requiresAuth: false,
    tags: ["ukraine", "conflict", "events", "verified"],
  },
  {
    slug: "military-equipment-registry",
    title: "Military Equipment Registry",
    description:
      "Registry of military equipment documented in the conflict zone, with visual identification metadata, first-seen dates, and loss attribution.",
    category: "equipment",
    formats: ["csv", "json"],
    license: "cc-by-4.0",
    size: "12 MB",
    recordCount: 4823,
    lastUpdated: "2026-06-01",
    updateFrequency: "weekly",
    requiresAuth: false,
    tags: ["equipment", "military", "vehicles", "aircraft"],
  },
  {
    slug: "entity-knowledge-graph",
    title: "Entity Knowledge Graph — Public Export",
    description:
      "Entities (units, locations, organizations) and their relations, exported from our knowledge graph. CC-BY for academic use.",
    category: "entities",
    formats: ["json", "parquet"],
    license: "cc-by-nc-4.0",
    size: "234 MB",
    recordCount: 28940,
    lastUpdated: "2026-05-31",
    updateFrequency: "weekly",
    requiresAuth: true,
    tags: ["entities", "knowledge-graph", "organizations"],
  },
  {
    slug: "source-registry",
    title: "Intelligence Source Registry",
    description:
      "Registry of all intelligence sources used by Aegis Lens, with tier ratings, reliability scores, and coverage metadata.",
    category: "sources",
    formats: ["csv", "json"],
    license: "cc-by-4.0",
    size: "2 MB",
    recordCount: 1247,
    lastUpdated: "2026-05-28",
    updateFrequency: "monthly",
    requiresAuth: false,
    tags: ["sources", "registry", "reliability"],
  },
  {
    slug: "confidence-scores-historical",
    title: "Historical Confidence Scores",
    description:
      "Time-series of confidence score evolution per event, showing how confidence changes as new sources corroborate or dispute.",
    category: "verification",
    formats: ["parquet", "csv"],
    license: "cc-by-nc-4.0",
    size: "1.2 GB",
    recordCount: 4200000,
    lastUpdated: "2026-06-02",
    updateFrequency: "daily",
    requiresAuth: true,
    tags: ["confidence", "verification", "historical", "time-series"],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function getDatasetData(slug: string): Dataset | undefined {
  return DATASETS_DATA.find((d) => d.slug === slug);
}

export const LICENSE_LABEL: Record<DatasetLicense, string> = {
  "cc-by-4.0": "CC-BY 4.0",
  "cc-by-nc-4.0": "CC-BY-NC 4.0",
  proprietary: "Proprietary",
  "public-domain": "Public Domain",
};

export const LICENSE_URL_DATA: Record<DatasetLicense, string> = {
  "cc-by-4.0": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-nc-4.0": "https://creativecommons.org/licenses/by-nc/4.0/",
  proprietary: "#",
  "public-domain": "https://creativecommons.org/publicdomain/zero/1.0/",
};

export const CATEGORY_LABEL: Record<DatasetCategory, string> = {
  events: "Events",
  entities: "Entities",
  regions: "Regions",
  equipment: "Equipment",
  sources: "Sources",
  verification: "Verification",
};

export const FORMAT_LABEL: Record<DatasetFormat, string> = {
  csv: "CSV",
  json: "JSON",
  geojson: "GeoJSON",
  parquet: "Parquet",
  shp: "SHP",
  kml: "KML",
};

/** Schema preview: first 3 columns per format, with mock type annotation. */
export const SCHEMA_PREVIEW: Record<DatasetFormat, { name: string; type: string }[]> = {
  csv: [
    { name: "id", type: "string" },
    { name: "occurred_at", type: "datetime" },
    { name: "confidence", type: "float" },
  ],
  json: [
    { name: "id", type: "string (UUID)" },
    { name: "occurred_at", type: "string (ISO 8601)" },
    { name: "confidence", type: "number (0–1)" },
  ],
  geojson: [
    { name: "type", type: "string" },
    { name: "features", type: "array<Feature>" },
    { name: "features[].geometry", type: "Point | Polygon" },
  ],
  parquet: [
    { name: "id", type: "BYTE_ARRAY (UTF8)" },
    { name: "occurred_at", type: "INT96 (timestamp)" },
    { name: "confidence", type: "DOUBLE" },
  ],
  shp: [
    { name: "FID", type: "Integer" },
    { name: "geometry", type: "Point / Polygon" },
    { name: "event_id", type: "String (36)" },
  ],
  kml: [
    { name: "Placemark/name", type: "string" },
    { name: "Placemark/description", type: "CDATA" },
    { name: "Placemark/Point/coordinates", type: "lon,lat,alt" },
  ],
};

/** 3-row mock sample data per slug (used as table preview). */
export const SAMPLE_DATA: Record<
  string,
  { columns: string[]; rows: (string | number)[][] }
> = {
  "verified-events-ukraine-2024-2026": {
    columns: ["event_id", "occurred_at", "class", "confidence", "geo_accuracy"],
    rows: [
      ["01J2PXH…0A", "2026-06-01T08:22:00Z", "strike", 0.93, "1km"],
      ["01J2PXH…0B", "2026-06-01T09:45:00Z", "troop_movement", 0.81, "admin2"],
      ["01J2PXH…0C", "2026-06-01T11:17:00Z", "maritime", 0.76, "10km"],
    ],
  },
  "military-equipment-registry": {
    columns: ["equipment_id", "designation", "country_origin", "first_seen", "status"],
    rows: [
      ["EQ-0001", "T-72B3", "RU", "2024-03-12", "destroyed"],
      ["EQ-0002", "BMP-2", "RU", "2024-03-14", "captured"],
      ["EQ-0003", "Shahed-136", "IR", "2024-02-28", "destroyed"],
    ],
  },
  "entity-knowledge-graph": {
    columns: ["entity_id", "name_en", "type", "country", "event_count"],
    rows: [
      ["ENT-001", "58th Combined Arms Army", "military_unit", "RU", 423],
      ["ENT-002", "General Staff of Ukraine", "organization", "UA", 1234],
      ["ENT-003", "Shahed-136 / Geran-2", "equipment", "IR", 891],
    ],
  },
  "source-registry": {
    columns: ["slug", "name", "kind", "tier", "reliability"],
    rows: [
      ["ua-mod-official", "Ukrainian MoD Official", "official_gov", "A", 0.97],
      ["ua-general-staff", "UA General Staff", "official_gov", "A", 0.96],
      ["deepstatemap", "DeepState Map", "milblogger", "B", 0.84],
    ],
  },
  "confidence-scores-historical": {
    columns: ["event_id", "timestamp", "confidence", "source_count", "delta"],
    rows: [
      ["01J2PXH…0A", "2026-06-01T08:30:00Z", 0.62, 1, null],
      ["01J2PXH…0A", "2026-06-01T09:15:00Z", 0.81, 2, "+0.19"],
      ["01J2PXH…0A", "2026-06-01T11:00:00Z", 0.93, 4, "+0.12"],
    ],
  },
};

/** Full license text snippets keyed by license. */
export const LICENSE_TEXT: Record<DatasetLicense, string> = {
  "cc-by-4.0": `Creative Commons Attribution 4.0 International (CC BY 4.0)

You are free to:
  • Share — copy and redistribute the material in any medium or format.
  • Adapt — remix, transform, and build upon the material for any purpose, even commercially.

Under the following terms:
  • Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.

Full legal code: https://creativecommons.org/licenses/by/4.0/legalcode`,
  "cc-by-nc-4.0": `Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

You are free to:
  • Share — copy and redistribute the material in any medium or format.
  • Adapt — remix, transform, and build upon the material for non-commercial purposes.

Under the following terms:
  • Attribution — You must give appropriate credit and indicate if changes were made.
  • NonCommercial — You may not use the material for commercial purposes.

Full legal code: https://creativecommons.org/licenses/by-nc/4.0/legalcode`,
  proprietary: `Proprietary License

This dataset is made available under a proprietary license. Use is restricted to approved parties only. Contact Aegis Lens to request a license agreement.`,
  "public-domain": `Creative Commons Zero (CC0 1.0 Universal)

The creator has dedicated this work to the public domain. You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

Full legal code: https://creativecommons.org/publicdomain/zero/1.0/legalcode`,
};

/** BibTeX citation generator for the new Dataset type. */
export function citationBibtexData(d: Dataset, siteUrl: string): string {
  const year = new Date(d.lastUpdated).getFullYear();
  return `@misc{aegislens_${d.slug.replace(/-/g, "_")}_${year},
  author    = {{Aegis Lens}},
  title     = {${d.title}},
  year      = {${year}},
  url       = {${siteUrl}/datasets/${d.slug}},
  note      = {Dataset. License: ${LICENSE_LABEL[d.license]}. Last updated: ${d.lastUpdated}.}
}`;
}

/** APA citation generator for the new Dataset type. */
export function citationApaData(d: Dataset, siteUrl: string): string {
  const year = new Date(d.lastUpdated).getFullYear();
  return `Aegis Lens. (${year}). ${d.title} [Dataset]. ${siteUrl}/datasets/${d.slug}`;
}
