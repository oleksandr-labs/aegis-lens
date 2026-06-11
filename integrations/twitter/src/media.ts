/**
 * Task — Media extraction.
 *
 * Extracts media entities (photos, videos, GIFs) and link/quote references from
 * an X/Twitter v2 tweet object so the canonical event's `media[]` array can be
 * populated and the items handed to downstream CV / archival.
 *
 * The v2 API returns media in `includes.media` keyed by `media_key`, referenced
 * from `tweet.attachments.media_keys`. The existing `XApiClient` already requests
 * the right `media.fields`/expansions; this module normalises whatever made it
 * onto the `XTweet` (and tolerates the raw include shape).
 */

import type { XTweet } from "./types";

/** Normalised media item ready for the canonical `media[]` array. */
export interface ExtractedMedia {
  type: "image" | "video" | "gif";
  /** Best available URL: full media url, else preview/thumbnail. */
  url: string;
  /** Thumbnail/preview (videos & gifs have no direct url on v2). */
  previewUrl?: string;
  altText?: string;
  width?: number;
  height?: number;
  mediaKey?: string;
}

/** Map an X media `type` to the canonical media kind. */
function mapType(t: string): ExtractedMedia["type"] {
  if (t === "video") return "video";
  if (t === "animated_gif") return "gif";
  return "image";
}

/** Extract media items already attached to an `XTweet`. */
export function extractMedia(tweet: Pick<XTweet, "media">): ExtractedMedia[] {
  const out: ExtractedMedia[] = [];
  for (const m of tweet.media ?? []) {
    const url = m.url ?? m.preview_image_url;
    if (!url) continue;
    out.push({
      type: mapType(m.type),
      url,
      previewUrl: m.preview_image_url,
      altText: m.alt_text,
      width: m.width,
      height: m.height,
      mediaKey: m.media_key,
    });
  }
  return out;
}

/**
 * Resolve media from the raw v2 response shape: join a tweet's
 * `attachments.media_keys` against the `includes.media` array. Use this when
 * working directly with the API response rather than a mapped `XTweet`.
 */
export function resolveMediaFromIncludes(
  attachments: { media_keys?: string[] } | undefined,
  includesMedia:
    | Array<{
        media_key: string;
        type: string;
        url?: string;
        preview_image_url?: string;
        alt_text?: string;
        width?: number;
        height?: number;
      }>
    | undefined,
): ExtractedMedia[] {
  if (!attachments?.media_keys?.length || !includesMedia?.length) return [];
  const byKey = new Map(includesMedia.map((m) => [m.media_key, m]));
  const out: ExtractedMedia[] = [];
  for (const key of attachments.media_keys) {
    const m = byKey.get(key);
    if (!m) continue;
    const url = m.url ?? m.preview_image_url;
    if (!url) continue;
    out.push({
      type: mapType(m.type),
      url,
      previewUrl: m.preview_image_url,
      altText: m.alt_text,
      width: m.width,
      height: m.height,
      mediaKey: m.media_key,
    });
  }
  return out;
}

/** Convert extracted media into the canonical event `media[]` entries. */
export function toCanonicalMedia(
  items: ExtractedMedia[],
): Array<{ type: "image" | "video" | "gif"; url: string; alt?: string }> {
  return items.map((m) => ({
    type: m.type,
    url: m.url,
    ...(m.altText ? { alt: m.altText } : {}),
  }));
}

/** Extract expanded link URLs (t.co → expanded) from a tweet's entities. */
export function extractLinks(tweet: Pick<XTweet, "entities">): string[] {
  return (tweet.entities?.urls ?? []).map((u) => u.expanded_url).filter(Boolean);
}

/** True if the tweet carries any media (drives CV/archival handoff). */
export function hasMedia(tweet: Pick<XTweet, "media">): boolean {
  return (tweet.media?.length ?? 0) > 0;
}
