export type DatasetFormat = "JSON" | "CSV" | "GeoJSON" | "JSON (OpenAPI 3.1)" | "JSON (Postman v2.1)" | "Parquet";

export type Dataset = {
  slug: string;
  title: string;
  description: string;
  /** Long-form documentation about the dataset fields and methodology. */
  longDescription: string;
  license: string;
  format: DatasetFormat;
  size: string;
  updated: string;
  /** Relative URL to download the dataset. */
  url: string;
  /** Pinned to the top "Featured datasets" strip on the index page. */
  featured?: boolean;
  /** Example of a single record / entry. */
  example?: string;
  fields?: { name: string; type: string; description: string }[];
  relatedSlugs?: string[];
};

export const LICENSE_URL: Record<string, string> = {
  "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
};

export const DATASETS: Dataset[] = [
  {
    slug: "events",
    title: "Verified events",
    description:
      "Full corpus of published events with confidence and danger scores, geolocation, class taxonomy, and contributing source URLs.",
    longDescription:
      "The events dataset contains every event published by Aegis Lens that has passed the two-source corroboration threshold. Each record includes a stable UUID, occurred_at timestamp (ISO 8601 UTC), geolocation (GeoJSON point or polygon), event class from the taxonomy, confidence score (0–1), danger score (0–100), and an array of contributing source URLs with their tier and captured_at timestamps.\n\nEvents are never deleted — corrections are applied via revision_history[] and flagged with a correction_reason. Use verification_state to filter for verified-only records or include events still under review.\n\nThe dataset is updated in rolling batches; the modified_at field reflects the last update to any field on the record.",
    license: "CC-BY-4.0",
    format: "JSON",
    size: "≈ 48 MB",
    updated: "2026-05-22",
    featured: true,
    url: "/data/events.json",
    fields: [
      { name: "event_id", type: "string (UUID)", description: "Stable identifier — never reused." },
      { name: "occurred_at", type: "string (ISO 8601 UTC)", description: "Best estimate of when the event occurred." },
      { name: "published_at", type: "string (ISO 8601 UTC)", description: "When Aegis Lens first published the event." },
      { name: "modified_at", type: "string (ISO 8601 UTC)", description: "Timestamp of the most recent field update." },
      { name: "class", type: "string (enum)", description: "Event class: strike, civilian_alert, maritime, cyber, humanitarian, troop_movement, aviation, fire." },
      { name: "verification_state", type: "string (enum)", description: "verified | under_review | retracted." },
      { name: "confidence", type: "number (0–1)", description: "Tier-weighted corroboration confidence." },
      { name: "danger_score", type: "number (0–100)", description: "Regional danger composite at time of publication." },
      { name: "geo", type: "GeoJSON (Point | Polygon)", description: "Geolocation — coarsened to admin-2 when precise location cannot be confirmed." },
      { name: "geo_accuracy", type: "string (enum)", description: "Accuracy class: exact | 1km | 10km | admin2 | admin1." },
      { name: "summary", type: "object {en, uk}", description: "Short event summary in English and Ukrainian." },
      { name: "sources", type: "array", description: "Contributing source records: tier (A–D), url, captured_at." },
      { name: "revision_history", type: "array", description: "Ordered log of field corrections with reason and timestamp." },
    ],
    example: `{
  "event_id": "01J2PXHKGQE00000000000000A",
  "occurred_at": "2026-05-20T14:22:00Z",
  "published_at": "2026-05-20T14:58:00Z",
  "modified_at": "2026-05-20T15:30:00Z",
  "class": "strike",
  "verification_state": "verified",
  "confidence": 0.91,
  "danger_score": 74,
  "geo": { "type": "Point", "coordinates": [36.23, 49.99] },
  "geo_accuracy": "1km",
  "summary": {
    "en": "Ballistic missile impact on industrial facility.",
    "uk": "Удар балістичної ракети по промисловому об'єкту."
  },
  "sources": [
    { "tier": "A", "url": "https://t.me/example/12345", "captured_at": "2026-05-20T14:30:00Z" }
  ],
  "revision_history": []
}`,
    relatedSlugs: ["sources", "geography"],
  },
  {
    slug: "sources",
    title: "Sources directory",
    description:
      "Tiered directory of every source ever ingested, with tier, language, country, first-seen date, and corroboration rate.",
    longDescription:
      "The sources dataset enumerates every OSINT source that has contributed at least one event to the Aegis Lens corpus. Each record carries a stable slug, display name, kind (telegram | satellite | news | official_gov | milblogger | academic | ngo | other), ISO 639-1 language code, ISO 3166-1 alpha-2 country code, reliability score (0–1), first_seen_at date, and a corroboration_rate representing the proportion of this source's claims that were independently confirmed.\n\nSensitive contributor identities are never published — only public, auditable sources appear here.",
    license: "CC-BY-4.0",
    format: "CSV",
    size: "≈ 2.1 MB",
    updated: "2026-05-20",
    featured: true,
    url: "/data/sources.csv",
    fields: [
      { name: "slug", type: "string", description: "Stable URL-safe identifier." },
      { name: "name", type: "string", description: "Display name." },
      { name: "kind", type: "string (enum)", description: "telegram | satellite | news | official_gov | milblogger | academic | ngo | other." },
      { name: "language", type: "string (ISO 639-1)", description: "Primary language of content." },
      { name: "country", type: "string (ISO 3166-1 alpha-2)", description: "Country of origin." },
      { name: "reliability", type: "number (0–1)", description: "Editorial reliability estimate." },
      { name: "corroboration_rate", type: "number (0–1)", description: "Proportion of claims independently confirmed." },
      { name: "first_seen_at", type: "string (ISO 8601 date)", description: "Date source first contributed a record." },
      { name: "homepage_url", type: "string (URL)", description: "Public homepage or feed URL." },
    ],
    relatedSlugs: ["events"],
  },
  {
    slug: "glossary",
    title: "Glossary terms",
    description:
      "Controlled vocabulary used across the site — military, OSINT, legal, and humanitarian terms with definitions in every active locale.",
    longDescription:
      "The glossary dataset exports the full Aegis Lens controlled vocabulary. Each term record carries a stable slug, English and Ukrainian definitions, an array of example sentences, related term slugs, and external citation URLs. The vocabulary feeds back into NER tagging and translation pipelines — keep machine-readable format when deriving secondary datasets.",
    license: "CC-BY-4.0",
    format: "JSON",
    size: "≈ 320 KB",
    updated: "2026-05-15",
    url: "/data/glossary.json",
    fields: [
      { name: "slug", type: "string", description: "URL-safe stable identifier." },
      { name: "term", type: "string", description: "English canonical term." },
      { name: "definition", type: "object {en, uk}", description: "Definition in each active locale." },
      { name: "examples", type: "array<string>", description: "Example sentences demonstrating usage." },
      { name: "related_slugs", type: "array<string>", description: "Slugs of semantically related terms." },
      { name: "sources", type: "array<{label, url}>", description: "Authoritative citations for the definition." },
    ],
    relatedSlugs: ["equipment"],
  },
  {
    slug: "equipment",
    title: "Equipment catalog",
    description:
      "Reference catalog of weapon systems, platforms, and munitions: NATO designation, country of origin, role, and known operators.",
    longDescription:
      "The equipment dataset provides a machine-readable reference for weapon systems and platforms documented by Aegis Lens. Each entry includes identification cues (visual and audio signatures), technical specifications from publicly available sources, known operators with ISO country codes, named variants, and FAQ items. All data is sourced from unclassified, public-domain references — no targeting-grade information is published.",
    license: "CC-BY-4.0",
    format: "JSON",
    size: "≈ 1.4 MB",
    updated: "2026-05-10",
    url: "/data/equipment.json",
    fields: [
      { name: "slug", type: "string", description: "URL-safe stable identifier." },
      { name: "name", type: "string", description: "Common name (NATO designation where applicable)." },
      { name: "country_of_origin", type: "string (ISO 3166-1 alpha-2)", description: "Manufacturing country." },
      { name: "role", type: "string", description: "Operational role (e.g. loitering munition, SRBM, UCAV)." },
      { name: "specs", type: "array<{label, value, source}>", description: "Public technical specifications with source citations." },
      { name: "identification_cues", type: "array<string>", description: "Visual and acoustic identification signatures." },
      { name: "operators", type: "array<{name, iso2, note}>", description: "Publicly attributed operators." },
      { name: "variants", type: "array<{name, note}>", description: "Known named variants and sub-types." },
    ],
    relatedSlugs: ["glossary", "events"],
  },
  {
    slug: "geography",
    title: "Regions, oblasts, cities",
    description:
      "Administrative geography used for filtering and rendering: oblast and rayon polygons plus city centroids with population estimates.",
    longDescription:
      "The geography dataset provides the administrative boundary and centroid data used throughout the Aegis Lens platform. Oblast (admin-1) and rayon (admin-2) polygons are derived from open government data and OpenStreetMap. City centroids include population estimates from UN DESA 2024 estimates where available. All geometries are WGS 84 (EPSG:4326).",
    license: "CC-BY-4.0",
    format: "GeoJSON",
    size: "live",
    updated: "2026-04-30",
    featured: true,
    url: "/data/geography.geojson",
    fields: [
      { name: "type", type: "string", description: "GeoJSON feature collection." },
      { name: "features[].properties.slug", type: "string", description: "Stable admin region slug." },
      { name: "features[].properties.name", type: "object {en, uk}", description: "Region name in each locale." },
      { name: "features[].properties.kind", type: "string (enum)", description: "oblast | rayon | city | country." },
      { name: "features[].properties.iso2", type: "string", description: "ISO 3166-1 alpha-2 country code." },
      { name: "features[].geometry", type: "GeoJSON (Point | Polygon | MultiPolygon)", description: "Region geometry." },
    ],
    relatedSlugs: ["events"],
  },
  {
    slug: "openapi",
    title: "OpenAPI specification",
    description:
      "Machine-readable description of the public Aegis Lens HTTP API, including authentication, rate limits, and example payloads.",
    longDescription:
      "The OpenAPI 3.1 specification documents every endpoint of the public Aegis Lens REST API: authentication (Bearer token), rate limit headers, request parameters, response schemas, and example payloads. Use this file to auto-generate client SDKs in any language, validate request/response shapes in tests, or import into API tools such as Postman, Insomnia, or Stoplight.",
    license: "CC-BY-4.0",
    format: "JSON (OpenAPI 3.1)",
    size: "≈ 180 KB",
    updated: "2026-05-22",
    url: "/api/openapi.json",
    relatedSlugs: ["postman"],
  },
  {
    slug: "postman",
    title: "Postman collection",
    description:
      "Importable Postman collection mirroring the OpenAPI spec, with pre-filled environment variables and example requests for every endpoint.",
    longDescription:
      "The Postman v2.1 collection mirrors every endpoint in the OpenAPI specification and includes pre-filled environment variables ({{base_url}}, {{api_key}}), example request bodies, and pre-request scripts for token injection. Import via File → Import in the Postman desktop app or Postman web.",
    license: "CC-BY-4.0",
    format: "JSON (Postman v2.1)",
    size: "≈ 90 KB",
    updated: "2026-05-22",
    url: "/api/postman.json",
    relatedSlugs: ["openapi"],
  },
];

export function getDataset(slug: string): Dataset | undefined {
  return DATASETS.find((d) => d.slug === slug);
}

export function citationApa(d: Dataset, siteUrl: string): string {
  const year = d.updated ? new Date(d.updated).getFullYear() : new Date().getFullYear();
  return `Aegis Lens. (${year}). ${d.title} [Dataset]. ${siteUrl}${d.url}`;
}

export function citationBibtex(d: Dataset, siteUrl: string): string {
  const year = d.updated ? new Date(d.updated).getFullYear() : new Date().getFullYear();
  return `@misc{aegislens_${d.slug}_${year},
  author    = {{Aegis Lens}},
  title     = {${d.title}},
  year      = {${year}},
  url       = {${siteUrl}${d.url}},
  note      = {Dataset. License: ${d.license}. Accessed ${new Date(d.updated).toISOString().slice(0, 10)}.}
}`;
}

export function citationRis(d: Dataset, siteUrl: string): string {
  const year = d.updated ? new Date(d.updated).getFullYear() : new Date().getFullYear();
  return `TY  - DATA
AU  - Aegis Lens
TI  - ${d.title}
PY  - ${year}
UR  - ${siteUrl}${d.url}
N1  - License: ${d.license}
ER  -`;
}
