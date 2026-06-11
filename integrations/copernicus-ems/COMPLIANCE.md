# Compliance — `@ua-map/copernicus-ems` (Copernicus Emergency Management Service)

This integration ingests **Copernicus EMS** crisis-mapping products (Rapid Mapping
EMSR… and Risk & Recovery Mapping EMSN…). The headline fact: **EMS products are
free, full, open and effectively public-domain Copernicus data** — they are among
the most citable, authoritative crisis-mapping sources available. The only hard
obligation is the **mandatory Copernicus attribution credit line**.

## 1. Source, license & attribution

### Copernicus Emergency Management Service (https://emergency.copernicus.eu)
- **Operator:** European Commission (DG DEFIS / DG ECHO), implemented by the
  European Union via the Copernicus programme.
- **License:** Copernicus data and EMS products are provided under the EU's
  **free, full and open data policy** (Regulation (EU) 2021/696, and the earlier
  Commission Delegated Regulation (EU) No 1159/2013). Users may **reproduce,
  distribute, adapt and commercially exploit** the products, including making
  derivative works (our normalization is a derivative — explicitly permitted).
  We treat this as **public-domain-equivalent** with a mandatory credit.
- **Mandatory attribution** (enforced by `citations.ts → COPERNICUS_ATTRIBUTION`,
  shown on every product surface — map legend, report footnote, evidence entry):
  > "Contains modified Copernicus Emergency Management Service information [year]"
  When unmodified, drop "modified". Where practical also cite the activation code
  (e.g. `EMSR700`) and "© European Union".
- **No warranty:** EMS products carry a disclaimer that they are provided "as is"
  without warranty. We surface EMS outputs as **verified authoritative source
  geometry**, but cross-reference them with our own Sentinel-derived layers
  (`sentinel-xref.ts`) before raising confidence, and never present them as our
  own original analysis.

### Activation feed (RSS) & product downloads
- The Rapid Mapping **activation list and RSS feed** and the per-component
  **product downloads** (vector GeoPackage/shapefile, raster GeoTIFF, PDF map
  sheets) are **public and require no API key**.
- **Crawler discipline** (`client.ts`): descriptive `User-Agent`, ≥2 s inter-request
  delay, RSS polled on a polite cadence (watcher default 30 min — `watcher.ts`),
  product downloads pulled only on a NEW UA-relevant activation, never bulk-mirrored.

## 2. Re-hosting / republication

| Product / artefact                       | Re-host normalized data? | Action |
|------------------------------------------|--------------------------|--------|
| EMS vector outputs (extent / grading)    | Yes, with attribution    | normalize → `crisis_mapping` layer |
| EMS raster outputs (classified GeoTIFF)  | Yes, with attribution    | overlay descriptor + link to download |
| EMS PDF map sheets                        | Link only (large)        | cite + deep-link to the EMS page |
| Activation metadata (code / title / URL) | Yes, with attribution    | banners, events, citations |

EMS products are public-domain-equivalent, so there is **no gating matrix** like
the HDX integration needs. The single rule is: **always carry the Copernicus
credit line**.

## 3. PII / data-responsibility

- EMS products are **building/area-level geospatial layers** (flood extents, burn
  scars, damage grading polygons), not individual records — there is **no
  personal data** in the ingested products.
- Damage-grading products identify *buildings*, not people. We coarsen the
  activation event location to oblast-scale (`uncertaintyM: 5000` in
  `event-mapping.ts`) for the canonical event; the precise per-building geometry
  stays in the `crisis_mapping` layer where EMS itself already publishes it openly.

## 4. Mapping to our model

- **Layer:** EMS outputs map to a NEW `crisis_mapping` layer (proposed in
  `c:\tmp\sprint259_shared_COPERNICUS.txt`), category **environment**, access tier
  **public**. They ALSO land on existing layers where geometry fits
  (`EXISTING_LAYER_MAPPING` in `to-layers.ts`): flood → `emergencies`,
  fire → `active_fires`, conflict damage → `infrastructure_damage`.
- **Event:** each activation → one canonical `AegisEventV1` (`event-mapping.ts`),
  `verificationState: "verified"`, source type `satellite_imagery`, deterministic
  id `copernicus-ems:<CODE>`. Confidence baseline 0.85, boosted/penalized by the
  Sentinel cross-reference verdict.
- **Cross-reference:** `sentinel-xref.ts` correlates EMS AOIs with our
  `@ua-map/sentinel-hub` change detection (corroborate / partial / discrepancy).

## 5. Secrets
- **None required.** EMS public feeds and downloads need no API key. The package
  is fully usable with demo fixtures offline. No secrets are hardcoded; the client
  reads only optional tuning (URLs / intervals) from its config object.
