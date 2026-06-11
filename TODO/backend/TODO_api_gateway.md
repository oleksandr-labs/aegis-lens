# TODO — Service: API Gateway

## Goal
Single ingress: auth, rate limiting, routing, billing metering, request tracing.

## Progress
- 11 / 11 done

## Tasks
- [x] Choice: Envoy / Kong / Tyk / custom Fastify gateway — `docs/architecture/gateway-choice.md` (ADR: Custom Fastify/Next.js middleware for Stage 1; Envoy for Stage 2 microservices; evaluation of all 4 options)
- [x] JWT validation + JWKS rotation — `apps/web/src/lib/jwt.ts`: `verifyJWT()` with JWKS cache (1h TTL), RS256/ES256, W3C traceparent propagation; `authenticateRequest()` handles Bearer JWT + API key + cookie session; `validateApiKey()`
- [x] Per-tier rate limits (sliding window in Redis) ✓ Sprint 1.4 + tier-aware `rateLimitTier()` in rate-limit.ts
- [x] Per-org IP allow / deny lists — `apps/web/src/lib/ip-allowlist.ts` (`IpListRule`, `IpListStore`, `InMemoryIpListStore`, `checkIpAccess()`, IPv4 CIDR matching, IPv6 stub)
- [x] Quota enforcement (events / API calls / AI tokens) — `GET /api/admin/quota` + `POST /api/admin/quota/enforce` with tier limits (free/pro/enterprise) per quota type
- [x] Usage metering → billing pipeline — `apps/web/src/lib/usage-metering.ts` (`MeterEvent`, `MeteringBuffer`, `recordUsage()`, `flushToStripe()`, no-op without `STRIPE_SECRET_KEY`)
- [x] Request tracing (OpenTelemetry) — `apps/web/src/lib/telemetry.ts`: `createRequestTrace()`, W3C traceparent, `emitSpan()` to OTLP endpoint, `withSpan()` helper
- [x] Schema validation at the edge (OpenAPI) — `apps/web/src/lib/schema-validation.ts` (`validateRequestBody()`, `validateQueryParams()`, spec cached from `/api/openapi.json`, JSON Schema Draft-07 subset, fail-open on missing spec)
- [x] CORS + CSRF protection ✓ Sprint 1.9
- [x] Bot / scraping defense (Cloudflare + custom heuristics) — `apps/web/src/lib/bot-defense.ts` (`detectBot()`, 35+ UA patterns, RPM thresholds, Cloudflare bot score fusion, `BotDecision` with confidence + recommendation)
- [x] Versioned routing (`/v1` / `/v2`) — `apps/web/src/app/api/v1/` with re-export aliases for all endpoints

## i18n
- `Accept-Language` parsed and forwarded.

### Примітки
The gateway is the contract. Keep it small and stable.
