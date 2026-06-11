# Year in Review — Template & Production Plan

> A flagship multi-format annual report. **Press magnet. Sales tool. Recruiting
> tool.** Plan from Q3 — don't write in December.

---

## What it is

The Aegis Lens Year in Review is published every December 15. It is a
multi-format, cited-and-embargoed annual intelligence synthesis that:

- **Establishes authority** as the definitive source for conflict-intelligence
  analysis of the year.
- **Generates press coverage** — sent under embargo to 50+ newsrooms 48h before
  launch.
- **Drives leads** — PDF download is gated behind email + company name (generates
  enterprise pipeline).
- **Aids recruiting** — showcases the quality and mission of the work.
- **Creates SEO value** — the web version targets "Ukraine conflict 2025 year in
  review" and related keywords.

---

## Production calendar

| Milestone | Date (annual) | Owner |
| --- | --- | --- |
| Scope and partners confirmed | Sep 1 | Editor-in-Chief |
| Data collection window open | Sep 15 | Intelligence Desk |
| First draft sections (4 of 6) | Oct 15 | Lead Author |
| Partner co-author submissions | Oct 31 | Partner orgs |
| Full first draft | Nov 7 | Lead Author |
| Review round 1 (intelligence + editorial) | Nov 14 | Intelligence Lead + Editor |
| Review round 2 (legal + external expert) | Nov 21 | Legal + External reviewer |
| Translations submitted (UK + DE) | Dec 1 | Translators |
| Graphic design + interactive dataviz | Dec 1 | Design team |
| Press embargo distribution | Dec 13 | Comms team |
| Publication + social campaign | Dec 15 | Marketing |
| Post-launch: metrics report | Jan 7 | Marketing |

---

## Format breakdown

### A. Long-form web essay (5,000+ words)

The primary publication: a narrative, year-spanning analysis. Structured with
`H2` sections per theme (not per month — thematic framing is more compelling
and more SEO-friendly than a timeline).

```
[HEADLINE] — [YEAR] in Review: Conflict Intelligence Report

## Editor's foreword (300 words)
  — Why this year, why this report, what changed.

## The year in numbers (with interactive dataviz embed)
  — 6–8 key statistics visualized: verified events, source count,
    geographic coverage, verification rates.

## Part 1: [Major theme 1 — e.g., "The infrastructure war"] (~800 words)
## Part 2: [Major theme 2 — e.g., "Displacement and humanitarian corridors"] (~800 words)
## Part 3: [Major theme 3 — e.g., "The information war"] (~800 words)
## Part 4: [Major theme 4 — e.g., "International dimensions"] (~600 words)

## Methodology (500 words)
  — How we collected, verified, and rated confidence in the data.
  — Limitations and what this report does not cover.

## About Aegis Lens (200 words)
## Acknowledgements — partner organizations

## Downloadable PDF [CTA]
## Data appendix [link to dataset]
```

Schema: `Article` with `datePublished`, `author` (org), `about`, `mentions`
(key entities). Include a `Dataset` schema for the data appendix.

---

### B. Interactive data visualizations

Built in Observable Plot / D3 / Flourish (to be determined by design/eng):

| Visualization | Data source | Format |
| --- | --- | --- |
| Events per week (time series) | Aegis Lens event database | Line chart |
| Geographic heat map | Aggregated event coordinates | deck.gl map embed |
| Source diversity chart | Source metadata | Stacked bar |
| Verification outcome distribution | Verification state field | Donut chart |
| Top incident types | Event taxonomy | Treemap |

All dataviz are mobile-responsive and include accessible alt-text descriptions.

---

### C. PDF download (designed)

- A4 + Letter-compatible PDF, print-ready.
- Design consistent with brand (see brand book).
- Includes all web content + infographic versions of the dataviz.
- Cover page, table of contents, page numbers, footer with URL and CC license.
- Gated: email + company name. On submit → immediate download + nurture sequence begins.

---

### D. Press embargo + release plan

| Action | Timing |
| --- | --- |
| Identify target media (50+ outlets: international wire, regional, specialist) | Nov 15 |
| Personalize embargo pitch per outlet (5–6 key journalists contacted directly) | Dec 11 |
| Distribute embargo PDF under NDA to pre-selected outlets | Dec 13, 09:00 CET |
| Embargo lifts (simultaneous web + social) | Dec 15, 09:00 CET |
| Press follow-up (answer questions, provide additional data) | Dec 15–18 |

Every press coverage hit is tracked in the media-coverage register (links, reach, sentiment).

---

### E. Multi-locale launch (EN + UK + DE)

| Locale | Responsibility | Deadline |
| --- | --- | --- |
| EN | Lead Author | Dec 7 |
| UK | Native Ukrainian translator + review | Dec 1 |
| DE | German translator + editorial review | Dec 1 |

UK and DE versions publish simultaneously with EN on Dec 15. Translations are
done by professional translators (not machine-only) — credibility depends on it.

---

### F. Social cut-downs

Per platform, per locale:

| Platform | Format | Content |
| --- | --- | --- |
| X / Twitter thread | 5–8 tweets | Top 5 findings with data cards |
| LinkedIn article | 800 words | Executive summary |
| Instagram / FB | 10-slide carousel | Data cards (dataviz as statics) |
| Telegram | Long-form post | EN + UK versions |
| YouTube | 3–4 min video | Narrated highlights reel |

Design team produces a consistent card template suite from the dataviz set.
Cards are ready at publication time, not after.

---

### G. Tracked metrics (post-launch)

| Metric | Target | Tracking |
| --- | --- | --- |
| Organic traffic to web version | TBD (baseline first year) | Plausible |
| PDF downloads | TBD | CRM lead capture |
| Press mentions (organic) | ≥ 20 outlets in month 1 | Media coverage register |
| Social shares | TBD | Native analytics |
| Leads generated (email capture) | TBD | CRM |
| Backlinks acquired | ≥ 10 new referring domains | Ahrefs / Search Console |

First-year report serves as the baseline. Year 2 targets are set from Year 1 actuals.

---

## Co-authoring with partner orgs

Partner contributions add credibility and expand the distribution network:
- Each partner writes one section or data contribution (500–800 words or a dataset).
- Partner gets named authorship credit and a shared press-release credit.
- Partner distributes to their own media contacts (extends embargo distribution).
- Target: 2–4 partner organizations per year.
