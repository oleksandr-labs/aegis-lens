/**
 * Mobile-friendly breadcrumb class tokens.
 *
 * On narrow viewports a crumb trail must not wrap into a ragged multi-line
 * block. The strategy here (matching the existing inline breadcrumb markup,
 * `<nav class="font-mono text-[11px] text-text-muted">` from Sprint 0):
 *
 *   - the trail is a single horizontal row that **scrolls horizontally** when
 *     it overflows, rather than wrapping;
 *   - momentum scrolling + a snap to the *current* crumb so the most relevant
 *     end is visible first on mobile;
 *   - the scrollbar is visually hidden (utility class) to keep the chrome
 *     clean; keyboard/AT users still reach every crumb.
 *
 * This module is the single source of the Tailwind class tokens so the UI and
 * any future breadcrumb component stay in sync. It exports strings only — no
 * React, no DOM. (Pairs with the existing Tailwind config in `apps/web`.)
 *
 * NOTE: relies on a `.scrollbar-none` utility (hide scrollbar). If not yet in
 * the Tailwind layer, add the standard cross-browser recipe:
 *   `.scrollbar-none{scrollbar-width:none;-ms-overflow-style:none}`
 *   `.scrollbar-none::-webkit-scrollbar{display:none}`
 * (proposed as a CSS note, not an edit to a shared file).
 */

/** Container `<nav>` / `<ol>`: horizontal, scrollable, no-wrap on overflow. */
export const BREADCRUMB_NAV_CLASS = [
  "flex",
  "items-center",
  "gap-0", // separators carry their own margin
  "overflow-x-auto",
  "whitespace-nowrap",
  "scrollbar-none",
  "overscroll-x-contain",
  "snap-x",
  // match Sprint-0 inline styling
  "font-mono",
  "text-[11px]",
  "text-text-muted",
].join(" ");

/** A single crumb item — never shrinks (so text doesn't squash), snaps. */
export const BREADCRUMB_ITEM_CLASS = ["shrink-0", "snap-start"].join(" ");

/** Linked crumb (`<a>`/`<Link>`). */
export const BREADCRUMB_LINK_CLASS = "hover:text-text-primary";

/** Current-page crumb (unlinked) — emphasised, snaps to end on mobile. */
export const BREADCRUMB_CURRENT_CLASS = ["text-text-secondary", "shrink-0", "snap-end"].join(" ");

/** Separator span between crumbs. */
export const BREADCRUMB_SEPARATOR_CLASS = ["mx-2", "text-border-default", "shrink-0"].join(" ");

/** Ellipsis disclosure button (collapsed middle — see truncate.ts). */
export const BREADCRUMB_ELLIPSIS_CLASS = [
  "shrink-0",
  "px-1",
  "hover:text-text-primary",
].join(" ");

/** Default separator glyph (matches Sprint-0 inline "/"). */
export const BREADCRUMB_SEPARATOR_GLYPH = "/";

/**
 * Bundle of all tokens, for ergonomic single-import in a component.
 */
export const breadcrumbClasses = {
  nav: BREADCRUMB_NAV_CLASS,
  item: BREADCRUMB_ITEM_CLASS,
  link: BREADCRUMB_LINK_CLASS,
  current: BREADCRUMB_CURRENT_CLASS,
  separator: BREADCRUMB_SEPARATOR_CLASS,
  ellipsis: BREADCRUMB_ELLIPSIS_CLASS,
  separatorGlyph: BREADCRUMB_SEPARATOR_GLYPH,
} as const;
