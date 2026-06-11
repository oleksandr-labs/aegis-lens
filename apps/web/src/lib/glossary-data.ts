export type GlossaryTerm = {
  slug: string;
  term: string;
  abbreviation?: string;
  definition: string;
  examples?: string[];
  relatedTerms: string[];
  category: "technical" | "military" | "geopolitical" | "osint" | "legal";
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "osint",
    term: "OSINT",
    abbreviation: "OSINT",
    definition:
      "Open Source Intelligence — intelligence collected from publicly available sources including social media, news, satellite imagery, and government publications.",
    examples: [
      "Geolocating a video using Google Street View and shadow analysis",
      "Tracking vessel movements via AIS data",
    ],
    relatedTerms: ["geolocation", "sigint", "humint"],
    category: "osint",
  },
  {
    slug: "geolocation",
    term: "Geolocation",
    definition:
      "The process of identifying the geographic location of a person, image, or event using visual cues, GPS metadata, or cross-referencing with known landmarks.",
    examples: [
      "Sun angle analysis to determine time of day",
      "Building/terrain matching against satellite imagery",
    ],
    relatedTerms: ["osint", "satellite-imagery", "chronolocation"],
    category: "osint",
  },
  {
    slug: "aob",
    term: "Area of Benefit",
    abbreviation: "AOB",
    definition:
      "Operational concept defining a geographic area from which forces can influence a situation.",
    relatedTerms: ["aoi"],
    category: "military",
  },
  {
    slug: "aoi",
    term: "Area of Interest",
    abbreviation: "AOI",
    definition:
      "A geographic region being monitored for intelligence purposes. In Aegis Lens, AOIs trigger automated alerts when new events are detected.",
    relatedTerms: ["aob", "geofence"],
    category: "osint",
  },
  {
    slug: "confidence-score",
    term: "Confidence Score",
    definition:
      "A 0–1 numeric score indicating the platform's certainty that an event occurred as described, based on number of independent sources, media verification status, and geographic plausibility.",
    relatedTerms: ["verification-state", "corroboration"],
    category: "technical",
  },
  {
    slug: "danger-score",
    term: "Danger Score",
    definition:
      "A 0–100 composite score representing the potential risk to civilians or infrastructure, combining event class, severity, location proximity to populated areas, and historical impact patterns.",
    relatedTerms: ["confidence-score", "severity"],
    category: "technical",
  },
  {
    slug: "deepfake",
    term: "Deepfake",
    definition:
      "AI-generated synthetic media (video, audio, or images) designed to realistically depict events or statements that did not occur.",
    relatedTerms: ["manipulation-detection", "verification-state"],
    category: "osint",
  },
  {
    slug: "isr",
    term: "ISR",
    abbreviation: "ISR",
    definition:
      "Intelligence, Surveillance, and Reconnaissance — military doctrine combining data collection platforms (drones, satellites, sensors) with processing and analysis.",
    relatedTerms: ["osint", "elint"],
    category: "military",
  },
  {
    slug: "stix",
    term: "STIX",
    abbreviation: "STIX",
    definition:
      "Structured Threat Information eXpression — a standardized language and serialization format for communicating cyber threat intelligence.",
    examples: [
      "Aegis Lens exports events in STIX 2.1 format for enterprise integrations",
    ],
    relatedTerms: ["taxii", "ioc"],
    category: "technical",
  },
  {
    slug: "chronolocation",
    term: "Chronolocation",
    definition:
      "The OSINT technique of determining when a photo or video was taken using sun angle, shadow length, vegetation state, or visible astronomical objects.",
    relatedTerms: ["geolocation", "osint"],
    category: "osint",
  },
];

/** Sorted alphabetically by term */
export const GLOSSARY_TERMS_SORTED = [...GLOSSARY_TERMS].sort((a, b) =>
  a.term.localeCompare(b.term),
);

/** All unique categories present in the data */
export const GLOSSARY_CATEGORIES = [
  "technical",
  "military",
  "geopolitical",
  "osint",
  "legal",
] as const satisfies GlossaryTerm["category"][];

/** Group terms by first letter */
export function groupByLetter(
  terms: GlossaryTerm[],
): Map<string, GlossaryTerm[]> {
  const map = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    const bucket = map.get(letter) ?? [];
    bucket.push(t);
    map.set(letter, bucket);
  }
  return map;
}
