export type PressReleaseCategory = "Product" | "Data" | "Partnership" | "Community";

export type PressRelease = {
  slug: string;
  headline: string;
  summary: string;
  date: string;
  category: PressReleaseCategory;
};

export const PRESS_RELEASES: PressRelease[] = [
  {
    slug: "aegis-lens-public-api-launch",
    headline: "Aegis Lens opens public API to researchers and journalists",
    summary:
      "Verified conflict event data now accessible via REST and GraphQL. Free tier for press and academic research.",
    date: "2026-03-15",
    category: "Product",
  },
  {
    slug: "aegis-lens-dataset-ukraine-q1-2026",
    headline: "Q1 2026 Ukraine conflict dataset released under CC BY 4.0",
    summary:
      "12,400 verified events covering January–March 2026, with confidence scores, geolocations, and source citations.",
    date: "2026-04-02",
    category: "Data",
  },
  {
    slug: "aegis-lens-gijn-partnership",
    headline: "Aegis Lens partners with GIJN to provide data to investigative newsrooms",
    summary:
      "Global Investigative Journalism Network members receive subsidised Pro access and dedicated analyst support.",
    date: "2026-04-20",
    category: "Partnership",
  },
  {
    slug: "aegis-lens-community-launch",
    headline: "Aegis Lens launches verified contributor programme",
    summary:
      "Open-source contributors can apply for verified status, early API access, and attribution in public releases.",
    date: "2026-05-10",
    category: "Community",
  },
];
