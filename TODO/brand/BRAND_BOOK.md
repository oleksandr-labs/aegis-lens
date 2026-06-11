# Aegis Lens — Brand Book v1.0

**Status:** Draft v1.0 — Sprint 2.39 (2026-05-24). Owner: Brand lead.
**Audience:** Designers, partners, journalists, new hires, contractors.
**License:** © Aegis Lens. Logo + wordmark usage requires written approval. Asset library: see `TODO/brand/DAM_PLAN.md`.

---

## 1. Mission, Vision, Values

**Mission.** Turn the world's open signals into verified intelligence at the speed of events.

**Vision (5-year).** The default operating surface for analysts, journalists, NGOs, and governments who need to know what is happening — and what is real — before anyone else.

**Values.**
1. **Verification before velocity.** We are fast because we are right, not the other way around. A retracted post is more expensive than a delayed one.
2. **Transparent by default.** Every score, every claim, every model output exposes its sources, its confidence, and its limits.
3. **Civilian first.** We serve analysts and NGOs and humanitarian responders before we serve militaries. When use cases conflict, civilian protection wins.
4. **Neutral voice, clear stakes.** We do not editorialize. We do not flinch.
5. **Local depth, global reach.** Ukraine-grade depth in every theater we cover.

---

## 2. Naming

- **Product name:** `Aegis Lens` (two words, both capitalized).
- **Short form:** `Aegis` (acceptable in body copy after first mention).
- **Wordmark:** lowercase `aegis lens` — only inside the lockup, never inline.
- **Never:** `AegisLens`, `Aegis-Lens`, `AEGIS LENS`, `aegis`, `lens`.
- **Legal entity name:** distinct from product — use the registered company name on contracts, never `Aegis Lens` alone.

---

## 3. Logo Usage

### Variants
| Variant | When | File |
| --- | --- | --- |
| Primary lockup (mark + wordmark, horizontal) | Web headers, decks, docs cover | `logo/primary-horizontal.svg` |
| Stacked lockup | Square avatars, social profiles | `logo/primary-stacked.svg` |
| Monogram (mark only) | Favicons, app icons, ≤ 32 px | `logo/monogram.svg` |
| Wordmark (text only) | Press footers, partner walls | `logo/wordmark.svg` |
| Monochrome (white) | On dark backgrounds, on photography | `logo/mono-white.svg` |
| Monochrome (black) | Print on light, fax, single-color print | `logo/mono-black.svg` |

### Clear space
Minimum clear space around the lockup = height of the mark's letter `A`. Nothing — text, illustrations, page edge — encroaches into that zone.

### Minimum size
- Digital: monogram 16 px, lockup 96 px wide.
- Print: monogram 8 mm, lockup 24 mm wide.

### Do
- Place the lockup on a flat brand-palette background.
- Use the monochrome variant when a photo or video forces it.
- Maintain native aspect ratio.

### Don't
- Recolor outside the palette. The mark is **either** brand navy, brand white, or full monochrome.
- Apply effects: shadows, gradients, outlines, bevels, 3D, motion-blur.
- Rotate, stretch, skew, or warp the lockup.
- Place over a busy photo without the white scrim layer.
- Compose new lockups with partner logos. Use the co-brand template (§ 9).
- Use the monogram as decorative wallpaper or repeat-pattern.

---

## 4. Color Palette

> **Source of truth:** `apps/web/tailwind.config.ts`. The palette below is the public-facing extract; UI tokens may extend it.

### Tactical dark (default UI theme)
| Token | Hex | Use |
| --- | --- | --- |
| `bg.base` | `#0a0d12` | Page background. The deepest layer. |
| `bg.elevated` | `#11151c` | Cards, side panels. |
| `bg.surface` | `#1a1f2a` | Inputs, hovered rows, popovers. |
| `border.subtle` | `#222936` | Dividers between same-elevation surfaces. |
| `border.default` | `#2c3445` | Inputs, card outlines, focus rings (non-accent). |

### Text
| Token | Hex | Min contrast on `bg.base` |
| --- | --- | --- |
| `text.primary` | `#e8edf5` | 16.4 : 1 (AAA) |
| `text.secondary` | `#9ba6b8` | 7.4 : 1 (AAA) |
| `text.muted` | `#6b7585` | 4.6 : 1 (AA large + AA body) |

