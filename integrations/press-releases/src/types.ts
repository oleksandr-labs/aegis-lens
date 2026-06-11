/**
 * Ukrainian government press release pipeline types.
 * Sources: President's Office, Ministry of Defence, Cabinet of Ministers.
 */

export type PressReleaseSource =
  | "president"   // president.gov.ua
  | "mod"         // mil.gov.ua
  | "cabinet"     // kmu.gov.ua
  | "general_staff"; // генштаб

export interface PressRelease {
  /** Unique ID: source:slug or source:isodate:index */
  id: string;
  /** Source identifier */
  source: PressReleaseSource;
  /** Article/press release title */
  title: string;
  /** Article URL */
  url: string;
  /** Summary / lead paragraph */
  summary?: string;
  /** Full text (if available) */
  body?: string;
  /** Publication date ISO-8601 */
  published_at: string;
  /** Language (uk / en) */
  language: "uk" | "en";
  /** Categories / tags */
  categories: string[];
  /** Thumbnail image URL if available */
  image_url?: string;
}

/** Configuration for a single press release source */
export interface PressReleaseSourceConfig {
  id: PressReleaseSource;
  /** Human label */
  label: string;
  /** RSS feed URL (if available) */
  rss_url?: string;
  /** HTML page URL for fallback scraping */
  page_url: string;
  /** CSS selectors for HTML scraping fallback */
  scrape?: {
    item_selector: string;
    title_selector: string;
    link_selector: string;
    date_selector: string;
    summary_selector?: string;
  };
  /** Poll interval in milliseconds */
  poll_interval_ms: number;
  /** Default language */
  language: "uk" | "en";
}

export interface PressReleaseFetcher {
  fetchSince(source: PressReleaseSourceConfig, since: Date): Promise<PressRelease[]>;
  fetchAll(since: Date): Promise<PressRelease[]>;
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}
