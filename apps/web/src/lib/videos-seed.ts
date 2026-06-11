export type Video = {
  slug: string;
  title: string;
  /** ISO date. */
  publishedAt: string;
  /** Duration in seconds. */
  durationSeconds: number;
  /** Short teaser. */
  summary: string;
  /** Category — used for index grouping. */
  category: "explainer" | "walkthrough" | "investigation" | "interview" | "briefing";
  /** Free-form tags. */
  tags: string[];
  /** Chapter markers (seconds + title). */
  chapters: { startSeconds: number; title: string }[];
  /** Transcript paragraphs. */
  transcript: string[];
  /** Linked event ID, report slug, or investigation slug. */
  linkedSurfaces: { kind: "event" | "report" | "investigation"; id: string; label: string }[];
};

export const VIDEOS: Video[] = [
  {
    slug: "explainer-confidence-score",
    title: "How the confidence score works (in 4 minutes)",
    publishedAt: "2026-04-30",
    durationSeconds: 4 * 60 + 12,
    summary:
      "A short, no-prerequisite explainer of the Aegis Lens confidence score — what it measures, how it updates, and how to use it operationally.",
    category: "explainer",
    tags: ["confidence", "methodology", "scoring"],
    chapters: [
      { startSeconds: 0, title: "What confidence is (and isn't)" },
      { startSeconds: 60, title: "Inputs to the score" },
      { startSeconds: 150, title: "How the score updates" },
      { startSeconds: 210, title: "Using thresholds in practice" },
    ],
    transcript: [
      "Confidence answers one question: how sure are we that this event happened as described?",
      "The score ranges from zero to one and combines source count, source diversity, corroboration window, and verification state.",
      "Confidence updates as new sources arrive. An event published at 0.45 can move to 0.85 within an hour.",
      "Operationally, treat 0.5 as the visibility threshold and 0.7 as the alerting threshold.",
    ],
    linkedSurfaces: [
      { kind: "report", id: "methodology-confidence-scoring-v1", label: "Confidence methodology v1" },
    ],
  },
  {
    slug: "walkthrough-geolocating-photo",
    title: "Walkthrough: geolocating a photograph",
    publishedAt: "2026-03-18",
    durationSeconds: 11 * 60 + 24,
    summary:
      "End-to-end worked example of geolocating a single photograph using anchor objects, shadow geometry, and street-level cross-check.",
    category: "walkthrough",
    tags: ["geolocation", "geospatial", "imagery"],
    chapters: [
      { startSeconds: 0, title: "The input" },
      { startSeconds: 120, title: "Pick an anchor object" },
      { startSeconds: 360, title: "Constrain with shadows" },
      { startSeconds: 540, title: "Cross-check with Street View" },
      { startSeconds: 600, title: "Publish coordinates with precision" },
    ],
    transcript: [
      "We start with a single photograph. No EXIF.",
      "Step one is pick the most distinctive thing in the frame. That becomes our search seed.",
      "Step two is shadow geometry. Sun azimuth narrows the time-of-day and, given a fixed orientation guess, narrows position too.",
      "Step three is cross-check with street-level imagery. Confirm three independent features before declaring a match.",
      "Finally we publish coordinates with an honest precision radius — not a fictitious decimal-degree resolution.",
    ],
    linkedSurfaces: [],
  },
  {
    slug: "investigation-shahed-launch-network",
    title: "Reconstructing the Shahed launch network",
    publishedAt: "2026-01-14",
    durationSeconds: 18 * 60 + 7,
    summary:
      "Inside the methodology behind the Shahed launch site network investigation — back-projection geometry, debris geolocation, and confidence calibration.",
    category: "investigation",
    tags: ["uav", "investigation", "geolocation"],
    chapters: [
      { startSeconds: 0, title: "The puzzle" },
      { startSeconds: 240, title: "Public source inventory" },
      { startSeconds: 600, title: "Back-projection geometry" },
      { startSeconds: 960, title: "Cross-checks and calibration" },
      { startSeconds: 1320, title: "What we did not publish" },
    ],
    transcript: [
      "The puzzle was simple to state, hard to answer: dozens of inbound trajectories per night, no admitted launch points. Where did they come from?",
      "Public source inventory: Air Force operational summaries, civilian flight-warning maps, geolocated debris photographs.",
      "Back-projection: given a documented impact point and a propulsion envelope, the launch point lives on an arc.",
      "Cross-checks let us collapse the arc to a small candidate area.",
      "What we didn't publish: candidate sites that didn't reach the corroboration bar stayed in the internal notebook.",
    ],
    linkedSurfaces: [
      {
        kind: "investigation",
        id: "shahed-launch-site-network",
        label: "Shahed launch site network investigation",
      },
    ],
  },
  {
    slug: "briefing-energy-grid-winter",
    title: "Energy grid resilience — winter 2025–26 briefing",
    publishedAt: "2026-02-22",
    durationSeconds: 22 * 60 + 38,
    summary:
      "Where the grid attack pattern shifted across the winter campaign, what worked, what didn't, and the resilience metrics that mattered most.",
    category: "briefing",
    tags: ["energy", "infrastructure", "briefing"],
    chapters: [
      { startSeconds: 0, title: "Headline numbers" },
      { startSeconds: 300, title: "Strike rate and class mix" },
      { startSeconds: 780, title: "Repair throughput as the constraint" },
      { startSeconds: 1260, title: "Cross-border restoration coordination" },
      { startSeconds: 1740, title: "What to watch in Q3" },
    ],
    transcript: [
      "Headline numbers first. Confirmed strikes on high-voltage substations ran at roughly double last winter's rate.",
      "The thing that changed wasn't the strike rate. It was that the same nodes were re-attacked during partial restoration.",
      "Repair throughput was the binding constraint, not workforce.",
      "Cross-border restoration agreements paid off where they were pre-coordinated. Where they weren't, recovery took longer than the technical fix would suggest.",
    ],
    linkedSurfaces: [
      {
        kind: "report",
        id: "weekly-ua-2026-w21",
        label: "Weekly Ukraine — week 21",
      },
    ],
  },
];

export function listVideos(): Video[] {
  return VIDEOS.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getVideo(slug: string): Video | null {
  return VIDEOS.find((v) => v.slug === slug) ?? null;
}

export function formatVideoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function isoVideoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
}

export const VIDEO_CATEGORY_LABEL: Record<Video["category"], string> = {
  explainer: "Explainer",
  walkthrough: "Walkthrough",
  investigation: "Investigation",
  interview: "Interview",
  briefing: "Briefing",
};