### Accent (signal blue)
| Token | Hex | Use |
| --- | --- | --- |
| `accent.DEFAULT` | `#4ea1ff` | Primary action, focus ring, links, brand mark color. |
| `accent.hover` | `#6ab2ff` | Hover state only. |

### Semantic
| Token | Hex | Meaning |
| --- | --- | --- |
| `danger` | `#ef4444` | Confirmed hostile / destructive action. |
| `warning` | `#f59e0b` | Unverified / caution / civilian alert. |
| `success` | `#22c55e` | Verified / safe / completed. |

### Accessibility floor
- Text on background ≥ **4.5 : 1** (WCAG 2.2 AA body).
- Non-text UI on adjacent surface ≥ **3 : 1**.
- Never communicate state with color alone — pair with an icon, label, or shape (see § 6).

### Do
- Use `accent.DEFAULT` sparingly. One primary action per surface.
- Use semantic colors only for their meaning. `danger` is **not** "important," it is hostile / destructive.
- Map verification status to semantic color: `verified` → success, `pending` → warning, `disputed` → danger.

### Don't
- Don't introduce new hues for marketing surfaces — use opacity / surface elevation instead.
- Don't tint photography with accent. Photography stays neutral.
- Don't use red as a "primary CTA" — it reads as confirmed hostility in our taxonomy.

---

## 5. Typography

### Faces
- **Display + body:** `Inter` (variable, weights 400–700). System fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **Mono (code, data, coordinates, IDs):** `JetBrains Mono`. Fallback: `Menlo, Consolas, monospace`.

### Type scale (rem, web)
| Token | Size | Line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `display` | 3.0 | 1.1 | 700 | Hero headlines, report titles. |
| `h1` | 2.25 | 1.2 | 700 | Page H1. |
| `h2` | 1.75 | 1.25 | 600 | Section. |
| `h3` | 1.375 | 1.3 | 600 | Sub-section. |
| `body-lg` | 1.125 | 1.55 | 400 | Hero copy, lead paragraphs. |
| `body` | 1.0 | 1.6 | 400 | Default body. |
| `caption` | 0.875 | 1.5 | 400 | Metadata, captions, timestamps. |
| `micro` | 0.75 | 1.4 | 500 | Tags, badges. UPPERCASE allowed. |
| `mono` | 0.875 | 1.5 | 400 | IDs, coordinates, code. |

### Rules
- Numbers in tables, coordinates, IDs, timestamps → **mono with tabular-nums**.
- Line length: 60–80 characters for body. Hard-cap at 90.
- Don't justify body text. Don't track display type below -1%.

---

## 6. Iconography

- **Library:** `lucide-react` baseline. Custom layer icons supplement (drone, missile, fire, outage, AOI).
- **Stroke:** 1.5 px at 16 px; 2 px at 24 px+.
- **Fill:** outline by default. Filled only when status-bearing (verified ✓, pending !, disputed ✕).
- **Color:** inherit current text color. Only status icons may use semantic colors.
- **Map layer icons:** 1 distinctive silhouette per event class (`drone | missile | fire | outage | civilian_alert | infrastructure | maritime | aviation | satellite`). Never reuse a silhouette across classes.

### Accessibility
- Every icon-only control has an `aria-label`.
- Status icons are paired with text or a `<title>` element. Never color-only.

---

## 7. Photography & Illustration Direction

### Photography
- **Subject hierarchy:** people > infrastructure > equipment > landscape. We are a people-centered product even when the subject is industrial.
- **Treatment:** neutral color grade, no filters, no faux-vintage. Documentary cinema, not Instagram.
- **License:** only photos with full commercial license and metadata cleared by Legal. Conflict zone imagery requires editorial provenance (photographer, date, location).
- **Sensitivity:** no graphic depictions of dead bodies, no identifiable victims, no children in distress. Content warnings per the `features/TODO_content_warnings.md` taxonomy.
- **Crop:** wide cinematic crops for marketing, square for social, vertical for mobile / Stories.

### Illustration
- **Style:** geometric, cartographic. Lines, grids, isolines, sparse fills. Think: military-grade infographics, not friendly SaaS blobs.
- **Palette:** restricted to brand tokens. No off-palette pastels.
- **Don'ts:** no 3D mascots, no anthropomorphic icons, no "fun" illustrations of war material.

