import type { Locale } from "@aegis/i18n-config";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type GuideSection = {
  heading: string;
  body: string;
};

export type Guide = {
  slug: string;
  title: Localized;
  summary: Localized;
  category: "osint" | "verification" | "geospatial" | "developer" | "analyst";
  level: "intro" | "intermediate" | "advanced";
  /** Approx reading time in minutes. */
  readingMinutes: number;
  publishedAt: string;
  updatedAt: string;
  author: string;
  /** Cross-link slugs into other surfaces. */
  relatedGlossarySlugs?: string[];
  relatedEquipmentSlugs?: string[];
  relatedInvestigationSlugs?: string[];
  /** Tag slugs for cross-listing in /tags. */
  tags: string[];
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "getting-started-with-osint",
    title: { en: "Getting started with OSINT" },
    summary: {
      en: "A pragmatic introduction to open-source intelligence: what it is, what it isn't, how to scope a question, and how to keep a notebook that holds up under scrutiny.",
    },
    category: "osint",
    level: "intro",
    readingMinutes: 12,
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-22",
    author: "M. Korol",
    relatedGlossarySlugs: ["osint", "socmint", "primary-source", "secondary-source"],
    tags: ["osint", "methodology", "training"],
    sections: [
      {
        heading: "What OSINT is — and isn't",
        body: "Open-source intelligence is the discipline of producing decision-useful findings from publicly available information. It is not 'whatever I found online' — the discipline is in scoping, sourcing, and accountability. If you can't tell a reader where a claim came from, you don't have OSINT, you have a vibe.",
      },
      {
        heading: "Scope before you search",
        body: "Write down the actual question you're trying to answer in one sentence. If you can't, you're going to spend hours collecting irrelevant material. The single most common OSINT mistake is unbounded collection.",
      },
      {
        heading: "Keep a notebook",
        body: "Every claim gets an archive link (archive.today / Wayback Machine), a fetched-at timestamp, and the language of the source. Your future self will thank you, especially when a source is taken down two days after you cite it.",
      },
      {
        heading: "Corroboration is the unit of trust",
        body: "A single source is a lead. Two independent sources is evidence. Three independent sources is a finding. Aegis Lens publishes confidence scores using exactly this scheme — see /methodology for the long form.",
      },
    ],
  },
  {
    slug: "geolocating-a-photograph",
    title: { en: "Geolocating a photograph: a step-by-step walkthrough" },
    summary: {
      en: "How to locate a photograph using shadows, signage, vegetation, building geometry, and street-level imagery. With a worked example.",
    },
    category: "geospatial",
    level: "intermediate",
    readingMinutes: 18,
    publishedAt: "2026-04-15",
    updatedAt: "2026-05-10",
    author: "T. Marchenko",
    relatedGlossarySlugs: ["geolocation", "chronolocation"],
    tags: ["geospatial", "geolocation", "imagery"],
    sections: [
      {
        heading: "Anchor objects first",
        body: "Identify the most unique object in the frame — a sign, a distinctive building, a piece of public infrastructure. That becomes your search seed. Everything else is corroboration.",
      },
      {
        heading: "Shadow and time-of-day",
        body: "Use the sun's azimuth to constrain time-of-day and direction. SunCalc and PeakVisor both let you reproduce the shadow geometry for a candidate location and date.",
      },
      {
        heading: "Cross-check with street-level imagery",
        body: "Mapillary and Google Street View are your friends. Confirm at least three independent features (a sign + a roof line + a tree) before declaring a match.",
      },
    ],
  },
  {
    slug: "verifying-social-media-footage",
    title: { en: "Verifying social-media footage end-to-end" },
    summary: {
      en: "The seven checks Aegis Lens runs before a piece of social-media footage influences a published event: provenance, timing, location, content, attribution, language, and corroboration.",
    },
    category: "verification",
    level: "intermediate",
    readingMinutes: 15,
    publishedAt: "2026-03-20",
    updatedAt: "2026-05-18",
    author: "K. Lysenko",
    relatedGlossarySlugs: [
      "verification",
      "corroboration",
      "attribution",
      "deepfake",
      "synthetic-media",
    ],
    tags: ["verification", "social-media", "osint"],
    sections: [
      {
        heading: "Provenance",
        body: "Who posted it first? A repost from a high-volume aggregator is not the source. Trace upload time on every platform until you hit the earliest one.",
      },
      {
        heading: "Timing",
        body: "EXIF (when present) is a hint, not a fact. Corroborate with shadows, weather, traffic patterns, broadcast schedules in the background, and platform metadata.",
      },
      {
        heading: "Location",
        body: "Geolocate independently (see our /guides/geolocating-a-photograph walkthrough) before believing any caption.",
      },
      {
        heading: "Content integrity",
        body: "Run reverse image search, check for prior appearances, and look for re-encoding artifacts that suggest the footage has been altered.",
      },
    ],
  },
  {
    slug: "reading-satellite-imagery",
    title: { en: "Reading satellite imagery for non-imagery analysts" },
    summary: {
      en: "What you can and can't see at different resolutions, why the same scene looks different across sensors, and how to interpret repair, dispersal, and concealment indicators.",
    },
    category: "geospatial",
    level: "intermediate",
    readingMinutes: 22,
    publishedAt: "2026-02-08",
    updatedAt: "2026-04-30",
    author: "I. Bondar",
    relatedGlossarySlugs: ["geolocation"],
    relatedInvestigationSlugs: ["crimea-bridge-infrastructure"],
    tags: ["geospatial", "imagery", "satellite"],
    sections: [
      {
        heading: "Resolution is not detail",
        body: "30 cm imagery doesn't necessarily mean you can read a license plate. Pixel size is the floor of what you can resolve, not the ceiling of what you can interpret.",
      },
      {
        heading: "Sensor differences matter",
        body: "Optical, SAR, and multispectral imagery answer different questions. SAR sees through cloud and at night; optical gives you human-interpretable colour; multispectral picks up vegetation stress and disturbed soil.",
      },
      {
        heading: "Look for change, not state",
        body: "A single image is a snapshot. Two images of the same place at different times is a finding. Always work in pairs at minimum.",
      },
    ],
  },
  {
    slug: "using-the-aegis-lens-api",
    title: { en: "Using the Aegis Lens API" },
    summary: {
      en: "From your first curl to cursor pagination, rate limits, and webhook delivery. Includes copy-pasteable snippets in five languages.",
    },
    category: "developer",
    level: "intro",
    readingMinutes: 10,
    publishedAt: "2026-05-15",
    updatedAt: "2026-05-24",
    author: "Aegis Lens Engineering",
    tags: ["api", "developer", "integration"],
    sections: [
      {
        heading: "Your first call",
        body: "Every endpoint is unauthenticated for now: `curl https://aegislens.io/api/events?country=ua&limit=5`. See /docs/api for the full reference and /docs/api/explorer for an interactive Redoc view.",
      },
      {
        heading: "Cursor pagination",
        body: "The `/api/events` endpoint returns `meta.nextCursor`. Pass it back as `?cursor=<value>` to fetch the next page. Stop when `meta.hasMore === false`. The HTTP response also carries an RFC 5988 `Link: <…>; rel=\"next\"` header.",
      },
      {
        heading: "Rate limits",
        body: "60 requests per minute per IP. Burst is allowed; sustained traffic above the limit returns HTTP 429 with `Retry-After` and `X-RateLimit-*` headers.",
      },
    ],
  },
  {
    slug: "writing-a-publishable-osint-finding",
    title: { en: "Writing a publishable OSINT finding" },
    summary: {
      en: "Structure, sourcing, hedging language, and the difference between 'we believe' and 'we have observed'. Aimed at analysts moving from internal notes to public publication.",
    },
    category: "analyst",
    level: "advanced",
    readingMinutes: 16,
    publishedAt: "2026-01-22",
    updatedAt: "2026-05-05",
    author: "O. Pavlenko",
    relatedGlossarySlugs: ["attribution", "corroboration"],
    tags: ["analyst", "writing", "publication"],
    sections: [
      {
        heading: "Lede that earns its first sentence",
        body: "The first sentence of a finding is real estate. Lead with what you observed, not who you are. 'On 23 May, two impacts were geolocated to northern Kharkiv' beats 'We are pleased to announce…' every single time.",
      },
      {
        heading: "Hedge calibrated to evidence",
        body: "'We assess' is for inference. 'We have observed' is for direct evidence. Mixing them is the fastest way to lose a reader's trust.",
      },
      {
        heading: "Cite every claim",
        body: "Inline citations, with archive links. If a fact is too embarrassing to source publicly, it is too embarrassing to include without a sourcing plan.",
      },
    ],
  },
];

export function listGuides(): Guide[] {
  return GUIDES.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export function guidesByCategory(category: Guide["category"]): Guide[] {
  return GUIDES.filter((g) => g.category === category);
}
