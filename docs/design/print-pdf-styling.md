# Print / PDF / Report Styling

> **Status:** v1.0 — design specification. Review with each major report format change.
> **Engine:** Playwright (headless Chromium) server-side render → PDF pipeline.

Aegis Lens reports are **intelligence products**, not web printouts. When a newsroom, NGO, or government ministry prints or shares our report, it must look like it came from a professional intelligence shop — not from an auto-generated web page. Every decision below serves that goal.

---

## 1. Render Pipeline

### 1.1 Architecture

```
User clicks "Export PDF"
  → POST /api/reports/{id}/export?format=pdf
  → Job queued in BullMQ (export-queue)
  → Playwright worker picks up job
  → Opens /print/report/{id}?token={signed-jwt} (headless, no auth UI)
  → Applies @media print CSS
  → page.pdf({ format: 'A4', printBackground: true, margin: {...} })
  → Upload to R2 / S3
  → Signed URL returned to client (15-min expiry)
  → Browser downloads
```

### 1.2 Print-specific route

All print renders go through a dedicated route `/print/*` that:
- Strips navigation, sidebars, cookie banners, and interactive elements.
- Applies `?print=true` param that activates the `@media print` stylesheet.
- Accepts a short-lived signed JWT (no cookie session needed — avoids Playwright auth complexity).
- Renders synchronously, waiting for all images and charts to be loaded (`networkidle`).

### 1.3 CSS `@page` rules

```css
@page {
  size: A4 portrait;
  margin: 18mm 15mm 20mm 15mm;  /* top right bottom left */

  @top-center {
    content: "AEGIS LENS — INTELLIGENCE REPORT";
    font-size: 7pt;
    letter-spacing: 0.15em;
    color: #6a8099;
  }

  @bottom-left {
    content: attr(data-report-id) " | " attr(data-date-range);
    font-size: 7pt;
    color: #6a8099;
  }

  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-size: 7pt;
    color: #6a8099;
  }

  @bottom-right {
    content: "aegislens.io";
    font-size: 7pt;
    color: #6a8099;
  }
}

@page :first {
  margin-top: 0;  /* cover page: bleed to edge */
  @top-center { content: ""; }  /* no header on cover */
}
```

### 1.4 Page numbering

- Page numbers rendered via CSS `counter(page)` + `counter(pages)` in `@page @bottom-center`.
- Cover page: unnumbered (`:first` page rule suppresses counter).
- Table of contents: uses roman numerals (i, ii, iii) — implemented via a separate counter reset section in CSS.
- Body sections: arabic numerals starting from 1.

### 1.5 Table of contents (auto-generated)

- Server-side: the report renderer crawls all `<h2>` and `<h3>` sections with `data-toc="true"` attribute and builds a TOC JSON structure.
- TOC template renders before the body sections.
- Page numbers in TOC: set via CSS `target-counter()` pointing to section anchors (CSS Paged Media Level 3 — supported in Playwright/Chromium).
- Fallback if CSS Paged Media level 3 not available: server-side two-pass render (render once, extract page numbers, re-render with numbers populated).

### 1.6 Cross-references with page numbers

In-document references like *"See Figure 3 on page 7"* are resolved via:
```html
<a href="#figure-3" class="cross-ref">
  See <span data-ref="figure-3"></span>
</a>
```
CSS: `span[data-ref]::after { content: target-counter(attr(href), page); }`

---

## 2. Visual Design

### 2.1 Cover page

The cover page is full-bleed (no page margin) and contains:

| Element | Spec |
|---|---|
| **Classification banner** | Top 10mm strip; color-coded by classification level (see §3.3) |
| **Aegis Lens wordmark** | Top-left, white on dark navy; 24pt |
| **Report type label** | e.g., "WEEKLY INTELLIGENCE BRIEF" — 8pt uppercase, letter-spacing 0.2em, muted |
| **Title** | 28–36pt, bold, white, max 2 lines |
| **Subtitle** | 14pt, muted white, optional |
| **Region / scope** | Icon + text — e.g., "🇺🇦 Ukraine — Eastern Front" — 11pt |
| **Date range** | e.g., "21–27 May 2026" — 11pt |
| **Prepared by** | "Aegis Lens Intelligence Platform" + analyst name if human-authored |
| **DOI / citation** | Bottom of cover — 8pt: `DOI: 10.57967/aegis.YYYY.NNNN` |
| **AI disclosure** | "This report contains AI-assisted analysis. Human reviewed." — 8pt, bottom-right |

Background: dark navy (`#0d1117`) with a subtle map graticule texture (light `#151c26` lines) — see §2.5.

### 2.2 Executive summary block

Rendered immediately after the TOC on the first body page:

```
┌─────────────────────────────────────────────────────┐
│  KEY FINDINGS                                       │
│  ─────────────────────────────────────────────────  │
│  • Finding 1 (bold lead) — supporting detail        │
│  • Finding 2 ...                                    │
│  • Finding 3 ...                                    │
└─────────────────────────────────────────────────────┘
```

- Bordered box: 1px `#2e3a4a` border, `#0d1a28` background fill, 10pt text.
- Rendered as a non-breaking block (avoid page split mid-summary).

### 2.3 Body typography

| Element | Font | Size | Color |
|---|---|---|---|
| Body text | DM Sans Regular | 9.5pt | `#1a1a2e` |
| Headings H2 | DM Sans SemiBold | 14pt | `#0d1a28` |
| Headings H3 | DM Sans SemiBold | 11pt | `#1a2a3a` |
| Captions | DM Sans Regular | 8pt | `#4a5a6a` |
| Source citations | DM Mono Regular | 7.5pt | `#4a5a6a` |
| Pullquotes | DM Sans Italic | 11pt | `#2a4060` |

