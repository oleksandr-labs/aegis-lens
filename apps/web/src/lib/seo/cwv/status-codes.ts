/**
 * HTTP status policy — no soft-404s; proper 410 for retired events.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("No soft-404s; proper 410 for retired
 * events"). A "soft-404" is a missing/empty resource served with HTTP 200 — it
 * wastes crawl budget and pollutes the index. This module decides the correct
 * status for a requested resource, with a dedicated 410 (Gone) path for events
 * that have been intentionally retired (so search engines drop them fast and
 * permanently, unlike a 404).
 *
 * Pairs with the redirect registry (`seo/redirects/registry.ts`), which already
 * models 301/302/410 for PATH renames/retirements. This module is for
 * RESOURCE-level decisions (does this event/entity still exist?) that the
 * registry's static path table can't express.
 */

export type ResourceStatus = 200 | 404 | 410 | 301;

/** Lifecycle of a content resource (event, entity, region page, …). */
export type ResourceState =
  /** Exists and is live. */
  | "live"
  /** Never existed / unknown id. */
  | "missing"
  /** Existed, intentionally retired and will not return — emit 410. */
  | "retired"
  /** Merged into another resource — emit 301 to `redirectTo`. */
  | "merged";

export interface ResourceDecisionInput {
  state: ResourceState;
  /** Required when state === "merged". Root-relative, locale-prefixed. */
  redirectTo?: string | null;
  /**
   * Whether the resource has renderable content. A live resource with zero
   * content (e.g. an empty listing) is a soft-404 risk and should 404.
   */
  hasContent?: boolean;
}

export interface ResourceDecision {
  status: ResourceStatus;
  /** Set for 301. */
  location?: string;
  /** Should this URL be served with `X-Robots-Tag: noindex`? */
  noindex: boolean;
  /** Human reason for the audit/log. */
  reason: string;
}

/**
 * Decide the HTTP status for a requested resource. Guarantees no soft-404:
 * a missing or empty-but-live resource resolves to a hard 404, retired
 * resources to 410, merged resources to 301.
 */
export function decideStatus(input: ResourceDecisionInput): ResourceDecision {
  switch (input.state) {
    case "live":
      if (input.hasContent === false) {
        return { status: 404, noindex: true, reason: "live but no content — avoid soft-404" };
      }
      return { status: 200, noindex: false, reason: "live" };
    case "missing":
      return { status: 404, noindex: true, reason: "unknown id" };
    case "retired":
      return { status: 410, noindex: true, reason: "retired event — Gone (410)" };
    case "merged": {
      const location = input.redirectTo ?? undefined;
      if (!location) {
        return { status: 404, noindex: true, reason: "merged but no target — fall back to 404" };
      }
      return { status: 301, location, noindex: false, reason: "merged → permanent redirect" };
    }
  }
}

/** Localized public message for a 410 (retired event) page. en + uk. */
export const GONE_MESSAGE: Record<"en" | "uk", { title: string; body: string }> = {
  en: {
    title: "This event has been retired",
    body: "The event you’re looking for is no longer tracked and will not return. Browse current events from the archive.",
  },
  uk: {
    title: "Цю подію вилучено",
    body: "Подія, яку ви шукаєте, більше не відстежується та не повернеться. Перегляньте актуальні події в архіві.",
  },
};
