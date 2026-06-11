import { COMPANIES, TOOLS, type DirectoryEntry } from "@/lib/directory-seed";

/**
 * Industries are derived dynamically from the categories present in COMPANIES + TOOLS.
 * The same display label maps to a single kebab-case slug.
 */
export type IndustryView = {
  slug: string;
  label: string;
  description?: string;
  featured?: boolean;
  useCaseVertical?: string;
  companies: DirectoryEntry[];
  tools: DirectoryEntry[];
  total: number;
};

type IndustryMeta = {
  description: string;
  featured?: boolean;
  useCaseVertical?: string;
};

const INDUSTRY_META: Record<string, IndustryMeta> = {
  osint: {
    description: "Open-source intelligence platforms, geolocation tools, and SOCMINT frameworks for analysts and investigators.",
    featured: true,
    useCaseVertical: "journalism",
  },
  cybersecurity: {
    description: "Threat intelligence, vulnerability management, and incident response tools for security operations centres.",
    featured: true,
    useCaseVertical: "defense",
  },
  geospatial: {
    description: "GIS platforms, spatial analytics, and mapping infrastructure for analysing geographic data at scale.",
    featured: true,
    useCaseVertical: "humanitarian",
  },
  "satellite-imagery": {
    description: "Commercial and open-access Earth observation imagery for change detection, damage assessment, and surveillance.",
    featured: true,
    useCaseVertical: "defense",
  },
  "threat-intelligence": {
    description: "Structured threat data, IOC feeds, and adversary tracking for proactive defence and attribution.",
    featured: true,
    useCaseVertical: "defense",
  },
  verification: {
    description: "Fact-checking, media verification, and provenance-tracking tools for journalists and content teams.",
    useCaseVertical: "journalism",
  },
  "defense-tech": {
    description: "Autonomous systems, C2 software, and defence-grade analytics platforms for government and military.",
    useCaseVertical: "defense",
  },
  mapping: {
    description: "Interactive map platforms, tile servers, and cartographic tools for building location-aware applications.",
  },
  analytics: {
    description: "Data analytics and business intelligence platforms for processing large-scale structured datasets.",
  },
  nlp: {
    description: "Natural language processing frameworks and text analytics for unstructured intelligence extraction.",
    useCaseVertical: "journalism",
  },
};

export function industrySlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function industryLabel(slug: string): string | null {
  for (const e of [...COMPANIES, ...TOOLS]) {
    if (industrySlug(e.category) === slug) return e.category;
  }
  return null;
}

export function listIndustries(): IndustryView[] {
  const map = new Map<string, IndustryView>();
  for (const e of COMPANIES) {
    const slug = industrySlug(e.category);
    const meta = INDUSTRY_META[slug];
    const v = map.get(slug) ?? {
      slug,
      label: e.category,
      description: meta?.description,
      featured: meta?.featured,
      useCaseVertical: meta?.useCaseVertical,
      companies: [],
      tools: [],
      total: 0,
    };
    v.companies.push(e);
    v.total = v.companies.length + v.tools.length;
    map.set(slug, v);
  }
  for (const e of TOOLS) {
    const slug = industrySlug(e.category);
    const meta = INDUSTRY_META[slug];
    const v = map.get(slug) ?? {
      slug,
      label: e.category,
      description: meta?.description,
      featured: meta?.featured,
      useCaseVertical: meta?.useCaseVertical,
      companies: [],
      tools: [],
      total: 0,
    };
    v.tools.push(e);
    v.total = v.companies.length + v.tools.length;
    map.set(slug, v);
  }
  return [...map.values()].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return b.total - a.total;
  });
}

export function listFeaturedIndustries(): IndustryView[] {
  return listIndustries().filter((i) => i.featured);
}

export function getIndustry(slug: string): IndustryView | null {
  return listIndustries().find((i) => i.slug === slug) ?? null;
}
