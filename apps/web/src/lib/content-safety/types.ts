/**
 * Content Warnings & Safety UI — core types.
 *
 * Covers severity classification, per-user preferences, and per-org policy.
 * See TODO/features/TODO_content_warnings.md for the full task backlog.
 */

// ── Severity & warning type primitives ───────────────────────────────────────

export type ContentSeverity = "mild" | "moderate" | "graphic" | "extreme";

export type ContentWarningType =
  | "violence"
  | "gore"
  | "casualty"
  | "destruction"
  | "graphic-injury"
  | "children-visible";

// ── Warning config per severity level ────────────────────────────────────────

export interface ContentWarningConfig {
  severity: ContentSeverity;
  warningTypes: ContentWarningType[];
  /** Blur the media tile until the user explicitly reveals it. */
  blurByDefault: boolean;
  /** User must click an acknowledgement overlay before seeing the content. */
  requiresClickThrough: boolean;
  /** Age gate (18+) must be passed before the content is revealed. */
  requiresAgeGate: boolean;
  /** Short plain-English description shown in the warning overlay. */
  description_en: string;
  /** Short Ukrainian description shown in the warning overlay. */
  description_uk: string;
}

// ── Per-user preferences ──────────────────────────────────────────────────────

export interface UserContentPreferences {
  userId: string;
  /** Show content warning overlays (disable = trust user's own judgement). */
  showWarnings: boolean;
  /** Blur graphic media thumbnails by default. */
  blurGraphicMedia: boolean;
  /** Autoplay is intentionally always false — trauma-informed default. */
  autoplayEnabled: false;
  /** Auto-sound is intentionally always false — trauma-informed default. */
  autoSoundEnabled: false;
}

// ── Per-organisation content policy ──────────────────────────────────────────

export interface OrgContentPolicy {
  orgId: string;
  /** True when all members of the org have completed analyst training. */
  trainedAnalysts: boolean;
  /** Allows trained analysts to bypass click-through/blur for graphic media. */
  warningOverrideEnabled: boolean;
  /** Extra safety net: admin must approve any override before it takes effect. */
  requiresAdminApproval: boolean;
}