Line height: 1.5 for body text, 1.2 for headings.

### 2.4 Page background — graticule

Option A (default): **no background** — pure white body pages (most print-friendly, saves ink).
Option B (premium): subtle map graticule pattern — 0.5pt `#e8eaed` horizontal + vertical lines at 20mm intervals, reminiscent of a geographic grid, visible on light background. Disabled in print mode by default; enabled only for digital-first report types.

A/B test result will determine default. Use a CSS class `report--graticule` on `<body>` to toggle.

### 2.5 Charts re-styled for print

All data visualizations rendered by the chart library must accept a `theme="print"` prop that applies:
- **High contrast:** minimum 4.5:1 ratio on white background.
- **No glow effects** (CSS `filter: drop-shadow()` removed).
- **No animations** (static render).
- **Pattern fills** in addition to color (stripes, dots, crosshatch) so charts are readable in B&W print.
- **Gridlines:** light `#d0d0d0`, not removed (unlike some screen styles).
- **Font:** same DM Sans used in body text.
- **Legend:** printed below the chart (not floating — avoids Playwright layout issues with fixed-position elements).

### 2.6 Map snapshots

- Server-rendered via a separate Playwright worker that captures the map at the required zoom and viewport.
- Resolution: 300 DPI equivalent (2× retina export from Mapbox, then downscaled at print).
- Style: "Print / Report Style" (grayscale-safe — see `docs/design/map-style-guide.md §1.4`).
- Marker clusters: disabled for print (show individual markers); if > 100 markers in viewport, use heatmap overlay instead.
- Caption: "Map generated: {timestamp} UTC | Data as of: {data_freshness}" — 8pt below the map.
- Alt text: written by the report author or AI-generated (`<img alt="...">` in the HTML source).

---

## 3. Branding

### 3.1 Footer attribution

Every page footer includes:
```
Aegis Lens Intelligence Platform | aegislens.io | {DOI or report-id} | CC-BY 4.0 (public reports)
```
For licensed / paid reports: `© {YEAR} Aegis Lens. All rights reserved. License: {SPDX-ID}.`

### 3.2 Watermark for embargoed / confidential variants

Applied as a CSS background on each page body:

| Classification | Watermark text | Color | Opacity |
|---|---|---|---|
| **EMBARGOED** | "EMBARGOED — NOT FOR DISTRIBUTION" | `#e74c3c` | 0.08 |
| **CONFIDENTIAL** | "CONFIDENTIAL" | `#e74c3c` | 0.06 |
| **DRAFT** | "DRAFT — NOT FOR DISTRIBUTION" | `#f39c12` | 0.06 |
| **PUBLIC** | (none) | — | — |

Watermark is a CSS `::before` pseudo-element on `body` using `transform: rotate(-35deg)`, rendered at z-index -1 (behind content). Playwright captures this layer correctly.

Watermark text is also embedded in PDF metadata (`Keywords: EMBARGOED`) for enterprise DRM workflows.

### 3.3 Classification banner colors

Top banner strip (cover page + every page header):

| Level | Banner color | Text color | Text |
|---|---|---|---|
| Public | `#27ae60` green | white | PUBLIC |
| Internal | `#2980b9` blue | white | INTERNAL |
| Confidential | `#e67e22` amber | white | CONFIDENTIAL |
| Embargoed | `#e74c3c` red | white | EMBARGOED — DO NOT DISTRIBUTE |

### 3.4 White-label theme support

White-label clients (Enterprise / OEM plan) can supply:
- **Logo:** SVG or PNG, displayed in place of Aegis Lens wordmark on cover + footer.
- **Color overrides:** primary brand color (used for headings + accent lines); must pass WCAG AA on white background.
- **Custom footer text:** replaces "Aegis Lens" attribution with client name (with mandatory "Powered by Aegis Lens" in 6pt at the very bottom per Terms).
- **Custom watermark:** client's own classification marking.

White-label config stored in org settings: `org.reportTheme: { logo, primaryColor, footerText, poweredByVisible }`.

---

## 4. i18n

- Date formats per locale (ISO 8601 in metadata; localized in display text).
- Number formatting per locale (decimal separator, thousands separator).
- RTL layout support for future Arabic / Hebrew reports: use CSS `dir="rtl"` on `<html>` and logical properties (`margin-inline-start` not `margin-left`).
- Report language set from `locale` param on the print route; fonts must include glyphs for all ACTIVE_LOCALES (Noto font family as fallback ensures Cyrillic, Latin, Arabic coverage).

---

## 5. Output Formats

| Format | Use case | Engine |
|---|---|---|
| PDF/A-1b | Archival; embed in legal / government submissions | Playwright → PDF (Chromium) |
| PDF (screen) | General sharing; email attachment | Playwright → PDF |
| DOCX | Editorial editing; newsroom workflows | `docx` npm package (post-render, server-side) |
| PNG (slide export) | Social media; presentation use | Playwright → screenshot per section |

DOCX output is a best-effort conversion — complex layouts (maps, multi-column) may not perfectly replicate the PDF. A note is displayed when DOCX is chosen: "DOCX export is an approximation. Use PDF for archival."

---

## 6. Performance

- Playwright PDF generation: target < 10s for a typical 10-page report (server-side, no user waiting).
- Long reports (> 50 pages): async job → email download link when ready.
- CDN: generated PDFs cached in R2 with a 1-hour TTL; invalidated when the report is republished.
- Max report size: 50MB. Reports exceeding this are split into sections with a master index PDF.
