export type PodcastEpisode = {
  slug: string;
  episodeNumber: number;
  title: string;
  description: string;
  guestName?: string;
  guestRole?: string;
  durationMin: number;
  publishedAt: string;
  tags: string[];
  transcript?: string;
  spotifyUrl?: string;
  appleUrl?: string;
};

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    slug: "ep001-osint-war-journalism",
    episodeNumber: 1,
    title: "OSINT in Modern War Journalism",
    description: "How open-source intelligence is changing frontline reporting.",
    guestName: "James Wilson",
    guestRole: "Head of OSINT, Aegis Lens",
    durationMin: 48,
    publishedAt: "2026-05-15",
    tags: ["osint", "journalism"],
    transcript: "Transcript coming soon.",
    spotifyUrl: "https://spotify.com",
    appleUrl: "https://podcasts.apple.com",
  },
  {
    slug: "ep002-satellite-imagery-analysis",
    episodeNumber: 2,
    title: "Reading Satellite Imagery for Conflict Analysis",
    description: "What Sentinel-2 and commercial imagery reveal that ground reporting can't.",
    guestName: "Sara Hassan",
    guestRole: "Verification Lead",
    durationMin: 52,
    publishedAt: "2026-05-29",
    tags: ["satellite", "verification"],
  },
  {
    slug: "ep003-ai-verification-pipeline",
    episodeNumber: 3,
    title: "How AI Assists Human Verification",
    description: "The role of machine learning in evidence verification — and its limits.",
    guestName: "Anna Marchuk",
    guestRole: "CTO, Aegis Lens",
    durationMin: 44,
    publishedAt: "2026-06-12",
    tags: ["ai", "verification", "tech"],
  },
];

export function getPodcastEpisode(slug: string): PodcastEpisode | undefined {
  return PODCAST_EPISODES.find((e) => e.slug === slug);
}

export function listPodcastEpisodes(): PodcastEpisode[] {
  return PODCAST_EPISODES.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
