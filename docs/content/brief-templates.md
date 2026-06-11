# Brief & Report Templates

> Reusable, branded templates that make every content piece feel consistent.
> **Templates compound author productivity — invest early.**
>
> Every template includes: a word-count target, section scaffolding, an SEO
> checklist, and a review workflow. Store the working copies in the CMS/Notion;
> keep the canonical structure here.

---

## Template 1 — Weekly Intelligence Brief (1,500–2,500 words)

**Cadence:** Weekly (Friday or Monday depending on news cycle preference).
**Audience:** Pro/Team subscribers + public SEO (high-value keyword: "Ukraine intelligence brief [week]").
**Format:** Long-form web post + email digest version (condensed to 400 words).

```
[HEADLINE] — Week of [DATE]
Byline: [Author Name], Aegis Lens Intelligence Desk
Published: [DATE] | Updated: [DATE if updated]

## Executive summary (150 words max)
  Three bullet points: top development, trend, notable absence.

## Section 1: Frontline situation (~400 words)
  - Key axis movements verified in the period.
  - Confidence note: "Based on [N] corroborated sources as of [DATE/TIME UTC]."
  - Map embed: Aegis Lens interactive map (AOI: frontline for the week).

## Section 2: Infrastructure and logistics (~350 words)
  - Notable strikes on infrastructure (verified) with source citations.
  - Supply-route status.

## Section 3: Aerial activity (~300 words)
  - Air alerts, drone/missile activity patterns.
  - ADS-B / open-source flight data summary.

## Section 4: Humanitarian situation (~250 words)
  - Displacement estimates (cite UNHCR / OCHA where applicable).
  - Corridor status.

## Section 5: What to watch next week (100–150 words)
  - 2–3 specific indicators to monitor.

## Sources and methodology
  - Every factual claim linked to a primary source or annotated.
  - Confidence ratings where applicable.
  - "Events not yet verified are not included."

## Verification note
  "This brief is based on open-source information verified by Aegis Lens's
  methodology. It does not include classified or proprietary intelligence."
```

**SEO checklist:**
- [ ] Title includes the date/week for freshness signal.
- [ ] Meta description < 160 chars, includes "verified" and "Ukraine."
- [ ] `Article` schema with `datePublished` and `dateModified`.
- [ ] At least 3 internal links (to region page, methodology, prior brief).
- [ ] `noindex` on older than 12 weeks unless evergreen (set in CMS).

**Review workflow:** Author → Intelligence Lead review (methodology) → publish.

---

## Template 2 — Monthly Deep Dive (3,000–5,000 words)

**Cadence:** Monthly, last week of the month.
**Audience:** All tiers; pitch to press for citation.

```
[HEADLINE]: [Month] Analysis — [Theme]
Byline + affiliation + methodology note

## Abstract (200 words)
  Research question, methodology, key finding.

## 1. Background and context (~500 words)
## 2. Data and sources (~400 words) — table of primary sources used
## 3. Main analysis (~1,500 words) — 3–4 sub-sections
## 4. Confidence and limitations (~300 words)
   - What we could verify vs. what remains uncertain.
   - Sources not yet cross-corroborated.
## 5. Implications (~400 words) — per audience segment
## 6. Appendix: full source list with access dates
```

**SEO checklist:** same as weekly + add `mentions` schema for named entities.

---

## Template 3 — Quarterly State-of-the-Conflict (5,000–8,000 words)

**Cadence:** Quarterly. Embargoed 48h for press; public launch with a press release.
**Audience:** All tiers; designed to be cited by academic and government analysts.

```
## Part 1: Situation assessment (by theatre)
## Part 2: Trend analysis (3-month)
## Part 3: Methodology and confidence notes
## Part 4: Data appendix (downloadable Parquet/CSV)
## Part 5: Outlook and indicators
```

Flagship piece; co-authored with partner organizations where possible.
DOI registration for academic citation (via DataCite).

---

## Template 4 — Year-in-Review

See [year-in-review template](year-in-review.md).

---

## Template 5 — Reaction Post (24h post-event) (~800–1,200 words)

**When to use:** A major breaking event requires rapid verified context before
the information space is flooded.

```
## What we know (verified only)
## What is unconfirmed
## What we are monitoring
## Timeline (UTC timestamps, source per entry)
## [Update block — stamped with author + time]
```

**Rule:** Nothing goes in "What we know" without a source. Speculation is
labelled "UNCONFIRMED." The article is updated in-place with a visible
`Updated: [TIME UTC]` timestamp — not replaced.

**SEO:** Live article (set `dateModified` on every update). "Live updates" in
title tag drives recency signals.

---

## Template 6 — Methodology Post (~1,500–2,500 words)

**When to use:** Publishing a new capability, explaining how a specific
verification method works, or responding to a methodology question.

```
## What we are measuring / doing
## How we do it (step by step)
## What our confidence ratings mean
## Limitations and edge cases
## Example: applied to a real case
## Further reading
```

Internal link magnet — methodology posts should be linked from every brief that
uses the method.

---

## Per-template SEO checklist (universal)

- [ ] Title tag: primary keyword at the front, ≤ 60 chars.
- [ ] Meta description: 120–155 chars, includes primary keyword.
- [ ] `H1` matches title tag (or is slightly longer — both are fine).
- [ ] At least one `H2` includes the primary keyword.
- [ ] 3–5 internal links (related briefs, pillar pages, region pages).
- [ ] 1–2 external links to reputable primary sources (signals topical authority).
- [ ] Schema markup: `Article` (datePublished, dateModified, author, image).
- [ ] OG image: 1200×630px, text overlay with title.
- [ ] `canonical` self-referencing.
- [ ] i18n: `hreflang` set for UK versions where published.

---

## Per-template review workflow

| Template | Reviewer 1 | Reviewer 2 | Final gate |
| --- | --- | --- | --- |
| Weekly brief | Intelligence Lead | — (time-sensitive) | SEO auto-check |
| Monthly deep dive | Intelligence Lead | Editor-in-Chief | SEO + legal spot-check |
| Quarterly state-of-conflict | Intelligence Lead + External reviewer | Editor-in-Chief + Legal | Press embargo hold |
| Reaction post | Intelligence Lead | — (< 2h window) | Speed > perfection |
| Methodology post | Engineering Lead | Editor-in-Chief | — |