---

## 8. Voice & Tone (summary)

See full guide: `TODO/brand/VOICE_TONE.md`.

**Voice traits.** Precise · Calm · Sourced · Plainspoken · Modest about uncertainty · Neutral.

**Tone modes.**
| Mode | When | Tonal shift |
| --- | --- | --- |
| Informational | Default. Briefs, docs, marketing. | Calm, direct, sourced. |
| Crisis | Active incident, public-safety event. | Compressed, top-line first, repeat-able. |
| Educational | Academy, glossary, methodology. | Patient, builds from first principles. |
| Promotional | Pricing, landing, sales. | Confident, never breathless. No superlatives. |

**House rules.**
- Active voice, present tense for events. ("Strike reported in Odesa" not "A strike has been reported.")
- Numbers carry units and sources. ("12 verified strikes in last 24h — source: Genstaff + 3 local reports").
- Hedge honestly. Use `reported`, `claimed`, `verified`, `disputed`, `unconfirmed`. Never `allegedly` (legalistic, not analytical).
- Never editorialize on belligerents' motives unless an analyst byline is attached.

---

## 9. Co-branding Rules

### Approved configurations
- **Partner = sponsor:** `Powered by Aegis Lens`, mark + wordmark on partner property. Aegis lockup ≥ 16 px high. Pre-approved.
- **Partner = data source:** `Source: Aegis Lens`, wordmark only.
- **Partner = peer (joint report, joint event):** equal-weight lockup, divider rule, equal clear space on both sides.
- **Partner = reseller:** Reseller wordmark + `Authorized Reseller — Aegis Lens` line.

### Approval workflow
- Any external use of the Aegis Lens lockup adjacent to a non-Aegis brand requires written approval from the brand lead. SLA: 2 business days.
- Approved lockups are versioned in the DAM and have an explicit expiration date.

### Never
- Don't merge Aegis Lens with another mark into a compound logo.
- Don't allow partners to recolor the Aegis mark.
- Don't place Aegis Lens alongside marks of belligerent states' military or intelligence services.

---

## 10. Anti-patterns Gallery

A short, deliberate list of misuses we will publish (with crossed-out exhibits) in the public brand book. Each is paired with a corrected example.

1. Lockup on a busy photo with no scrim — fix: monochrome white on dark scrim.
2. Lockup rotated or angled — fix: always horizontal.
3. Mark recolored to red — fix: brand navy or accent blue only.
4. Mark stretched to fit a button — fix: monogram for tight spaces.
5. Lockup with drop shadow / glow — fix: flat only.
6. Lockup over a partner mark, overlapping — fix: co-brand template.
7. "Aegis" used alone in legal docs — fix: full registered entity name.
8. Stock photo of soldiers smiling at the camera as marketing hero — fix: documentary, civilian-centered imagery.
9. Red CTA button — fix: accent blue. Red is reserved for hostile / destructive semantics.
10. Mascot character of the mark — fix: there is no mascot, ever.

---

## 11. Versioning, Distribution, Localization

- **This document** is the canonical source. Stored in `TODO/brand/BRAND_BOOK.md` until promoted to `/brand/` web page.
- **Web version:** `/{locale}/brand` static page in `apps/web` once published externally.
- **PDF version:** generated from this Markdown via the report template (`content/TODO_brief_templates.md`). Versioned by date (`brand-book-2026-05-24.pdf`).
- **Localization:** EN canonical. UK on-demand. Other locales only when a partnership or media surface justifies the cost. Voice translates, not transliterates — see VOICE_TONE.md § Localization.
- **Change process:** brand lead opens PR → review by design + comms + legal → merge → bump version + date → publish to DAM and web.

---

## 12. Quick Reference Card

| | |
| --- | --- |
| Product name | Aegis Lens |
| Short form | Aegis (after first mention) |
| Tagline | Intelligence at the speed of events. |
| Primary brand color | `#4ea1ff` accent blue on `#0a0d12` base |
| Headline font | Inter |
| Mono font | JetBrains Mono |
| Logo file (default) | `logo/primary-horizontal.svg` |
| Co-brand approver | brand lead, 2 business days |
| Contact | `brand@aegislens.<tld>` |
