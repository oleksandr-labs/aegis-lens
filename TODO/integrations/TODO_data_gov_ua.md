# TODO — Integration: data.gov.ua + Civic-Tech Datasets

## Goal
Ukrainian open-data portal + civic-tech sources (Texty.org.ua, OpenDataBot, YouControl) for entity enrichment + KG.

## Progress
- 11 / 11 done

## Tasks

### Sources
- [x] data.gov.ua dataset catalog (EDR, addresses, infrastructure) — integrations/data-gov-ua/src/data-gov-client.ts (CKAN Action API + demo fixture; topic classifier)
- [x] OpenDataBot (company registry enrichment, business intelligence) — integrations/data-gov-ua/src/opendatabot-client.ts (proprietary API client → CompanyRecord; env key; demo)
- [x] YouControl (entity verification) — integrations/data-gov-ua/src/youcontrol-client.ts (verification/risk signal → applyVerification; env key; demo)
- [x] Texty.org.ua (data-journalism datasets) — integrations/data-gov-ua/src/texty-client.ts (curated dataset catalog + ЄДРПОУ cross-link metadata)
- [x] Prozorro (public procurement transparency) — integrations/data-gov-ua/src/prozorro-client.ts (OpenProcurement tenders → ProcurementTender; demo)

### Pipeline
- [x] Periodic dataset sync (varies by source) — integrations/data-gov-ua/src/sync.ts (per-source SYNC_SCHEDULE + runSync over all clients)
- [x] Entity-resolution from EDR codes — integrations/data-gov-ua/src/edr-resolver.ts (ЄДРПОУ → merged CompanyRecord across providers)
- [x] KG enrichment with company / institution data — integrations/data-gov-ua/src/kg-enrichment.ts (CompanyRecord → RegistryEntity; type classification + procurement footprint)
- [x] Entity pages enriched with registry data — integrations/data-gov-ua/src/entity-enrichment.ts + apps/web/src/app/api/integrations/data-gov-ua/route.ts (view=entity)
- [x] Directory / companies-directory enrichment — integrations/data-gov-ua/src/directory-enrichment.ts + route.ts (view=directory; filter/sort/facets)
- [x] Cross-link to relevant investigations — integrations/data-gov-ua/src/investigation-link.ts (Texty named-in + Prozorro counterparty links)

## i18n
- UK source; EN translation for international audiences.

### Примітки
Many sources have generous open-data licenses. License check per dataset — see integrations/data-gov-ua/COMPLIANCE.md (per-dataset license + republication gate; OpenDataBot/YouControl proprietary = link-out only).
