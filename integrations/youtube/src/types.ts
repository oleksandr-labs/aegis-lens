export interface YTChannel {
  id: string;
  name: string;
  description?: string;
  country?: string;
  reliability: 1 | 2 | 3 | 4 | 5;
  topics: string[];
  language: string;
  verified_at: string;
}

export interface YTVideo {
  id: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  publishedAt: string;
  lang?: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  thumbnailUrl?: string;
  transcriptAvailable?: boolean;
}

export interface YTTranscriptLine {
  text: string;
  start: number;
  duration: number;
}

export interface YTPlaylistItem {
  videoId: string;
  title: string;
  publishedAt: string;
  channelId: string;
}
