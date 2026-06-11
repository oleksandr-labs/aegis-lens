/**
 * WCAG 2.2 AA audit baseline for Aegis Lens.
 *
 * All criteria start as 'not-tested'. Update status + notes as each criterion
 * is evaluated. computeAuditScore() gates CI once real statuses are recorded.
 */

export interface WcagCriterion {
  id: string;
  level: "A" | "AA" | "AAA";
  title: string;
  description: string;
  status: "pass" | "fail" | "partial" | "not-tested";
  notes?: string;
}

export const WCAG_AUDIT_BASELINE: WcagCriterion[] = [
  // --- Perceivable ---
  {
    id: "1.1.1",
    level: "A",
    title: "Non-text Content",
    description:
      "All non-text content has a text alternative that serves the equivalent purpose.",
    status: "not-tested",
  },
  {
    id: "1.2.1",
    level: "A",
    title: "Audio-only and Video-only (Prerecorded)",
    description: "Prerecorded audio-only and video-only content has an alternative.",
    status: "not-tested",
  },
  {
    id: "1.2.2",
    level: "A",
    title: "Captions (Prerecorded)",
    description: "Captions are provided for all prerecorded audio in synchronized media.",
    status: "not-tested",
  },
  {
    id: "1.2.3",
    level: "A",
    title: "Audio Description or Media Alternative (Prerecorded)",
    description:
      "An audio description or full media alternative is provided for prerecorded video.",
    status: "not-tested",
  },
  {
    id: "1.2.4",
    level: "AA",
    title: "Captions (Live)",
    description: "Captions are provided for all live audio in synchronized media.",
    status: "not-tested",
  },
  {
    id: "1.2.5",
    level: "AA",
    title: "Audio Description (Prerecorded)",
    description: "Audio description is provided for prerecorded video content.",
    status: "not-tested",
  },
  {
    id: "1.3.1",
    level: "A",
    title: "Info and Relationships",
    description:
      "Information, structure, and relationships conveyed through presentation can be programmatically determined.",
    status: "not-tested",
  },
  {
    id: "1.3.2",
    level: "A",
    title: "Meaningful Sequence",
    description: "Reading sequence can be programmatically determined when order affects meaning.",
    status: "not-tested",
  },
  {
    id: "1.3.3",
    level: "A",
    title: "Sensory Characteristics",
    description: "Instructions do not rely solely on sensory characteristics.",
    status: "not-tested",
  },
  {
    id: "1.3.4",
    level: "AA",
    title: "Orientation",
    description: "Content does not restrict its view to a single display orientation.",
    status: "not-tested",
  },
  {
    id: "1.3.5",
    level: "AA",
    title: "Identify Input Purpose",
    description: "The purpose of each input field collecting personal information can be programmatically determined.",
    status: "not-tested",
  },
  {
    id: "1.4.1",
    level: "A",
    title: "Use of Color",
    description: "Color is not used as the only visual means of conveying information.",
    status: "not-tested",
    notes: "All status indicators must include icon + label in addition to hue.",
  },
  {
    id: "1.4.2",
    level: "A",
    title: "Audio Control",
    description: "Any audio that plays automatically for > 3 s has a pause / stop / volume mechanism.",
    status: "not-tested",
  },
  {
    id: "1.4.3",
    level: "AA",
    title: "Contrast (Minimum)",
    description:
      "Text and images of text have a contrast ratio of at least 4.5:1 (3:1 for large text).",
    status: "not-tested",
    notes: "Verify all AEGIS_COLOR_PAIRS in color-contrast.ts.",
  },
  {
    id: "1.4.4",
    level: "AA",
    title: "Resize Text",
    description: "Text can be resized up to 200% without loss of content or functionality.",
    status: "not-tested",
  },
  {
    id: "1.4.5",
    level: "AA",
    title: "Images of Text",
    description: "Images of text are used only for decoration or where a particular presentation is essential.",
    status: "not-tested",
  },
  {
    id: "1.4.10",
    level: "AA",
    title: "Reflow",
    description: "Content can be presented without loss of information at 320 CSS pixels width.",
    status: "not-tested",
  },
  {
    id: "1.4.11",
    level: "AA",
    title: "Non-text Contrast",
    description: "Non-text UI components have a contrast ratio of at least 3:1.",
    status: "not-tested",
  },
  {
    id: "1.4.12",
    level: "AA",
    title: "Text Spacing",
    description: "No loss of content occurs when letter / word / line spacing is overridden.",
    status: "not-tested",
  },
  {
    id: "1.4.13",
    level: "AA",
    title: "Content on Hover or Focus",
    description: "Content that appears on hover or focus is dismissible, hoverable, and persistent.",
    status: "not-tested",
  },
  // --- Operable ---
  {
    id: "2.1.1",
    level: "A",
    title: "Keyboard",
    description: "All functionality is operable through a keyboard interface.",
    status: "not-tested",
    notes: "Map workspace requires full keyboard nav — see map-a11y.ts.",
  },
  {
    id: "2.1.2",
    level: "A",
    title: "No Keyboard Trap",
    description: "Keyboard focus is never locked within a component without an exit mechanism.",
    status: "not-tested",
    notes: "FocusTrap in keyboard-nav.ts must implement Escape-to-exit.",
  },
  {
    id: "2.1.4",
    level: "A",
    title: "Character Key Shortcuts",
    description: "If single-character key shortcuts are implemented they can be remapped or disabled.",
    status: "not-tested",
  },
  {
    id: "2.2.1",
    level: "A",
    title: "Timing Adjustable",
    description: "Time limits can be turned off, adjusted, or extended.",
    status: "not-tested",
  },
  {
    id: "2.2.2",
    level: "A",
    title: "Pause, Stop, Hide",
    description: "Auto-updating / moving content can be paused, stopped, or hidden.",
    status: "not-tested",
    notes: "Live event ticker on hero must include a pause control.",
  },
  {
    id: "2.3.1",
    level: "A",
    title: "Three Flashes or Below Threshold",
    description: "No content flashes more than three times per second.",
    status: "not-tested",
  },
  {
    id: "2.4.1",
    level: "A",
    title: "Bypass Blocks",
    description: "A mechanism to bypass repeated navigation blocks is available.",
    status: "not-tested",
    notes: "Skip-to-content link implemented in keyboard-nav.ts.",
  },
  {
    id: "2.4.2",
    level: "A",
    title: "Page Titled",
    description: "Web pages have titles that describe their topic or purpose.",
    status: "not-tested",
  },
  {
    id: "2.4.3",
    level: "A",
    title: "Focus Order",
    description: "Focusable components receive focus in an order that preserves meaning.",
    status: "not-tested",
  },
  {
    id: "2.4.4",
    level: "A",
    title: "Link Purpose (In Context)",
    description: "The purpose of each link can be determined from context.",
    status: "not-tested",
  },
  {
    id: "2.4.5",
    level: "AA",
    title: "Multiple Ways",
    description: "More than one way exists to locate a web page within a site.",
    status: "not-tested",
  },
  {
    id: "2.4.6",
    level: "AA",
    title: "Headings and Labels",
    description: "Headings and labels describe topic or purpose.",
    status: "not-tested",
  },
  {
    id: "2.4.7",
    level: "AA",
    title: "Focus Visible",
    description: "Keyboard focus indicator is visible.",
    status: "not-tested",
    notes: "Must be visible in both light and dark themes.",
  },
  {
    id: "2.4.11",
    level: "AA",
    title: "Focus Not Obscured (Minimum)",
    description: "When a component receives keyboard focus, it is not entirely hidden by author-created content.",
    status: "not-tested",
    notes: "WCAG 2.2 new criterion — check sticky header / cookie banner.",
  },
  {
    id: "2.5.1",
    level: "A",
    title: "Pointer Gestures",
    description: "Functionality using multipoint or path-based gestures has a single-pointer alternative.",
    status: "not-tested",
  },
  {
    id: "2.5.2",
    level: "A",
    title: "Pointer Cancellation",
    description: "Single-pointer functionality can be cancelled.",
    status: "not-tested",
  },
  {
    id: "2.5.3",
    level: "A",
    title: "Label in Name",
    description: "Visible text label is part of the accessible name for controls.",
    status: "not-tested",
  },
  {
    id: "2.5.4",
    level: "A",
    title: "Motion Actuation",
    description: "Motion-triggered functionality has a UI alternative and can be disabled.",
    status: "not-tested",
  },
  {
    id: "2.5.7",
    level: "AA",
    title: "Dragging Movements",
    description: "Dragging operations have a single-pointer alternative.",
    status: "not-tested",
    notes: "WCAG 2.2 new criterion — map drag / pan must have keyboard equivalents.",
  },
  {
    id: "2.5.8",
    level: "AA",
    title: "Target Size (Minimum)",
    description: "Target size for pointer inputs is at least 24×24 CSS pixels.",
    status: "not-tested",
    notes: "WCAG 2.2 new criterion.",
  },
  // --- Understandable ---
  {
    id: "3.1.1",
    level: "A",
    title: "Language of Page",
    description: "The default human language of each web page can be programmatically determined.",
    status: "not-tested",
    notes: "lang attribute must match locale; en / uk switching must update <html lang>.",
  },
  {
    id: "3.1.2",
    level: "AA",
    title: "Language of Parts",
    description: "The language of each passage or phrase can be programmatically determined.",
    status: "not-tested",
  },
  {
    id: "3.2.1",
    level: "A",
    title: "On Focus",
    description: "Components do not initiate a change of context on focus.",
    status: "not-tested",
  },
  {
    id: "3.2.2",
    level: "A",
    title: "On Input",
    description: "Input to a component does not automatically cause a change of context.",
    status: "not-tested",
  },
  {
    id: "3.2.3",
    level: "AA",
    title: "Consistent Navigation",
    description: "Navigation mechanisms are in the same order across pages.",
    status: "not-tested",
  },
  {
    id: "3.2.4",
    level: "AA",
    title: "Consistent Identification",
    description: "Components with the same functionality are identified consistently.",
    status: "not-tested",
  },
  {
    id: "3.3.1",
    level: "A",
    title: "Error Identification",
    description: "Errors are identified and described to the user in text.",
    status: "not-tested",
    notes: "See form-errors.ts for implementation pattern.",
  },
  {
    id: "3.3.2",
    level: "A",
    title: "Labels or Instructions",
    description: "Labels or instructions are provided for user input.",
    status: "not-tested",
  },
  {
    id: "3.3.3",
    level: "AA",
    title: "Error Suggestion",
    description: "Error suggestions are provided unless it would jeopardise security.",
    status: "not-tested",
  },
  {
    id: "3.3.4",
    level: "AA",
    title: "Error Prevention (Legal, Financial, Data)",
    description: "Submissions are reversible, checked, or confirmed.",
    status: "not-tested",
  },
  // --- Robust ---
  {
    id: "4.1.2",
    level: "A",
    title: "Name, Role, Value",
    description: "Name and role can be programmatically determined; states, properties, and values can be set.",
    status: "not-tested",
    notes: "All custom components must expose correct ARIA — see aria-patterns.ts.",
  },
  {
    id: "4.1.3",
    level: "AA",
    title: "Status Messages",
    description: "Status messages can be programmatically determined without receiving focus.",
    status: "not-tested",
    notes: "a11y-announcer.ts handles this via aria-live regions.",
  },
];

export interface AuditScoreResult {
  passRate: number;
  aaCompliance: boolean;
  criticalFailures: WcagCriterion[];
}

/**
 * Compute an audit score snapshot.
 *
 * aaCompliance = true only when no A or AA criteria are 'fail'.
 */
export function computeAuditScore(criteria: WcagCriterion[]): AuditScoreResult {
  const tested = criteria.filter((c) => c.status !== "not-tested");
  const passed = criteria.filter((c) => c.status === "pass");
  const passRate = tested.length > 0 ? (passed.length / tested.length) * 100 : 0;

  const criticalFailures = criteria.filter(
    (c) => (c.level === "A" || c.level === "AA") && c.status === "fail",
  );

  const aaCompliance = criticalFailures.length === 0;

  return { passRate: Math.round(passRate * 10) / 10, aaCompliance, criticalFailures };
}
