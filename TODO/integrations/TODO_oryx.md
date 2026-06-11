# TODO — Integration: Oryx (Visually-Confirmed Equipment Losses)

## Goal
Authoritative visually-verified equipment-loss dataset. Powers losses analytics + equipment pages.

## Progress
- 10 / 10 done

## Tasks

### Source
- [x] Oryx Google Sheets / blog parser — integrations/oryx/src/client.ts (sheet CSV + demo fallback) + src/parser.ts (raw rows → OryxEntry)
- [x] Per-entry: equipment model, side, status (destroyed / damaged / abandoned / captured), date, location (often coarse), evidence URL — integrations/oryx/src/types.ts (`OryxEntry`)
- [x] Daily sync — integrations/oryx/src/sync.ts (runDailySync + diffSnapshots, 24h cadence `0 6 * * *`)

### Schema mapping
- [x] Map Oryx entries to our `Entity` (equipment model) in KG — integrations/oryx/src/kg-mapping.ts (`mapEntriesToEntities` → OryxEquipmentEntity)
- [x] Map to our event taxonomy — integrations/oryx/src/event-mapping.ts (→ canonical AegisEventV1, eventType "equipment_loss")
- [x] Preserve Oryx evidence URL as source — kg-mapping.ts (OryxEntitySource.evidenceUrl) + event-mapping.ts (SourceCitation) + attribution.ts

### Use in product
- [x] Equipment-loss layer (aggregate count by region × time) — registry id `equipment_losses` in c:\tmp\sprint258_shared_ORYX.txt; API apps/web/src/app/api/integrations/oryx/route.ts + src/trends.ts (aggregateByRegionTime)
- [x] Per-equipment page → "verified losses" widget — integrations/oryx/src/widget.ts (`buildVerifiedLossesWidget`)
- [x] Loss-trend chart per side — integrations/oryx/src/trends.ts (`buildSideTrends`)
- [x] Cite Oryx everywhere derived — integrations/oryx/src/attribution.ts + COMPLIANCE.md + API attribution block

## i18n
- Equipment names + transliteration; descriptions per locale.

### Примітки
Oryx is volunteer-maintained, strict visual-verification standard. Cite generously.
