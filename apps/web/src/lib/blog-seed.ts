export type BlogCategory = "Briefs" | "Deep Dives" | "Methodology" | "Releases";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  author: string;
  authorRole: string;
  publishedAt: string;
  readingTimeMin: number;
  aiGenerated: boolean;
  /** Pinned to the top of the index page regardless of date sort. */
  pinned?: boolean;
  /**
   * ISO date the post was last reviewed for factual accuracy.
   * Displayed on the post page as a trust signal.
   */
  lastVerifiedAt?: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "eastern-front-week-in-review-may-2026",
    pinned: true,
    lastVerifiedAt: "2026-05-25",
    title: "Eastern Front: Week in Review — 19–25 May 2026",
    excerpt:
      "Verified event summary for the eastern theatre. 47 confirmed strikes across Donetsk and Zaporizhzhia oblasts, two infrastructure corridor disruptions, and a significant shift in drone saturation patterns over the Kursk border area.",
    category: "Briefs",
    tags: ["ukraine", "donetsk", "zaporizhzhia", "drones", "weekly"],
    author: "O. Didenko",
    authorRole: "Head of Data & Methodology",
    publishedAt: "2026-05-25",
    readingTimeMin: 8,
    aiGenerated: false,
  },
  {
    slug: "satellite-imagery-analysis-kherson-crossings",
    pinned: true,
    lastVerifiedAt: "2026-05-23",
    title: "Bridge repair activity at Kherson crossings: a satellite imagery analysis",
    excerpt:
      "Multi-temporal Sentinel-2 imagery from January–May 2026 reveals three distinct phases of repair activity on two Dnipro crossings near Kherson. We walk through the methodology, imagery sources, and uncertainty bounds.",
    category: "Deep Dives",
    tags: ["ukraine", "kherson", "satellite", "infrastructure", "geolocation"],
    author: "A. Lytvyn",
    authorRole: "Founder & Head of Intelligence",
    publishedAt: "2026-05-22",
    readingTimeMin: 18,
    aiGenerated: false,
  },
  {
    slug: "confidence-scoring-v2-methodology",
    lastVerifiedAt: "2026-05-18",
    title: "Confidence scoring v2: what changed and why",
    excerpt:
      "We revised the confidence model to improve handling of social-media corroboration chains. The key change: we now detect and discount reposts of the same original, rather than treating each share as an independent signal.",
    category: "Methodology",
    tags: ["methodology", "scoring", "confidence", "osint"],
    author: "O. Didenko",
    authorRole: "Head of Data & Methodology",
    publishedAt: "2026-05-18",
    readingTimeMin: 12,
    aiGenerated: false,
  },
  {
    slug: "black-sea-maritime-q1-2026",
    title: "Black Sea maritime threat surface: Q1 2026 digest",
    excerpt:
      "AI-generated digest of Q1 maritime events: drone boat incidents, warship movements, and port disruptions. 214 events analysed; 31 high-confidence incidents published.",
    category: "Briefs",
    tags: ["ukraine", "black-sea", "maritime", "quarterly"],
    author: "Aegis Lens AI (human-reviewed)",
    authorRole: "AI-generated, reviewed by O. Didenko",
    publishedAt: "2026-05-14",
    readingTimeMin: 14,
    aiGenerated: true,
  },
  {
    slug: "geolocating-drones-with-acoustic-shadow",
    title: "Geolocating drone strikes using acoustic shadow analysis",
    excerpt:
      "Video metadata and acoustic analysis can triangulate a drone strike within 300 metres even when the camera operator pans away before impact. A methodology note with worked examples from six verified cases.",
    category: "Methodology",
    tags: ["methodology", "geolocation", "drones", "acoustic", "osint"],
    author: "M. Kovalenko",
    authorRole: "Lead Engineer",
    publishedAt: "2026-05-10",
    readingTimeMin: 22,
    aiGenerated: false,
  },
  {
    slug: "sprint-2-40-changelog-highlights",
    title: "Sprint 2.40: what shipped and why it matters for analysts",
    excerpt:
      "RSS badges on investigation cards, geo-filter chips on the city directory, the newsletter, billing toggle, and six TypeScript fixes. A plain-language summary of what changed and how it affects your workflow.",
    category: "Releases",
    tags: ["platform", "releases", "updates"],
    author: "M. Kovalenko",
    authorRole: "Lead Engineer",
    publishedAt: "2026-05-24",
    readingTimeMin: 5,
    aiGenerated: false,
  },
  {
    slug: "cyber-incidents-ukraine-q1-2026",
    title: "Ukrainian cyber incident landscape: Q1 2026",
    excerpt:
      "AI-assisted analysis of 89 verified cyber incidents in the Q1 period. Disruption targets skewed heavily toward energy and transport infrastructure. Attribution remains contested in 34% of cases.",
    category: "Briefs",
    tags: ["ukraine", "cyber", "quarterly", "infrastructure"],
    author: "Aegis Lens AI (human-reviewed)",
    authorRole: "AI-generated, reviewed by A. Lytvyn",
    publishedAt: "2026-05-07",
    readingTimeMin: 16,
    aiGenerated: true,
  },
  {
    slug: "open-source-imagery-guide-sentinel-firms",
    title: "Analyst's guide to Sentinel-2 and NASA FIRMS for conflict monitoring",
    excerpt:
      "A practical walkthrough of the two free satellite data sources we use most: Copernicus Sentinel-2 for structural analysis and NASA FIRMS for thermal anomaly / fire detection. Includes query tips, band combinations, and known failure modes.",
    category: "Methodology",
    tags: ["methodology", "satellite", "osint", "sentinel", "firms", "guide"],
    author: "O. Didenko",
    authorRole: "Head of Data & Methodology",
    publishedAt: "2026-04-30",
    readingTimeMin: 25,
    aiGenerated: false,
  },
];

export const BLOG_CATEGORIES: BlogCategory[] = ["Briefs", "Deep Dives", "Methodology", "Releases"];

export function listPinnedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.pinned).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function listPosts(opts?: { category?: BlogCategory; limit?: number }): BlogPost[] {
  let posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  if (opts?.category) posts = posts.filter((p) => p.category === opts.category);
  if (opts?.limit) posts = posts.slice(0, opts.limit);
  return posts;
}

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== post.slug && p.category === post.category)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
