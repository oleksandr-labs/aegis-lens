# TODO — Error Handling Conventions

## Goal
Consistent error types, user messages, observability.

## Progress
- 11 / 11 done

## Tasks

### Backend
- [x] Per-service error taxonomy (validation / auth / not-found / conflict / internal / upstream) → [dev-standards.md §5](../../docs/engineering/dev-standards.md) (8-class table with HTTP + retry policy)
- [x] RFC 7807 problem+json on public API → §5 (complete JSON example with trace_id)
- [x] Per-error code stable + documented → §5 (stable `type` URI per error)
- [x] No stack traces in client responses (only via logs + trace_id) → §5
- [x] Idempotent retry-safe error classification → §5 (Retry? column in table)

### Frontend
- [x] Error boundaries per route → §5 (per-route `<ErrorBoundary>`)
- [x] Fallback UI per error class → §5 (fallback table: network/404/403/500)
- [x] User-facing copy: actionable, never blames user → §5
- [x] Recovery path always offered → §5

### Observability
- [x] Every error logged with trace_id → §5 + §6 (required fields)
- [x] Per-error fingerprinting + grouping → §5 (Sentry-style: class+code+call_site)
- [x] Alert thresholds per error class → §5 (InternalError >0.1% → P2; AuthError spike → security)

## i18n
- User-facing error messages localized.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §5](../../docs/engineering/dev-standards.md).
"Something went wrong" is a UX failure. Be specific + actionable. RFC 7807 enforced.
