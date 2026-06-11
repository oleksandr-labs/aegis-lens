# COMPLIANCE — `@ua-map/acled-gdelt` (ACLED · GDELT · UCDP)

This package ingests three **academic event datasets**. Their licences differ sharply.
The single most important rule: **ACLED raw rows must never be republished**; GDELT and
UCDP are openly licensed and may be republished **with attribution**. The code enforces
this gate (`citations.assertCanRepublishRaw`, `acledToCanonical` defaults `isPublic: false`,
`datasets.ts` `rawRepublishable` flag).

| Dataset | Licence tier | Raw rows republishable? | Attribution required | Commercial use |
|---------|--------------|--------------------------|----------------------|----------------|
| **ACLED** | `attribution` (restrictive ToS; academic/paid tiers) | **NO** — derived/aggregated only | **YES** | **Paid licence required** |
| **GDELT** | `open` (CC-BY-style) | **YES** | **YES** | Allowed with attribution |
| **UCDP** | `open` (research/CC-BY-style) | **YES** | **YES** (cite dataset + codebook) | Allowed with citation |

---

## 1. ACLED — Armed Conflict Location & Event Data

- **Publisher:** ACLED (acleddata.com).
- **Access:** registered account → REST API (`api.acleddata.com/acled/read`, auth via
  `key` + `email`) or curated bulk export. Credentials read from
  `process.env.ACLED_API_KEY` / `process.env.ACLED_API_EMAIL`. Never hardcoded.
- **Licence reality — RESTRICTIVE.** ACLED's Terms of Use and Attribution Policy:
  - **Raw event redistribution is prohibited.** You may not republish ACLED rows, dumps,
    or row-level exports. We therefore keep ACLED records **ingest-only** and expose only
    **derived/aggregated** trend metrics (counts, fatalities by period) — never raw rows.
  - **Attribution is mandatory** on any product surface that uses ACLED-derived figures:
    *"Source: ACLED (acleddata.com)."*
  - **Commercial use requires a paid licence.** Free access is for non-commercial /
    academic use under registration; commercial republication or resale requires an ACLED
    commercial agreement. Aegis Lens must hold the appropriate tier before any commercial
    surfacing of ACLED-derived content.
  - **Crawler discipline:** ≤ ~1 request/second (`ACLED_MIN_REQUEST_INTERVAL_MS = 1100`),
    descriptive User-Agent, page-size cap 5000. Do not scrape the website; use the API.
- **Gating in code:** `acledToCanonical()` defaults `isPublic = false` and
  `keepRawPayload = false`; `citations.assertCanRepublishRaw("acled")` **throws**. Trend
  pages may show ACLED-derived aggregates **with attribution**, never the underlying rows.
- **Partnership / liaison note:** before any commercial launch, confirm tier with ACLED
  Access (access@acleddata.com) and record the agreement reference here.

## 2. GDELT — Global Database of Events, Language, and Tone

- **Publisher:** The GDELT Project (gdeltproject.org).
- **Access:** Google **BigQuery public dataset** `gdelt-bq.gdeltv2.events`. The data is
  free; you pay Google only for **bytes scanned** — so all queries are bounded by `SQLDATE`
  (`buildGdeltQuery`) to control cost. A real `BigQueryRunner` reads
  `GOOGLE_APPLICATION_CREDENTIALS` / project id from `process.env`.
- **Licence — OPEN (CC-BY-style).** GDELT data is freely usable **with attribution**.
  - Raw machine-coded events **may be republished** with attribution.
  - `SOURCEURL` evidence links may be surfaced publicly (attribution preserved on the
    canonical event citation).
  - Caveat (accuracy, not licensing): GDELT is **machine-coded** from news — noisier and
    coarser-geocoded than ACLED/UCDP. We mark it lower-confidence and 25 km uncertainty,
    and present it as a **signal/volume** indicator, not ground truth.
- **Attribution string:** *"Source: The GDELT Project (gdeltproject.org), CC-BY."*

## 3. UCDP — Uppsala Conflict Data Program

- **Publisher:** UCDP, Uppsala University (ucdp.uu.se).
- **Access:** annual GED releases (CSV/Excel/RData) + JSON API (`ucdp.uu.se/apidocs/`).
- **Licence — OPEN for research, with citation.** UCDP data may be **republished with
  proper citation** of the specific dataset (GED) and its codebook/version.
  - Raw rows **may be republished** with attribution.
  - UCDP is the **conservative, vetted, citation-grade** series (annual, back to 1989) and
    is used here as the **historical baseline** for trend context.
- **Attribution / citation:** cite the UCDP Georeferenced Event Dataset + codebook and the
  dataset version used (e.g. *"UCDP GED v24.1"* via `buildCitation(id, { version })`).

---

## Cross-cutting rules

1. **No secrets in code.** All credentials via `process.env`; clients run in **demo mode**
   (bundled synthetic fixtures) when credentials/runners are absent.
2. **Demo fixtures are synthetic** — they are *not* real ACLED/GDELT/UCDP rows and carry no
   redistribution restriction. They exist only for local dev/tests.
3. **Per-page citation is mandatory** (academic credibility). Every trends/datasets page must
   render the `DatasetCitation` for each dataset it draws on (`citations.buildCitations`).
4. **Republication gate is enforced in code**, not just policy: `assertCanRepublishRaw`
   throws for ACLED, and ACLED canonical events default to `isPublic: false`.
5. **No new map layer.** These datasets power trend/datasets pages only — see
   `c:\tmp\sprint258_shared_ACLED.txt` (`<none>` for registry + paint).
