# @aegis/sdk-ts Changelog

All notable changes to this package will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 0.1.0 — 2026-06-10

### Added

- Initial release: `AegisClient` constructor with `apiKey`, `baseUrl`, `timeoutMs`, `userAgent` options
- `EventsResource` — `list()`, `get()`, `iterate()` (auto-pagination)
- `SourcesResource` — `list()`
- `ReportsResource` — `list()`
- `SearchResource` — `query()`, `suggest()`
- `CopilotResource` — `ask()`, `stream()` (SSE streaming via async generator)
- Auto-pagination on `events.iterate()` — follows `meta.nextCursor` transparently
- SSE streaming via `copilot.stream()` — yields typed `CopilotStreamChunk` objects
- Webhook signature verification — `verifyWebhookSignature(secret, headers, body)` using HMAC-SHA256; tolerates 5-minute replay window
- `AegisApiError` — typed error class with `.status` and `.body` fields
- Full TypeScript types: `AegisEvent`, `AegisSource`, `AegisReport`, `SearchResponse`, `CopilotResponse`, `PaginatedResponse<T>`, `GeoPoint`, `EventMedia`, `LocalizedString`
