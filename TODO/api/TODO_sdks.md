# TODO — SDKs (TS / Python / Go)

## Goal
First-class typed SDKs for each major audience.

## Progress
- 9 / 9 done

## Tasks
- [x] TypeScript SDK (auto-generated from OpenAPI, hand-tuned ergonomics) — `packages/sdk-ts/` (`AegisClient` with events/sources/reports/search/copilot resources + auto-pagination)
- [x] Python SDK (Pydantic models, async + sync) — `packages/sdk-python/` with `AegisClient` (sync httpx) + `AsyncAegisClient`, Pydantic v2 models, all resource classes
- [x] Go SDK (idiomatic, context-aware) — `packages/sdk-go/` (client.go, events.go, regions.go, webhook_verify.go, go.mod, README.md)
- [x] Streaming helpers (WebSocket / SSE) per SDK — `client.events.stream()` in Python SDK yields parsed SSE events
- [x] Webhook signature verification helpers — Python: `webhook_verify.py`; TS: `packages/sdk-ts/src/webhook-verify.ts`
- [x] Example apps per SDK — `packages/sdk-ts/examples/basic-events.ts`; `packages/sdk-python/examples/basic_events.py`
- [x] Jupyter notebook templates (Python) — `packages/sdk-python/notebooks/aegis_quickstart.ipynb` (4 cells: install, auth+events, pandas analysis, folium map)
- [x] SDK changelog + semver — `packages/sdk-ts/CHANGELOG.md`; `packages/sdk-python/CHANGELOG.md`
- [x] Auto-publish on release (npm, PyPI, go modules) — `.github/workflows/publish-sdks.yml`

## i18n
- SDK docs EN; examples annotated to suggest locale handling.

### Примітки
Python SDK matters most for analyst / academic personas.
