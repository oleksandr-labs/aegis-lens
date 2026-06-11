# TODO — Open Data & Dataset SEO

## Goal
Public datasets with proper schema, DOIs, and academic discoverability. Earns .edu / .gov backlinks.

## Progress
- 6 / 11 done

## Tasks
- [x] `/datasets` index page ✓ Sprint 0 (existed); enriched Sprint 2.46 — now imports from shared `datasets-seed.ts`, added "details →" link per card, `DataCatalog` JSON-LD
- [x] `/datasets/<slug>` per dataset ✓ Sprint 2.46 — full detail page with field reference table, example record, APA/BibTeX/RIS citation blocks, related datasets, `Dataset` + `BreadcrumbList` JSON-LD
- [ ] DataCite DOIs per dataset version
- [x] Schema.org `Dataset` markup ✓ Sprint 2.46 — `Dataset` schema with `distribution`, `license`, `dateModified`, `publisher`, `isPartOf DataCatalog`
- [x] Google Dataset Search compatibility ✓ Sprint 2.46 — `Dataset` JSON-LD matches Google's required fields (name, description, url, license, distribution)
- [x] License clearly stated per dataset (CC-BY default for public) ✓ Sprint 2.46 — license shown with link to CC-BY-4.0 on both index and detail pages
- [ ] Versioning + changelog per dataset
- [ ] Download formats: CSV, Parquet, GeoJSON
- [x] Citation snippet generator (APA / BibTeX / RIS) ✓ Sprint 2.46 — `citationApa()`, `citationBibtex()`, `citationRis()` in `datasets-seed.ts`; rendered as `<details>` blocks on detail page
- [ ] Submit to data registries (re3data, OpenAIRE)
- [x] Per-dataset documentation (codebook, methodology) ✓ Sprint 2.46 — `longDescription` + `fields[]` table per dataset in `datasets-seed.ts`

## i18n
- Dataset metadata + docs localized to EN + UK.

### Примітки
Academic citations age into authoritative backlinks. Long-tail SEO compounding.
