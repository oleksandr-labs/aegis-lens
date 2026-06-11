# Compliance — `@ua-map/data-gov-ua` (data.gov.ua + civic-tech entity enrichment)

This integration ingests **public registry / open-data** facts about **legal
entities** (companies, institutions, civic formations) keyed by **ЄДРПОУ
(EDRPOU)** codes, plus public-procurement records and data-journalism dataset
descriptors. It enriches Knowledge-Graph entities and entity pages.

The governing rules are: (1) **per-dataset license check** before any
republication, gated in code by `isRedistributable(license)` (`types.ts`); and
(2) **personal-data minimization** — we ingest *legal-entity* facts and
*public-officer* roles as published in the state register, not arbitrary
natural-person PII.

## 1. Sources, licenses & attribution

### data.gov.ua — national open-data portal (https://data.gov.ua)
- Platform: **CKAN**, operated by the State Agency for E-Governance / Ministry of
  Digital Transformation. Read-only Action API, no key required for open datasets.
- **License:** the portal's default reuse regime follows **Cabinet of Ministers
  Resolution No. 835** (open-data reuse with attribution, free of charge),
  mapped here as **`ogl-ua`** and treated as **redistributable with attribution**.
  Individual datasets may declare a more specific `license_id` (CC BY / CC0),
  mapped via `mapLicense`. Datasets with `cc-by-nc` / `cc-by-nd` / unknown are
  **NOT re-hosted** (link to the dataset page only).
- **Datasets used:** EDR (ЄДР Unified State Register of legal entities / sole
  proprietors / civic formations), the State Address Register, and aggregated
  critical-infrastructure catalogs.
- **Attribution:** cite the dataset organization + the data.gov.ua dataset URL.
- **ToS / crawler discipline:** descriptive `User-Agent`, `rows` capped at 100,
  ≥1s inter-request delay, **metadata-only** fetch — the multi-GB EDR dumps are
  **not bulk-mirrored**; we keep resource URLs + the resolved facts for entities
  we actually surface.

### Prozorro / OpenProcurement (https://prozorro.gov.ua)
- **License:** Prozorro procurement data is **OPEN DATA**, reusable with
  attribution (the OpenProcurement API is public, no key). Mapped **`cc-by`**,
  **redistributable**.
- **Attribution:** "Source: Prozorro — <tender URL>" + the procuring entity.
- **Discipline:** descriptive `User-Agent`, capped page size, polite delay. The
  public feed is a firehose; production indexers page it — we never hammer it.

### Texty.org.ua (https://texty.org.ua)
- **Datasets:** Texty publishes investigation **datasets** that are generally
  **reusable with attribution** (mapped `cc-by` / `other-open`). We store dataset
  **descriptors + titles + permalinks** and the ЄДРПОУ codes an investigation
  names (for cross-linking).
- **Article text:** the journalistic **article body remains Texty's copyright** —
  we **do not re-host** article bodies; we **link out** to texty.org.ua.
- **Attribution:** "Source: Texty.org.ua — <permalink>".
- **Discipline:** descriptive `User-Agent`, ≥2s delay; the feed is used only as a
  liveness probe (the structured ЄДРПОУ links come from a curated catalog).

### OpenDataBot (https://opendatabot.ua) — **PROPRIETARY**
- **License:** OpenDataBot's API is a **commercial** product; its value-added
  analytics are **proprietary** (mapped `proprietary`). An API key
  (`OPENDATABOT_API_KEY`, from `process.env`) is **required** for live access.
- **Policy:** we **DO NOT re-host** OpenDataBot's dataset. We display enrichment
  fields to the authenticated operator and **link out** to the OpenDataBot
  company profile. `isRedistributable("proprietary") === false` enforces this.
- **Attribution / link-out:** `https://opendatabot.ua/c/<edrpou>`.

### YouControl (https://youcontrol.com.ua) — **PROPRIETARY**
- **License:** YouControl is a **commercial** due-diligence platform with a
  contract-gated API. Its risk/verification analytics are **proprietary**
  (mapped `proprietary`). Key `YOUCONTROL_API_KEY` (from `process.env`) required.
- **Policy:** we surface only the **verification signal** (status + risk flag)
  and **link out** to the YouControl profile. We **DO NOT re-host** YouControl's
  analytics. Republication gate keeps `proprietary` link-out only.
- **Attribution / link-out:** `https://youcontrol.com.ua/catalog/company_details/<edrpou>/`.

## 2. Personal-data minimization

Aligned with Ukraine's *Law on Protection of Personal Data* and the GDPR
principle of data minimization.

- **What we ingest:** **legal-entity** facts (company name, ЄДРПОУ, status,
  registered legal address, KVED activity, authorized capital, procurement
  footprint) and **public-officer roles** (director / head / signatory) **exactly
  as published in the open state register**. A registered director's name is a
  *public officer record*, not arbitrary PII.
- **What we do NOT ingest:** beneficiary natural-person identifiers beyond the
  public register, contact details, or any field denoting private personal data.
- **Addresses:** we retain the **registered legal address of the entity** (a
  business fact), not a natural person's home address.
- **Conservative by design:** when a provider returns fields outside the
  legal-entity scope, only the modeled `CompanyRecord` fields are mapped; extra
  fields are dropped (not stored).

## 3. Republication decision matrix

| Source / license                              | Re-host normalized data?         | Action |
|-----------------------------------------------|----------------------------------|--------|
| data.gov.ua `ogl-ua` / `cc-by` / `cc-zero`    | Yes, with attribution            | normalize + serve |
| data.gov.ua `cc-by-nc` / `cc-by-nd` / unknown | No                               | link to dataset page only |
| Prozorro / OpenProcurement (`cc-by`)          | Yes, with attribution            | normalize + serve |
| Texty dataset (`cc-by` / `other-open`)        | Yes, with attribution            | descriptor + permalink |
| Texty article body                            | No                               | link out to permalink |
| OpenDataBot (`proprietary`)                   | **No**                           | enrichment fields + link-out |
| YouControl (`proprietary`)                    | **No**                           | verification signal + link-out |

The gate is enforced in code: `isRedistributable(license)` returns `false` for
`cc-by-nc`, `cc-by-nd`, `proprietary`, and `unknown`.

## 4. Partnership / liaison notes
- **OpenDataBot** and **YouControl** are commercial vendors. Using their APIs in
  production requires a **paid subscription / contract**; the deliverable here is
  the codeable contract (typed client + adapter + demo fixture) plus this license
  encoding. No data is re-hosted without the corresponding agreement.
- **data.gov.ua, Prozorro, Texty** are open/civic sources; attribution back to
  each is required in every product surface that displays their data (entity page
  footer, directory footer, investigation citations).

## 5. Secrets
- `OPENDATABOT_API_KEY`, `YOUCONTROL_API_KEY`, and an optional data.gov.ua API
  key are all read from `process.env` and are **optional** — the package is fully
  usable with **demo fixtures** and no secrets. None are hardcoded.
