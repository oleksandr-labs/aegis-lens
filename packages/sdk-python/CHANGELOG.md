# aegis-sdk-python Changelog

All notable changes to this package will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 0.1.0 — 2026-06-10

### Added

- Initial release: `AegisClient` (synchronous, httpx-backed) and `AsyncAegisClient` (async/await)
- `EventsResource` — `list()`, `get()`, `iter_all()` (auto-pagination), `stream()` (SSE generator)
- `SearchResource` — `query()` with full filter support
- `CopilotResource` — `ask()`
- `AlertsResource` — `list()`, `create()`, `delete()`
- `SourcesResource` — `list()`
- `WebhooksResource` — `list()`, `create()`, `delete()`, `verify_signature()`
- Pydantic v2 models: `AegisEvent`, `AegisSource`, `AegisAlert`, `PagedResponse`, `CopilotResponse`, `SearchResponse`, `WebhookEndpoint`, `PaginationMeta`
- SSE streaming via `events.stream()` — yields parsed event dicts from live feed
- Webhook signature verification — `verify_webhook_signature(payload, headers, secret)` using HMAC-SHA256
- Context-manager support (`with AegisClient(...) as client:`)
- `AEGIS_API_KEY` environment variable auto-detection
