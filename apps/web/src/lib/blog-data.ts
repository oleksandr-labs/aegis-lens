export type BlogDataCategory =
  | "Analysis"
  | "OSINT Guide"
  | "Conflict Brief"
  | "Product Update"
  | "Data Release";

export const BLOG_DATA_CATEGORIES: BlogDataCategory[] = [
  "Analysis",
  "OSINT Guide",
  "Conflict Brief",
  "Product Update",
  "Data Release",
];

export type BlogDataPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogDataCategory;
  date: string;
  readTime: string;
  eventCount: number | null;
  author: string;
};

export const BLOG_POSTS_DATA: BlogDataPost[] = [
  {
    slug: "ukraine-air-defense-deep-dive",
    title: "Ukraine Air Defense: A Deep Dive",
    excerpt:
      "An analysis of intercepted missile and drone data from the past quarter.",
    category: "Analysis",
    date: "2026-05-20",
    readTime: "8 min",
    eventCount: 312,
    author: "Aegis Editorial",
  },
  {
    slug: "osint-image-verification-guide",
    title: "How to Verify Conflict Photos: A Step-by-Step OSINT Guide",
    excerpt:
      "From reverse image search to sun-angle analysis — our complete workflow.",
    category: "OSINT Guide",
    date: "2026-05-15",
    readTime: "12 min",
    eventCount: null,
    author: "OSINT Team",
  },
  {
    slug: "black-sea-maritime-monitoring",
    title: "Black Sea Maritime Intelligence: What AIS Data Tells Us",
    excerpt:
      "How vessel tracking reveals logistical patterns in the Black Sea.",
    category: "Conflict Brief",
    date: "2026-05-10",
    readTime: "6 min",
    eventCount: 89,
    author: "Maritime Desk",
  },
  {
    slug: "aegis-lens-v2-launch",
    title: "Aegis Lens v2: Real-Time AI-Powered OSINT Platform",
    excerpt:
      "Today we're launching the most significant update to our intelligence platform.",
    category: "Product Update",
    date: "2026-05-01",
    readTime: "4 min",
    eventCount: null,
    author: "Aegis Team",
  },
  {
    slug: "infrastructure-attack-patterns",
    title: "Infrastructure Attack Patterns: A Data Analysis",
    excerpt:
      "Using 6 months of verified events to identify patterns in infrastructure targeting.",
    category: "Analysis",
    date: "2026-04-25",
    readTime: "10 min",
    eventCount: 448,
    author: "Data Team",
  },
  {
    slug: "geolocation-techniques-2026",
    title: "Geolocation Techniques for Modern OSINT Analysts",
    excerpt:
      "Shadow analysis, vegetation cues, and building signature matching.",
    category: "OSINT Guide",
    date: "2026-04-18",
    readTime: "15 min",
    eventCount: null,
    author: "OSINT Team",
  },
  {
    slug: "civilian-casualty-data-release",
    title: "Open Dataset: Verified Civilian Events 2022–2026",
    excerpt:
      "We are releasing a verified, de-identified dataset of civilian-affecting events.",
    category: "Data Release",
    date: "2026-04-10",
    readTime: "3 min",
    eventCount: 1847,
    author: "Data Team",
  },
  {
    slug: "cyber-operations-q1-2026",
    title: "Cyber Operations in Q1 2026: Threat Landscape Report",
    excerpt:
      "DDoS, intrusion attempts, and disinformation operations — quarterly summary.",
    category: "Conflict Brief",
    date: "2026-04-02",
    readTime: "7 min",
    eventCount: 58,
    author: "Cyber Desk",
  },
  {
    slug: "confidence-scoring-methodology",
    title: "How We Score Confidence: Our Verification Methodology",
    excerpt:
      "A transparent look at how Aegis Lens assigns confidence scores to events.",
    category: "Product Update",
    date: "2026-03-20",
    readTime: "5 min",
    eventCount: null,
    author: "Engineering",
  },
];

export const CATEGORY_CHIP_STYLES: Record<BlogDataCategory, string> = {
  Analysis: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  "OSINT Guide": "text-amber-400 border-amber-500/40 bg-amber-500/10",
  "Conflict Brief": "text-red-400 border-red-500/40 bg-red-500/10",
  "Product Update": "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  "Data Release": "text-blue-400 border-blue-500/40 bg-blue-500/10",
};

export function getDataPost(slug: string): BlogDataPost | undefined {
  return BLOG_POSTS_DATA.find((p) => p.slug === slug);
}

export function relatedDataPosts(post: BlogDataPost, limit = 3): BlogDataPost[] {
  return BLOG_POSTS_DATA.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  ).slice(0, limit);
}

export const PLACEHOLDER_SOURCES = [
  { name: "Telegram: @UkraineNow", url: "https://archive.org" },
  { name: "ISW Daily Update", url: "https://understandingwar.org" },
  { name: "DeepStateMAP", url: "https://deepstatemap.live" },
  { name: "Liveuamap", url: "https://liveuamap.com" },
  { name: "UA Army General Staff", url: "https://www.facebook.com/GeneralStaff.ua" },
];
