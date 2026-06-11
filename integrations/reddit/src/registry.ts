/**
 * Curated subreddit registry for conflict OSINT.
 *
 * Only subreddits with high signal/noise and verifiable moderation.
 */

import type { RedditSubreddit } from "./types";

export const SUBREDDIT_REGISTRY: RedditSubreddit[] = [
  {
    name: "ukraine",
    description: "General Ukraine news and discussion",
    reliability: 3,
    topics: ["general", "politics", "humanitarian"],
    requiresVerifiedOp: false,
  },
  {
    name: "UkraineWarVideoReport",
    description: "Verified conflict video reports — strict sourcing rules",
    reliability: 4,
    topics: ["military", "osint", "video"],
    requiresVerifiedOp: true,
  },
  {
    name: "UkrainianConflict",
    description: "News and analysis of the Ukrainian conflict",
    reliability: 3,
    topics: ["military", "politics"],
    requiresVerifiedOp: false,
  },
  {
    name: "worldnews",
    description: "World news — Ukraine flair filter applied at ingestion",
    reliability: 3,
    topics: ["general"],
    requiresVerifiedOp: false,
  },
  {
    name: "geopolitics",
    description: "Geopolitical analysis including Eastern Europe",
    reliability: 4,
    topics: ["analysis", "politics"],
    requiresVerifiedOp: false,
  },
  {
    name: "OSINT",
    description: "Open source intelligence community",
    reliability: 4,
    topics: ["osint", "military"],
    requiresVerifiedOp: false,
  },
  {
    name: "CredibleDefense",
    description: "High-quality defense analysis — flaired users only",
    reliability: 5,
    topics: ["military", "analysis"],
    requiresVerifiedOp: true,
  },
];

export class RedditSubredditRegistryService {
  private readonly subreddits = new Map<string, RedditSubreddit>(
    SUBREDDIT_REGISTRY.map((s) => [s.name.toLowerCase(), s]),
  );

  getByName(name: string): RedditSubreddit | undefined {
    return this.subreddits.get(name.toLowerCase());
  }

  byTopic(topic: string): RedditSubreddit[] {
    return SUBREDDIT_REGISTRY.filter((s) => s.topics.includes(topic));
  }

  getSourceWeight(subreddit: string): number {
    const sub = this.getByName(subreddit);
    if (!sub) return 0.2;
    return sub.reliability / 5;
  }

  highReliability(minReliability = 4): RedditSubreddit[] {
    return SUBREDDIT_REGISTRY.filter((s) => s.reliability >= minReliability);
  }

  all(): RedditSubreddit[] {
    return SUBREDDIT_REGISTRY;
  }
}
