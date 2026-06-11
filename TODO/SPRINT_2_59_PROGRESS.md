# Sprint 2.59 Progress

**Date:** 2026-06-06
**Status:** Complete
**Theme:** OSINT Source Ingest Fleet — completion (closes the `TODO/integrations/` source backlog)
**Tasks closed:** 100 (across 13 `TODO/integrations/` files)

Eighth-to-tenth wave of the data layer: 8 new `@ua-map/*` source packages + completion of 5 partial
packages (ADS-B, AIS, Sentinel Hub, YouTube/Reddit, X/Twitter). Same proven pattern — typed
client+adapter → canonical `packages/event-schema` v1, demo fixtures + fail-soft, `COMPLIANCE.md` for
license/ToS/partnership tasks, codeable-contract for ML/commercial-data tasks. Dispatched as 10 parallel
agents, merged centrally. **~95 new TS modules + 8 new API routes + 14 COMPLIANCE.md (8 new + 6 added to
extended packages) + 2 new map layers.** After this sprint the only remaining `TODO/integrations/` items
are the commercial/platform connectors (Anthropic/OpenAI, Stripe, Mapbox) and a few residual partial tasks.

## New source packages

### `integrations/copernicus-ems` — Copernicus EMS — 9/9 — `@ua-map/copernicus-ems`
RapidMapping activations client; Risk&Recovery portfolio; vector/raster outputs; activation watcher;
EMS→our-layers mapper (flood→emergencies, fire→active_fires, conflict→infrastructure_damage); Sentinel
cross-ref; per-region activation banner; canonical event mapping; citations. Public-domain EU data.
**New layer `crisis_mapping`** (authoritative delineated flood/burn extents + per-building damage grades).

### `integrations/data-gov-ua` — data.gov.ua + civic-tech — 11/11 — `@ua-map/data-gov-ua`
CKAN catalog + OpenDataBot + YouControl + Texty + Prozorro clients; per-source sync schedule; ЄДРПОУ
entity resolution; KG enrichment; entity-page + directory enrichment; investigation cross-links.
Proprietary sources (OpenDataBot/YouControl) link-out only. Entity/KG cluster — no map layer.

### `integrations/hajun-bypol` — Hajun / BYPOL (Belarus) — 9/9 — `@ua-map/hajun-bypol`
Telegram+site client; vetted pseudonymous-contributor registry (source-protection enforced:
`assertNoPii`, coarse trust bands only); daily ingest; BY rail/airbase gazetteer geocoder; Sentinel-1
SAR cross-ref (dark-vessel style); equipment vision-classifier interface+heuristic; movement timeline;
RU equipment-pool cross-ref. **New layer `belarus_flank`** (low-precision POI markers, SAR-verified ring).

### `integrations/milbloggers` — Curated Milblogger Allow-List — 12/12 — `@ua-map/milbloggers`
UA/INT/RU-side curated registry (RU = opposite-narrative only, mandatory label); reputation; specialty
tags; editorial vetting gate; content classification; **no-false-equivalence invariant** (`assertSideLabel`,
RU never corroborates UA/INT, RU confidence capped ≤0.35); same-camp cross-ref boost; misinfo downgrade
(via services/misinfo); UA-vs-RU narrative comparison; editorial review queue. No map layer.

### `integrations/ova-telegram` — OVA Telegram (24 oblasts) — 10/10 — `@ua-map/ova-telegram`
All-27-code channel registry + 5 city councils (extends the alerts-in-ua OVA seed); authenticity
verification; backup-channel failover; Telegram Bot-API ingest; cadence+reputation; auto-translate
(UA original preserved); NER→admin/KG; per-oblast widget; provenance quoting; alerts.in.ua cross-validation.
Official-of-record trust tier. Feeds existing surfaces.

