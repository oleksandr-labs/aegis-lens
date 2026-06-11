# TODO — API Design Principles

## Goal
A REST + GraphQL API that's pleasant to use, versioned, secure, and stable.

## Progress
- 14 / 14 done

## Tasks
- [x] Resource modeling: `/events`, `/events/<id>`, `/regions/<iso2>`, `/copilot`, `/admin/*` ✓ Sprint 1.1–1.6
- [x] Consistent envelope: `{ data, meta }` ✓ Sprint 1
- [x] Filterable per resource (events: country, class, hours, limit) ✓ Sprint 1
- [x] Cache-Control headers on reads ✓ Sprint 1
- [x] 404 with structured error body on missing resource ✓ Sprint 1.6
- [x] Cursor pagination everywhere (`?cursor=…`) — `apps/web/src/lib/cursor-pagination.ts` with `encodeCursor`/`decodeCursor`/`paginateArray`/`extractPaginationParams`
- [x] Field selection (`?fields=…`) — `apps/web/src/lib/field-selection.ts` (parseFieldsParam() parses comma-list with alphanumeric+dot validation, applyFieldSelection() masks top-level keys, applyFieldSelectionToArray() for collections; null return = no mask)
- [x] Sparse fieldsets / expansion (`?include=…`) — `apps/web/src/lib/include-expansion.ts` (parseIncludeParam(), InclusionConfig<T> resolver map, expandIncludes() runs resolvers in parallel fail-soft, buildExpansionResponse() returns { data, included })
- [x] OpenAPI 3.1 source of truth ✓ Sprint 2.0 (/api/openapi.json)
- [x] GraphQL schema generated where appropriate — `apps/web/src/lib/graphql-schema.ts` (AEGIS_GRAPHQL_SCHEMA SDL: Query.events/regions/copilot, EventFilter input, Event/Region/CopilotResponse/EventConnection/PageInfo types mirroring REST resources; getGraphqlSchema() accessor; resolver wiring deferred)
- [x] Errors: RFC 7807 (`application/problem+json`) — `apps/web/src/lib/api-errors.ts` with `ProblemDetail`, `problem*` helpers, `Content-Type: application/problem+json`
- [x] Idempotency keys on writes — `apps/web/src/lib/idempotency.ts` (server-only; IDEMPOTENCY_HEADER const, IdempotencyRecord type, InMemoryIdempotencyStore with 24h TTL + lazy eviction, checkIdempotency/storeIdempotencyResult/extractIdempotencyKey helpers, withIdempotency() wrapper caches 2xx responses and replays with Idempotent-Replayed header)
- [x] Deprecation policy + `Sunset` headers — `addDeprecationHeaders()` in `api-errors.ts`
- [x] DX: TypeScript SDK with strict types — `packages/sdk-ts/`; Python SDK: `packages/sdk-python/`

## i18n
- `Accept-Language` honored; per-locale text fields included.

### Примітки
The API is the most-versioned surface. Don't break clients.
