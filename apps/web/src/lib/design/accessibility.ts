/**
 * Accessibility System — Aegis Lens
 *
 * WCAG 2.2 AA conformance baseline for the intelligence platform.
 * This file is the single authoritative reference for contrast requirements,
 * keyboard navigation patterns, focus policies, and the audit checklist.
 *
 * Sprint 2.73 — Design foundations (A11y)
 */

// ── Contrast requirements ─────────────────────────────────────────────────────

export interface ContrastRequirement {
  /** Criterion name */
  criterion: string;
  /** WCAG success criterion number */
  sc: string;
  /** Minimum contrast ratio */
  ratio: number;
  /** Applies to */
  scope: string;
  /** Whether AAA target */
  isAAA: boolean;
}

/**
 * Contrast ratios required across the UI.
 * Implemented in Tailwind custom tokens in packages/ui/tailwind-preset.ts.
 * Every colour combination used in production must pass the ratio for its scope.
 *
 * Tool to verify: https://webaim.org/resources/contrastchecker/
 * CI check: pnpm dlx axe-core --standard WCAG2AA (see .github/workflows/a11y.yml)
 */
export const WCAG_CONTRAST_REQUIREMENTS: ContrastRequirement[] = [
  // ── AA requirements ───────────────────────────────────────────────────────
  {
    criterion: "Normal text — AA",
    sc: "1.4.3",
    ratio: 4.5,
    scope: "All text ≤18pt (24px) or ≤14pt (18.67px) bold",
    isAAA: false,
  },
  {
    criterion: "Large text — AA",
    sc: "1.4.3",
    ratio: 3.0,
    scope: "Text >18pt (24px) or >14pt (18.67px) bold",
    isAAA: false,
  },
  {
    criterion: "UI components — AA",
    sc: "1.4.11",
    ratio: 3.0,
    scope: "Input borders, toggle states, focus rings, icons that convey meaning",
    isAAA: false,
  },
  {
    criterion: "Focus indicator — AA",
    sc: "1.4.11 + 2.4.11",
    ratio: 3.0,
    scope: "Focus ring against adjacent background (outer AND inner edge)",
    isAAA: false,
  },

  // ── AAA targets (aspirational, not legally required) ─────────────────────
  {
    criterion: "Normal text — AAA",
    sc: "1.4.6",
    ratio: 7.0,
    scope: "Body text on primary dark background",
    isAAA: true,
  },
  {
    criterion: "Large text — AAA",
    sc: "1.4.6",
    ratio: 4.5,
    scope: "Display headings on dark background",
    isAAA: true,
  },

  // ── Platform-specific additions ───────────────────────────────────────────
  {
    criterion: "Confidence chip text",
    sc: "1.4.3",
    ratio: 4.5,
    scope: "Small percentage text inside ConfidenceChip on coloured background",
    isAAA: false,
  },
  {
    criterion: "Map label on tile",
    sc: "1.4.3",
    ratio: 4.5,
    scope: "Town/region labels rendered over MapLibre tile imagery",
    isAAA: false,
  },
  {
    criterion: "DangerChip critical",
    sc: "1.4.3",
    ratio: 4.5,
    scope: "White text on red-600 (#dc2626) critical danger chip",
    isAAA: false,
  },
  {
    criterion: "Source provenance pill",
    sc: "1.4.3",
    ratio: 4.5,
    scope: "SourcePill label text on pill background",
    isAAA: false,
  },
];

// ── Keyboard navigation patterns ──────────────────────────────────────────────

export interface KeyboardPattern {
  widget: string;
  /** Keys that navigate / activate */
  keys: string[];
  /** ARIA pattern reference */
  ariaPattern: string;
  /** Implementation notes */
  notes: string;
}

/**
 * Canonical keyboard patterns per widget type.
 * All interactive components must implement the matching pattern.
 * Reference: https://www.w3.org/WAI/ARIA/apg/patterns/
 */
