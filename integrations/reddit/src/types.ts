export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  author: string;
  created_utc: number;
  score: number;
  upvote_ratio: number;
  num_comments: number;
  is_self: boolean;
  domain?: string;
  link_flair_text?: string;
  media?: { type: string; oembed?: { provider_name: string; thumbnail_url?: string } };
  crosspost_parent?: string;
}

export interface RedditComment {
  id: string;
  postId: string;
  subreddit: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  depth: number;
  parentId: string;
}

export interface RedditSubreddit {
  name: string;
  description?: string;
  reliability: 1 | 2 | 3 | 4 | 5;
  topics: string[];
  requiresVerifiedOp?: boolean;
}
