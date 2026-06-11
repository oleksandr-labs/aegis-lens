# Accessibility (a11y)

> **Status:** v1.0 — audit specs + cognitive design standards. Review each major release.
> **Target:** WCAG 2.2 AA conformance across all routes.
> **Covers:** WCAG audit checklist, cognitive accessibility policy, screen reader and keyboard nav supplemental specs.

---

## Part 1 — WCAG 2.2 AA Audit

> "A VPAT is a sales requirement for US gov / education."

### 1.1 Per-Route Audit Checklist (POUR Principles)

Run this checklist for every route before release. Add new routes to `apps/web/tests/a11y/routes.ts`.

#### Perceivable

- [ ] All images have descriptive `alt` text (non-decorative); decorative images have `alt=""`
- [ ] Text contrast ≥ 4.5:1 for normal text; ≥ 3:1 for large text (18pt / 14pt bold)
- [ ] UI component contrast ≥ 3:1 against adjacent colors (borders, icons)
- [ ] No information conveyed by color alone (always paired with label, pattern, or icon)
- [ ] Captions provided for all video content
- [ ] Audio content has transcript
- [ ] Content reflows correctly at 400% zoom (mobile breakpoint equivalent) — no horizontal scroll
- [ ] Text spacing: line height 1.5×, letter spacing 0.12em, word spacing 0.16em — content not clipped

#### Operable

- [ ] All interactive elements reachable via keyboard (Tab + Shift+Tab traversal complete)
- [ ] No keyboard trap (user can always exit a component via Escape or Tab)
- [ ] Focus indicator visible on all focusable elements (minimum 3:1 contrast vs. adjacent)
- [ ] Skip-links present: `#main-content`, `#map`, `#filters` (see §1.6)
- [ ] Landmarks correct: `<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>` — all present and unique where required
- [ ] Timed interactions: no auto-timeout on critical analyst flows (see cognitive §2.6)
- [ ] Motion: all animations respect `prefers-reduced-motion`
- [ ] No content flashing > 3 times/second (seizure prevention)

#### Understandable

- [ ] `lang` attribute correct on `<html>` per locale
- [ ] Error messages: specific, actionable, not just "Error" — identify the field + correction
- [ ] Form labels: every `<input>` / `<select>` / `<textarea>` has an explicit `<label>` or `aria-label`
- [ ] Error suggestions provided where possible (e.g., "Date must be in YYYY-MM-DD format")
- [ ] Consistent navigation: nav items in same order across pages

#### Robust

- [ ] Valid HTML (no duplicate IDs, no unclosed tags, no deprecated elements)
- [ ] Custom widgets have correct ARIA roles, states, and properties
- [ ] Status messages use `role="status"` or `aria-live` (not just visual styling)
- [ ] All interactive components operable without JavaScript (progressive enhancement where possible)

### 1.2 Automated: axe-core in CI

Already implemented (`apps/web/tests/a11y/axe.spec.ts`). Runs:
- WCAG 2.0 A + AA tags
- WCAG 2.1 A + AA tags
- WCAG 2.2 A + AA tags
- Against 6 routes (EN + UK locale variants)

**Extending coverage:**
- Add new routes to `routes.ts` when pages are added
- axe results are non-blocking in CI by default; promote to blocking after WCAG remediation sprint
- Rule suppressions must be documented with rationale in `axe-overrides.ts`

### 1.3 Manual NVDA / VoiceOver Pass per Release

**Frequency:** Before every major release (minor releases: spot-check 3 critical flows).

**Critical flows to test:**
1. Landing page → sign up
2. Map workspace: event discovery, filter, event detail
3. Alert rule creation
4. Blog post reading
5. Help center search + article

**Screen reader matrix:**

| Screen reader | Browser | Platform | Tester |
|---|---|---|---|
| NVDA | Chrome | Windows | QA / engineer rotation |
| JAWS | Chrome / Edge | Windows | External audit (annually) |
| VoiceOver | Safari | macOS / iOS | QA / engineer rotation |
| TalkBack | Chrome | Android | QA / engineer rotation |

**Test script format:**
```
Flow: [name]
SR: [NVDA / VoiceOver / TalkBack]
Date: YYYY-MM-DD
Tester: ___

Step 1: Navigate to [URL]
Expected: [heading announced, skip link offered]
Actual: ___
Pass/Fail: ___

Step 2: ...
```