export const KEYBOARD_NAV_PATTERNS: Record<string, KeyboardPattern> = {
  modal: {
    widget: "Dialog / Modal",
    keys: ["Tab", "Shift+Tab", "Escape"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
    notes:
      "Focus trapped inside dialog while open. Escape closes and returns focus to trigger element. " +
      "First focusable element receives focus on open (or explicit autofocus element). " +
      "Scroll of page body locked while dialog is open (overflow: hidden on <body>). " +
      "Implemented via Radix Dialog + focus-trap-react.",
  },
  dropdown: {
    widget: "Dropdown Menu / DropdownMenu",
    keys: ["ArrowDown", "ArrowUp", "Enter", "Space", "Escape", "Tab"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
    notes:
      "Arrow keys navigate items. Enter/Space selects. Escape closes menu and returns focus to trigger. " +
      "Home/End jump to first/last item. " +
      "Type-ahead: first char matches. " +
      "Implemented via Radix DropdownMenu (handles this natively).",
  },
  map: {
    widget: "MapLibre GL Map",
    keys: ["+", "-", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape"],
    ariaPattern: "Custom (no ARIA APG for maps)",
    notes:
      "+ zooms in, - zooms out. Arrow keys pan. " +
      "Events navigable via j/k (see keyboard-shortcuts.ts). " +
      "Enter opens selected event. Escape deselects. " +
      "Map canvas has role='application', aria-label='Interactive conflict map', tabIndex=0. " +
      "Screen-reader summary panel outside canvas lists current visible events count + bounds.",
  },
  commandPalette: {
    widget: "Command Palette (⌘K)",
    keys: ["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    notes:
      "Opens with ⌘K / Ctrl+K. Input is auto-focused. " +
      "Arrow keys navigate results list (role='listbox', items role='option'). " +
      "Enter executes highlighted command. Escape closes. " +
      "Results update live; aria-live='polite' on results container.",
  },
  datatable: {
    widget: "Data Table",
    keys: ["Tab", "Shift+Tab", "ArrowDown", "ArrowUp", "Enter", "Space"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/grid/",
    notes:
      "role='grid'. Rows focusable. Arrow keys navigate cells. " +
      "Enter activates row action (open event). Space toggles row selection. " +
      "Column headers: sortable headers have aria-sort='ascending'/'descending'/'none'. " +
      "Virtual scroll: aria-rowcount set to total rows, aria-rowindex on each rendered row.",
  },
  select: {
    widget: "Select / Combobox",
    keys: ["ArrowDown", "ArrowUp", "Enter", "Escape", "Home", "End"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
    notes:
      "Closed state: Enter/Space opens. " +
      "Open state: Arrow keys navigate, Enter selects, Escape closes. " +
      "Implemented via Radix Select.",
  },
  tabs: {
    widget: "Tabs",
    keys: ["ArrowLeft", "ArrowRight", "Home", "End"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
    notes:
      "Tab moves focus INTO tab list; arrow keys navigate within. " +
      "Automatic activation on focus. Home/End jump to first/last tab. " +
      "Implemented via Radix Tabs.",
  },
  toast: {
    widget: "Toast / Alert",
    keys: ["Escape"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/alert/",
    notes:
      "Toasts have role='status' (polite) or role='alert' (assertive for critical). " +
      "Escape dismisses focused toast. " +
      "Pause auto-dismiss on hover / focus. " +
      "Action buttons in toast are Tab-reachable.",
  },
  bottomSheet: {
    widget: "Mobile Bottom Sheet",
    keys: ["Escape", "Tab", "Shift+Tab"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
    notes:
      "Treated as a modal dialog on mobile. Focus trapped. " +
      "Escape / swipe-down closes. Drag handle aria-label='Drag to resize or swipe down to close'.",
  },
  slider: {
    widget: "Slider (timeline / opacity)",
    keys: ["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"],
    ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/slider/",
    notes:
      "Arrow keys adjust by step. Page keys adjust by larger step. Home/End jump to min/max. " +
      "aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext all set. " +
      "Implemented via Radix Slider.",
  },
};

// ── Focus visible policy ──────────────────────────────────────────────────────

/**
 * Global focus-visible policy.
 *
 * Applied via Tailwind + CSS in globals.css:
 *
 * ```css
 * :focus-visible {
 *   outline: 2px solid hsl(var(--brand-500));
 *   outline-offset: 2px;
 *   border-radius: 3px;
 * }
 *
 * :focus:not(:focus-visible) {
 *   outline: none;   / * mouse users don't see focus rings * /
 * }
 *
 * .dark :focus-visible {
 *   outline-color: hsl(var(--brand-400));  / * slightly lighter for dark bg * /
 * }
 * ```
 *
 * NEVER do `outline: none` without a visible replacement.
 * NEVER rely solely on colour change to indicate focus (must add ring or border change).
 * All interactive elements must have tabIndex ≥ 0 (or be natively focusable).
 */
export const FOCUS_VISIBLE_POLICY =
  "always visible, 2px offset ring, brand-500 color" as const;

export const FOCUS_RING_CSS = {
  width: "2px",
  offset: "2px",
  color: "hsl(var(--brand-500))",
  colorDark: "hsl(var(--brand-400))",
  borderRadius: "3px",
  style: "solid",
} as const;

// ── WCAG 2.2 AA audit checklist ───────────────────────────────────────────────

export interface A11yCheckItem {
  id: string;
  sc: string;
  level: "A" | "AA" | "AAA";
  category: "perceivable" | "operable" | "understandable" | "robust";
  description: string;
  howToTest: string;
  tools: string[];
}

/**
 * 15-item WCAG 2.2 AA audit checklist.
 * Run this checklist on every major feature before shipping.
 * Automated checks: axe-core in CI. Manual checks: listed in howToTest.
 */
export const A11Y_AUDIT_CHECKLIST: A11yCheckItem[] = [
  {
    id: "a11y-01",
    sc: "1.1.1",
    level: "A",
    category: "perceivable",
    description: "All non-text content has a text alternative (alt text, aria-label, aria-labelledby)",
    howToTest:
      "Run axe-core. Manually inspect images, icons, SVG markers, chart elements. " +
      "Decorative images have alt='' or role='presentation'.",
    tools: ["axe-core", "WAVE", "screen reader (NVDA/VoiceOver)"],
  },
  {
    id: "a11y-02",
    sc: "1.3.1",
    level: "A",
    category: "perceivable",
    description: "Information, structure, and relationships conveyed via HTML semantics, not visual only",
    howToTest:
      "Verify headings form a logical outline (h1→h2→h3). " +
      "Tables have <caption> and <th scope>. Lists use <ul>/<ol>/<li>. " +
      "Form controls are associated with <label> or aria-labelledby.",
    tools: ["axe-core", "browser accessibility tree", "Headings panel"],
  },
  {
    id: "a11y-03",
    sc: "1.3.4",
    level: "AA",
    category: "perceivable",
    description: "Orientation not restricted to portrait or landscape",
    howToTest:
      "Rotate device / browser. Verify map, dashboard, and data table work in both orientations.",
    tools: ["Chrome DevTools device toolbar", "physical device"],
  },
  {
    id: "a11y-04",
    sc: "1.4.1",
    level: "A",
    category: "perceivable",
    description: "Colour is not the only means of conveying information",
    howToTest:
      "View UI in greyscale (Chrome filter: grayscale(100%)). " +
      "Danger indicators must show text/icon in addition to red colour. " +
      "Map event markers must use shape + colour, not colour alone.",
    tools: ["Chrome greyscale filter", "Colour Contrast Analyser"],
  },
  {
    id: "a11y-05",
    sc: "1.4.3",
    level: "AA",
    category: "perceivable",
    description: "Text contrast ≥ 4.5:1 (normal) or 3:1 (large text)",
    howToTest:
      "Run axe-core contrast check. Spot-check with WebAIM contrast checker: " +
      "body text on dark surface, chip labels on coloured backgrounds, map labels on tiles.",
    tools: ["axe-core", "WebAIM contrast checker", "Colour Contrast Analyser"],
  },
  {
    id: "a11y-06",
    sc: "1.4.4",
    level: "AA",
    category: "perceivable",
    description: "Text resizes up to 200% without loss of content or functionality",
    howToTest:
      "Set browser text size to 200% (not page zoom). " +
      "Verify no overflow, truncation, or overlapping UI elements. " +
      "Data table and map panels must remain usable.",
    tools: ["Browser text-size setting", "manual"],
  },
  {
    id: "a11y-07",
    sc: "1.4.10",
    level: "AA",
    category: "perceivable",
    description: "Content reflows at 320px viewport width without horizontal scrolling",
    howToTest:
      "Set viewport to 320px. Verify all content is accessible without horizontal scroll. " +
      "Exception: maps and data tables that require 2D browsing are exempt if a text alternative is available.",
    tools: ["Chrome DevTools device emulation"],
  },
  {
    id: "a11y-08",
    sc: "1.4.11",
    level: "AA",
    category: "perceivable",
    description: "Non-text contrast (UI components, focus rings) ≥ 3:1",
    howToTest:
      "Check input borders, checkboxes, toggles, focus rings in both light (N/A, we're dark) and dark themes.",
    tools: ["axe-core", "WebAIM contrast checker"],
  },
  {
    id: "a11y-09",
    sc: "2.1.1",
    level: "A",
    category: "operable",
    description: "All functionality available via keyboard",
    howToTest:
      "Tab through entire UI without using mouse. Every interactive element must be reachable and operable. " +
      "Map: pan/zoom/event-select. Command palette. Modals. Data table. Dropdowns.",
    tools: ["keyboard only", "screen reader"],
  },
  {
    id: "a11y-10",
    sc: "2.4.7",
    level: "AA",
    category: "operable",
    description: "Focus indicator visible for keyboard navigation",
    howToTest:
      "Tab through UI. Every focused element must show a visible ring (2px brand-500). " +
      "No element should have outline: none without a visible replacement.",
    tools: ["keyboard only", "visual inspection"],
  },
  {
    id: "a11y-11",
    sc: "2.4.11",
    level: "AA",
    category: "operable",
    description: "Focus not obscured (focus indicator not entirely hidden by sticky content)",
    howToTest:
      "With sticky header / bottom sheet open, verify focused elements are not entirely behind the sticky layer. " +
      "Use scroll-margin-top where needed.",
    tools: ["keyboard only", "visual inspection"],
  },
  {
    id: "a11y-12",
    sc: "2.5.3",
    level: "A",
    category: "operable",
    description: "Visible label matches accessible name (for voice control users)",
    howToTest:
      "For every button / link with a visible text label, verify aria-label (if present) includes the visible text. " +
      "Use Accessibility Insights for Windows 'Name from visible text' check.",
    tools: ["Accessibility Insights", "axe-core"],
  },
  {
    id: "a11y-13",
    sc: "3.1.1",
    level: "A",
    category: "understandable",
    description: "Page language set correctly (lang attribute on <html>)",
    howToTest:
      "Inspect HTML element. Verify lang='en' for English pages, lang='uk' for Ukrainian pages. " +
      "Inline language switches (e.g., Ukrainian quote in English page) use lang attribute on the span.",
    tools: ["browser DevTools", "axe-core"],
  },
  {
    id: "a11y-14",
    sc: "3.3.1",
    level: "A",
    category: "understandable",
    description: "Error identification: form errors are described in text, not just colour",
    howToTest:
      "Submit forms with invalid data. Errors must appear as text adjacent to the field, " +
      "associated with the input via aria-describedby. " +
      "Error messages must be specific (not just 'invalid').",
    tools: ["manual", "screen reader"],
  },
  {
    id: "a11y-15",
    sc: "4.1.3",
    level: "AA",
    category: "robust",
    description: "Status messages communicated to assistive technologies without focus change",
    howToTest:
      "Trigger: toast notification, live event count update, filter result change. " +
      "Screen reader must announce the message without focus moving to it. " +
      "Toasts use role='status' (polite) or role='alert' (assertive). " +
      "Live regions: aria-live='polite' on event count, aria-live='assertive' on critical alerts.",
    tools: ["screen reader (NVDA/VoiceOver)", "axe-core"],
  },
];

// ── Assistive technology test matrix ─────────────────────────────────────────

export const AT_TEST_MATRIX = [
  { at: "NVDA 2024+", browser: "Firefox", os: "Windows", priority: "P1" },
  { at: "JAWS 2024+", browser: "Chrome", os: "Windows", priority: "P1" },
  { at: "VoiceOver", browser: "Safari", os: "macOS 14+", priority: "P1" },
  { at: "VoiceOver", browser: "Safari", os: "iOS 17+", priority: "P2" },
  { at: "TalkBack", browser: "Chrome", os: "Android 14+", priority: "P2" },
  { at: "Windows Narrator", browser: "Edge", os: "Windows", priority: "P3" },
] as const;

// ── Reduced-motion contract ───────────────────────────────────────────────────

/**
 * Every animation / transition in the codebase must be gated:
 *
 * ```css
 * @media (prefers-reduced-motion: no-preference) {
 *   .my-animation { animation: ... ; }
 *   .my-transition { transition: ... ; }
 * }
 * ```
 *
 * Or in Tailwind (add to tailwind-preset):
 *   motion-safe:animate-*  /  motion-safe:transition-*
 *
 * Zero motion tolerance in workspace surfaces (map, data table, copilot).
 * Landing page animations allowed with reduced-motion fallback.
 *
 * useMotionPreference() hook in apps/web/src/lib/motion.ts provides
 * the runtime signal for JS-driven animations.
 */
export const REDUCED_MOTION_POLICY =
  "All CSS transitions/animations gated in @media (prefers-reduced-motion: no-preference). " +
  "JS animations check useMotionPreference(). Zero motion in workspace; " +
  "landing cinematic animations have reduced-motion alternatives.";
