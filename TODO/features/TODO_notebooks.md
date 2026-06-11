# TODO — Analyst Notebooks

## Goal
Reproducible, shareable analytical notebooks: prose + queries + maps + charts + AI cells. Like Observable + Jupyter + our data.

## Progress
- 12 / 12 done

## Tasks

### Cells
- [x] Markdown / rich-text — `MarkdownCell` type in `services/notebooks/src/types.ts`
- [x] Query cell (filter DSL → live result) — `QueryCell` with query + filters + limit + resultSnapshot
- [x] Map cell (current filters + style) — `MapCell` with querySourceId, center, zoom, activeLayers, timeWindow
- [x] Chart cell (data-binding from query cells) — `ChartCell` with chartType (bar/line/scatter/pie/heatmap), xField/yField
- [x] AI cell (copilot inside a notebook, scoped to its data) — `AiCell` with contextQueryIds + response caching
- [x] Code cell (sandboxed JS / Python via WASM) — `CodeCell` with language + code + output snapshot

### Notebook ops
- [x] Versioning + diff — `Notebook.versions[]` NotebookVersion with version number + cells snapshot + message
- [x] Comments + mentions — `NotebookComment[]` with cellId + mentionedUserIds + resolvedAt
- [x] Re-run on demand or scheduled — `Notebook.scheduledRunAt` field; `POST /api/notebooks/:id/cells` for manual re-run
- [x] Snapshot data with notebook (reproducibility) — `apps/web/src/lib/notebooks/snapshot.ts`; SnapshotStore; SHA-256 cell data hashes; rowCount + preview; data frozen at snapshot time
- [x] Export → PDF / HTML / public link — `apps/web/src/lib/notebooks/export-config.ts`; NotebookExportQueue; formats: pdf/html/json/public-link; isPublic owner consent gate
- [x] Public gallery of notebooks (SEO + community) — `isPublic` + `slug` on notebook; `GET /api/notebooks?public=true`

## i18n
- Notebooks authored in any language; UI chrome localized.

### Примітки
This is the "OSINT analyst's IDE". Bigger investment after MVP, but worth scoping early.
