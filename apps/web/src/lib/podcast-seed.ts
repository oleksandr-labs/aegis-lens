export type PodcastEpisode = {
  slug: string;
  /** Episode number. */
  number: number;
  title: string;
  /** ISO date. */
  publishedAt: string;
  /** Duration in seconds. */
  durationSeconds: number;
  /** One-line teaser. */
  summary: string;
  /** Guest list (free-form). */
  guests: { name: string; role: string }[];
  /** Show-notes paragraphs. */
  showNotes: string[];
  /** Chapter markers (seconds + title). */
  chapters: { startSeconds: number; title: string }[];
  /** Transcript paragraphs (publishable). */
  transcript: string[];
  /** Cross-link tag slugs. */
  tags: string[];
};

export const PODCAST_TITLE = "Aegis Lens — Field Notes";
export const PODCAST_DESCRIPTION =
  "Long-form conversations with OSINT analysts, journalists, and defense practitioners — the craft, the constraints, and the calls that keep finding the line.";
export const PODCAST_AUTHOR = "Aegis Lens";

export const EPISODES: PodcastEpisode[] = [
  {
    slug: "ep-01-what-osint-actually-is",
    number: 1,
    title: "What OSINT actually is — and what it isn't",
    publishedAt: "2026-01-15",
    durationSeconds: 42 * 60 + 18,
    summary:
      "Show host walks through the working definition of open-source intelligence with a practicing analyst. Where the discipline starts, where it stops, and what 'just Google' gets wrong.",
    guests: [
      { name: "M. Korol", role: "Analyst, Aegis Lens" },
    ],
    showNotes: [
      "We open with the cheap definition (public information turned into decision-useful findings) and stress-test it against the hard cases.",
      "We get into accountability — what separates OSINT from 'whatever I found online' is the discipline of saying where things came from and what they don't show.",
      "We close with the three-source corroboration rule and why publication confidence labels matter more than confidence the analyst feels privately.",
    ],
    chapters: [
      { startSeconds: 0, title: "Cold open: a single Telegram post" },
      { startSeconds: 240, title: "Working definition of OSINT" },
      { startSeconds: 720, title: "What 'just Google' gets wrong" },
      { startSeconds: 1500, title: "Source tiering in practice" },
      { startSeconds: 2100, title: "Three-source corroboration rule" },
    ],
    transcript: [
      "[Host] Welcome back. This is field notes from Aegis Lens. Today we're going to do something basic but worth doing: define open-source intelligence well enough that we can argue about everything else from a shared baseline.",
      "[Guest] Right. The cheap definition is — public information turned into decision-useful findings. That's it. The discipline is everything that follows from the word 'decision-useful.'",
      "[Host] Because anyone can find a viral clip. That's not OSINT.",
      "[Guest] No. That's collection at best. OSINT is what happens after collection — when you scope a question, source against that scope, corroborate, hedge calibrated to evidence, and publish in a form someone can act on or audit later.",
    ],
    tags: ["osint", "methodology", "podcast"],
  },
  {
    slug: "ep-02-shahed-launch-geography",
    number: 2,
    title: "Inside the Shahed launch site network reconstruction",
    publishedAt: "2026-02-12",
    durationSeconds: 51 * 60 + 4,
    summary:
      "Two analysts walk through how they reconstructed five primary launch areas for one-way attack drones using only public flight-warning maps and impact reports.",
    guests: [
      { name: "S. Hrytsenko", role: "Lead investigator, Shahed launch site network" },
      { name: "T. Marchenko", role: "Geospatial analyst" },
    ],
    showNotes: [
      "We start with the puzzle: dozens of inbound trajectories per night, no admitted launch points.",
      "Then the method — back-projecting from documented impact points to plausible launch arcs, narrowed by physics + observable air defense engagement geometry.",
      "Finally, the implications for civilian air-raid planning and counter-targeting cycles.",
    ],
    chapters: [
      { startSeconds: 0, title: "Cold open: a quiet night that wasn't" },
      { startSeconds: 360, title: "Source material constraints" },
      { startSeconds: 1080, title: "Back-projection geometry" },
      { startSeconds: 1740, title: "Cross-checking with debris geolocation" },
      { startSeconds: 2640, title: "What changes if launch sites shift" },
    ],
    transcript: [
      "[Host] How sure can you be that those five launch areas are the right ones?",
      "[Guest 1] We're sure enough that we'd publish a confidence above 0.85. The areas converge from independent kinds of evidence — observed flight-warning maps, public impact reporting, and debris-field geolocation.",
      "[Host] And the ones you're less sure about?",
      "[Guest 2] We don't publish those as launch sites. They're candidate areas in our internal notebook until corroboration arrives.",
    ],
    tags: ["uav", "geolocation", "investigation"],
  },
  {
    slug: "ep-03-newsroom-verification",
    number: 3,
    title: "Verification under deadline",
    publishedAt: "2026-03-08",
    durationSeconds: 38 * 60 + 47,
    summary:
      "An investigative producer talks about running the seven-check verification workflow against a breaking-news claim with a three-hour publication window.",
    guests: [{ name: "K. Lysenko", role: "Investigative producer, anonymous outlet" }],
    showNotes: [
      "We walk a real (anonymized) story from tip to publishable finding.",
      "The mechanics of provenance tracing on a clip that's been re-shared 8000 times.",
      "Why 'we have observed' and 'we assess' matter so much.",
    ],
    chapters: [
      { startSeconds: 0, title: "Cold open: the tip" },
      { startSeconds: 300, title: "Scoping the question" },
      { startSeconds: 1020, title: "Provenance and timing" },
      { startSeconds: 1620, title: "The call to publish at 0.65 confidence" },
    ],
    transcript: [
      "[Host] You had three hours and a viral clip. Walk me through the first thirty minutes.",
      "[Guest] First thirty minutes is always the same. Trace it back. Where did it actually start? Not 'who is sharing it now,' but 'who posted it first that we can verify?' That takes ten minutes if you're disciplined.",
    ],
    tags: ["journalism", "verification", "deadline"],
  },
];

export function listEpisodes(): PodcastEpisode[] {
  return EPISODES.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getEpisode(slug: string): PodcastEpisode | null {
  return EPISODES.find((e) => e.slug === slug) ?? null;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** ISO-8601 duration for schema.org `timeRequired` / `duration`. */
export function isoDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
}
