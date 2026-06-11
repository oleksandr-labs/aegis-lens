# TODO — Integration: Copernicus EMS (Emergency Management Service)

## Goal
EU-funded crisis-mapping service: rapid damage maps, flood / fire / damage assessments for activations.

## Progress
- 9 / 9 done

## Tasks

### Source
- [x] EMS Rapid Mapping activations (RSS + downloads) — integrations/copernicus-ems/src/client.ts (CopernicusEmsClient: RSS feed parse + listActivations + demo fixtures)
- [x] Risk & Recovery mapping product portfolio — integrations/copernicus-ems/src/products.ts (EMSN portfolio model, buildPortfolio/filterProducts + DEMO_PORTFOLIO)
- [x] Per-activation vector + raster outputs — integrations/copernicus-ems/src/outputs.ts (typed ActivationAOI/VectorOutput/RasterOutput + loadActivationOutputs + DEMO_OUTPUTS)

### Pipeline
- [x] Activation watcher (auto-pull on new UA-relevant product) — integrations/copernicus-ems/src/watcher.ts (ActivationWatcher.poll → PullTask, UA-relevant country/hazard filter + SeenStore)
- [x] Convert outputs to our layers (damage assessment, flood, fire) — integrations/copernicus-ems/src/to-layers.ts (toCrisisLayer GeoJSON + EXISTING_LAYER_MAPPING flood/fire/damage + raster overlays)
- [x] Cross-reference with our Sentinel-derived layers — integrations/copernicus-ems/src/sentinel-xref.ts (crossReference EMS AOI ↔ sentinel change detection → corroborated/partial/discrepancy + confidence delta)

### Use in product
- [x] Activation banner on relevant regions — integrations/copernicus-ems/src/banner.ts + apps/web/src/app/api/integrations/copernicus-ems/route.ts (bannersForOblast/Point, ?view=banners)
- [x] Per-activation linked event — integrations/copernicus-ems/src/event-mapping.ts (activationToEvent → canonical AegisEventV1, deterministic id copernicus-ems:<CODE>, Sentinel-linked)
- [x] Citation in reports + investigations — integrations/copernicus-ems/src/citations.ts (citeActivation/citeProduct + mandatory Copernicus attribution + toEvidenceEntry; COMPLIANCE.md)

## i18n
- Original EN; translated summaries per locale.

### Примітки
EMS activations are public-domain. Highly citable + authoritative.
