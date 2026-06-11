# Sprint 2.58 Progress

**Date:** 2026-06-06
**Status:** Complete
**Theme:** OSINT Data-Source Integrations — the ingest layer that feeds the map layers shipped in 2.57
**Tasks closed:** 100 (across 9 `TODO/integrations/` files, all fully closed)

Built 9 new integration packages (`@ua-map/<source>`), each a real typed client + adapter that
normalizes an external OSINT source into the canonical `packages/event-schema` v1 Event/Entity model,
dispatched as 9 parallel package-scoped agents and merged centrally. Live network/credential-bound
paths ship as typed clients with `process.env` config + demo fixtures + fail-soft fallback (no secrets,
sandbox has no network) — the repo's sanctioned codeable/documented-contract pattern. License / ToS /
partnership tasks are delivered as per-package `COMPLIANCE.md`. **120 new TS modules + 9 new API routes
under `apps/web/src/app/api/integrations/` + 9 COMPLIANCE.md + 5 new map layers.**

## Completed by source

### `integrations/isw` — ISW — 10/10 — `@ua-map/isw`
Daily ROCA RSS/blog client; control-of-terrain map ingest + differential polygons; daily text ingest;
heuristic NLP entity-extraction → KG refs; DeepStateMAP divergence detection; "ISW today" per-region
widget + API route; citation chains; per-region mentions. Fair-use snippet gating in `COMPLIANCE.md`
(no map re-hosting). EN canonical, UK AI-translated (native-review debt flagged).

### `integrations/oryx` — Oryx equipment losses — 10/10 — `@ua-map/oryx`
Sheets/blog parser + `OryxEntry` model (model/side/status/date/coarse-location/evidence); daily sync +
diff; KG equipment-Entity mapping; canonical event mapping (`equipment_loss`); per-model "verified
losses" widget; per-side loss trends; generous attribution. **New layer `equipment_losses`** (military,
count choropleth + status-colored points).

### `integrations/deepstatemap` — DeepStateMAP frontline — 12/12 — `@ua-map/deepstatemap`
GeoJSON daily-snapshot client (republication gated OFF by default → demo polygons); GitHub mirror;
Telegram commentary; snapshot diff + net-km²; PostGIS-ready control polygons (controlled/contested/
liberated); changelog; per-region playback; disputed-area display policy; prominent attribution;
license + partnership brief. **New layer `frontline_control`** (3 control states, confidence-aware opacity).

### `integrations/ukrenergo` — Ukrenergo + Oblenergo — 13/13 — `@ua-map/ukrenergo`
National TSO client; 25-entry oblenergo registry; DTEK/Yasno consumer schedules; per-provider adapter
interface + schedule (rotation-group/черги) parser; emergency-vs-scheduled classifier; restoration ETAs;
emits `OutageSignal` into the existing `power_outages` fusion; VIIRS + Cloudflare Radar correlation;
schedule widget + "power in my area" + historical stats. uk/ru/en. Feeds existing `power_outages` layer.

### `integrations/alerts-in-ua` — Air alerts (alerts.in.ua) — 13/13 — `@ua-map/alerts-in-ua`
Complements (does not rewrite) `civilian-alerts`, reusing its oblast model. Tiered API client; Telegram
+ per-oblast OVA fallbacks; fail-safe multi-source quorum (silence never clears); <5s latency SLO;
active/partial/cleared FSM; full archive; oblast→raion→hromada hierarchy; alert-type taxonomy
(air/artillery/urban/chemical) uk/en/ru; freshness SLO; **hard "no civilian delay" invariant**. Feeds
existing `air_raid_alerts` layer.

### `integrations/acled-gdelt` — ACLED + GDELT + UCDP — 12/12 — `@ua-map/acled-gdelt`
ACLED REST/bulk client + coverage check; GDELT BigQuery builder + incremental ingest + CAMEO extraction;
UCDP annual import + trend baseline; multi-year trend pages + dataset catalog + per-dataset citations.
**License enforced in code:** ACLED raw rows non-republishable (`isPublic:false`, `assertCanRepublishRaw`
throws, route emits aggregates only); GDELT/UCDP open-with-attribution. Powers trend/datasets pages (no
map layer).

### `integrations/cert-ua` — CERT-UA + SSSCIP — 11/11 — `@ua-map/cert-ua`
CERT-UA RSS + SSSCIP clients; MISP model with TLP gating (default-deny RED/AMBER); daily advisory ingest;
IOC extractor (IP/domain/hash/CVE, re-fang); CVE cross-ref; uk/en sector tagging; cyber-incident
intensity model; advisories widget; per-sector threat pages. Retrospective latency (days) encoded in
cadence/cache/disclaimers. **New layer `cyber_incidents`** (sector-colored intensity).

### `integrations/ua-dsns` — ДСНС / DSNS — 9/9 — `@ua-map/ua-dsns`
Site + Telegram client (polite rate limit); per-oblast branch registry; daily operational summary;
heuristic emergency-type classifier (fire/explosion/collapse/rescue/demining, uk+en); gazetteer geocoder
interface; FIRMS/Sentinel fire cross-reference; per-oblast feed widget; evacuation-order extraction +
plain en/uk civilian guidance. **New layer `emergencies`** (event-type markers, evacuation ring).

### `integrations/un-ocha` — UN OCHA + ReliefWeb — 10/10 — `@ua-map/un-ocha`
HDX (CKAN) + ReliefWeb + IOM DTM clients; IASC cluster taxonomy (health/shelter/food/WASH);
**fail-closed PII redactor** (drops whole record on hard-block PII — the top invariant, enforced across
adapter/ingest/evidence/dashboard); HDX subscription + license gating; daily/weekly ingest; NGO-persona
dashboard; cite-able evidence base. **New layer `humanitarian`** (displacement choropleth +
`humanitarian_corridors` access lines).

## Registry & shared-file merges
- `layers/src/registry.ts`: **+5 LayerConfig** (`equipment_losses`, `frontline_control`,
  `cyber_incidents`, `emergencies`, `humanitarian`) → **24 layers total**. All use existing
  `LayerDataSource`/`LayerCategory` enum values (agents flagged optional dedicated source enums —
  `oryx`/`deepstatemap`/`cert_ua`/`dsns` — left for a future cleanup). Braces balanced (231/231, 66/66).
- `apps/web/src/lib/map-style.ts`: **+6 `LAYER_PAINT_SPECS`** (the 5 layers + `humanitarian_corridors`).
  Braces balanced (34/34, 266/266).

## Notes / honest caveats
- No local TypeScript toolchain (builds run on CI per project convention); the ISW agent additionally
  ran a Node runtime smoke-test of its adapter/extraction/diff path. Recommend `pnpm typecheck` on CI
  before deploy.
- Mojibake scan across all new/edited files: **0 markers.** uk/ru Cyrillic intact.
- Every demo fixture is **synthetic**, not real provider data. Republication is gated where licenses
  require it (ACLED raw, DeepStateMAP live polygons both default-OFF).
- `apps/web` has no `@ua-map` path alias, so each API route is self-contained (mirrors its package's
  types/fixtures inline) — same pattern as existing `/api/integrations/*` and `/api/layers/*` routes.
- These integrations close the ingest side of the layers shipped in
  [SPRINT_2_57_PROGRESS.md](SPRINT_2_57_PROGRESS.md): ukrenergo→power_outages, alerts.in.ua→air_raid_alerts,
  dsns→fires/emergencies, oryx→equipment_losses, deepstatemap→frontline_control, cert-ua→cyber_incidents.
