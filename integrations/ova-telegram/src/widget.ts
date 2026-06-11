/**
 * Task 8 — Per-oblast official-feed widget (view-model builder).
 *
 * Produces a compact, locale-aware view model for a "Official OVA feed" widget
 * pinned to one oblast. The API route (`apps/web/.../ova-telegram/route.ts`)
 * serves this shape. NO new map layer is introduced — this widget feeds existing
 * surfaces (the per-oblast detail panel), per the sprint handoff (`<none>`).
 *
 * UK is primary; EN + RU are included. The UA original is always present.
 */

import type { Locale, OblastCode, OvaTranslatedPost } from "./types";
import { oblastGroup, oblastInfo } from "./registry";

export interface OvaFeedItem {
  postId: string;
  username: string;
  /** Institution that posted (oblast OVA or a city council). */
  source: { uk: string; en: string; ru?: string };
  kind: "oblast_ova" | "city_council";
  postedAt: string;
  /** Localized body in the requested locale (falls back to UA). */
  text: string;
  /** Full set of translations; UA original always present. */
  translations: { uk: string; en?: string; ru?: string };
  permalink: string;
  mediaUrls?: string[];
}

export interface OvaFeedWidget {
  oblastCode: OblastCode;
  oblast: { uk: string; en: string };
  /** Official channels backing this widget (primary + city councils). */
  channels: Array<{ username: string; kind: string; label: { uk: string; en: string } }>;
  locale: Locale;
  items: OvaFeedItem[];
  /** Attribution string the UI must display. */
  attribution: { uk: string; en: string };
  generatedAt: string;
}

function localize(post: OvaTranslatedPost, locale: Locale): string {
  if (locale === "en" && post.translations.en) return post.translations.en;
  if (locale === "ru" && post.translations.ru) return post.translations.ru;
  return post.translations.uk; // UA original is the canonical fallback
}

/**
 * Build the widget view model for an oblast from already-translated posts.
 * Posts are sorted newest-first and clamped to `limit`.
 */
export function buildOvaFeedWidget(
  oblastCode: OblastCode,
  posts: OvaTranslatedPost[],
  opts: { locale?: Locale; limit?: number } = {},
): OvaFeedWidget {
  const locale = opts.locale ?? "uk";
  const limit = opts.limit ?? 20;
  const info = oblastInfo(oblastCode);
  const group = oblastGroup(oblastCode);

  const items: OvaFeedItem[] = posts
    .filter((p) => p.oblastCode === oblastCode)
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
    .slice(0, limit)
    .map((p) => {
      const channel = [group.primary, ...group.cityCouncils].find((c) => c.username === p.username);
      return {
        postId: p.postId,
        username: p.username,
        source: channel?.label ?? { uk: info?.nameUk ?? oblastCode, en: info?.nameEn ?? oblastCode },
        kind: p.kind,
        postedAt: p.postedAt,
        text: localize(p, locale),
        translations: p.translations,
        permalink: p.evidenceUrl,
        mediaUrls: p.mediaUrls,
      };
    });

  const channels = [group.primary, ...group.cityCouncils].map((c) => ({
    username: c.username,
    kind: c.kind,
    label: { uk: c.label.uk, en: c.label.en },
  }));

  return {
    oblastCode,
    oblast: { uk: info?.nameUk ?? oblastCode, en: info?.nameEn ?? oblastCode },
    channels,
    locale,
    items,
    attribution: {
      uk: "Джерело: офіційні канали ОВА (Telegram)",
      en: "Source: official OVA channels (Telegram)",
    },
    generatedAt: new Date().toISOString(),
  };
}
