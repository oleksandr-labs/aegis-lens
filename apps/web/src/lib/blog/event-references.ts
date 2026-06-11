/**
 * Inline event references for blog posts.
 * Supports [event:ID] shortcodes in MDX body text, resolved to live event data
 * with confidence and danger scores.
 *
 * Вбудовані посилання на події у публікаціях блогу.
 * Підтримує скорочення [event:ID] в MDX-тілі, що резолвляться до живих даних
 * події з показниками достовірності та небезпеки.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A resolved event reference used in a blog post.
 * Розв'язане посилання на подію у публікації блогу.
 */
export interface BlogEventReference {
  eventId: string;
  title: string;
  titleUk: string;
  /** Danger score 0–100 */
  dangerScore: number;
  /** Confidence score 0–1 */
  confidenceScore: number;
  /** Human-readable verification verdict */
  verificationVerdict: string;
  /** Canonical event URL on the platform */
  eventUrl: string;
}

/**
 * Compact badge data for inline rendering inside MDX.
 * Компактні дані бейджа для вбудованого рендерингу в MDX.
 */
export interface InlineEventBadge {
  eventId: string;
  label: string;
  labelUk: string;
  dangerScore: number;
  confidence: number;
  verdict: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a compact InlineEventBadge from a full BlogEventReference.
 * Формує компактний InlineEventBadge з повного BlogEventReference.
 */
export function buildInlineEventBadge(ref: BlogEventReference): InlineEventBadge {
  return {
    eventId:    ref.eventId,
    label:      `[${ref.dangerScore}/100] ${ref.title}`,
    labelUk:    `[${ref.dangerScore}/100] ${ref.titleUk}`,
    dangerScore: ref.dangerScore,
    confidence:  ref.confidenceScore,
    verdict:     ref.verificationVerdict,
  };
}

/** Regex matching the [event:ULID_OR_ID] MDX shortcode */
const EVENT_REF_REGEX = /\[event:([A-Za-z0-9_-]+)\]/g;

/**
 * Extracts all unique event IDs from [event:ID] shortcodes in an MDX body.
 * Витягує всі унікальні ID подій зі скорочень [event:ID] в MDX-тілі.
 */
export function parseEventReferences(mdxBody: string): string[] {
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = EVENT_REF_REGEX.exec(mdxBody)) !== null) {
    const id = match[1];
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const EVENT_REF_NOTES_EN: string[] = [
  "mdx-shortcode-syntax: use [event:01HX...] anywhere in the MDX body; the remark plugin resolves each shortcode to an <InlineEventBadge /> component at build time, fetching live data from /api/v1/events/:id.",
  "live-data-fallback-to-snapshot: if the live event API is unavailable at build time, fall back to the last-known snapshot stored in the post's frontmatter (eventRefs: [{id, dangerScore, confidence, verdict, title}]) to avoid build failures.",
];

export const EVENT_REF_NOTES_UK: string[] = [
  "mdx-shortcode-syntax: використовувати [event:01HX...] будь-де в тілі MDX; remark-плагін резолвить кожне скорочення до компонента <InlineEventBadge /> під час збірки, отримуючи живі дані з /api/v1/events/:id.",
  "live-data-fallback-to-snapshot: якщо live API подій недоступний під час збірки, використовувати останній відомий знімок зі frontmatter публікації (eventRefs: [{id, dangerScore, confidence, verdict, title}]) для запобігання збоям збірки.",
];
