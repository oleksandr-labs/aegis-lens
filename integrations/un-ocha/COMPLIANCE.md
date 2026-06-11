# Compliance — `@ua-map/un-ocha` (UN OCHA + ReliefWeb + HDX + IOM DTM)

This integration ingests **humanitarian** data. The single most important rule is
the **fail-closed PII redaction invariant** (`src/pii-redaction.ts`): if we cannot
confidently strip personal data from a record, the record is **blocked and dropped**,
never emitted. This document records the licenses, attribution terms, ToS, and the
PII / data-responsibility policy that gate this package.

## 1. Sources, licenses & attribution

### HDX — Humanitarian Data Exchange (https://data.humdata.org)
- Platform: CKAN, operated by UN OCHA's Centre for Humanitarian Data.
- **Per-dataset licenses vary.** HDX does not impose one license; each dataset
  declares its own (`license_id`). Common values, mapped in `hdx-client.ts`:
  - `cc-by` → **CC BY 4.0** — republication allowed **with attribution**.
  - `cc-by-igo` → **CC BY 3.0 IGO** — republication allowed with attribution.
  - `cc-by-sa` → **CC BY-SA 4.0** — attribution + share-alike.
  - `cc-zero` / `other-pd` → public domain — free reuse.
  - `cc-by-nc` → **non-commercial only** — NOT redistributed by this package.
  - `cc-by-nd` → **no-derivatives** — our normalization is a derivative; NOT redistributed.
  - `hdx-other` / `other-closed` / `unknown` → treated as **non-redistributable**.
- **Gating:** `REDISTRIBUTABLE_LICENSES` in `hdx-client.ts` enumerates the only
  licenses we re-host. `hdx-subscribe.ts` routes everything else to `gated[]`
  (link to HDX page only — we never re-host the resource).
- **Attribution:** always cite the dataset organization + HDX dataset URL.
- **ToS / crawler discipline:** descriptive `User-Agent`, ≥1s inter-request delay,
  `rows` capped at 100, metadata-only fetch (resource URLs are not bulk-mirrored).
  `HDX_API_KEY` (optional, from `process.env`) only raises rate limits; never hardcoded.

### ReliefWeb (https://reliefweb.int) — OCHA service
- **API ToS:** requires a stable `appname` parameter (read from
  `process.env.RELIEFWEB_APPNAME`; it is an identifier, **not a secret**). No API
  key required for the public read API.
- **Content rights:** ReliefWeb aggregates third-party reports. ReliefWeb metadata
  is reusable with attribution; **full article bodies belong to the original
  publisher** and may carry their own terms. Policy here: we store/display
  titles + short redacted excerpts + **permalinks back to reliefweb.int** and the
  original source URL for attribution. We do **not** re-host full bodies.
- **Attribution:** "Source: <publisher(s)> via ReliefWeb — <permalink>".
- **Crawler discipline:** descriptive `User-Agent`, ≥1s delay, `limit` capped at 100.

### IOM DTM — Displacement Tracking Matrix (https://dtm.iom.int)
- **License:** DTM products are generally **CC BY 3.0 IGO / CC BY 4.0** (varies by
  product; some require contacting IOM). Default mapping in this package is
  `cc-by-igo`. Verify the specific product before commercial reuse.
- **Aggregate only:** the DTM API and our client expose **admin-level aggregate
  figures** (IDP stock/flow by admin1/admin2). No individual-level records are
  fetched, stored, or emitted. Centroids are **coarsened to admin resolution**
  (`coarsenCoord`, 2 dp ≈ 1.1 km) — never an individual's location.
- **Attribution:** "Source: IOM DTM — <product URL>".
- **Optional key:** `DTM_API_KEY` (`Ocp-Apim-Subscription-Key`) from `process.env`.

### Humanitarian clusters (IASC cluster system)
- Cluster taxonomy (`clusters.ts`) is descriptive metadata (cluster names, lead
  agencies). Per-cluster figures originate from cluster lead agencies (WHO, UNHCR,
  WFP/FAO, UNICEF, …) and inherit the license of their HDX/ReliefWeb publication.

## 2. PII & data-responsibility policy (HIGHEST PRIORITY — fail-closed)

Aligned with the **IASC Operational Guidance on Data Responsibility in Humanitarian
Action** and the humanitarian **"do no harm"** principle.

- **What we ingest:** AGGREGATE figures only (counts of people by area, cluster
  needs/coverage, convoy-route status). Aggregate counts are **not** PII.
- **What is forbidden (hard-block → record dropped):**
  - person names (any field labeled as a name, or name-labeled text),
  - exact coordinates of individuals (≥4 decimal places ≈ <11 m),
  - street addresses of individuals,
  - any field whose **name** denotes personal data carrying a value
    (`phone`, `email`, `passport`, `national_id`, `dob`, `beneficiary_id`, `gps`, …).
- **Soft-redactable (tokenized in place):** emails, phone numbers, long digit runs
  (possible IDs), case/beneficiary IDs, DOB-labeled values.
- **Fail-closed:** detection of any **hard-block** category, or a sensitive-named
  field with a value, **blocks the entire record** (`redactRecord → ok:false,
  value:null`). The adapter drops it; `report-ingest.ts` counts it in
  `recordsBlocked`; the evidence base returns an `EvidenceRejection`. There is **no
  best-effort partial pass-through** for hard-block PII.
- **Coordinate minimization:** all emitted geometry uses coarsened admin centroids.
- **Conservative by design:** the redactor favors recall (false positives) over the
  risk of leaking a single individual's data.

## 3. Republication decision matrix

| Source / license            | Re-host normalized data? | Action |
|-----------------------------|--------------------------|--------|
| HDX `cc-by` / `cc-by-igo` / `cc-by-sa` / `cc-zero` / public-domain | Yes, with attribution | normalize + serve |
| HDX `cc-by-nc` / `cc-by-nd` / closed / unknown | No | link to HDX page only (`gated[]`) |
| ReliefWeb metadata + excerpt + permalink | Yes, with attribution | title + short excerpt + link |
| ReliefWeb full article body | No | link to permalink + origin |
| IOM DTM aggregate (CC BY-IGO) | Yes, with attribution | coarse centroids only |
| Any record failing PII redaction | **No — dropped** | counted in `recordsBlocked` |

## 4. Partnership / liaison notes
- NGOs are the primary beneficiary persona (`ngo-dashboard.ts`). This integration
  is positioned to support **mutual-benefit data partnerships** with NGOs and
  cluster leads. Any partnership that would introduce non-aggregate or beneficiary
  data MUST first pass a data-protection-impact review; the fail-closed redactor
  remains in force regardless of partnership.
- Attribution back to OCHA / HDX / ReliefWeb / IOM is required in all product
  surfaces that display this data (map legend, dashboard footer, evidence citations).

## 5. Secrets
- `HDX_API_KEY`, `RELIEFWEB_APPNAME`, `DTM_API_KEY` are all read from
  `process.env` and are optional. None are hardcoded. The package is fully usable
  with **demo fixtures** and no secrets.
