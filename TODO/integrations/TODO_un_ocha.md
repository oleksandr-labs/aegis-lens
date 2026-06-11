# TODO — Integration: UN OCHA + ReliefWeb

## Goal
Humanitarian datasets: displacement, aid corridors, humanitarian needs assessments.

## Progress
- 10 / 10 done

## Tasks

### Sources
- [x] HDX (Humanitarian Data Exchange) — datasets — integrations/un-ocha/src/hdx-client.ts (CKAN API model, license mapping/gating, demo fixture)
- [x] ReliefWeb — situation reports + crisis updates — integrations/un-ocha/src/reliefweb-client.ts (ReliefWeb API v1 + demo fixture)
- [x] IOM DTM (Displacement Tracking Matrix) — integrations/un-ocha/src/dtm-client.ts (DTM API model, coarse centroids, demo fixture)
- [x] Per-cluster reports (health / shelter / food / WASH) — integrations/un-ocha/src/clusters.ts (IASC cluster taxonomy + per-cluster report model + classifier)

### Pipeline
- [x] HDX dataset subscription — integrations/un-ocha/src/hdx-subscribe.ts (cursor-based change detection + license gating)
- [x] Daily / weekly report ingest — integrations/un-ocha/src/report-ingest.ts (orchestrates ReliefWeb+DTM+clusters → canonical events, fail-closed PII accounting)
- [x] PII strict redaction (humanitarian data sensitivity) — integrations/un-ocha/src/pii-redaction.ts (fail-closed redactor: names/contacts/exact-coords/sensitive fields → block whole record)

### Use in product
- [x] Humanitarian layer (displacement intensity, aid corridors) — registry id "humanitarian" + paint specs (humanitarian / humanitarian_corridors) proposed in c:\tmp\sprint258_shared_OCHA.txt; builders in integrations/un-ocha/src/humanitarian-layer.ts; route apps/web/src/app/api/integrations/un-ocha/route.ts
- [x] NGO persona dashboards — integrations/un-ocha/src/ngo-dashboard.ts (displacement-by-oblast + cluster coverage + underserved clusters; route view=dashboard)
- [x] Investigation evidence base — integrations/un-ocha/src/evidence-base.ts (cite-able, hash-stamped, redaction-attested evidence records; route view=evidence)

## i18n
- EN canonical; localized summaries.

### Примітки
NGOs persona is biggest beneficiary. Builds NGO partnerships (mutual benefit).