### `integrations/ua-genstaff` — UA General Staff + MoD — 11/11 — `@ua-map/ua-genstaff`
Genstaff/MoD/Air Force/Navy clients + per-branch spokesperson registry; standardized daily-report parser
(typed loss tallies — carried as structured data, never editorialized); press NER+KG; Air-Force threat ↔
`air_raid_alerts` correlation; daily-summary widget; official-vs-OSINT divergence (neutral); provenance.
uk/en/de. Fixed 2 real parser bugs found during build. Feeds existing layers.

### `integrations/ualosses` — UALosses / Killed in Ukraine — 12/12 — `@ua-map/ualosses`
**Most ethically sensitive feed — aggregate-only, fail-closed.** Three sources (aggregate counts only);
`ethics-gate.ts` blocks any per-person field/image/exact-coord (whole record dropped, mirrors un-ocha PII
redactor); strict allow-list `PublicAggregate` projection; per-region/period rollups; always-on attribution;
aggregate widget; respectful memorial cross-links; family take-down handler. Invariant enforced at 3 layers
(gate + projection + independent route mirror). **Deliberately no map layer** (dignity over engagement).

### `integrations/ukrhydromet` — Ukrhydromet (UA weather) — 8/8 — `@ua-map/ukrhydromet`
meteo.gov.ua forecast client; per-oblast severe-warning taxonomy; hydrology/flood-risk; daily sync;
severe-weather civilian push (calm, silent-by-default); divergence vs Open-Meteo; geo-gated source
preference (inside UA → Ukrhydromet); severe-weather civilian advisories. Feeds existing `weather` layer.

## Completed partial packages (extended, not rewritten)
- **ADS-B** (3): provider/tier config + `assertProductionTier` guard; per-feed health monitor; COMPLIANCE.
- **AIS** (3): Phase-2-gated Spire client; **MarineTraffic cross-ref + Sentinel-1 dark-vessel correlation
  marked done by citing the existing Sprint 2.57 `cross-reference.ts` / `dark-vessel.ts`** (not rebuilt).
- **Sentinel Hub** (4): CDSE/commercial account+tier config; AOI cache (key+TTL); PU cost monitor+budget; COMPLIANCE.
- **YouTube/Reddit** (5): transcript+STT fallback; frame sampling for CV; shared reputation engine
  (in youtube, reddit wrapper); rate-limit policies; reusable Wayback Save-Page-Now client.
- **X/Twitter** (3): filtered-stream/poll tracked-accounts; Wayback archive (reuses youtube client) +
  academic-dump gate; media extraction.

## Registry & shared-file merges
- `layers/src/registry.ts`: **+2 LayerConfig** (`belarus_flank` military, `crisis_mapping` environment)
  → **26 layers total**. Braces balanced (261/261).
- `apps/web/src/lib/map-style.ts`: **+2 `LAYER_PAINT_SPECS`** (`belarus_flank`, `crisis_mapping`).
  Braces balanced (36/36, 283/283).

## Notes / honest caveats
- No local TypeScript toolchain (builds run on CI); agents matched patterns and verified imports by
  inspection (one ran a Node smoke-test of the ualosses fail-closed gate). Recommend `pnpm typecheck` on CI.
- Mojibake scan across all new/edited files: **0 markers.** uk/ru/be/de Cyrillic & diacritics intact.
- Commercial/paid sources (OpenDataBot, YouControl, Spire, ADS-B Exchange, Sentinel Hub commercial) ship
  as the documented codeable contract — typed gated client + `COMPLIANCE.md` — never re-hosted; activation
  needs signed agreements + env secrets.
- Ethics/source-protection enforced in code (fail-closed): ualosses aggregate-only, hajun contributor
  anonymity, milbloggers no-false-equivalence.
- Agents flagged that a few new layers reuse existing `LayerDataSource` enum values (no dedicated
  `oryx`/`deepstatemap`/`cert_ua`/`dsns`/`hajun` source members) — optional future enum cleanup.
- Continues [SPRINT_2_57_PROGRESS.md](SPRINT_2_57_PROGRESS.md) (layers) + [SPRINT_2_58_PROGRESS.md](SPRINT_2_58_PROGRESS.md) (first 9 sources).
