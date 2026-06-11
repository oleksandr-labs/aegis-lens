/**
 * News aggregator types — GDELT GKG v2, NewsAPI.org, MediaCloud.
 */

/** GDELT Global Knowledge Graph v2 record */
export interface GdeltGkgRecord {
  /** GKG record ID (DATE#SOURCEID) */
  gkg_record_id: string;
  /** Publication date ISO-8601 */
  date: string;
  /** Source document URL */
  document_identifier: string;
  /** Source collection identifier */
  source_collection_identifier: string;
  /** Article title (extracted) */
  title?: string;
  /** Themes (pipe-separated) */
  themes: string[];
  /** Named locations */
  locations: Array<{
    type: string;
    fullname: string;
    country_code: string;
    lat?: number;
    lon?: number;
  }>;
  /** Named persons */
  persons: string[];
  /** Named organizations */
  organizations: string[];
  /** Tone: positive, negative, polarity, activity, self/group reference density */
  tone: {
    positive: number;
    negative: number;
    polarity: number;
    activity: number;
  };
  /** Document language */
  language?: string;
}

/** NewsAPI.org article */
export interface NewsApiArticle {
  /** Article URL */
  url: string;
  /** Source name */
  source_name: string;
  /** Source domain */
  source_id?: string;
  /** Author (public byline) */
  author?: string;
  /** Headline */
  title: string;
  /** Excerpt */
  description?: string;
  /** Full content (truncated to 200 chars in free tier) */
  content?: string;
  /** Published at ISO-8601 */
  published_at: string;
  /** Top image URL */
  url_to_image?: string;
  /** Language */
  language?: string;
}

/** MediaCloud story */
export interface MediaCloudStory {
  /** Story ID */
  stories_id: number;
  /** Story URL */
  url: string;
  /** Media source name */
  media_name: string;
  /** Media source URL */
  media_url: string;
  /** Story title */
  title: string;
  /** Publish date ISO-8601 */
  publish_date: string;
  /** Language */
  language: string;
  /** AP/UP tags */
  tags?: Array<{ tag: string; tag_set: string }>;
}

export type NewsAggregatorSource = "gdelt" | "newsapi" | "mediacloud";

export interface NewsAggregatorClient {
  fetchGdelt(since: Date, keywords?: string[]): Promise<GdeltGkgRecord[]>;
  fetchNewsApi(since: Date, opts?: { query?: string; language?: string }): Promise<NewsApiArticle[]>;
  fetchMediaCloud(since: Date, opts?: { query?: string }): Promise<MediaCloudStory[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
