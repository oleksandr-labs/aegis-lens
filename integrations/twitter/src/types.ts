export interface XTweet {
  id: string;
  text: string;
  author_id: string;
  author_username: string;
  author_name: string;
  created_at: string;
  lang?: string;
  geo?: {
    place_id?: string;
    coordinates?: { lat: number; lon: number };
  };
  media?: XMedia[];
  referenced_tweets?: { type: "retweeted" | "quoted" | "replied_to"; id: string }[];
  metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
  };
  /** Entities extracted by Twitter */
  entities?: {
    urls?: { url: string; expanded_url: string; display_url: string }[];
    hashtags?: { tag: string }[];
    mentions?: { username: string; id: string }[];
  };
}

export interface XMedia {
  media_key: string;
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface XAccount {
  id: string;
  username: string;
  name: string;
  description?: string;
  location?: string;
  /** reliability 1-5, region scope, topic focus */
  reliability: 1 | 2 | 3 | 4 | 5;
  region: string;
  topics: string[];
  /** ToS-verified inclusion date */
  tos_verified_at: string;
}
