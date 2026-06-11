# TODO — Integration: UA General Staff + MoD

## Goal
Official Ukrainian military communications: daily summaries, MoD press releases, Air Force Command alerts.

## Progress
- 11 / 11 done

## Tasks

### Sources
- [x] General Staff Facebook / Telegram daily summary — integrations/ua-genstaff/src/genstaff-client.ts (Facebook Graph + Telegram Bot API + DEMO daily-report fixture)
- [x] MoD (mod.gov.ua) press releases + Telegram — integrations/ua-genstaff/src/mod-client.ts
- [x] Air Force Command (Повітряні Сили) Telegram — integrations/ua-genstaff/src/airforce-client.ts
- [x] Navy Command Telegram — integrations/ua-genstaff/src/navy-client.ts
- [x] Spokespersons' official accounts (per branch) — integrations/ua-genstaff/src/spokespersons.ts (per-branch registry, tracked by role)

### Pipeline
- [x] Daily summary parser (structured fields: enemy losses, frontline activity, regions) — integrations/ua-genstaff/src/summary-parser.ts (verbatim loss tallies + 24h deltas, directions, oblast resolution; `partial` when figures unparseable)
- [x] Press-release ingest with NER + KG enrichment — integrations/ua-genstaff/src/press-ingest.ts (entities: unit/weapon_system/oblast/country/org → KG node ids)
- [x] Air Force missile/drone alert correlation with civilian_alerts layer — integrations/ua-genstaff/src/airalert-correlation.ts (agreement / official_lead / alert_only vs active air_raid_alerts snapshot)

### Use in product
- [x] Daily "Genstaff summary" widget — integrations/ua-genstaff/src/widget.ts + apps/web/src/app/api/integrations/ua-genstaff/route.ts
- [x] Official-vs-OSINT divergence detection — integrations/ua-genstaff/src/divergence.ts (neutral framing + standing disclaimer; one-sided tolerance for OSINT visual-confirmation under-count)
- [x] Citation in event provenance — integrations/ua-genstaff/src/provenance.ts (canonical SourceCitation `official_statement` + attribution line uk/en/de)

## i18n
- UK primary; EN + DE translations for press.

### Примітки
Official sources = highest trust tier. Be neutral in framing: present, don't editorialize.
Adapter maps all records to canonical Event v1 (packages/event-schema); loss tallies carried as structured rawPayload, not editorialized. No new map layer (see c:\tmp\sprint259_shared_GENSTAFF.txt = <none>; threat alerts inform existing air_raid_alerts layer). COMPLIANCE.md covers official sources + neutral framing.
