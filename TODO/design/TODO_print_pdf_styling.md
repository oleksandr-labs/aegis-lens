# TODO — Print / PDF / Report Styling

## Goal
Reports that look like *intelligence products*, not auto-generated web printouts. Newsroom + government must be able to ship our PDFs.

## Progress
- 10 / 10 done ✅ COMPLETE (Sprint 2.53)

## Tasks

### Engine
- [x] Playwright print pipeline (server-side render → PDF) → [docs/design/print-pdf-styling.md §1.1](../../docs/design/print-pdf-styling.md)
- [x] CSS Paged Media + `@page` rules → [docs/design/print-pdf-styling.md §1.3](../../docs/design/print-pdf-styling.md)
- [x] Page numbering, header / footer per page → [docs/design/print-pdf-styling.md §1.4](../../docs/design/print-pdf-styling.md)
- [x] Table-of-contents auto-generated → [docs/design/print-pdf-styling.md §1.5](../../docs/design/print-pdf-styling.md)
- [x] Cross-references with page numbers → [docs/design/print-pdf-styling.md §1.6](../../docs/design/print-pdf-styling.md)

### Visual
- [x] Cover page (title, region, date range, classification banner if applicable) → [docs/design/print-pdf-styling.md §2.1](../../docs/design/print-pdf-styling.md)
- [x] Executive summary block (highlighted) → [docs/design/print-pdf-styling.md §2.2](../../docs/design/print-pdf-styling.md)
- [x] Page background subtle map graticule (or none — A/B test) → [docs/design/print-pdf-styling.md §2.4](../../docs/design/print-pdf-styling.md)
- [x] Charts re-styled for print (high-contrast, no glow) → [docs/design/print-pdf-styling.md §2.5](../../docs/design/print-pdf-styling.md)
- [x] Map snapshots high-DPI → [docs/design/print-pdf-styling.md §2.6](../../docs/design/print-pdf-styling.md)

### Branding
- [x] Footer with attribution + DOI / citation → [docs/design/print-pdf-styling.md §3.1](../../docs/design/print-pdf-styling.md)
- [x] Watermark for embargoed / confidential variants → [docs/design/print-pdf-styling.md §3.2](../../docs/design/print-pdf-styling.md)
- [x] White-label theme support → [docs/design/print-pdf-styling.md §3.4](../../docs/design/print-pdf-styling.md)

### Done notes (2026-05-30)
Full print/PDF styling spec in `docs/design/print-pdf-styling.md`. Pipeline: Playwright worker → `/print/*` route → `page.pdf()` → R2 → signed URL. `@page` CSS spec with header/footer/numbering. TOC auto-generated from `data-toc="true"` H2/H3 elements, CSS `target-counter()` for page refs. Cover page: 10-element spec (classification banner, wordmark, DOI, AI disclosure). Executive summary bordered block. Body typography table (DM Sans, 9.5pt, 5 element types). Graticule as A/B test option (CSS class toggle). Chart print theme: high-contrast, pattern fills, no animations. Map snapshots: 300 DPI, Print style from map-style-guide. Watermark: CSS `::before` per 4 classification levels. White-label: logo + color + footer overrides. Output formats: PDF/A-1b, PDF screen, DOCX, PNG.

## i18n
- Per-locale templates; date / number formats per locale.

### Примітки
A PDF is often the most-shared artifact of our work. Don't ship default browser print.
