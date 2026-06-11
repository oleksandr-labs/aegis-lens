# Audiences & Personas

> Single source of truth for who we build for. **Every feature, page, and SEO
> cluster maps to ≥1 persona here. If a feature doesn't serve a persona, it's a
> candidate for cut.**

## Persona matrix

| ID | Persona | Primary need | Tier | SEO surface |
| --- | --- | --- | --- | --- |
| [P1](#p1-civilians) | Civilians (informed public) | "Is it safe near me / family?" | Free | Regional safety pages, alerts |
| [P2](#p2-journalists--newsrooms) | Journalists / Newsrooms | Verified, citable, fast | Pro / Press | Press kit, embeds, briefs |
| [P3](#p3-osint-analysts) | OSINT analysts | Deep tools, raw access, exports | Pro / Team | Docs, methodology, glossary |
| [P4](#p4-ngos--humanitarian-orgs) | NGOs & Humanitarian orgs | Humanitarian targeting, civilian protection | Discounted | Humanitarian portal, case studies |
| [P5](#p5-governments--defense) | Governments & Defense researchers | Sovereignty, audit, custom layers | Enterprise | Gov landing, compliance pages |
| [P6](#p6-security--private-intel-firms) | Security / private intel firms | API, white-label, SLA | Enterprise | API docs, white-label page |
| [P7](#p7-military-researchers--academics) | Military researchers / academics | Historical archive, datasets | Pro / Academic | Dataset releases, papers |
| [P8](#p8-traders--financial-analysts) | Traders / financial analysts | Geopolitical alpha, alerts | Pro / Enterprise | Finance use-case pages |
| [P9](#p4-ngos--humanitarian-orgs) | Humanitarian orgs (UN, ICRC) | Crisis monitoring, coordination | Discounted | Humanitarian portal |

---

## P1 — Civilians

**Primary question:** "Is it safe near me / my family?"

**Jobs To Be Done:**
- Know if their city or a relative's location is currently under threat.
- Receive alerts without needing to understand military jargon.
- Find the nearest shelter quickly.
- Share credible, plain-language updates with family.

**Features that matter:** Safety-near-me view, push notifications (air raid + civilian alerts), family watchlist, shelter finder, plain-language summaries, daily digest email, PWA/mobile-first.

**Features that don't matter:** raw event JSON, STIX exports, API rate limits, bulk datasets.

**Pricing:** Free. No barrier — public safety is a mission goal.

**Onboarding path:** → mobile PWA install → location permission → set home region → first alert.

**Landing page SEO:** `/safety/<region>`, `/alerts`, "air raid alerts Ukraine," "what to do in air raid."

**i18n priority:** UK first, EN second, RU for occupied/border areas.

**Misinformation risk:** Highest of all personas. Conservative thresholds; always show confidence caveats; no raw danger scores.

---

## P2 — Journalists & Newsrooms

**Primary question:** "Is this verified? Can I cite it? How fast can I publish?"

**Jobs To Be Done:**
- Verify an event before deadline.
- Generate a citable source reference automatically.
- Embed a live map widget in their article.
- Get real-time press alerts by region and topic.
- Collaborate on a story file with colleagues.

**Features that matter:** Verified press tier (free Pro access), citation generator, embed widgets, press-ready snapshots, Slack/Teams app, real-time alerts, story files, brief export (PDF + JSON).

**Features that don't matter:** sovereign deployment, CLI scripts, quant-model exports.

**Pricing:** Press credential check → free Pro. Revenue comes from newsroom seat licensing.

**Onboarding path:** → press credential verification → embed widget setup → first alert subscription.

**Landing page SEO:** `/press`, "how to cite OSINT," "verified Ukraine news," per-newsroom case studies.

**i18n priority:** EN, UK, DE, FR, PL for European newsrooms.

**Strategic value:** Press citations = SEO backlinks + brand authority. Every journalist embed is a link.

---

## P3 — OSINT Analysts

**Primary question:** "Can I access the raw data, script against it, and trust the methodology?"

**Jobs To Be Done:**
- Run complex multi-field queries with AND/OR/NOT logic.
- Geolocate a photo using coordinate multi-format input and cross-source corroboration.
- Export data in STIX 2.1, KML, GeoJSON for their own tools.
- Access the platform programmatically via CLI or Python/TS SDK.
- Contribute geolocations and earn community recognition.

**Features that matter:** Advanced filters (saved queries), raw event JSON + JSON-Path, reverse image/video search, coordinate parsers (MGRS/UTM/DMS), geolocation workspace, STIX/GeoJSON/CSV exports, CLI + SDKs, Jupyter notebooks, webhooks, verified-contributor badges.

**Features that don't matter:** family watchlist, shelter finder, plain-language labels.

**Pricing:** Pro (individual), Team (small group). Academia: consider a special rate.

**Onboarding path:** → API key + SDK install → first query → Jupyter notebook template.

**Landing page SEO:** Methodology pages (✓ done), tutorial library, dataset release pages, glossary.

**Strategic value:** This persona finds bugs, drives word-of-mouth, and publishes the case studies that attract every other persona. **Serve them first.**

---

## P4 — NGOs & Humanitarian Orgs

**Primary question:** "Where should we send aid? Where is the corridor open? Where are civilians at risk?"

**Jobs To Be Done:**
- Identify areas of civilian concentration and displacement.
- Plan aid routes avoiding active conflict zones.
- Submit encrypted incident reports from the field.
- Share a live operational picture with a multi-seat team.

**Features that matter:** Humanitarian layer set (displaced populations, critical infrastructure damage, civilian-impact events, medical facilities, evacuation corridors, border crossings), population-at-risk estimator, aid-route planner, field-team check-in (mobile + offline), encrypted incident reporting, multi-seat dashboard.

**Pricing:** Free / heavily discounted (humanitarian mission). Grant-funded institutional purchases are the revenue path (UN, ICRC type customers pay).

**Compliance requirements:** PII-zero mode (default), data-handling agreement, audit log access.

**Onboarding path:** → org verification → PII-zero mode confirmed → humanitarian layer set activated.

**Landing page SEO:** `/humanitarian`, per-crisis humanitarian briefs, partnership case studies.

**i18n priority:** EN, UK, RU, PL, RO (refugee-corridor languages).

---

## P5 — Governments & Defense

**Primary question:** "Can we deploy this on our infrastructure, with our security requirements, audited?"

**Jobs To Be Done:**
- Deploy on sovereign or on-prem infrastructure.
- Apply custom classifications and layers per classification level.
- Get an audit log that withstands legal scrutiny.
- Provide reproducible, citable dataset outputs for academic and policy partners.

**Features that matter:** Sovereign deployment (on-prem / GovCloud / UA-resident), air-gapped install, custom data layers and taxonomy, 99.95% SLA, tamper-evident audit log, RBAC with geo-fencing, procurement pack (DUNS/SBOM/vuln disclosure), historical archive (5+ years), bulk Parquet exports, citation DOIs.

**Pricing:** Enterprise (custom contract, long sales cycle).

**Onboarding path:** → procurement process → SOC 2 / security questionnaire → PoC environment → custom layer configuration.

**Landing page SEO:** `/government`, `/defense` (gated demo), research collaborations directory.

**i18n priority:** EN (universal), UK (Ukrainian gov), FR/DE/PL (EU partners).

**Sales note:** Gov sales cycles are long. Trust-building (SOC 2, transparency reports) starts Phase 1 even without an active deal.

---

## P6 — Security & Private Intel Firms

**Primary question:** "What's the API rate limit and SLA? Can we white-label?"

**Jobs To Be Done:**
- Build a product on top of our data (resell, embed, or augment).
- Get high-rate-limit API with webhook replay.
- Offer clients a co-branded or white-labeled experience.
- Monitor specific assets / travel risks for their clients.

**Features that matter:** Enterprise API + high rate limits, bulk historical export, webhook delivery with replay, white-label (custom domain/branding/theme), co-branded reports, custom AOI monitoring, travel-risk module, asset-protection module, reseller agreement.

**Pricing:** Enterprise API pricing per call or per AOI. White-label wholesale. Reseller margin.

**Onboarding path:** → API key + sandbox → white-label config → reseller agreement signing.

**Landing page SEO:** `/api` (✓ done), `/partners/security-firms`, "vs in-house build" calculator.

**Strategic value:** Pays most per seat/call. High-margin. Optimize API DX relentlessly.

---

## P7 — Military Researchers & Academics

**Primary question:** "Can I access historical data, export it in bulk, and cite it in a paper?"

**Jobs To Be Done:**
- Run reproducible queries over the historical archive.
- Export bulk datasets in Parquet for statistical analysis.
- Cite datasets with a DOI in academic publications.
- Access pre-publication data under embargo for partner institutions.

**Features that matter:** Historical archive (5+ years), bulk Parquet exports, reproducible versioned queries, citation DOIs (DataCite), embargo / pre-publication access, Jupyter notebook integration.

**Pricing:** Pro (individual academics), Academic tier (institutional, possibly grant-funded).

**Onboarding path:** → institutional email verification → archive access confirmation → Jupyter notebook template.

**Landing page SEO:** Dataset release pages, published papers and citations, research collaborations directory.

---

## P8 — Traders & Financial Analysts

**Primary question:** "Give me structured geopolitical signal I can feed into my model before market open."

**Jobs To Be Done:**
- Get a structured pre-market brief before NYSE/LSE open.
- Map conflict events to commodity and asset impacts automatically.
- Receive low-latency alerts (< 5s after verification) to trade on.
- Backtest a geopolitical signal against price history.

**Features that matter:** Commodity-impact tagging (energy/grain/metals), asset-mapping layer (refineries/ports/pipelines), pre-market AI brief (06:00 ET/CET), event→ticker mapping, low-latency alert webhooks (< 5s), backtestable historical dataset, Bloomberg/Refinitiv-style snippet exports, anomaly score time-series.

**Pricing:** Pro (individual), Enterprise (institutional trading desk).

**Compliance note:** Pure OSINT pedigree — no insider info, no non-public data. This must be explicit in the product and the data agreements.

**Onboarding path:** → API key → webhook endpoint setup → first alert test → backtesting dataset access.

**Landing page SEO:** `/finance`, "geopolitical alpha" content series, quant-friendly dataset docs.

---

## Cross-persona rules

1. **Every feature ticket must name its primary persona(s)** in the Linear description.
2. **Quarterly persona interviews:** 5 per persona per quarter (see [user-research.md](../qa/user-research.md)).
3. **Win/loss tracking:** every deal won or lost is tagged with its persona so we know which personas convert and which churn.
4. **Persona-based homepage personalization** (Phase 2): UTM + behavioral signals route visitors to persona-specific hero content.
5. **Persona-tagged content** in blog and docs so search engines and readers find the right content for their context.