Results logged in `apps/web/tests/a11y/manual-audit-log.md`.

### 1.4 Form Labels + Error Association

Every form field must:
- Have an explicit `<label for="id">` or `aria-label` (not just placeholder — placeholder is not a label)
- On error: `aria-invalid="true"` on the input + `aria-describedby="error-id"` pointing to the error message element
- Error message has `role="alert"` or the parent form uses `aria-live="polite"` for error announcement

```tsx
// Correct pattern
<label htmlFor="api-key-name">API key name</label>
<input
  id="api-key-name"
  aria-invalid={!!error}
  aria-describedby={error ? "api-key-name-error" : undefined}
/>
{error && (
  <p id="api-key-name-error" role="alert" className="text-danger">
    {error}
  </p>
)}
```

### 1.5 Skip-Links + Landmark Structure

**Skip links** rendered as the first focusable element in `<body>`:

```tsx
<div className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50">
  <a href="#main-content" className="skip-link">Skip to main content</a>
  <a href="#map" className="skip-link">Skip to map</a>
  <a href="#filters" className="skip-link">Skip to filters</a>
</div>
```

Skip links are visually hidden by default; revealed on focus (keyboard navigation).

**Required landmark structure (every page):**
```html
<header role="banner">    ← global nav
<nav aria-label="Primary">
<main id="main-content">  ← primary content
<aside aria-label="...">  ← optional sidebars (unique label each)
<footer role="contentinfo">
```

No duplicate landmark roles without unique `aria-label`.

### 1.6 WCAG 2.2 New Criteria

WCAG 2.2 adds several criteria not in 2.1:

| Criterion | SC | Implementation |
|---|---|---|
| **Focus Appearance (Enhanced)** | 2.4.13 (AA) | Focus indicator: ≥ 2px solid outline; area ≥ perimeter × 2px; contrast ≥ 3:1 vs. unfocused state |
| **Focus Not Obscured (Minimum)** | 2.4.11 (AA) | Focused component must not be entirely hidden by sticky headers, overlays, or cookie banners |
| **Focus Not Obscured (Enhanced)** | 2.4.12 (AAA) | Fully visible when focused — target for critical flows |
| **Dragging Movements** | 2.5.7 (AA) | All drag operations have a single-pointer alternative (keyboard equivalent for any draggable element) |
| **Target Size (Minimum)** | 2.5.8 (AA) | Interactive targets ≥ 24×24 CSS px (exceptions for inline text links, browser-default controls) |
| **Accessible Authentication** | 3.3.8 (AA) | No cognitive function tests in auth (no CAPTCHA without audio/text alternative; no memory-based challenges) |
| **Redundant Entry** | 3.3.7 (A) | Don't ask user to re-enter information provided in the same session (e.g., billing address same as account address) |

**Immediate actions:**
- Audit all draggable UI elements (layer reorder in the map panel → add keyboard reorder)
- Verify all interactive targets are ≥ 24px (button minimum height: 40px in our design system — compliant)
- Review authentication flows for cognitive function tests

### 1.7 Public VPAT (Voluntary Product Accessibility Template)

**Target:** Publish a VPAT v2.5 (WCAG 2.2 Edition) before the first US government or US education contract.

**Template:** Use the official VPAT 2.5 from the IT Industry Council (ITI).

**Structure:**
- Section 1: Success Criteria, Level A
- Section 2: Success Criteria, Level AA
- (Section 3: Level AAA — optional)
- Chapter 3: Functional Performance Criteria
- Chapter 4: Hardware (N/A)
- Chapter 5: Software (web application)
- Chapter 6: Support Documentation and Services

**Conformance levels:**
- Supports: fully conforms
- Supports with Exceptions: mostly conforms; known exceptions documented
- Does Not Support: does not conform; remediation in roadmap with ETA

**Update cadence:** Updated within 60 days of any major feature release.

---

## Part 2 — Cognitive Accessibility Policy

> "Civilian persona may use this under air-raid stress. Design for that."

### 2.1 Plain-Language Policy

