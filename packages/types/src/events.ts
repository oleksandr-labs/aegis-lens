import type { Locale } from "./locales";
import type { GeoPoint } from "./geo";

/**
 * Canonical event class taxonomy. Tier-1.
 * See TODO/data/TODO_schema.md.
 */
export const EVENT_CLASSES = [
  "military_action",
  "infrastructure",
  "civilian_alert",
  "humanitarian",
  "cyber",
  "maritime",
  "aviation",
  "environmental",
  "political",
  "economic",
] as const;
export type EventClass = (typeof EVENT_CLASSES)[number];

export type VerificationState =
  | "unverified"
  | "corroborated"
  | "verified"
  | "disputed"
  | "retracted";

export type EventSource = {
  url: string;
  archiveUrl: string | null;
  fetchedAt: string; // ISO
  language: Locale | string;
  /** SHA-256 of the original text payload (for dedup). */
  contentHash: string;
};

export type EventMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl: string | null;
  verificationState: VerificationState;
};

/**
 * Canonical event. v1.
 * Cross-reference: TODO/data/TODO_schema.md, TODO/product_specs/TODO_spec_event_schema.md.
 */
export type AegisEvent = {
  eventId: string; // ULID
  occurredAt: string; // ISO
  reportedAt: string; // ISO
  ingestedAt: string; // ISO
  location: GeoPoint;
  class: EventClass;
  subclass: string | null;
  /** 0..5 ordinal */
  severity: 0 | 1 | 2 | 3 | 4 | 5;
  /** 0..100 */
  dangerScore: number;
  /** 0..1 */
  confidence: number;
  verificationState: VerificationState;
  sources: EventSource[];
  media: EventMedia[];
  /** Per-locale AI summary. */
  summary: Partial<Record<Locale, string>> & { en: string };
  /** Original-language excerpt preserved per source. */
  originalText: string | null;
};
