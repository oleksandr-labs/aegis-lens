// Auto-derived from OpenAPI spec v0.1.0
// Do not edit manually — regenerate from openapi.json

export type EventClass =
  | "military_action"
  | "infrastructure"
  | "civilian_alert"
  | "humanitarian"
  | "cyber"
  | "maritime"
  | "aviation"
  | "environmental"
  | "political"
  | "economic";

export type VerificationState =
  | "unverified"
  | "corroborated"
  | "verified"
  | "disputed"
  | "retracted";

export interface GeoPoint {
  lat: number;
  lon: number;
  precisionM?: number | null;
}

export interface EventSource {
  url: string;
  archiveUrl: string | null;
  fetchedAt: string;
  language: string;
  contentHash: string;
}

export interface EventMedia {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl: string | null;
  verificationState: VerificationState;
}

export type LocalizedString = Record<string, string> & { en: string };

export interface AegisEvent {
  eventId: string;
  occurredAt: string;
  reportedAt: string;
  ingestedAt: string;
  location: GeoPoint;
  class: EventClass;
  subclass: string | null;
  severity: number;
  dangerScore: number;
  confidence: number;
  verificationState: VerificationState;
  sources: EventSource[];
  media: EventMedia[];
  summary: LocalizedString;
  originalText: string | null;
}

export interface AegisSource {
  slug: string;
  name: string;
  kind:
    | "telegram"
    | "satellite"
    | "news"
    | "official_gov"
    | "ova_telegram"
    | "cyber"
    | "academic"
    | "milblogger";
  country: string;
  language: string;
  description: string;
  reliability: number;
  homepageUrl: string;
}

export interface AegisReport {
  slug: string;
  title: LocalizedString;
  kind: "regional" | "incident" | "weekly" | "trend" | "methodology";
  publishedAt: string;
  author: string;
  summary: LocalizedString;
  body: LocalizedString;
  citations: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    count: number;
    total: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export interface ApiError {
  ok: false;
  error: string;
}

export interface CopilotResponse {
  answer: string;
  stats: {
    count: number;
    topClass?: string;
    avgDanger?: number;
  };
  citations: string[];
  provider: string;
  model: string;
}

export interface SearchHit {
  id: string;
  score: number;
  eventId: string;
  class: EventClass;
  subclass?: string;
  severity: number;
  summary: LocalizedString;
  location?: GeoPoint | null;
  occurredAt: string;
  sources: { url: string; language: string }[];
  highlights: Record<string, string>;
  distanceKm?: number;
}

export interface SearchResponse {
  data: SearchHit[];
  meta: {
    query: string;
    total: number;
    limit: number;
    offset: number;
    nextCursor: string | null;
  };
}