All user-facing copy on **civilian-facing surfaces** (civilian alert pages, public region pages, help center) must meet an **8th-grade reading level** (US equivalent; Flesch-Kincaid Grade ≤ 8).

**Tools:**
- Hemingway Editor (hemingwayapp.com) — target: Grade ≤ 8, no "hard to read" sentences
- `readability` npm package in copy review CI for high-traffic pages

**Rules:**
- Short sentences (≤ 20 words)
- Active voice preferred
- Avoid jargon; if unavoidable, define on first use
- One idea per paragraph
- Bullet lists over dense paragraphs for step-by-step instructions

**Professional surfaces** (analyst dashboard, API docs): 10th–12th grade acceptable; technical precision over simplicity.

### 2.2 Consistent Layouts + Iconography

**Layout consistency rules:**
- Primary navigation: same position, same order, same labels across all pages
- Filter controls: always left-panel or top-bar (not mixed per page)
- Action buttons: primary CTA always top-right or bottom-center of the relevant form — never hidden in overflow menus for primary actions
- Pagination: same component, same position (bottom-center) across all list pages

**Iconography rules:**
- Every icon has a text label or tooltip (never icon-only for interactive elements)
- Same icon = same meaning everywhere (no reuse of icons for different functions)
- Icon library: Lucide Icons (consistent, MIT licensed)
- Custom icons: requires design review + a11y review before ship

### 2.3 Predictable Interactions (No Surprise Modals)

**Rules:**
- Modals are never triggered without user action (no auto-open modals on page load or after a timeout)
- Navigation: links do not open in new tabs without warning (`target="_blank"` only with `↗` icon + `aria-label` suffix "opens in new tab")
- Form submit: always provides feedback (success state or error state) — no silent submissions
- Keyboard shortcuts: listed in discoverable cheat sheet (Shift+?) — no undiscoverable keyboard behaviors
- Tooltips: triggered on focus or hover, never on load — keyboard-accessible

### 2.4 Stress-Tolerant Flows (Clear, Single-Task Screens During Alerts)

For civilian-facing emergency flows (air alert notification, evacuation guidance):

- **One task per screen.** No sidebars, no secondary CTAs, no ads.
- **Maximum reading load:** 3 bullet points or < 80 words per screen.
- **Color redundancy:** Every status (safe / alert / all-clear) uses shape + color + text. Not color alone.
- **Large touch targets:** All interactive elements ≥ 48×48 CSS px in alert views.
- **Language:** Plain Ukrainian (UK) primary; English secondary; no technical terms.
- **Panic-mode design review:** At least one civilian (non-technical) user tests each alert flow before ship.

### 2.5 Undo Where Possible; Confirm Where Destructive

| Action | Required behavior |
|---|---|
| Delete alert rule | Confirmation dialog ("Are you sure? This cannot be undone.") |
| Delete case file | Soft-delete with 30-day recovery window |
| Export data | No confirmation needed; no destructive effect |
| Publish report | "Publish publicly?" confirmation with preview of what will be visible |
| Downgrade subscription | Confirmation with explicit list of features that will be lost |
| Revoke API key | Confirmation dialog — API keys cannot be recovered |

Confirmations must be brief: state what will happen, offer Cancel + Confirm (both clearly labeled, no default focus on destructive action).

### 2.6 No Timeouts on Critical Actions

- **Map workspace:** Never auto-close the event detail panel
- **Form filling:** No session timeout during form completion — save progress client-side
- **Alert rule builder:** No timeout; partial rules saved as drafts automatically
- **Export queue:** 15-minute signed URL expiry — user warned before expiry with a "Re-request" option
- **Session timeout:** If session expires, user is redirected to login with a message "Your session expired — your work is saved" (for any form-in-progress)

### 2.7 Animation Budget for Cognitive-Load-Heavy Surfaces

On surfaces used for extended concentration (analyst map workspace, investigation case files):

- **Ambient animations reduced:** no pulsing unless severity-5 event
- **Page transitions:** < 200ms; fade-only, no sliding panels (sliding adds spatial cognitive load)
- **Chart animations:** entrance only (1 play on load); no looping
- **`prefers-reduced-motion`:** all animations disabled; static equivalents provided
- **User preference:** "Reduce animations" toggle in `/account/settings/accessibility` persists in localStorage + account settings (server-side, so it applies across devices)

