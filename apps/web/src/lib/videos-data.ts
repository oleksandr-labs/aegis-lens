export type VideoEntry = {
  slug: string;
  title: string;
  category: "tutorial" | "demo" | "explainer" | "interview";
  duration: string;
  views: string;
  publishedAt: string;
  tags: string[];
  thumbnailEmoji: string;
};

export const VIDEOS: VideoEntry[] = [
  {
    slug: "geolocation-tutorial-1",
    title: "Geolocation 101: Your First Image Analysis",
    category: "tutorial",
    duration: "12:34",
    views: "8.2K",
    publishedAt: "2026-05-10",
    tags: ["geolocation", "beginner"],
    thumbnailEmoji: "🗺",
  },
  {
    slug: "shadow-analysis-technique",
    title: "Shadow Analysis Masterclass",
    category: "tutorial",
    duration: "18:22",
    views: "5.1K",
    publishedAt: "2026-05-20",
    tags: ["geolocation", "advanced"],
    thumbnailEmoji: "🌒",
  },
  {
    slug: "aegis-lens-demo-2026",
    title: "Aegis Lens Platform Demo — May 2026",
    category: "demo",
    duration: "8:15",
    views: "12.4K",
    publishedAt: "2026-05-01",
    tags: ["product", "demo"],
    thumbnailEmoji: "🖥",
  },
  {
    slug: "satellite-imagery-basics",
    title: "Reading Sentinel-2 Imagery for OSINT",
    category: "tutorial",
    duration: "22:10",
    views: "4.8K",
    publishedAt: "2026-04-15",
    tags: ["satellite", "tutorial"],
    thumbnailEmoji: "🛰",
  },
  {
    slug: "osint-tools-overview",
    title: "OSINT Tools Overview 2026",
    category: "explainer",
    duration: "15:42",
    views: "9.7K",
    publishedAt: "2026-03-20",
    tags: ["tools", "overview"],
    thumbnailEmoji: "🔭",
  },
];

export const VIDEO_CATEGORY_LABELS: Record<VideoEntry["category"], string> = {
  tutorial: "Tutorial",
  demo: "Demo",
  explainer: "Explainer",
  interview: "Interview",
};

export function getVideoEntry(slug: string): VideoEntry | undefined {
  return VIDEOS.find((v) => v.slug === slug);
}

export function listVideoEntries(): VideoEntry[] {
  return VIDEOS.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
