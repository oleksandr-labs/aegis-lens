# TODO — Integration: OVA Telegram Channels (24 Oblasts)

## Goal
24 official oblast military administration Telegram channels — primary source for local alerts, damage, civilian guidance.

## Progress
- 10 / 10 done

## Tasks

### Channels
- [x] Curated registry of all 24 OVA official channels + city councils (Kyiv, Kharkiv, Odesa, Dnipro, Lviv) — integrations/ova-telegram/src/registry.ts (OVA_PRIMARY all 26 ISO codes + CITY_COUNCILS x5; reuses OBLASTS, extends alerts-in-ua/ova-fallback.ts)
- [x] Per-channel verification of authenticity — integrations/ova-telegram/src/verification.ts (gov.ua anchor + blue-check + registry + chatId + maturity → authenticity 0–1, MIN_AUTHENTIC gate)
- [x] Backup channel detection (if primary banned/lost) — integrations/ova-telegram/src/backup-detection.ts (ban/stale detection, registered-backup failover, unverified-mirror review, no auto-promote)

### Pipeline
- [x] Ingest via Telegram client (within ToS) — integrations/ova-telegram/src/ingest.ts (reuses telegram/src/bot-api-client.ts, Bot-API read-only, env token, DEMO fixture)
- [x] Per-channel cadence + reputation — integrations/ova-telegram/src/cadence.ts (median interval → polite poll window + stale signal; reputation multiplier from corroboration history)
- [x] Auto-translate to EN + RU (preserve UA original) — integrations/ova-telegram/src/translate.ts (Translator seam, passthrough default, UA original always preserved in translations.uk)
- [x] NER → linked to admin hierarchy + KG — integrations/ova-telegram/src/ner-link.ts (gazetteer NER → kg: refs + AdminLink on shared OBLASTS; channel oblast anchor guaranteed)

### Use in product
- [x] Per-oblast official-feed widget — integrations/ova-telegram/src/widget.ts + apps/web/src/app/api/integrations/ova-telegram/route.ts (locale-aware view model; route self-contained + DEMO)
- [x] Quote in event provenance chain — integrations/ova-telegram/src/provenance.ts (official_of_record SourceCitation + verbatim quote, quoteInChain prepends OVA; adapter.ts maps post → AegisEventV1)
- [x] Cross-reference with alerts.in.ua for alert validation — integrations/ova-telegram/src/alert-validation.ts (reuses alerts-in-ua taxonomy; confirmed/contradicted/ova_only → confidence delta, fail-safe)

## i18n
- UK primary; EN + RU translations.

### Примітки
OVA channels = official-of-record. Highest trust tier short of Cabinet of Ministers.