### 2.8 User Testing with Diverse Cognitive Profiles

**Cadence:** Before each major UX change to the map workspace, alert flows, or onboarding.

**Participant recruitment:**
- At least 1 participant with ADHD or dyslexia
- At least 1 participant with low technical literacy (non-OSINT user)
- At least 1 civilian user (not a professional analyst)
- At least 1 participant who uses the product under time pressure

**Testing method:**
- Think-aloud protocol (remote, recorded with consent)
- Task-based: 3–5 specific tasks per session (e.g., "You've just received an air alert for your region — find the nearest shelter suggestion")
- Note-taking: facilitator + observer; observer watches for hesitations, backtracking, confusion
- Debrief: "What was the hardest part? What surprised you?"

**Output:** Usability issues prioritized by severity (blocking / frustrating / minor). Blocking issues fixed before ship; frustrating issues scheduled within 2 sprints.

---

## Part 3 — Screen Reader Supplemental Spec

*Extends existing implementation in `apps/web/src/lib/a11y-announcer.ts`.*

### 3.1 ARIA Patterns Audit for Custom Widgets

Custom components that require specific ARIA patterns:

| Widget | ARIA pattern | Key implementation |
|---|---|---|
| Map event marker | `role="button"`, `aria-label="[EventClass] in [Region] at [Time]"` | Keyboard: Enter/Space to open detail |
| Layer toggle panel | `role="group"`, each toggle `role="switch" aria-checked` | |
| Filter combobox | ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-controls`) | See §3.4 |
| Confidence badge | `aria-label="Confidence: [N]% — [Likely verified]"` | Not just the number |
| Severity indicator | `aria-label="Severity [N] of 5 — [Critical]"` | |
| Alert rule builder | `role="form"` with named steps; progress `aria-valuenow` | |
| Data table (events) | `role="grid"`, row selection `aria-selected` | |

### 3.2 Map Workspace: Tabular Alternative + ARIA Navigation

The map cannot be fully keyboard-navigable in its native canvas/GL form. A tabular alternative is required:

- A toggle button "Switch to table view" (keyboard shortcut: `T`) renders the current map viewport as a data table.
- Table: sortable by time, severity, confidence; keyboard-navigable (grid pattern).
- Table row → Enter: opens event detail panel (same as map marker click).
- "Return to map" button re-focuses on the last selected marker.
- The table view should be the default for users who have `prefers-reduced-motion` or who use a screen reader (detected via `forced-colors` media query as a proxy).

### 3.3 Filter Sidebar: combobox / listbox / treegrid

All filter dropdowns implement the ARIA combobox pattern:
```
<div role="combobox" aria-expanded={open} aria-controls="filter-listbox" aria-haspopup="listbox">
  <input type="text" aria-autocomplete="list" />
</div>
<ul id="filter-listbox" role="listbox">
  <li role="option" aria-selected={selected}>...</li>
</ul>
```
Keyboard: ↑↓ navigate options, Enter select, Escape close + return focus to trigger.

For multi-select filter groups (event class, region): `role="group"` + `role="checkbox"` per option.

### 3.4 Dialogs: Focus Trap + Return Focus

Already partially implemented (modal scope in keyboard-shortcuts.ts). Spec:
- On open: focus moves to the first interactive element inside the dialog
- `aria-modal="true"` on the dialog element
- Background is inert (`inert` attribute on `<main>` while dialog is open)
- On close: focus returns to the element that triggered the dialog
- Never destroy the trigger element while dialog is open (avoids lost focus)

---

## Appendix: Accessibility Tooling Stack

| Tool | Purpose | CI integration |
|---|---|---|
| `@axe-core/playwright` | Automated WCAG audit | Yes — `a11y` CI job |
| `eslint-plugin-jsx-a11y` | Static lint for JSX accessibility | Yes — lint step |
| Storybook a11y addon | Component-level accessibility check | Yes — Storybook build |
| Hemingway Editor | Readability scoring for copy | Manual |
| Coblis | Colorblind simulation | Manual (design review) |
| NVDA (free) | Screen reader testing — Windows | Manual |
| VoiceOver (built-in) | Screen reader testing — macOS/iOS | Manual |
| TalkBack (built-in) | Screen reader testing — Android | Manual |
